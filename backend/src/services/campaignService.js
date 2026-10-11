import { Agency, Contact, CampaignContact, Campaign } from '../models/index.js';

// Subscribed contacts of the user's agencies in the campaign's segment, de-duplicated by email.
export const findEligibleContacts = async (userId, target) => {
    const contacts = await Contact.findAll({
        where: { user_id: userId, status: 'Subscribed' },
        attributes: ['id', 'email'],
        include: [{ model: Agency, as: 'agency', attributes: [], required: true, where: { user_id: userId, segment_tag: target } }],
        order: [['id', 'ASC']],
    });
    const seen = new Set();
    return contacts.filter((c) => {
        const key = c.email.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export const countEligibleContacts = async (userId, target) => (await findEligibleContacts(userId, target)).length;

// Creates one CampaignContact row per eligible contact. Safe to call repeatedly (unique constraint).
export const snapshotAudience = async (campaign) => {
    const contacts = await findEligibleContacts(campaign.user_id, campaign.target);
    if (contacts.length) {
        await CampaignContact.bulkCreate(
            contacts.map((c) => ({ campaign_id: campaign.id, contact_id: c.id, status: 'Pending' })),
            { ignoreDuplicates: true }
        );
    }
    const total = await CampaignContact.count({ where: { campaign_id: campaign.id } });
    await Campaign.update({ total }, { where: { id: campaign.id } });
    return total;
};
