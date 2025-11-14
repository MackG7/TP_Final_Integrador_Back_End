import Chat from "../models/chat.model.js";
import User from "../models/User.model.js";
import Message from "../models/Message.model.js";

export default class ChatController {

    static async createOrGetChat(req, res) {
        try {
            const userId = req.user._id;
            const { contactId } = req.body;

            if (!contactId) {
                return res.status(400).json({ success: false, message: "contactId es requerido" });
            }

            const contact = await User.findById(contactId);
            if (!contact) {
                return res.status(404).json({ success: false, message: "Contacto no encontrado" });
            }

            const participants = [userId, contactId].sort();

            let chat = await Chat.findOne({
                participants: {
                    $all: participants,
                    $size: participants.length
                },
                isGroup: false
            }).populate("participants", "username email");

            if (!chat) {
                try {
                    chat = await Chat.create({
                        participants: participants,
                        isGroup: false
                    });
                    chat = await Chat.findById(chat._id).populate("participants", "username email");
                } catch (error) {

                    if (error.code === 11000) {
                        chat = await Chat.findOne({
                            participants: {
                                $all: participants,
                                $size: participants.length
                            },
                            isGroup: false
                        }).populate("participants", "username email");
                    } else {
                        throw error;
                    }
                }
            }
            return res.status(200).json({ success: true, data: chat });

        } catch (error) {
            console.error("ChatController.createOrGetChat error:", error);
            return res.status(500).json({
                success: false,
                message: error.code === 11000 ? "El chat ya existe" : "Error al crear/obtener chat"
            });
        }
    }

    static async getMyChats(req, res) {
        try {
            const userId = req.user._id;

            const chats = await Chat.find({ participants: userId })
                .populate("participants", "username email")
                .populate("lastMessage")
                .sort({ updatedAt: -1 });

            const chatsFormatted = chats.map(c => ({
                ...c.toObject(),
                type: "direct"
            }));

            return res.status(200).json({ success: true, data: chatsFormatted });

        } catch (error) {
            console.error("ChatController.getMyChats error:", error.stack || error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener chats",
                error: error.message
            });
        }
    }

    static async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user._id;

            console.log(" Solicitando mensajes para chat:", chatId);

            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, message: "Chat no encontrado" });
            }

            if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
                return res.status(403).json({ success: false, message: "No perteneces al chat" });
            }

            const messages = await Message.find({ chatId })
                .populate("sender", "username email _id")
                .sort({ createdAt: 1 });

            console.log(` Encontrados ${messages.length} mensajes`);

            return res.status(200).json({
                success: true,
                data: {
                    messages,
                    chatId
                }
            });

        } catch (error) {
            console.error("ChatController.getChatMessages error:", error);
            return res.status(500).json({ success: false, message: "Error al obtener mensajes" });
        }
    }

    static async sendMessage(req, res) {
        try {
            const userId = req.user._id;
            const { chatId } = req.params;
            const { content } = req.body;

            console.log("📤 Enviando mensaje:", {
                chatId,
                content,
                sender: userId
            });

            if (!content || !content.trim()) {
                return res.status(400).json({ success: false, message: "El contenido es requerido" });
            }

            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, message: "Chat no encontrado" });
            }

            if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
                return res.status(403).json({ success: false, message: "No perteneces al chat" });
            }

            const newMessage = await Message.create({
                chatId,
                sender: userId,
                content: content.trim()
            });

            await newMessage.populate("sender", "username email _id");

            chat.lastMessage = newMessage._id;
            chat.updatedAt = new Date();
            await chat.save();

            console.log(" Mensaje creado:", {
                id: newMessage._id,
                content: newMessage.content,
                chatId: newMessage.chatId,
                sender: newMessage.sender?.username || 'N/A',
                timestamp: newMessage.createdAt
            });

            return res.status(201).json({
                success: true,
                message: "Mensaje enviado correctamente",
                data: newMessage
            });

        } catch (error) {
            console.error("ChatController.sendMessage error:", error);
            return res.status(500).json({ success: false, message: error.message || "Error al enviar mensaje" });
        }
    }

    static async deleteChat(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user._id;

            const chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ success: false, message: "Chat no encontrado" });
            }

            if (!chat.participants.map(p => p.toString()).includes(userId.toString())) {
                return res.status(403).json({ success: false, message: "No tienes permiso para eliminar este chat" });
            }

            await Chat.findByIdAndDelete(chatId);

            return res.status(200).json({
                success: true,
                message: "Chat eliminado correctamente"
            });
        } catch (error) {
            console.error("ChatController.deleteChat error:", error);
            return res.status(500).json({ success: false, message: "Error al eliminar el chat" });
        }
    }


    static async createChat(req, res) {
        try {
            const userId = req.user._id;
            const { participants } = req.body;

            if (!participants || !Array.isArray(participants)) {
                return res.status(400).json({ success: false, message: "Participants array es requerido" });
            }

            const allParticipants = [...new Set([...participants, userId.toString()])].sort();

            let chat = await Chat.findOne({
                participants: {
                    $all: allParticipants,
                    $size: allParticipants.length
                },
                isGroup: allParticipants.length > 2
            }).populate("participants", "username email");

            if (!chat) {
                try {
                    chat = await Chat.create({
                        participants: allParticipants,
                        isGroup: allParticipants.length > 2
                    });
                    chat = await Chat.findById(chat._id).populate("participants", "username email");
                } catch (error) {

                    if (error.code === 11000) {
                        chat = await Chat.findOne({
                            participants: {
                                $all: allParticipants,
                                $size: allParticipants.length
                            }
                        }).populate("participants", "username email");

                        if (!chat) {
                            throw new Error("Chat duplicado pero no encontrado");
                        }
                    } else {
                        throw error;
                    }
                }
            }

            return res.status(200).json({ success: true, data: chat });

        } catch (error) {
            console.error("ChatController.createChat error:", error);
            return res.status(500).json({
                success: false,
                message: error.code === 11000 ? "El chat ya existe" : "Error al crear chat"
            });
        }
    }
}