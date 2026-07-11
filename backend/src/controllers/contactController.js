import { Contact, Agency } from '../models/index.js';

export const createContact = async (req, res) =>{
    try{
        const { full_name, email , agency_id, position } = req.body;

        if (!full_name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        if (!agency_id) {
            return res.status(400).json({error: 'Agency ID is required'});
        }

        const agency = await Agency.findByPk(agency_id);

        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }

        const newContact = await Contact.create({
            agency_id,
            full_name,
            position,
            email
        })
        res.status(201).json(newContact);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Failed to create contact' });
    }
}

export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByPk(id);

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
        const { id } = req.params;
        const { full_name, email, agency_id, position } = req.body;

        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        if (agency_id) {
            const agency = await Agency.findByPk(agency_id);
            if (!agency) {
                return res.status(404).json({ error: 'Agency not found' });
            }
        }

        await contact.update({
            full_name,
            email,
            agency_id,
            position
        });

        res.status(200).json({ message: 'Contact updated successfully', contact });
    } catch (err) {
        console.error('Could not update contact:', err);
        res.status(500).json({ error: 'Server error' });
    }
}