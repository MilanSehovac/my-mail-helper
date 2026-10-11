import express from "express";
import {createCampaign, launchCampaign, deleteCampaign, getCampaigns, updateCampaign} from "../controllers/campaignController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router()

router.get('/', authenticate, getCampaigns)
router.post('/', authenticate, createCampaign)
router.post('/:id/launch', authenticate, launchCampaign)
router.put('/:id', authenticate, updateCampaign)
router.delete('/:id', authenticate, deleteCampaign)
export default router