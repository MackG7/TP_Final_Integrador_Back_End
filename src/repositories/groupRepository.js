import Group from "../models/Group.model.js";

export default class GroupRepository {
    
    /* Crear nuevo grupo - CORREGIDO  */
    static async create(data) {
        try {
            console.log('Repository - Creando grupo con datos:', data);
            
            // Usar new Group() en lugar de Group.create()
            const group = new Group(data);
            const savedGroup = await group.save();
            
            console.log('Repository - Grupo creado exitosamente:', savedGroup._id);
            return savedGroup;
            
        } catch (error) {
            console.error ('Repository - Error en create:', error);
            throw new Error(`Error al crear grupo: ${error.message}`);
        }
    }

    /* Obtener todos los grupos */
    static async findAll() {
        try {
            return await Group.find({ isActive: true })
                .populate("createdBy", "name email avatar")
                .populate("members.user", "name email avatar")
                .populate("messages")
                .sort({ createdAt: -1 });
        } catch (error) {
            console.error('Repository - Error en findAll:', error);
            throw new Error(`Error al obtener grupos: ${error.message}`);
        }
    }

    /*Obtener grupo por ID */
    static async findById(id) {
        try {
            return await Group.findById(id)
                .populate("createdBy", "name email avatar")
                .populate("members.user", "name email avatar")
                .populate("messages");
        } catch (error) {
            console.error('Repository - Error en findById:', error);
            throw new Error(`Error al obtener grupo: ${error.message}`);
        }
    }

    /* Actualizar grupo */
    static async update(id, data) {
        try {
            return await Group.findByIdAndUpdate(
                id, 
                { $set: data }, 
                { new: true, runValidators: true }
            ).populate("createdBy", "name email avatar")
            .populate("members.user", "name email avatar");
        } catch (error) {
            console.error('Repository - Error en update:', error);
            throw new Error(`Error al actualizar grupo: ${error.message}`);
        }
    }

    /*  Eliminar grupo (soft delete) */
    static async delete(id) {
        try {
            return await Group.findByIdAndUpdate(
                id, 
                { isActive: false }, 
                { new: true }
            );
        } catch (error) {
            console.error('Repository - Error en delete:', error);
            throw new Error(`Error al eliminar grupo: ${error.message}`);
        }
    }

    /* Agregar miembro al grupo - CORREGIDO para estructura compleja */
    static async addMember(groupId, memberId) {
        try {
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error("Grupo no encontrado");
            }

            // Verificar si el usuario ya es miembro
            const isAlreadyMember = group.members.some(
                member => member.user.toString() === memberId.toString()
            );

            if (isAlreadyMember) {
                throw new Error("El usuario ya es miembro del grupo");
            }

            // Agregar nuevo miembro
            group.members.push({
                user: memberId,
                role: "member",
                joinedAt: new Date()
            });

            return await group.save();
        } catch (error) {
            console.error('Repository - Error en addMember:', error);
            throw new Error(`Error al agregar miembro: ${error.message}`);
        }
    }

    /* Agregar mensaje al grupo */
    static async addMessage(groupId, messageId) {
        try {
            // Si tu modelo tiene un array de messages como ObjectIds simples
            return await Group.findByIdAndUpdate(
                groupId,
                { $push: { messages: messageId } },
                { new: true }
            ).populate("messages");
        } catch (error) {
            console.error('Repository - Error en addMessage:', error);
            throw new Error(`Error al agregar mensaje: ${error.message}`);
        }
    }
}