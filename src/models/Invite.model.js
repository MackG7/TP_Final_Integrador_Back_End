import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema(
{
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, trim: true },
    token: { type: String, required: true },
    status: { type: String, enum:["pending","used","expired"], default:"pending" },
    expiresAt: { type: Date, required: true }
},{
    timestamps:true
});

InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invite = mongoose.models.Invite || mongoose.model("Invite", InviteSchema);
export default Invite;
