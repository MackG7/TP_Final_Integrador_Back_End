import Group from "../models/Group.model.js";

export default class GroupRepository {

    // ✅ Crear grupo - CORREGIDO (sin populate pesado)
    static async createGroup(data) {
        try {
            console.log ('GroupRepository - Iniciando creación de grupo con datos:', {
                name: data.name,
                createdBy: data.createdBy,
                membersCount: data.members?.length
            });

            if (!data.name?.trim()) {
                throw new Error("El nombre del grupo es requerido");
            }

            if (!data.createdBy) {
                throw new Error("ID del creador es requerido");
            }

            // Validar estructura de members
            if (!data.members || !Array.isArray(data.members) || data.members.length === 0) {
                throw new Error("El grupo debe tener al menos un miembro");
            }

            // Verificar que todos los miembros tengan la estructura correcta
            const invalidMember = data.members.find(member =>
                !member.userId || !member.role
            );

            if (invalidMember) {
                throw new Error("Estructura de miembros inválida");
            }

            console.log('GroupRepository - Datos validados, creando grupo...');

            const group = new Group(data);
            const savedGroup = await group.save();

            console.log('GroupRepository - Grupo creado exitosamente:', savedGroup._id);

            // ✅ CORRECCIÓN: Populate mínimo para evitar respuestas grandes
            const populatedGroup = await Group.findById(savedGroup._id)
                .populate("createdBy", "username email") // Solo campos esenciales
                .populate("members.userId", "username email") // Solo campos esenciales
                .select("-__v"); // Excluir campo version

            console.log('GroupRepository - Grupo populado exitosamente');
            return populatedGroup;

        } catch (error) {
            console.error("GroupRepository - Error CRÍTICO en createGroup:", error);

            // Manejo específico de errores de MongoDB
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                console.error('Errores de validación:', errors);
                throw new Error(`Error de validación: ${errors.join(', ')}`);
            } else if (error.name === 'CastError') {
                console.error('Error de casteo:', error.message);
                throw new Error(`ID inválido: ${error.message}`);
            } else if (error.code === 11000) {
                console.error('Error de duplicado:', error.message);
                throw new Error('Ya existe un grupo con ese nombre');
            } else {
                console.error('Error desconocido:', error.message);
                throw new Error(`Error al crear grupo: ${error.message}`);
            }
        }
    }

    // ✅ Obtener todos los grupos de un usuario
    static async getGroupsByUser(userId) {
        try {
            console.log('GroupRepository - Buscando grupos para usuario:', userId);

            const groups = await Group.find({
                "members.userId": userId,
                isActive: true
            })
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v") // Excluir campo version
                .sort({ createdAt: -1 });

            console.log('GroupRepository - Grupos encontrados:', groups.length);
            return groups;
        } catch (error) {
            console.error("GroupRepository - Error en getGroupsByUser:", error);
            throw error;
        }
    }

    // ✅ Obtener un grupo por ID - CORREGIDO
    static async getGroupById(groupId) {
        try {
            console.log('GroupRepository - Buscando grupo por ID:', groupId);

            if (!groupId) {
                throw new Error("ID de grupo no proporcionado");
            }

            const group = await Group.findById(groupId)
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v"); // Excluir campo version

            if (!group) {
                console.log('GroupRepository - Grupo no encontrado:', groupId);
                throw new Error("Grupo no encontrado");
            }

            console.log('GroupRepository - Grupo encontrado:', group.name);
            return group;
        } catch (error) {
            console.error("GroupRepository - Error en getGroupById:", error);

            if (error.name === 'CastError') {
                throw new Error("ID de grupo inválido");
            }
            throw error;
        }
    }

    // ✅ Obtener grupo por ID con populate mínimo (para creación)
    static async getGroupByIdMinimal(groupId) {
        try {
            console.log('GroupRepository - Buscando grupo (mínimo):', groupId);

            if (!groupId) {
                throw new Error("ID de grupo no proporcionado");
            }

            const group = await Group.findById(groupId)
                .populate("createdBy", "username") // Solo username
                .select("name description createdBy members isActive createdAt");

            if (!group) {
                throw new Error("Grupo no encontrado");
            }

            return group;
        } catch (error) {
            console.error("GroupRepository - Error en getGroupByIdMinimal:", error);
            throw error;
        }
    }

    // ✅ Actualizar grupo
    static async updateGroup(groupId, data) {
        try {
            console.log('GroupRepository - Actualizando grupo:', groupId);

            const group = await Group.findByIdAndUpdate(groupId, data, {
                new: true,
                runValidators: true
            })
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v");

            if (!group) throw new Error("Grupo no encontrado");
            return group;
        } catch (error) {
            console.error("GroupRepository - Error en updateGroup:", error);
            throw error;
        }
    }

    // ✅ Eliminar (soft delete)
    static async deleteGroup(groupId) {
        try {
            console.log('GroupRepository - Eliminando grupo:', groupId);

            const group = await Group.findByIdAndUpdate(
                groupId,
                { isActive: false },
                { new: true }
            )
                .select("-__v");

            if (!group) throw new Error("Grupo no encontrado");
            return group;
        } catch (error) {
            console.error("GroupRepository - Error en deleteGroup:", error);
            throw error;
        }
    }

    // ✅ Agregar miembro
    static async addMemberToGroup(groupId, memberId, role = "member") {
        try {
            console.log('GroupRepository - Agregando miembro:', { groupId, memberId, role });

            const group = await Group.findByIdAndUpdate(
                groupId,
                {
                    $addToSet: {
                        members: { userId: memberId, role }
                    }
                },
                { new: true, runValidators: true }
            )
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v");

            if (!group) throw new Error("Grupo no encontrado");
            return group;
        } catch (error) {
            console.error("GroupRepository - Error en addMemberToGroup:", error);
            throw error;
        }
    }

    // ✅ Remover miembro
    static async removeMemberFromGroup(groupId, memberId) {
        try {
            console.log('GroupRepository - Removiendo miembro:', { groupId, memberId });

            const group = await Group.findByIdAndUpdate(
                groupId,
                { $pull: { members: { userId: memberId } } },
                { new: true }
            )
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v");

            if (!group) throw new Error("Grupo no encontrado");
            return group;
        } catch (error) {
            console.error("GroupRepository - Error en removeMemberFromGroup:", error);
            throw error;
        }
    }

    // ✅ Verificar si usuario es miembro del grupo
    static async isUserMember(groupId, userId) {
        try {
            const group = await Group.findOne({
                _id: groupId,
                "members.userId": userId,
                isActive: true
            }).select("_id name");

            return !!group;
        } catch (error) {
            console.error("GroupRepository - Error en isUserMember:", error);
            throw error;
        }
    }

    // ✅ Obtener grupos con paginación
    static async getGroupsPaginated(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const groups = await Group.find({
                "members.userId": userId,
                isActive: true
            })
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const total = await Group.countDocuments({
                "members.userId": userId,
                isActive: true
            });

            return {
                groups,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
            };
        } catch (error) {
            console.error("GroupRepository - Error en getGroupsPaginated:", error);
            throw error;
        }
    }

    // ✅ Buscar grupos por nombre
    static async searchGroups(userId, searchTerm) {
        try {
            const groups = await Group.find({
                "members.userId": userId,
                isActive: true,
                name: { $regex: searchTerm, $options: 'i' }
            })
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .select("-__v")
                .sort({ createdAt: -1 })
                .limit(20);

            return groups;
        } catch (error) {
            console.error("GroupRepository - Error en searchGroups:", error);
            throw error;
        }
    }

    // ✅ Método de prueba para diagnóstico
    static async testConnection() {
        try {
            console.log('GroupRepository - Probando conexión a la base de datos...');
            const count = await Group.countDocuments();
            console.log('GroupRepository - Conexión exitosa. Total de grupos:', count);
            return true;
        } catch (error) {
            console.error('GroupRepository - Error de conexión a la base de datos:', error);
            return false;
        }
    }

    // ✅ Método alternativo para creación rápida (sin populate)
    static async createGroupFast(data) {
        try {
            console.log('GroupRepository - Creación rápida de grupo...');

            const group = new Group(data);
            const savedGroup = await group.save();

            console.log('GroupRepository - Grupo creado (fast):', savedGroup._id);

            // Retornar solo datos básicos
            return {
                _id: savedGroup._id,
                name: savedGroup.name,
                description: savedGroup.description,
                createdBy: savedGroup.createdBy,
                isActive: savedGroup.isActive,
                createdAt: savedGroup.createdAt
            };
        } catch (error) {
            console.error("GroupRepository - Error en createGroupFast:", error);
            throw error;
        }
    }
}