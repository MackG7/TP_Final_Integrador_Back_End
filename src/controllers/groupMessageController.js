import GroupMessage from "../models/GroupMessage.model.js";
import Group from "../models/Group.model.js";

export default class GroupMessageController {

    static async getMessages(req, res) {
        try {
            const { groupId } = req.params;

            const messages = await GroupMessage.find({ groupId })
                .populate("sender", "username email")
                .sort({ createdAt: 1 });

            return res.json({ success: true, data: messages });

        } catch (error) {
            console.error("GM getMessages error:", error);
            return res.status(500).json({ success: false, message: "Error obteniendo mensajes del grupo" });
        }
    }

    static async sendMessage(req, res) {
        try {
            const sender = req.user._id;
            const { groupId } = req.params;
            const { message } = req.body;

            const newMsg = await GroupMessage.create({
                groupId,
                sender,
                content: message
            });

            return res.status(201).json({ success: true, data: newMsg });

        } catch (error) {
            console.error("GM sendMessage error:", error);
            return res.status(500).json({ success: false, message: "Error enviando mensaje" });
        }
    }
}
