import express from 'express';
import { getAgencies, getSegmentTags, createAgency, updateAgency, deleteAgency, getAgencyById, getAgencyNames } from '../controllers/agencyController.js';
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get('/', authenticate, getAgencies);
router.get('/names', authenticate, getAgencyNames);
router.get('/segment-tags', authenticate, getSegmentTags);
router.get('/:id', authenticate, getAgencyById);
router.post('/', authenticate, createAgency);
router.put('/:id', authenticate, updateAgency);
router.delete('/:id', authenticate, deleteAgency);
export default router;