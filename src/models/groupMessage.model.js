import mongoose from "mongoose";

const GroupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: { // ✅ nombre unificado
            type: String,
            required: true,
            trim: true
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
);

const GroupMessage = mongoose.models.GroupMessage || mongoose.model("GroupMessage", GroupMessageSchema);
export default GroupMessage;
