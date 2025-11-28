import mongoose from "mongoose";

const DirectMessageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true }
    },
    { timestamps: true }
);

export default mongoose.models.DirectMessage ||
    mongoose.model("DirectMessage", DirectMessageSchema);
