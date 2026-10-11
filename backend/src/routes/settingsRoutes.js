import express from 'express';
import {
    getProfile,
    updateProfile,
    getSmtpSettings,
    updateSmtpSettings,
    getNotificationPreferences,
    updateNotificationPreferences,
    changePassword,
} from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/smtp', getSmtpSettings);
router.put('/smtp', updateSmtpSettings);

router.get('/notifications', getNotificationPreferences);
router.put('/notifications', updateNotificationPreferences);

router.put('/security/password', changePassword);

export default router;
