import mongoose from "mongoose";

const GroupMessageSchema = new mongoose.Schema(
    {
        groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.models.GroupMessage ||
    mongoose.model("GroupMessage", GroupMessageSchema);
