import { Router } from "express";
import ChatController from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();



// 📥 Obtener todos los chats del usuario autenticado
router.get("/my-chats", protect, ChatController.getMyChats);

// 💬 Obtener mensajes de un chat específico
router.get("/:chatId/messages", protect, ChatController.getChatMessages);

// 📨 Enviar mensaje a un chat
router.post("/:chatId/message", protect, ChatController.sendMessage);

// 🆕 Crear chat manualmente (uno a uno o grupo pequeño)
router.post("/create", protect, ChatController.createChat);

// 🧠 Crear o recuperar chat existente entre dos usuarios
router.post("/create-or-get", protect, ChatController.createOrGetChat);




// 🗑️ Eliminar un mensaje específico
router.delete("/message/:messageId", protect, ChatController.deleteMessage || ((req, res) => {
    res.status(200).json({ success: true, message: "deleteMessage aún no implementado" });
}));

// ❌ Eliminar un chat completo
router.delete("/:chatId", protect, ChatController.deleteChat || ((req, res) => {
    res.status(200).json({ success: true, message: "deleteChat aún no implementado" });
}));

// 🧹 Limpiar mensajes de un chat (sin borrarlo)
router.delete("/:chatId/clear", protect, ChatController.clearChat || ((req, res) => {
    res.status(200).json({ success: true, message: "clearChat aún no implementado" });
}));

// 🕰️ Eliminar mensajes antiguos del sistema (mantenimiento)
router.delete("/messages/cleanup", protect, ChatController.deleteOldMessages || ((req, res) => {
    res.status(200).json({ success: true, message: "deleteOldMessages aún no implementado" });
}));

export default router;
