import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, validateEnv } from './config/env.js';
import sequelize from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import settingsRoutes from './routes/settingsRoutes.js';
import emailSettingsRoutes from "./routes/emailSettingsRoutes.js";
import unsubscribeRoutes from "./routes/unsubscribeRoutes.js";
import { startCampaignWorker, stopCampaignWorker } from './services/campaignWorker.js';

validateEnv();

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Non-browser clients (curl, mail clients following unsubscribe links) send no Origin header.
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '100kb' }));

// Liveness: process is up. Readiness: database is reachable.
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'database unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/contact', contactRoutes)
app.use('/api/campaign', campaignRoutes)
app.use('/api/settings', settingsRoutes);
app.use('/api/service/email', emailSettingsRoutes)
app.use('/api/unsubscribe', unsubscribeRoutes)

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.message === 'Origin not allowed by CORS') return res.status(403).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

try {
  await sequelize.authenticate();
  console.log('Database connected');
} catch (err) {
  console.error('Database connection failed:', err.message);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`Server is in ${config.status} mode, running on port ${config.port}`);
  startCampaignWorker();
});

const shutdown = () => {
  stopCampaignWorker();
  server.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
