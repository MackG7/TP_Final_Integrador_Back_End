import DirectMessage from "../models/DirectMessage.model.js";

export default class DirectMessageRepository {

    static async sendMessage(senderId, receiverId, content) { // ✅ Cambiado 'message' por 'content'
        const msg = await DirectMessage.create({
            sender: senderId,
            receiver: receiverId,
            content // ✅ Ahora usa 'content' que viene como parámetro
        });
        return msg;
    }

    static async getConversation(userA, userB, page = 1, limit = 25) {
        const skip = (page - 1) * limit;

        const messages = await DirectMessage.find({
            $or: [
                { sender: userA, receiver: userB },
                { sender: userB, receiver: userA },
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await DirectMessage.countDocuments({
            $or: [
                { sender: userA, receiver: userB },
                { sender: userB, receiver: userA },
            ]
        });

        return {
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalMessages: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    static async markAsRead(senderId, receiverId) {
        await DirectMessage.updateMany(
            { sender: senderId, receiver: receiverId, readAt: null },
            { $set: { readAt: new Date() } }
        );
    }

    static async updateMessage(messageId, userId, newContent) {
        return await DirectMessage.findOneAndUpdate(
            { _id: messageId, sender: userId },
            { $set: { content: newContent } }, // ✅ Cambiado 'message' por 'content'
            { new: true }
        );
    }

    static async deleteMessage(messageId, userId) {
        return await DirectMessage.findOneAndUpdate(
            { _id: messageId, sender: userId },
            { $set: { content: "Este mensaje fue eliminado" } }, // ✅ Cambiado 'message' por 'content'
            { new: true }
        );
    }
}