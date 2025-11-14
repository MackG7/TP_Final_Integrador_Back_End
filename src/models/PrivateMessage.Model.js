import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PrivateMessage",
            default: null,
        },
    },
    { timestamps: true }
);

// Evita crear duplicado de chat entre los mismos dos usuarios
ChatSchema.index({ participants: 1 }, { unique: true });

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
