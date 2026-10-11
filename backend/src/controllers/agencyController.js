import { Agency, Contact } from '../models/index.js';
import { Op, literal } from 'sequelize';
import { parseId, pick, isNonEmptyString, optionalString } from '../utils/validators.js';

const FIELDS = ['name', 'country', 'city', 'website', 'segment_tag', 'status', 'counter', 'last_contact', 'comment'];
const STATUSES = Agency.rawAttributes.status.type.values;

const validate = (body, { partial }) => {
    const required = ['name', 'country', 'city'];
    for (const key of required) {
        if (body[key] === undefined ? !partial : !isNonEmptyString(body[key])) {
            return `${key} is required`;
        }
    }
    for (const key of ['website', 'segment_tag', 'comment']) {
        if (!optionalString(body[key], key === 'comment' ? 5000 : 255)) return `${key} is invalid`;
    }
    if (body.status !== undefined && !STATUSES.includes(body.status)) {
        return `status must be one of: ${STATUSES.join(', ')}`;
    }
    return null;
};

const findOwned = (req) => {
    const id = parseId(req.params.id);
    return id ? Agency.findOne({ where: { id, user_id: req.user.id } }) : null;
};

export const getAgencies = async (req, res) => {
    try {
        const agencies = await Agency.findAll({
            where: { user_id: req.user.id },
            attributes: {
                include: [[literal('(SELECT COUNT(*) FROM contacts WHERE contacts.agency_id = Agency.id)'), 'contacts_count']]
            },
            order: [['created_at', 'DESC']]
        });
        res.json(agencies.map((a) => ({ ...a.toJSON(), contacts_count: Number(a.get('contacts_count')) })));
    } catch (error) {
        console.error('Could not get agencies:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getAgencyById = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const agency = id && await Agency.findOne({
            where: { id, user_id: req.user.id },
            include: { model: Contact, as: 'contacts' }
        });
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }
        res.status(200).json(agency);
    } catch (error) {
        console.error('Could not get agency:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export const getAgencyNames = async (req, res) => {
    try {
        const agencies = await Agency.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
            attributes: ['id', 'name', 'segment_tag']
        });
        res.json(agencies);
    } catch (error) {
        console.error('Could not get agency names:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export const createAgency = async (req, res) => {
    try {
        const body = req.body ?? {};
        const problem = validate(body, { partial: false });
        if (problem) return res.status(400).json({ error: problem });

        const newAgency = await Agency.create({
            ...pick(body, FIELDS.filter((f) => !['counter', 'last_contact'].includes(f))),
            user_id: req.user.id
        });
        res.status(201).json(newAgency);
    } catch (error) {
        console.error('Could not create agency:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

export const getSegmentTags = async (req, res) => {
    try {
        const segments = await Agency.findAll({
            attributes: ['segment_tag'],
            raw: true,
            where: { user_id: req.user.id, segment_tag: { [Op.and]: [{ [Op.not]: null }, { [Op.ne]: '' }] } },
            group: ['segment_tag']
        });
        res.json(segments.map(s => s.segment_tag));
    } catch (error) {
        console.error('Could not get segment tags:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateAgency = async (req, res) => {
    try {
        const agency = await findOwned(req);
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }
        const body = req.body ?? {};
        const problem = validate(body, { partial: true });
        if (problem) return res.status(400).json({ error: problem });

        await agency.update(pick(body, FIELDS));
        res.status(200).json({ message: 'Agency updated successfully', agency })
    } catch (err) {
        console.error('Could not update agency:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const deleteAgency = async (req, res) => {
    try {
        const agency = await findOwned(req);
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }
        await agency.destroy();
        res.status(200).json({ message: 'Agency deleted successfully' });
    } catch (err) {
        console.error('Could not delete agency:', err);
        res.status(500).json({ error: 'Server error' });
    }
}
