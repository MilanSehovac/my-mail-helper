import crypto from 'crypto';

const PREFIX = 'enc:v1:';

const getKey = () => crypto.createHash('sha256').update(process.env.SMTP_ENCRYPTION_KEY).digest();

export const encryptSecret = (plain) => {
    if (plain === null || plain === undefined || plain === '') return plain;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return PREFIX + [iv, tag, encrypted].map((b) => b.toString('base64')).join(':');
};

// Values without the prefix are legacy plaintext and returned unchanged.
export const decryptSecret = (stored) => {
    if (!stored || !String(stored).startsWith(PREFIX)) return stored;
    const [iv, tag, data] = String(stored).slice(PREFIX.length).split(':').map((p) => Buffer.from(p, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
};
