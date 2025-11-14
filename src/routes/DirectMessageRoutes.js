import { Router } from "express";
import DirectMessageController from "../controllers/directMessageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// enviar mensaje directo
router.post("/", DirectMessageController.sendMessage);

// obtener conversación entre usuario logueado y userB
router.get("/:userB", DirectMessageController.getConversation);

// marcar como leídos los mensajes de senderId -> hacia mí
router.patch("/read/:senderId", DirectMessageController.markRead)

// editar mensaje
router.put("/:messageId", DirectMessageController.updateMessage);

// eliminar mensaje (soft delete)
router.delete("/:messageId", DirectMessageController.deleteMessage);;

export default router;