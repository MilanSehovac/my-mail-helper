import express from 'express';
import rateLimit from 'express-rate-limit';
import { getEmailSettings, saveEmailSettings, sendTestEmail } from "../controllers/emailSettingsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
const testLimiter = rateLimit({ windowMs: 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

router.use(authenticate);
router.get('/', getEmailSettings);
router.post('/', saveEmailSettings);
router.post('/test', testLimiter, sendTestEmail);
export default router;
