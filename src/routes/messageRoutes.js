import express from "express";
import {
    sendMessageToGroup,
    getMessagesByGroup,
    updateMessage,
    deleteMessage
} from "../controllers/messageControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📩 Enviar mensaje a un grupo
router.post("/:groupId", protect, sendMessageToGroup);

// 💬 Obtener todos los mensajes de un grupo
router.get("/:groupId", protect, getMessagesByGroup);

// ✏️ Actualizar mensaje
router.put("/:messageId", protect, updateMessage);

// ❌ Eliminar mensaje
router.delete("/:messageId", protect, deleteMessage);

export default router;