import mongoose from "mongoose";

const GroupMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "El nombre del grupo es requerido"],
            trim: true
        },
        description: { type: String, default: "" },
        url_img: { type: String, default: "" },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        members: {
            type: [GroupMemberSchema],
            default: []
        },

        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

mongoose.models.Group && delete mongoose.models.Group;
export default mongoose.model("Group", GroupSchema);

