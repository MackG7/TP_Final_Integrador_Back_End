import DirectMessage from "../models/directMessage.model";

export default class DirectMessageController {

    // GET conversacion entre logged user y otro userB
    static async getConversation(req, res) {
        try {
            const userA = req.user._id;
            const userB = req.params.userId;

            const messages = await DirectMessage.find({
                $or: [
                    { sender: userA, receiver: userB },
                    { sender: userB, receiver: userA }
                ]
            })
            .populate("sender receiver", "username email")
            .sort({ createdAt: 1 });

            return res.json({ ok: true, data: messages });

        } catch (error) {
            console.error("DM getConversation error:", error);
            return res.status(500).json({ ok: false, message: "Error al obtener conversación" });
        }
    }

    // POST enviar mensaje DM
    static async sendMessage(req, res) {
        try {
            const sender = req.user._id;
            const { receiverId, message } = req.body;

            const newMsg = await DirectMessage.create({
                sender,
                receiver: receiverId,
                content: message
            });

            return res.status(201).json({ ok: true, data: newMsg });

        } catch (error) {
            console.error("DM sendMessage error:", error);
            return res.status(500).json({ ok: false, message: "Error al enviar mensaje" });
        }
    }
}
