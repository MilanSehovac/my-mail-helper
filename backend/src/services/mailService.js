import nodemailer from 'nodemailer';
import { assertSafeSmtpTarget } from '../utils/smtpGuard.js';
import { decryptSecret } from '../utils/secrets.js';

// `config` uses the SmtpSettings column names. Passwords are decrypted here, never earlier.
export const createTransporter = (config) => {
    const port = Number(config.smtp_port) || 587;
    return nodemailer.createTransport({
        host: config.smtp_host,
        port,
        secure: port === 465,
        auth: {
            user: config.smtp_user,
            pass: decryptSecret(config.smtp_password),
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
    });
};

export const verifySmtpConnection = async (config) => {
    await assertSafeSmtpTarget(config.smtp_host, config.smtp_port);
    const transporter = createTransporter(config);
    return await transporter.verify();
};

const cleanHeaderValue = (value) => String(value ?? '').replace(/[\r\n"<>]/g, '').trim();

export const sendEmail = async (config, { to, subject, html, text, headers }) => {
    await assertSafeSmtpTarget(config.smtp_host, config.smtp_port);
    const transporter = createTransporter(config);
    return await transporter.sendMail({
        from: {
            name: cleanHeaderValue(config.from_name),
            address: cleanHeaderValue(config.from_email || config.smtp_user),
        },
        to,
        subject,
        text,
        html,
        headers,
    });
};
