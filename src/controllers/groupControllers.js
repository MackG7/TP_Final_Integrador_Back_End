import Group from '../models/Group.model.js';
import User from '../models/User.model.js';
// import { createGroup } from '../controllers/groupController.js';

// ✅ CREAR GRUPO
export const createGroup = async (req, res) => {
    try {
        const { name, description, url_img } = req.body;
        const userId = req.user.id; // Del middleware de autenticación

        console.log('👥 Creando grupo:', { name, userId });

        // Validaciones
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'El nombre del grupo es requerido'
            });
        }

        // Crear grupo
        const newGroup = new Group({
            name,
            description: description || '',
            url_img: url_img || '',
            createdBy: userId,
            members: [userId] // El creador es el primer miembro
        });

        await newGroup.save();

        // Popular datos del creador
        await newGroup.populate('createdBy', 'name email');

        console.log('✅ Grupo creado:', newGroup.name);

        res.status(201).json({
            success: true,
            message: 'Grupo creado exitosamente',
            data: newGroup
        });

    } catch (error) {
        console.error('❌ Error creando grupo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ✅ OBTENER GRUPOS DEL USUARIO
export const getGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        const groups = await Group.find({ 
            members: userId 
        })
        .populate('createdBy', 'name email')
        .populate('members', 'name email')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: groups
        });

    } catch (error) {
        console.error('❌ Error obteniendo grupos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ✅ OBTENER GRUPO POR ID
export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const group = await Group.findOne({
            _id: id,
            members: userId
        })
        .populate('createdBy', 'name email')
        .populate('members', 'name email');

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Grupo no encontrado'
            });
        }

        res.json({
            success: true,
            data: group
        });

    } catch (error) {
        console.error('❌ Error obteniendo grupo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// ✅ INVITAR USUARIO A GRUPO
export const inviteUserToGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { invited_email } = req.body;
        const userId = req.user.id;

        // Verificar que el grupo existe y el usuario es miembro
        const group = await Group.findOne({
            _id: id,
            members: userId
        });

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Grupo no encontrado'
            });
        }

        // Verificar que el usuario invitado existe
        const userToInvite = await User.findOne({ email: invited_email });
        if (!userToInvite) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar que no sea ya miembro
        if (group.members.includes(userToInvite._id)) {
            return res.status(400).json({
                success: false,
                error: 'El usuario ya es miembro del grupo'
            });
        }

        // Agregar usuario al grupo
        group.members.push(userToInvite._id);
        await group.save();

        await group.populate('members', 'name email');

        res.json({
            success: true,
            message: 'Usuario invitado exitosamente',
            data: group
        });

    } catch (error) {
        console.error('❌ Error invitando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Placeholders para otras funciones
export const updateGroup = async (req, res) => {
    res.json({ success: true, message: 'Update group - En desarrollo' });
};

export const deleteGroup = async (req, res) => {
    res.json({ success: true, message: 'Delete group - En desarrollo' });
};

export const getGroupMembers = async (req, res) => {
    res.json({ success: true, message: 'Get group members - En desarrollo' });
};