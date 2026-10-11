import User from "../models/User.js";
import SmtpSettings from "../models/SmtpSettings.js";
import NotificationPreferences from "../models/NotificationPreferences.js";
import bcrypt from 'bcrypt';
import { isEmail, normalizeEmail, optionalString } from '../utils/validators.js';
import { MIN_PASSWORD_LENGTH } from './authController.js';
import { toPublicSmtp, validateSmtpInput } from './emailSettingsController.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, company, email } = req.body ?? {};
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!isEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (![first_name, last_name, company].every((v) => optionalString(v, 100))) {
            return res.status(400).json({ error: "Name or company is too long" });
        }
        const normalizedEmail = normalizeEmail(email);
        if (normalizedEmail !== user.email && await User.findOne({ where: { email: normalizedEmail } })) {
            return res.status(409).json({ error: "Email already in use" });
        }

        await user.update({ first_name, last_name, company, email: normalizedEmail });
        const { password, ...safe } = user.toJSON();
        res.status(200).json({ message: 'User updated successfully', user: safe })
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getSmtpSettings = async (req, res) => {
    try {
        const settings = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        res.json(settings ? toPublicSmtp(settings) : {
            smtp_host: '', smtp_port: 587, smtp_user: '', from_name: '', from_email: '',
            is_configured: false, has_password: false,
        });
    } catch (error) {
        console.error('SMTP settings error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateSmtpSettings = async (req, res) => {
    try {
        const input = req.body ?? {};
        const existing = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        // A blank password keeps the saved one; the API never returns it to the browser.
        const keepPassword = !input.smtp_password && Boolean(existing?.smtp_password);

        const problem = await validateSmtpInput(input, { requirePassword: !keepPassword });
        if (problem) return res.status(400).json({ error: problem });

        const values = {
            smtp_host: input.smtp_host.trim(),
            smtp_port: Number(input.smtp_port),
            smtp_user: input.smtp_user.trim(),
            from_name: input.from_name,
            from_email: input.from_email,
            is_configured: true,
        };
        if (!keepPassword) values.smtp_password = input.smtp_password;

        const settings = existing
            ? await existing.update(values)
            : await SmtpSettings.create({ ...values, user_id: req.user.id });

        res.json({ message: "SMTP settings updated", settings: toPublicSmtp(settings) });
    } catch (error) {
        console.error('SMTP settings error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

const NOTIFICATION_FIELDS = ['campaign_complete', 'new_reply', 'weekly_digest', 'bounce_alert'];

export const getNotificationPreferences = async (req, res) => {
    try {
        const [prefs] = await NotificationPreferences.findOrCreate({
            where: { user_id: req.user.id },
            defaults: { user_id: req.user.id }
        });
        res.json(prefs);
    } catch (error) {
        console.error('Notification preferences error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateNotificationPreferences = async (req, res) => {
    try {
        const body = req.body ?? {};
        const changes = {};
        for (const field of NOTIFICATION_FIELDS) {
            if (body[field] === undefined) continue;
            if (typeof body[field] !== 'boolean') {
                return res.status(400).json({ error: `${field} must be a boolean` });
            }
            changes[field] = body[field];
        }

        const [prefs] = await NotificationPreferences.findOrCreate({
            where: { user_id: req.user.id },
            defaults: { user_id: req.user.id }
        });
        await prefs.update(changes);

        res.json({ message: "Notification preferences updated", preferences: prefs });
    } catch (error) {
        console.error('Notification preferences error:', error);
        res.status(500).json({ error: "Server error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body ?? {};

        if (typeof current_password !== 'string' || typeof new_password !== 'string') {
            return res.status(400).json({ error: "Both passwords required" });
        }
        if (new_password.length < MIN_PASSWORD_LENGTH || new_password.length > 72) {
            return res.status(400).json({ error: `New password must be ${MIN_PASSWORD_LENGTH}-72 characters` });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(current_password, user.password);

        if (!isPasswordValid) {
            // 400, not 401: the browser client treats 401 as "session expired" and logs the user out.
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        await user.update({
            password: await bcrypt.hash(new_password, 12),
            password_changed_at: new Date()
        });

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: "Server error" });
    }
};
