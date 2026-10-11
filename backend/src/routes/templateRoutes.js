import express from "express";
import { getAllTemplates, createTemplate, deleteTemplate, updateTemplate, getTemplateById } from "../controllers/templateController.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router()

router.get('/', authenticate, getAllTemplates);
router.get('/:id', authenticate, getTemplateById)
router.post('/', authenticate, createTemplate)
router.put('/:id', authenticate, updateTemplate)
router.delete('/:id', authenticate, deleteTemplate)
export default router;