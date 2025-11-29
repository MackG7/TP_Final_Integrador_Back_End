import { Router } from "express";
import ContactController from "../controllers/contactController.js"
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);


router.post("/invite", protect, ContactController.createInviteLink);

router.post("/", ContactController.addContact);

router.get("/", ContactController.getContacts);

router.put("/:contactId", ContactController.updateAlias);

router.delete("/:contactId", ContactController.deleteContact);

router.get("/resolve-invite/:token", ContactController.resolveInvitePublic);

export default router;
