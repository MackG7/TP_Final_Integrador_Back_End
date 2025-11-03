import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    avatar: String,
    lastMessage: String,
});

export default mongoose.model("Contact", contactSchema);