import { Router } from "express";
import GroupMessageController from "../controllers/groupMessageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// todas requieren auth
router.use(protect);

// enviar mensaje al grupo
router.post("/:groupId/message", GroupMessageController.sendMessage);

// obtener mensajes del grupo
router.get("/:groupId/messages", GroupMessageController.getMessages);

// editar mensaje
router.put("/:groupId/message/:messageId", GroupMessageController.updateMessage);

// eliminar mensaje (soft delete)
router.delete("/:groupId/message/:messageId", GroupMessageController.deleteMessage);

export default router;
