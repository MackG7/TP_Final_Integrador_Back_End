import GroupMessage from "../models/groupMessage.model.js";
import Group from "../models/Group.model.js";

export default class GroupMessageRepository {

    static async sendGroupMessage(senderId, groupId, content) {
        const group = await Group.findById(groupId);
        if (!group) throw new Error("Grupo no existe");

        // validar que el usuario pertenece al grupo
        const isMember = group.members.some(m => m.userId.toString() === senderId.toString());
        if (!isMember) throw new Error("No perteneces al grupo");

        const msg = await GroupMessage.create({
            groupId,
            sender: senderId,
            content   
        });

        return msg.populate("sender", "username email");
    }

    static async getGroupMessages(groupId, page = 1, limit = 25) {
        const skip = (page - 1) * limit;

        const messages = await GroupMessage.find({ groupId })
            .populate("sender", "username email")
            .sort({ createdAt: 1 }) // orden cronológico normal
            .skip(skip)
            .limit(limit);

        const total = await GroupMessage.countDocuments({ groupId });

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

    static async updateMessage(messageId, senderId, newContent) {
        return await GroupMessage.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { $set: { content: newContent } },
            { new: true }
        );
    }

    static async deleteMessage(messageId, senderId) {
        return await GroupMessage.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { $set: { content: "Este mensaje fue eliminado" } },
            { new: true }
        );
    }

    static async markAsRead(messageId, userId) {
        await GroupMessage.findByIdAndUpdate(messageId, {
            $addToSet: { readBy: userId }
        });
    }
}
