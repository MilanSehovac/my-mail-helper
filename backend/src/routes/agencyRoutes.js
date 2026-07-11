import express from 'express';
import { getAgencies, createAgency, updateAgency, deleteAgency, getAgencyById } from '../controllers/agencyController.js';

const router = express.Router();

router.get('/', getAgencies);
router.get('/:id', getAgencyById);
router.post('/', createAgency);
router.put('/:id', updateAgency);
router.delete('/:id', deleteAgency);
export default router;