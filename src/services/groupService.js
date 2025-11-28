import GroupRepository from "../repositories/groupRepository.js";

export default class GroupService {

    /* ============================================================
       CREATE - Crear grupo
    ============================================================ */
    static async createGroup(data, creatorId) {
        try {
            if (!creatorId) throw new Error("ID de creador no proporcionado");
            if (!data.name || !data.name.trim())
                throw new Error("El nombre del grupo es requerido");

            if (data.name.trim().length < 2)
                throw new Error("El nombre debe tener al menos 2 caracteres");

            const groupData = {
                name: data.name.trim(),
                description: (data.description || "").trim(),
                url_img: data.url_img || "",
                createdBy: creatorId,
                admin: creatorId,   // 🟩 FIX OBLIGATORIO
                members: [
                    {
                        userId: creatorId,
                        role: "admin",
                        joinedAt: new Date(),
                    }
                ],
                isActive: true,
            };

            const group = await GroupRepository.createGroup(groupData);
            if (!group) throw new Error("Error creando el grupo (retornó null)");

            return {
                success: true,
                message: "Grupo creado exitosamente",
                group,
            };

        } catch (error) {
            console.error("❌ GroupService.createGroup:", error);

            if (error.name === "ValidationError") {
                const messages = Object.values(error.errors).map(e => e.message);
                return {
                    success: false,
                    error: `Error de validación: ${messages.join(", ")}`,
                };
            }

            if (error.code === 11000) {
                return {
                    success: false,
                    error: "Ya existe un grupo con ese nombre",
                };
            }

            return {
                success: false,
                error: error.message,
            };
        }
    }


    /* ============================================================
       READ - Obtener grupo por ID con verificación de acceso
    ============================================================ */
    static async getGroupById(id, userId = null) {
        try {
            const group = await GroupRepository.getGroupById(id);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            // Si se envía userId → se verifica membresía
            if (userId) {
                const isMember = group.members.some(member => {
                    const memberId = member.userId?._id
                        ? member.userId._id.toString()
                        : member.userId.toString();

                    return memberId === userId.toString();
                });

                if (!isMember) {
                    return {
                        success: false,
                        error: "No tienes acceso a este grupo",
                    };
                }
            }

            return { success: true, data: group };

        } catch (error) {
            console.error("❌ GroupService.getGroupById:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       READ - Obtener todos los grupos de un usuario
    ============================================================ */
    static async getAllGroups(userId = null) {
        try {
            const groups = userId
                ? await GroupRepository.getGroupsByUser(userId)
                : await GroupRepository.getAllGroups();

            return { success: true, data: groups };

        } catch (error) {
            console.error("❌ GroupService.getAllGroups:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       UPDATE
    ============================================================ */
    static async updateGroup(id, data, userId) {
        try {
            const group = await GroupRepository.getGroupById(id);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            const isAdmin = group.members.some(
                m => m.userId.toString() === userId.toString() && m.role === "admin"
            );

            if (!isAdmin)
                return { success: false, error: "Solo administradores pueden actualizar el grupo" };

            const updated = await GroupRepository.updateGroup(id, data);

            return { success: true, data: updated };

        } catch (error) {
            console.error("❌ GroupService.updateGroup:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       DELETE
    ============================================================ */
    static async deleteGroup(id, userId) {
        try {
            const group = await GroupRepository.getGroupById(id);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            const isAdmin = group.members.some(
                m => m.userId.toString() === userId.toString() && m.role === "admin"
            );

            if (!isAdmin)
                return { success: false, error: "Solo administradores pueden eliminar el grupo" };

            await GroupRepository.deleteGroup(id);

            return { success: true, message: "Grupo eliminado exitosamente" };

        } catch (error) {
            console.error("❌ GroupService.deleteGroup:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       ADD MEMBER
    ============================================================ */
    static async addMember(groupId, memberId, userId) {
        try {
            const group = await GroupRepository.getGroupById(groupId);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            const isAdmin = group.members.some(
                m => m.userId.toString() === userId.toString() && m.role === "admin"
            );

            if (!isAdmin)
                return { success: false, error: "Solo administradores pueden agregar miembros" };

            const updated = await GroupRepository.addMemberToGroup(groupId, memberId);

            return { success: true, data: updated };

        } catch (error) {
            console.error("❌ GroupService.addMember:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       REMOVE MEMBER
    ============================================================ */
    static async removeMember(groupId, memberId, userId) {
        try {
            const group = await GroupRepository.getGroupById(groupId);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            const requester = group.members.find(
                m => m.userId.toString() === userId.toString()
            );

            if (!requester)
                return { success: false, error: "No perteneces al grupo" };

            const isSelf = userId.toString() === memberId.toString();
            const isAdmin = requester.role === "admin";

            if (!isAdmin && !isSelf)
                return { success: false, error: "No tienes permisos para remover a este usuario" };

            // Evitar que último admin abandone
            if (isSelf && isAdmin) {
                const adminCount = group.members.filter(m => m.role === "admin").length;

                if (adminCount <= 1) {
                    return {
                        success: false,
                        error: "No puedes salir del grupo siendo el único administrador"
                    };
                }
            }

            const updated = await GroupRepository.removeMemberFromGroup(groupId, memberId);

            return { success: true, data: updated };

        } catch (error) {
            console.error("❌ GroupService.removeMember:", error);
            return { success: false, error: error.message };
        }
    }


    /* ============================================================
       UNSAFE - sin verificación (solo debug)
    ============================================================ */
    static async getGroupByIdUnsafe(id) {
        try {
            const group = await GroupRepository.getGroupById(id);
            if (!group) return { success: false, error: "Grupo no encontrado" };

            return { success: true, data: group };

        } catch (error) {
            console.error("❌ GroupService.getGroupByIdUnsafe:", error);
            return { success: false, error: error.message };
        }
    }
}
