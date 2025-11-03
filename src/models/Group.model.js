import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del grupo es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    description: {
        type: String,
        maxlength: [200, 'La descripción no puede tener más de 200 caracteres'],
        default: ''
    },
    url_img: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índice para búsquedas eficientes
groupSchema.index({ createdBy: 1, createdAt: -1 });
groupSchema.index({ members: 1 });

export default mongoose.model('Group', groupSchema);