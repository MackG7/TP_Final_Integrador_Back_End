import DirectMessageRepository from "../repositories/directMessageRepository.js";

class DirectMessageController {

    static async sendMessage(req, res) {
        try {
            const senderId = req.user.user_id; 
            const { receiverId, message } = req.body;

            if (!receiverId || !message) {
                return res.status(400).json({
                    ok: false,
                    message: "receiverId y message son obligatorios"
                });
            }

            const newMessage = await DirectMessageRepository.sendMessage(senderId, receiverId, message);

            res.status(201).json({
                ok: true,
                message: "Mensaje enviado",
                data: newMessage
            });
        } catch (error) {
            console.error("DirectMessageController - Error en sendMessage:", error);
            res.status(500).json({
                ok: false,
                message: "Error al enviar mensaje",
                error: error.message
            });
        }
    }


    static async getConversation(req, res) {
        try {
            const userA = req.user.user_id;2
            const { userB } = req.params;

            if (!userB) {
                return res.status(400).json({
                    ok: false,
                    message: "userB obligatorio"
                });
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;

            const result = await DirectMessageRepository.getConversation(userA, userB, page, limit);

            res.status(200).json({
                ok: true,
                data: result.messages,
                pagination: result.pagination
            });

        } catch (error) {
            console.error("DirectMessageController - Error en getConversation:", error);
            res.status(500).json({
                ok: false,
                message: "Error al obtener conversación",
                error: error.message
            });
        }
    }


    static async markRead(req, res) {
        try {
            const receiverId = req.user._id;
            const { senderId } = req.params;

            if (!senderId) {
                return res.status(400).json({
                    ok: false,
                    message: "senderId obligatorio"
                });
            }

            await DirectMessageRepository.markAsRead(senderId, receiverId);

            res.status(200).json({
                ok: true,
                message: "Mensajes marcados como leídos"
            });
        } catch (error) {
            console.error("DirectMessageController - Error en markRead:", error);
            res.status(500).json({
                ok: false,
                message: "Error al marcar mensajes como leídos",
                error: error.message
            });
        }
    }

    static async updateMessage(req, res) {
    try {
        const { messageId } = req.params;
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ ok: false, message: "Nuevo contenido requerido" });
        }

        const updated = await DirectMessageRepository.updateMessage(messageId, userId, message);

        if (!updated) {
            return res.status(404).json({ ok: false, message: "Mensaje no encontrado o no tienes permisos" });
        }

        res.status(200).json({ ok: true, data: updated });

    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
}

static async deleteMessage(req, res) {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const deleted = await DirectMessageRepository.deleteMessage(messageId, userId);

        if (!deleted) {
            return res.status(404).json({ ok: false, message: "Mensaje no encontrado o no tienes permisos" });
        }

        res.status(200).json({ ok: true, message: "Mensaje eliminado correctamente", data: deleted });

    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
}

}

export default DirectMessageController;