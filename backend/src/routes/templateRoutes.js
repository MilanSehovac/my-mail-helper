import express from "express";
import { getTemplates, createTemplate, deleteTemplate, updateTemplate, getTemplateById } from "../controllers/templateController.js";

const router = express.Router()

router.get('/', getTemplates);
router.get('/:id', getTemplateById)
router.post('/', createTemplate)
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)
export default router;