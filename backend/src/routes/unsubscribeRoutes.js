import express from 'express';
import { showUnsubscribe, confirmUnsubscribe } from '../controllers/unsubscribeController.js';

// Public on purpose: recipients are not logged in. The signed token identifies the contact.
const router = express.Router();
router.get('/:token', showUnsubscribe);
router.post('/:token', confirmUnsubscribe);
export default router;
