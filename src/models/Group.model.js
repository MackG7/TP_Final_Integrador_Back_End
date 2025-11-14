import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del grupo es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'La descripción no puede exceder 200 caracteres'],
        default: ''
    },
    url_img: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El creador del grupo es requerido']
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índice para búsqueda eficiente
groupSchema.index({ "members.userId": 1, isActive: 1 });
groupSchema.index({ name: 'text', description: 'text' });

// Método para verificar si un usuario es miembro
groupSchema.methods.isMember = function(userId) {
    return this.members.some(member => 
        member.userId.toString() === userId.toString()
    );
};

// Método para verificar si un usuario es admin
groupSchema.methods.isAdmin = function(userId) {
    return this.members.some(member => 
        member.userId.toString() === userId.toString() && 
        member.role === 'admin'
    );
};

export default mongoose.model('Group', groupSchema);