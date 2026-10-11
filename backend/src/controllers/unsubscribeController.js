import { Contact, CampaignContact } from '../models/index.js';
import { verifyUnsubscribeToken } from '../utils/unsubscribeToken.js';

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#222}
button{padding:10px 18px;font-size:16px;cursor:pointer}</style></head>
<body><h1>${title}</h1>${body}</body></html>`;

const contactFromToken = (token) => {
    try {
        return verifyUnsubscribeToken(token);
    } catch {
        return null;
    }
};

// GET only shows a confirmation form: mail scanners prefetch links and must not unsubscribe people.
export const showUnsubscribe = (req, res) => {
    if (!contactFromToken(req.params.token)) {
        return res.status(400).type('html').send(page('Invalid link', '<p>This unsubscribe link is not valid.</p>'));
    }
    res.type('html').send(page(
        'Unsubscribe',
        `<p>Do you want to stop receiving emails from this sender?</p>
         <form method="post"><button type="submit">Yes, unsubscribe me</button></form>`
    ));
};

// POST handles both the confirmation form and RFC 8058 one-click requests.
export const confirmUnsubscribe = async (req, res) => {
    try {
        const contactId = contactFromToken(req.params.token);
        if (!contactId) {
            return res.status(400).type('html').send(page('Invalid link', '<p>This unsubscribe link is not valid.</p>'));
        }
        const contact = await Contact.findByPk(contactId);
        if (contact && contact.status === 'Subscribed') {
            await contact.update({
                status: 'Unsubscribed',
                unsubscribed_at: new Date(),
                suppression_reason: 'Unsubscribed by recipient via email link',
            });
        }
        if (contact) {
            await CampaignContact.update(
                { status: 'Skipped', last_error: 'Contact unsubscribed' },
                { where: { contact_id: contact.id, status: 'Pending' } }
            );
        }
        res.type('html').send(page('You are unsubscribed', '<p>You will no longer receive emails from this sender.</p>'));
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).type('html').send(page('Something went wrong', '<p>Please try again later.</p>'));
    }
};
