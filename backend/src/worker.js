// Standalone sending worker: `npm run worker`.
// Set RUN_WORKER=false on the API process when running this, so only one place sends mail
// (running both is still safe: recipients are claimed atomically in the database).
import { validateEnv } from './config/env.js';
import sequelize from './config/db.js';
import { startCampaignWorker, stopCampaignWorker } from './services/campaignWorker.js';

validateEnv();

try {
  await sequelize.authenticate();
} catch (err) {
  console.error('Database connection failed:', err.message);
  process.exit(1);
}

startCampaignWorker();

const shutdown = async () => {
  stopCampaignWorker();
  await sequelize.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
