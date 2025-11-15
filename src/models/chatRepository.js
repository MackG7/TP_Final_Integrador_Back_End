import Chat from "./chat.model.js";
import PrivateMessage from "./PrivateMessage.Model.js";
import Contact from "../controllers/contactController.js"; 
import mongoose from "mongoose";

class ChatRepository {
    // 🔹 Crear o recuperar chat entre 2 usuarios
    static async createOrGetChat(userId, contactId) {
        // validar si user tiene agregado a contactId
        const exists = await Contact.findOne({
            owner: userId,
            contactUser: contactId,
        });

        if (!exists) {
            throw new Error("No puedes iniciar chat: el contacto no está agregado");
        }

        // buscar si ya existe un chat entre ambos
        let chat = await Chat.findOne({
            participants: { $all: [userId, contactId] },
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [userId, contactId],
            });
        }

        return chat.populate("participants", "username email");
    }

    // 🔹 Enviar mensaje privado
    static async sendMessage(chatId, senderId, receiverId, message) {
        const msg = await PrivateMessage.create({
            chatId,
            sender: senderId,
            receiver: receiverId,
            message,
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: msg._id });
        return msg.populate("sender receiver", "username email");
    }

    // 🔹 Obtener todos los mensajes del chat
    static async getMessages(chatId, page = 1, limit = 25) {
        const skip = (page - 1) * limit;
        const messages = await PrivateMessage.find({ chatId })
            .populate("sender receiver", "username email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await PrivateMessage.countDocuments({ chatId });

        return {
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalMessages: total,
            },
        };
    }

    // 🔹 Obtener todos los chats del usuario
    static async getUserChats(userId) {
        return await Chat.find({ participants: userId })
            .populate("participants", "username email")
            .populate("lastMessage");
    }
}

export default ChatRepository;
