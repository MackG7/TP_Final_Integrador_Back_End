import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invitedEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Índice para expiración automática
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Invite', inviteSchema);