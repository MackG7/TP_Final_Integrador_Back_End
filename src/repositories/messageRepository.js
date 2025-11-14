import Message from "../models/Message.model.js";
import Chat from "../models/chat.model.js";

export default class MessageRepository {

    static async sendMessage(senderId, chatId, content) {
        const chat = await Chat.findById(chatId);
        if (!chat) throw new Error("Chat no encontrado");

        // crear mensaje
        const msg = await Message.create({
            chatId,
            sender: senderId,
            content, // ✅ unificado
        });

        // actualizar último mensaje del chat
        chat.lastMessage = msg._id;
        await chat.save();

        return msg.populate("sender", "username email");
    }

    static async getMessages(chatId, page = 1, limit = 25) {
        const skip = (page - 1) * limit;

        const messages = await Message.find({ chatId })
            .populate("sender", "username email")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ chatId });

        return {
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalMessages: total,
            },
        };
    }

    static async updateMessage(messageId, senderId, newContent) {
        return await Message.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { $set: { content: newContent } },
            { new: true }
        );
    }

    static async deleteMessage(messageId, senderId) {
        return await Message.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { $set: { content: "Este mensaje fue eliminado" } },
            { new: true }
        );
    }
}
