// repositories/memberRepository.js
import Group from "../models/Group.model.js";

export default class MemberRepository {

    static async addMemberToGroup(groupId, userId, role = "member") {
        try {
            console.log("✅ MemberRepository.addMemberToGroup ejecutándose");

            const group = await Group.findById(groupId);
            if (!group) throw new Error("Grupo no encontrado");

            // agregar nuevo miembro con estructura correcta
            group.members.addToSet({
                userId,
                role
            });

            await group.save();
            return group;

        } catch (error) {
            console.error("MemberRepository - Error:", error);
            throw error;
        }
    }


    static async getGroupsByUserId(userId) {
        return await Group.find({
            "members.userId": userId
        });
    }


    static async removeMemberFromGroup(groupId, userId) {

        const group = await Group.findById(groupId);
        if (!group) throw new Error("Grupo no encontrado");

        group.members = group.members.filter(m => m.userId.toString() !== userId.toString());
        await group.save();

        return group;
    }


    static async updateMemberRole(groupId, userId, newRole) {

        const group = await Group.findOneAndUpdate(
            { _id: groupId, "members.userId": userId },
            { $set: { "members.$.role": newRole } },
            { new: true }
        );

        if (!group) throw new Error("Miembro no encontrado");
        return group;
    }

}
