import { Op, literal } from 'sequelize';
import { Agency, Campaign, CampaignContact, Contact, SmtpSettings, Template, User } from '../models/index.js';
import { sendEmail } from './mailService.js';
import { buildContext, renderTemplate } from './templateRenderer.js';
import { createUnsubscribeToken } from '../utils/unsubscribeToken.js';
import { config } from '../config/env.js';

const STALE_CLAIM_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 5 * 60 * 1000;
const MAX_BACKOFF_MS = 60 * 60 * 1000;

// Only errors where the server definitely did NOT accept the message are safe to retry:
// SMTP 4xx replies (temporary rejection) and failures to even connect. A timeout or socket error
// after the connection was established is ambiguous (the mail may have been accepted), so it is not retried.
export const isSafeToRetry = (error) => {
    const code = Number(error?.responseCode);
    if (code >= 400 && code < 500) return true;
    return ['ECONNECTION', 'ETIMEDOUT', 'EDNS', 'ESOCKET'].includes(error?.code) && error?.command === 'CONN';
};

// Exponential backoff with +/-20% jitter
export const backoffMs = (attempts) => {
    const base = Math.min(BASE_BACKOFF_MS * 2 ** Math.max(attempts - 1, 0), MAX_BACKOFF_MS);
    return Math.round(base * (0.8 + Math.random() * 0.4));
};
const DAY_MS = 24 * 60 * 60 * 1000;

const log = (...args) => console.log('[worker]', ...args);

const refreshCounters = async (campaignId) => {
    const sent = await CampaignContact.count({ where: { campaign_id: campaignId, sent_at: { [Op.ne]: null } } });
    await Campaign.update({ sent }, { where: { id: campaignId } });
};

// A crash between "claimed" and "result recorded" leaves delivery unknown. We never retry those automatically,
// because the mail may already have been accepted by the SMTP server.
const recoverStaleClaims = async () => {
    await CampaignContact.update(
        { status: 'Failed', last_error: 'Interrupted while sending; delivery unknown, not retried automatically' },
        { where: { status: 'Sending', claimed_at: { [Op.lt]: new Date(Date.now() - STALE_CLAIM_MS) } } }
    );
};

const promoteDueCampaigns = async () => {
    await Campaign.update(
        { status: 'Sending' },
        { where: { status: 'Scheduled', scheduled_at: { [Op.lte]: new Date() } } }
    );
};

const finishIfDone = async (campaign) => {
    const open = await CampaignContact.count({ where: { campaign_id: campaign.id, status: { [Op.in]: ['Pending', 'Sending'] } } });
    if (open === 0) {
        await Campaign.update({ status: 'Completed' }, { where: { id: campaign.id, status: 'Sending' } });
        await refreshCounters(campaign.id);
        log(`campaign ${campaign.id} completed`);
    }
};

const releaseClaim = (recipientId) =>
    CampaignContact.update(
        { status: 'Pending', claimed_at: null, attempts: literal('GREATEST(attempts - 1, 0)') },
        { where: { id: recipientId, status: 'Sending' } }
    );

const markResult = (recipientId, values) =>
    CampaignContact.update({ claimed_at: null, ...values }, { where: { id: recipientId } });

const processCampaign = async (campaignId) => {
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign || campaign.status !== 'Sending') return;

    // Daily limit (rolling 24h) and pacing between messages.
    const sentLast24h = await CampaignContact.count({
        where: { campaign_id: campaign.id, sent_at: { [Op.gte]: new Date(Date.now() - DAY_MS) } },
    });
    if (sentLast24h >= campaign.daily_limit) return;

    const lastClaim = await CampaignContact.max('claimed_at', { where: { campaign_id: campaign.id } });
    const lastSent = await CampaignContact.max('sent_at', { where: { campaign_id: campaign.id } });
    const last = Math.max(lastClaim ? new Date(lastClaim).getTime() : 0, lastSent ? new Date(lastSent).getTime() : 0);
    if (Date.now() - last < config.sendIntervalMs) return;

    const next = await CampaignContact.findOne({
        where: {
            campaign_id: campaign.id,
            status: 'Pending',
            [Op.or]: [{ next_attempt_at: null }, { next_attempt_at: { [Op.lte]: new Date() } }],
        },
        order: [['id', 'ASC']],
    });
    if (!next) return finishIfDone(campaign);

    // Atomic claim: if another worker got it first, affectedRows is 0.
    const [claimed] = await CampaignContact.update(
        { status: 'Sending', claimed_at: new Date(), next_attempt_at: null, attempts: literal('attempts + 1') },
        { where: { id: next.id, status: 'Pending' } }
    );
    if (!claimed) return;

    try {
        // Pause/cancel must take effect before the message leaves.
        const fresh = await Campaign.findByPk(campaign.id, { attributes: ['status'] });
        if (!fresh || fresh.status !== 'Sending') return releaseClaim(next.id);

        const contact = await Contact.findOne({
            where: { id: next.contact_id, user_id: campaign.user_id },
            include: [{ model: Agency, as: 'agency' }],
        });
        if (!contact || contact.status !== 'Subscribed') {
            await markResult(next.id, { status: 'Skipped', last_error: 'Contact missing or no longer subscribed' });
            return;
        }

        const [template, sender, smtp] = await Promise.all([
            Template.findOne({ where: { id: campaign.template_id, user_id: campaign.user_id } }),
            User.findByPk(campaign.user_id),
            SmtpSettings.findOne({ where: { user_id: campaign.user_id } }),
        ]);
        if (!template || !sender || !smtp || !smtp.is_configured) {
            await markResult(next.id, { status: 'Failed', last_error: 'Template or SMTP settings are missing' });
            return;
        }

        const rendered = renderTemplate(template, buildContext({ contact, agency: contact.agency, sender }));
        const unsubscribeUrl = `${config.publicApiUrl}/api/unsubscribe/${createUnsubscribeToken(contact.id)}`;
        const text = `${rendered.text}\n\n--\nTo stop receiving these emails, open: ${unsubscribeUrl}`;
        const html = `${rendered.html}<br><br><hr><p style="font-size:12px;color:#666">` +
            `To stop receiving these emails, <a href="${unsubscribeUrl}">unsubscribe</a>.</p>`;

        const info = await sendEmail(smtp, {
            to: contact.email,
            subject: rendered.subject,
            text,
            html,
            headers: {
                'List-Unsubscribe': `<${unsubscribeUrl}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
        });

        await markResult(next.id, {
            status: 'Sent',
            sent_at: new Date(),
            provider_message_id: info?.messageId ? String(info.messageId).slice(0, 255) : null,
            last_error: null,
        });
        if (contact.agency) {
            await contact.agency.update({ last_contact: new Date(), counter: (contact.agency.counter || 0) + 1 });
        }
        await refreshCounters(campaign.id);
        log(`campaign ${campaign.id}: sent to contact ${contact.id}`);
    } catch (error) {
        const attempts = next.attempts + 1; // the claim above incremented it in the DB
        const message = String(error.message).slice(0, 1000);
        if (isSafeToRetry(error) && attempts < MAX_ATTEMPTS) {
            log(`campaign ${campaign.id}: recipient ${next.id} attempt ${attempts} failed, will retry: ${error.message}`);
            await markResult(next.id, {
                status: 'Pending',
                next_attempt_at: new Date(Date.now() + backoffMs(attempts)),
                last_error: message,
            });
        } else {
            log(`campaign ${campaign.id}: recipient ${next.id} failed permanently: ${error.message}`);
            await markResult(next.id, { status: 'Failed', last_error: message });
        }
    }
    await finishIfDone(campaign);
};

let timer = null;
let running = false;

const tick = async () => {
    if (running) return;
    running = true;
    try {
        await recoverStaleClaims();
        await promoteDueCampaigns();
        const active = await Campaign.findAll({ where: { status: 'Sending' }, attributes: ['id'] });
        for (const campaign of active) {
            await processCampaign(campaign.id);
        }
    } catch (error) {
        console.error('[worker] tick failed:', error);
    } finally {
        running = false;
    }
};

export const startCampaignWorker = () => {
    if (timer) return;
    timer = setInterval(tick, config.workerTickMs);
    tick();
    log(`started (tick ${config.workerTickMs}ms, send interval ${config.sendIntervalMs}ms)`);
};

export const stopCampaignWorker = () => {
    clearInterval(timer);
    timer = null;
};
