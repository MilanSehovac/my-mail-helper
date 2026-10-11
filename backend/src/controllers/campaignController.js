import { Campaign, CampaignContact, Template, SmtpSettings } from '../models/index.js';
import { countEligibleContacts, snapshotAudience } from '../services/campaignService.js';
import { findUnknownVariables } from '../services/templateRenderer.js';
import { parseId, isNonEmptyString, optionalString } from '../utils/validators.js';

const MAX_DAILY_LIMIT = 500;

const findOwned = (req) => {
    const id = parseId(req.params.id);
    return id ? Campaign.findOne({ where: { id, user_id: req.user.id } }) : null;
};

const parseSchedule = (sendMode, scheduledAt) => {
    if (sendMode !== 'scheduled') return { value: null };
    const when = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(when.getTime())) return { error: 'A valid scheduled_at is required for scheduled campaigns' };
    return { value: when };
};

export const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
        });
        res.json(campaigns);
    } catch (error) {
        console.error('Could not get campaigns:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export const createCampaign = async (req, res) => {
    try {
        const { name, description, target, template_id, scheduled_at, send_mode = 'scheduled', daily_limit = 30 } = req.body ?? {};
        const user_id = req.user.id;

        if (!isNonEmptyString(name) || !isNonEmptyString(target)) {
            return res.status(400).json({ error: 'Name and Target are required' });
        }
        if (!optionalString(description, 5000)) {
            return res.status(400).json({ error: 'Description is too long' });
        }
        if (!['scheduled', 'immediate'].includes(send_mode)) {
            return res.status(400).json({ error: 'send_mode must be scheduled or immediate' });
        }
        const limit = Number(daily_limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > MAX_DAILY_LIMIT) {
            return res.status(400).json({ error: `daily_limit must be between 1 and ${MAX_DAILY_LIMIT}` });
        }
        const schedule = parseSchedule(send_mode, scheduled_at);
        if (schedule.error) return res.status(400).json({ error: schedule.error });
        if (schedule.value && schedule.value.getTime() <= Date.now()) {
            return res.status(400).json({ error: 'Scheduled time must be in the future' });
        }

        const template = await Template.findOne({ where: { id: parseId(template_id) ?? 0, user_id } });
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const unknown = findUnknownVariables(template.subject, template.body);
        if (unknown.length) {
            return res.status(400).json({ error: `Template uses unknown variable(s): ${unknown.join(', ')}` });
        }

        const audience = await countEligibleContacts(user_id, target);
        if (audience === 0) {
            return res.status(400).json({ error: 'No subscribed contacts match this target segment' });
        }

        const campaign = await Campaign.create({
            user_id,
            name: name.trim(),
            description,
            target,
            template_id: template.id,
            scheduled_at: schedule.value,
            send_mode,
            daily_limit: limit,
            sent: 0,
            total: audience,
            status: 'Paused',
        });

        res.status(201).json(campaign);
    } catch (error) {
        console.error('Could not create Campaign:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

// Pause is the only status change allowed here; use /launch to start or resume.
export const updateCampaign = async (req, res) => {
    try {
        const campaign = await findOwned(req);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        const { name, description, daily_limit, status } = req.body ?? {};

        if (status !== undefined) {
            if (status !== 'Paused') {
                return res.status(400).json({ error: 'Only status "Paused" can be set here; use /launch to start or resume' });
            }
            if (campaign.status === 'Completed') {
                return res.status(409).json({ error: 'Campaign already completed' });
            }
            // Conditional update so a concurrent completion is not overwritten.
            await Campaign.update({ status: 'Paused' }, { where: { id: campaign.id, status: ['Scheduled', 'Sending', 'Paused'] } });
        }

        const changes = {};
        if (name !== undefined) {
            if (!isNonEmptyString(name)) return res.status(400).json({ error: 'Invalid name' });
            changes.name = name.trim();
        }
        if (description !== undefined) {
            if (!optionalString(description, 5000)) return res.status(400).json({ error: 'Description is too long' });
            changes.description = description;
        }
        if (daily_limit !== undefined) {
            const limit = Number(daily_limit);
            if (!Number.isInteger(limit) || limit < 1 || limit > MAX_DAILY_LIMIT) {
                return res.status(400).json({ error: `daily_limit must be between 1 and ${MAX_DAILY_LIMIT}` });
            }
            changes.daily_limit = limit;
        }
        if (Object.keys(changes).length) await campaign.update(changes);

        await campaign.reload();
        res.status(200).json({ message: 'Campaign updated successfully', campaign })
    } catch (error) {
        console.error('Could not update campaign:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export const deleteCampaign = async (req, res) => {
    try {
        const campaign = await findOwned(req);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        if (['Scheduled', 'Sending'].includes(campaign.status)) {
            return res.status(409).json({ error: 'Pause the campaign before deleting it' });
        }
        await CampaignContact.destroy({ where: { campaign_id: campaign.id } });
        await campaign.destroy();
        res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (err) {
        console.error('Could not delete campaign:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

// Snapshots the audience and hands the campaign to the background worker (see services/campaignWorker.js).
export const launchCampaign = async (req, res) => {
    try {
        const campaign = await findOwned(req);
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        if (campaign.status !== 'Paused') {
            return res.status(409).json({ error: `Campaign is already ${campaign.status.toLowerCase()}` });
        }

        const smtp = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        if (!smtp || !smtp.is_configured || !smtp.smtp_host || !smtp.smtp_user || !smtp.smtp_password) {
            return res.status(400).json({ error: 'SMTP configuration not found. Configure it in Settings first.' });
        }
        const template = await Template.findOne({ where: { id: campaign.template_id, user_id: req.user.id } });
        if (!template) {
            return res.status(400).json({ error: 'Campaign template no longer exists' });
        }

        const total = await snapshotAudience(campaign);
        if (total === 0) {
            return res.status(400).json({ error: 'No subscribed contacts match this target segment' });
        }

        const future = campaign.send_mode === 'scheduled' && campaign.scheduled_at && new Date(campaign.scheduled_at).getTime() > Date.now();
        const status = future ? 'Scheduled' : 'Sending';
        const [changed] = await Campaign.update({ status }, { where: { id: campaign.id, status: 'Paused' } });
        if (!changed) {
            return res.status(409).json({ error: 'Campaign state changed, please retry' });
        }

        res.json({
            message: status === 'Scheduled' ? 'Campaign scheduled.' : 'Campaign launched. Emails will be sent gradually.',
            status,
            total,
        });
    } catch (error) {
        console.error('Error launching campaign:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
