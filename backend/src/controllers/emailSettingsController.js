import { SmtpSettings, User } from '../models/index.js';
import { sendEmail, verifySmtpConnection } from '../services/mailService.js';
import { assertSafeSmtpTarget } from '../utils/smtpGuard.js';
import { isEmail, isNonEmptyString, optionalString } from '../utils/validators.js';

export const toPublicSmtp = (settings) => ({
    smtp_host: settings.smtp_host,
    smtp_port: settings.smtp_port,
    smtp_user: settings.smtp_user,
    from_name: settings.from_name,
    from_email: settings.from_email,
    is_configured: settings.is_configured,
    has_password: Boolean(settings.smtp_password),
});

// Returns an error string or null. A blank password is allowed on update (keeps the saved one).
export const validateSmtpInput = async (input, { requirePassword }) => {
    const { smtp_host, smtp_port, smtp_user, smtp_password, from_name, from_email } = input;
    if (!isNonEmptyString(smtp_host) || !isNonEmptyString(smtp_user)) return 'SMTP host and user are required';
    if (requirePassword && !isNonEmptyString(smtp_password, 1000)) return 'SMTP password is required';
    if (!optionalString(from_name, 100)) return 'from_name is too long';
    if (from_email && !isEmail(from_email)) return 'from_email is not a valid email';
    try {
        await assertSafeSmtpTarget(smtp_host, smtp_port);
    } catch (error) {
        return error.message;
    }
    return null;
};

export const getEmailSettings = async (req, res) => {
    try {
        const settings = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        res.json({ success: true, data: settings ? toPublicSmtp(settings) : null });
    } catch (error) {
        console.error('SMTP settings error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export const saveEmailSettings = async (req, res) => {
    try {
        const input = req.body ?? {};
        const existing = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        const keepPassword = !input.smtp_password && Boolean(existing?.smtp_password);

        const problem = await validateSmtpInput(input, { requirePassword: !keepPassword });
        if (problem) return res.status(400).json({ success: false, error: problem });

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

        res.json({ success: true, message: 'SMTP settings saved', data: toPublicSmtp(settings) });
    } catch (error) {
        console.error('SMTP settings error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// Sends a test message to the logged-in user's own account email using the submitted (or saved) settings.
export const sendTestEmail = async (req, res) => {
    try {
        const input = req.body ?? {};
        const saved = await SmtpSettings.findOne({ where: { user_id: req.user.id } });
        const config = {
            smtp_host: input.smtp_host,
            smtp_port: input.smtp_port,
            smtp_user: input.smtp_user,
            smtp_password: input.smtp_password || saved?.smtp_password, // already encrypted when taken from DB
            from_name: input.from_name,
            from_email: input.from_email,
        };
        const problem = await validateSmtpInput(config, { requirePassword: true });
        if (problem) return res.status(400).json({ success: false, error: problem });

        const user = await User.findByPk(req.user.id, { attributes: ['email'] });
        await verifySmtpConnection(config);
        await sendEmail(config, {
            to: user.email,
            subject: 'Test Email - SMTP Configuration',
            text: 'Your SMTP settings work correctly.',
            html: '<p><strong>Your SMTP settings work correctly.</strong> Your configuration is ready.</p>',
        });
        res.json({ success: true, message: `Test email sent to ${user.email}` });
    } catch (error) {
        res.status(400).json({ success: false, error: `SMTP test failed: ${error.message}` });
    }
}
