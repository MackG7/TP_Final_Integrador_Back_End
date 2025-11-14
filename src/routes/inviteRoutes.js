import { Router } from "express";
import InviteController from "../controllers/inviteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// crear invitación
router.post("/", protect, InviteController.createInvite);

// validar si el token existe (esto se usa mucho en pantalla register)
router.get("/:token", InviteController.validateInvite);

// marcar usada
router.put("/:token", InviteController.markUsed);

export default router;
