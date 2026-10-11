import express from "express";
import { createContact, deleteContact, updateContact, getContacts } from "../controllers/contactController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate);
router.get('/', getContacts)
router.post('/', createContact)
router.put('/:id', updateContact)
router.delete('/:id', deleteContact)
export default router;
