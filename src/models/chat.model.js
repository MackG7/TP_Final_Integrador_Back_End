import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });

// ✅ Índice compuesto para evitar duplicados del mismo conjunto de participantes
chatSchema.index({ participants: 1 }, { 
    unique: true,
    partialFilterExpression: { isGroup: false } // Solo aplicar a chats no grupales
});

export default mongoose.model("Chat", chatSchema);