import GroupMessageRepository from "../repositories/groupMessageRepository.js";

class GroupMessageController {

    static async sendMessage(req, res) {
        try {
            const { content } = req.body; // ✅ ahora se llama "content"
            const { groupId } = req.params;
            const senderId = req.user._id;

            const msg = await GroupMessageRepository.sendGroupMessage(senderId, groupId, content);

            res.status(201).json({
                success: true,
                message: "Mensaje enviado correctamente",
                data: msg
            });

        } catch (error) {
            console.error("GroupMessageController - sendMessage:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async getMessages(req, res) {
        try {
            const { groupId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;

            const result = await GroupMessageRepository.getGroupMessages(groupId, page, limit);

            res.status(200).json({
                success: true,
                data: result.messages,
                pagination: result.pagination
            });

        } catch (error) {
            console.error("GroupMessageController - getMessages:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateMessage(req, res) {
        try {
            const { messageId } = req.params;
            const senderId = req.user._id;
            const { content } = req.body;

            const updated = await GroupMessageRepository.updateMessage(messageId, senderId, content);

            if (!updated)
                return res.status(403).json({ success: false, message: "No puedes editar este mensaje" });

            res.status(200).json({ success: true, message: "Mensaje actualizado", data: updated });
        } catch (error) {
            console.error("GroupMessageController - updateMessage:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    static async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const senderId = req.user._id;

            const deleted = await GroupMessageRepository.deleteMessage(messageId, senderId);

            if (!deleted)
                return res.status(403).json({ success: false, message: "No puedes eliminar este mensaje" });

            res.status(200).json({ success: true, message: "Mensaje eliminado" });
        } catch (error) {
            console.error("GroupMessageController - deleteMessage:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default GroupMessageController;
