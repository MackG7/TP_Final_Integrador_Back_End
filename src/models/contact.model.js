import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        contactUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        alias: { type: String, trim: true },

        // ✅ WA MODE
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Contact = mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
export default Contact;