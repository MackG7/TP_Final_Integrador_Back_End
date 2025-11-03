import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;