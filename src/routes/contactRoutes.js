import { Router } from "express";
import ContactController from "../controllers/contactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// INVITE
router.post("/invite", protect, ContactController.createInviteLink);

// CREATE
router.post("/", ContactController.addContact);

// READ
router.get("/", ContactController.getContacts);

// UPDATE alias
router.put("/:contactId", ContactController.updateAlias);

// DELETE (soft delete)
router.delete("/:contactId", ContactController.deleteContact);


export default router;
