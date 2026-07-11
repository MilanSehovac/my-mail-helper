import express from "express";
import { createContact, deleteContact, updateContact } from "../controllers/contactController.js";

const router = express.Router();

router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)
export default router;