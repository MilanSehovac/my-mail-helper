import { Contact, Agency } from '../models/index.js';
import { isEmail, normalizeEmail, parseId, optionalString, isNonEmptyString } from '../utils/validators.js';

const findOwnedAgency = (agencyId, userId) => {
    const id = parseId(agencyId);
    return id ? Agency.findOne({ where: { id, user_id: userId } }) : null;
};

export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Agency, as: 'agency', attributes: ['id', 'name'] }],
            order: [['created_at', 'DESC']]
        });
        res.json(contacts);
    } catch (error) {
        console.error('Could not get contacts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const createContact = async (req, res) => {
    try {
        const { full_name, email, agency_id, position, tag, source } = req.body ?? {};

        if (!isNonEmptyString(full_name) || !isEmail(email)) {
            return res.status(400).json({ error: 'Name and a valid email are required' });
        }
        if (!optionalString(position) || !optionalString(tag) || !optionalString(source)) {
            return res.status(400).json({ error: 'position, tag or source is invalid' });
        }
        if (!agency_id) {
            return res.status(400).json({ error: 'Agency ID is required' });
        }

        const agency = await findOwnedAgency(agency_id, req.user.id);
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }

        const newContact = await Contact.create({
            user_id: req.user.id,
            agency_id: agency.id,
            full_name: full_name.trim(),
            position,
            email: normalizeEmail(email),
            tag,
            source: source || 'manual'
        });
        res.status(201).json(newContact);
    } catch (err) {
        console.error('Could not create contact:', err);
        res.status(500).json({ error: 'Failed to create contact' });
    }
}

const findOwned = (req) => {
    const id = parseId(req.params.id);
    return id ? Contact.findOne({ where: { id, user_id: req.user.id } }) : null;
};

export const deleteContact = async (req, res) => {
    try {
        const contact = await findOwned(req);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        await contact.destroy();
        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (err) {
        console.error('Could not delete contact:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const updateContact = async (req, res) => {
    try {
        const contact = await findOwned(req);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        const { full_name, email, agency_id, position, tag } = req.body ?? {};
        const changes = {};

        if (full_name !== undefined) {
            if (!isNonEmptyString(full_name)) return res.status(400).json({ error: 'Invalid name' });
            changes.full_name = full_name.trim();
        }
        if (email !== undefined) {
            if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
            changes.email = normalizeEmail(email);
        }
        if (position !== undefined) changes.position = position;
        if (tag !== undefined) changes.tag = tag;
        if (agency_id !== undefined) {
            const agency = await findOwnedAgency(agency_id, req.user.id);
            if (!agency) return res.status(404).json({ error: 'Agency not found' });
            changes.agency_id = agency.id;
        }

        await contact.update(changes);
        res.status(200).json({ message: 'Contact updated successfully', contact });
    } catch (err) {
        console.error('Could not update contact:', err);
        res.status(500).json({ error: 'Server error' });
    }
}
