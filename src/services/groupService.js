import GroupRepository from "../repositories/groupRepository.js";

export default class GroupService {
    // 🟢 CREAR GRUPO (YA ESTÁ BIEN)
    static async createGroup(data, creatorId) {
        try {
            console.log("🎯 GroupService - INICIANDO CREACIÓN DE GRUPO");
            console.log("👤 Creador:", creatorId);
            console.log("📝 Datos recibidos:", data);

            // Validaciones básicas
            if (!creatorId) throw new Error("ID de creador no proporcionado");
            if (!data.name || !data.name.trim()) throw new Error("El nombre del grupo es requerido");
            if (data.name.trim().length < 2)
                throw new Error("El nombre debe tener al menos 2 caracteres");

            const groupData = {
                name: data.name.trim(),
                description: (data.description || "").trim(),
                url_img: data.url_img || "",
                createdBy: creatorId,
                members: [{
                    userId: creatorId,
                    role: "admin",
                }],
                isActive: true,
            };

            console.log("📦 Datos preparados para crear grupo:", groupData);

            const group = await GroupRepository.createGroup(groupData);
            if (!group) throw new Error("El grupo se creó pero retornó null");

            console.log("✅ Grupo creado exitosamente:", group._id);

            return {
                success: true,
                message: "Grupo creado exitosamente",
                group: group,
            };
        } catch (error) {
            console.error("❌ GroupService - ERROR en createGroup:", error);
            
            if (error.name === "ValidationError") {
                const errors = Object.values(error.errors).map((err) => err.message);
                return {
                    success: false,
                    error: `Error de validación: ${errors.join(", ")}`,
                };
            } else if (error.code === 11000) {
                return {
                    success: false,
                    error: "Ya existe un grupo con ese nombre",
                };
            } else {
                return {
                    success: false,
                    error: `Error al crear grupo: ${error.message}`,
                };
            }
        }
    }

    // 🟢 OBTENER GRUPO POR ID - CORREGIDO
    static async getGroupById(id, userId = null) {
        try {
            console.log('🔍 GroupService - Verificando acceso al grupo:', { id, userId });
            
            const group = await GroupRepository.getGroupById(id);
            if (!group) {
                return { success: false, error: "Grupo no encontrado" };
            }

            console.log('📋 Grupo encontrado:', group.name);
            console.log('👥 Miembros del grupo:', group.members.map(m => ({
                userId: m.userId?._id ? m.userId._id.toString() : m.userId.toString(),
                username: m.userId?.username || 'No username'
            })));

            // ✅ VERIFICACIÓN MEJORADA - Maneja populate y ObjectId
            if (userId) {
                const isMember = group.members.some(member => {
                    // Manejar tanto ObjectId populado como string
                    const memberUserId = member.userId?._id 
                        ? member.userId._id.toString() 
                        : member.userId.toString();
                    
                    const currentUserId = userId.toString();
                    
                    console.log('🔍 Comparando:', {
                        memberUserId,
                        currentUserId,
                        isMatch: memberUserId === currentUserId
                    });
                    
                    return memberUserId === currentUserId;
                });

                console.log('✅ Resultado verificación membresía:', { isMember });

                if (!isMember) {
                    console.log('❌ Usuario NO es miembro del grupo');
                    return {
                        success: false,
                        error: "No tienes acceso a este grupo"
                    };
                }
                
                console.log('✅ Usuario SÍ es miembro del grupo');
            }

            return { success: true, data: group };
        } catch (error) {
            console.error("GroupService - Error en getGroupById:", error);
            return { success: false, error: error.message };
        }
    }

    // 🟡 OBTENER TODOS LOS GRUPOS
    static async getAllGroups(userId = null) {
        try {
            let groups;
            if (userId) {
                groups = await GroupRepository.getGroupsByUser(userId);
            } else {
                groups = await GroupRepository.getAllGroups();
            }
            return { success: true, data: groups };
        } catch (error) {
            console.error("GroupService - Error en getAllGroups:", error);
            return { success: false, error: error.message };
        }
    }

    // 🟠 ACTUALIZAR GRUPO
    static async updateGroup(id, data, userId) {
        try {
            const group = await GroupRepository.getGroupById(id);
            const isAdmin = group.members.some(
                (member) =>
                    member.userId.toString() === userId.toString() &&
                    member.role === "admin"
            );

            if (!isAdmin) {
                return {
                    success: false,
                    error: "Solo los administradores pueden actualizar el grupo",
                };
            }

            const updatedGroup = await GroupRepository.updateGroup(id, data);
            return { success: true, data: updatedGroup };
        } catch (error) {
            console.error("GroupService - Error en updateGroup:", error);
            return { success: false, error: error.message };
        }
    }

    // 🔴 ELIMINAR GRUPO
    static async deleteGroup(id, userId) {
        try {
            const group = await GroupRepository.getGroupById(id);
            const isAdmin = group.members.some(
                (member) =>
                    member.userId.toString() === userId.toString() &&
                    member.role === "admin"
            );

            if (!isAdmin) {
                return {
                    success: false,
                    error: "Solo los administradores pueden eliminar el grupo",
                };
            }

            await GroupRepository.deleteGroup(id);
            return { success: true, message: "Grupo eliminado exitosamente" };
        } catch (error) {
            console.error("GroupService - Error en deleteGroup:", error);
            return { success: false, error: error.message };
        }
    }

    // 🟢 AGREGAR MIEMBRO
    static async addMember(groupId, memberId, userId) {
        try {
            const group = await GroupRepository.getGroupById(groupId);
            const isAdmin = group.members.some(
                (member) =>
                    member.userId.toString() === userId.toString() &&
                    member.role === "admin"
            );

            if (!isAdmin) {
                return {
                    success: false,
                    error: "Solo los administradores pueden agregar miembros",
                };
            }

            const updatedGroup = await GroupRepository.addMemberToGroup(
                groupId,
                memberId
            );
            return { success: true, data: updatedGroup };
        } catch (error) {
            console.error("GroupService - Error en addMember:", error);
            return { success: false, error: error.message };
        }
    }

    // 🟠 REMOVER MIEMBRO
    static async removeMember(groupId, memberId, userId) {
        try {
            const group = await GroupRepository.getGroupById(groupId);
            const userRole = group.members.find(
                (member) => member.userId.toString() === userId.toString()
            )?.role;

            const isSelfRemoval = userId.toString() === memberId.toString();
            const isAdmin = userRole === "admin";

            if (!isAdmin && !isSelfRemoval) {
                return {
                    success: false,
                    error: "No tienes permisos para eliminar este miembro",
                };
            }

            if (isSelfRemoval && isAdmin) {
                const adminCount = group.members.filter(
                    (member) => member.role === "admin"
                ).length;
                if (adminCount <= 1) {
                    return {
                        success: false,
                        error: "No puedes salir del grupo siendo el único administrador",
                    };
                }
            }

            const updatedGroup = await GroupRepository.removeMemberFromGroup(
                groupId,
                memberId
            );
            return { success: true, data: updatedGroup };
        } catch (error) {
            console.error("GroupService - Error en removeMember:", error);
            return { success: false, error: error.message };
        }
    }

    // 🟢 MÉTODO TEMPORAL - Desactivar verificación
    static async getGroupByIdUnsafe(id) {
        try {
            console.log('⚠️  MODO INSECURO - Obteniendo grupo sin verificación');
            const group = await GroupRepository.getGroupById(id);
            if (!group) {
                return { success: false, error: "Grupo no encontrado" };
            }
            return { success: true, data: group };
        } catch (error) {
            console.error("GroupService - Error en getGroupByIdUnsafe:", error);
            return { success: false, error: error.message };
        }
    }
}