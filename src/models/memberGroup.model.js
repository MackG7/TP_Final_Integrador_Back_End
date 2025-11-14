import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        role: {
            type: String,
            enum: ["member", "admin", "moderator"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

/* Método estático para verificar si un usuario ya es miembro de un grupo */
memberSchema.statics.isMember = async function (userId, groupId) {
    const member = await this.findOne({ user: userId, group: groupId });
    return !!member;
};

/* Método estático para agregar un miembro solo si no existe */
memberSchema.statics.addMember = async function (userId, groupId, role = "member") {
    const alreadyMember = await this.isMember(userId, groupId);
    if (alreadyMember) throw new Error("El usuario ya es miembro del grupo");

    const member = new this({ user: userId, group: groupId, role });
    return await member.save();
};

export default mongoose.model("Member", memberSchema);
