import 'dotenv/config';

const required = ['JWT_SECRET', 'SMTP_ENCRYPTION_KEY', 'DB_NAME', 'DB_USER'];

export const validateEnv = () => {
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters');
    }
    if (process.env.SMTP_ENCRYPTION_KEY.length < 32) {
        throw new Error('SMTP_ENCRYPTION_KEY must be at least 32 characters');
    }
};

export const config = {
    status: process.env.STATUS || 'development',
    get port() {
        return Number(
            (this.status === 'development' ? process.env.DEV_PORT : process.env.PROD_PORT) || process.env.PORT || 8000
        );
    },
    // Comma-separated list of allowed browser origins
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    // Public base URL of this API, used to build unsubscribe links in emails
    publicApiUrl: (process.env.PUBLIC_API_URL || `http://localhost:${process.env.DEV_PORT || 8000}`).replace(/\/$/, ''),
    // Minimum gap between two emails of the same campaign
    sendIntervalMs: Number(process.env.MAIL_SEND_INTERVAL_MS || 180000),
    workerTickMs: Number(process.env.WORKER_TICK_MS || 30000),
    // Run the sending worker inside the API process (set RUN_WORKER=false when using `npm run worker`)
    runWorker: process.env.RUN_WORKER !== 'false',
    allowPrivateSmtpHosts: process.env.ALLOW_PRIVATE_SMTP_HOSTS === 'true',
};
