import { literal } from 'sequelize';
import { Template, Campaign } from '../models/index.js';
import { parseId, isNonEmptyString, optionalString } from '../utils/validators.js';
import { findUnknownVariables, ALLOWED_VARIABLES } from '../services/templateRenderer.js';

const findOwned = (req) => {
    const id = parseId(req.params.id);
    return id ? Template.findOne({ where: { id, user_id: req.user.id } }) : null;
};

const unknownVariablesError = (subject, body) => {
    const unknown = findUnknownVariables(subject, body);
    return unknown.length
        ? `Unknown variable(s): ${unknown.map((v) => `{{${v}}}`).join(', ')}. Allowed: ${ALLOWED_VARIABLES.join(', ')}`
        : null;
};

export const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll({
            attributes: {
                include: [
                    [literal('SUBSTRING(body, 1, 140)'), 'preview'],
                    [literal('(SELECT COUNT(*) FROM campaigns WHERE campaigns.template_id = Template.id)'), 'used_in'],
                ],
                exclude: ['body'],
            },
            where: { user_id: req.user.id },
            order: [['updated_at', 'DESC']],
        });
        res.json(templates.map((t) => ({ ...t.toJSON(), used_in: Number(t.get('used_in')) })));
    } catch (error) {
        console.error('Could not get templates:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getTemplateById = async (req, res) => {
    try {
        const template = await findOwned(req);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.status(200).json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const createTemplate = async (req, res) => {
    try {
        const { name, subject, body, category } = req.body ?? {};

        if (!isNonEmptyString(name) || !isNonEmptyString(subject) || !isNonEmptyString(body, 100000)) {
            return res.status(400).json({ error: 'Please provide name, subject, and body for the template' });
        }
        if (!optionalString(category, 100)) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        const problem = unknownVariablesError(subject, body);
        if (problem) return res.status(400).json({ error: problem });

        const newTemplate = await Template.create({
            user_id: req.user.id,
            name,
            subject,
            body,
            category: category || null
        });
        res.status(201).json(newTemplate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const updateTemplate = async (req, res) => {
    try {
        const template = await findOwned(req);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const next = {
            name: req.body?.name ?? template.name,
            subject: req.body?.subject ?? template.subject,
            body: req.body?.body ?? template.body,
        };
        if (!isNonEmptyString(next.name) || !isNonEmptyString(next.subject) || !isNonEmptyString(next.body, 100000)) {
            return res.status(400).json({ error: 'name, subject and body must be non-empty' });
        }
        const problem = unknownVariablesError(next.subject, next.body);
        if (problem) return res.status(400).json({ error: problem });

        const inUse = await Campaign.count({ where: { template_id: template.id, status: ['Scheduled', 'Sending'] } });
        if (inUse) {
            return res.status(409).json({ error: 'Template is used by an active campaign. Pause the campaign first.' });
        }

        if (req.body?.category !== undefined) next.category = req.body.category || null;
        await template.update(next);
        res.status(200).json({ message: 'Template updated successfully', template });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const deleteTemplate = async (req, res) => {
    try {
        const template = await findOwned(req);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const used = await Campaign.count({ where: { template_id: template.id } });
        if (used) {
            return res.status(409).json({ error: `Template is used by ${used} campaign(s) and cannot be deleted` });
        }
        await template.destroy();
        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
