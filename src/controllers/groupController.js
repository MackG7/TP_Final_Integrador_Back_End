import GroupService from "../services/groupService.js";
import GroupRepository from "../repositories/groupRepository.js";
import Group from "../models/Group.model.js";

class GroupController {

    /* ============================================================
    CREATE - Crear grupo
    ============================================================ */
    static async createGroup(req, res) {
        try {
            console.log('🎯 GroupController - CREANDO NUEVO GRUPO');
            console.log('📦 Body recibido:', req.body);
            console.log('👤 Usuario creador:', req.user._id);

            const { name, description, url_img } = req.body;
            const createdBy = req.user._id;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del grupo es requerido"
                });
            }

            if (name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del grupo debe tener al menos 2 caracteres"
                });
            }

            console.log('🔄 GroupController - Llamando a GroupService...');

            const result = await GroupService.createGroup(
                { name, description, url_img },
                createdBy
            );

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error
                });
            }

            console.log('✅ Grupo creado exitosamente:', result.group._id);

            return res.status(201).json({
                success: true,
                message: "Grupo creado correctamente",
                group: result.group,
                data: result.group
            });

        } catch (error) {
            console.error("❌ Error en createGroup:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al crear grupo"
            });
        }
    }



    /* ============================================================
    READ - Obtener mis grupos
    ============================================================ */
    static async getMyGroups(req, res) {
        try {
            const userId = req.user._id;

            console.log('👤 Obteniendo grupos del usuario:', userId);

            const groups = await Group.find({
                "members.userId": userId,
                isActive: true
            })
                .populate("createdBy", "username email")
                .populate("members.userId", "username email")
                .sort({ updatedAt: -1 });

            console.log(`📁 ${groups.length} grupos encontrados`);

            const groupsFormatted = groups.map(g => ({
                ...g.toObject(),
                type: "group"
            }));

            return res.status(200).json({
                success: true,
                data: groupsFormatted
            });

        } catch (error) {
            console.error("❌ Error en getMyGroups:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }



    /* ============================================================
    DEBUG - Diagnóstico de grupos
    ============================================================ */
    static async debugMyGroups(req, res) {
        try {
            const userId = req.user._id;

            const groups = await Group.find({
                "members.userId": userId,
                isActive: true
            });

            const detailedGroups = groups.map(g => ({
                _id: g._id,
                name: g.name,
                createdBy: g.createdBy.toString(),
                members: g.members.map(m => ({
                    userId: m.userId.toString(),
                    role: m.role,
                    isCurrentUser: m.userId.toString() === userId.toString()
                }))
            }));

            res.json({
                success: true,
                userId: userId.toString(),
                totalGroups: groups.length,
                groups: detailedGroups
            });

        } catch (error) {
            console.error('❌ Error en debugMyGroups:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }



    /* ============================================================
    DEBUG - Verificar acceso a un grupo específico
    ============================================================ */
    static async debugGroupAccess(req, res) {
        try {
            const userId = req.user._id;
            const { groupId } = req.params;

            const group = await Group.findById(groupId)
                .populate("createdBy", "username email")
                .populate("members.userId", "username email");

            if (!group) {
                return res.json({ success: false, error: "Grupo no encontrado" });
            }

            const isMember = group.members.some(member =>
                member.userId._id.toString() === userId.toString()
            );

            res.json({
                success: true,
                group: {
                    _id: group._id.toString(),
                    name: group.name,
                    members: group.members.map(m => ({
                        userId: m.userId._id.toString(),
                        username: m.userId.username,
                        role: m.role
                    }))
                },
                user: { _id: userId.toString() },
                isMember,
                accessGranted: isMember
            });

        } catch (error) {
            console.error('❌ Error en debugGroupAccess:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }



    /* ============================================================
    READ - Obtener grupo por ID
    ============================================================ */
    static async getGroupById(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user._id;

            const result = await GroupService.getGroupById(groupId, userId);

            if (!result.success) {
                return res.status(403).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data
            });

        } catch (error) {
            console.error("❌ Error en getGroupById:", error);
            return res.status(404).json({
                success: false,
                message: "Grupo no encontrado"
            });
        }
    }



    /* ============================================================
    UPDATE - Actualizar grupo
    ============================================================ */
    static async updateGroup(req, res) {
        try {
            const { groupId } = req.params;
            const updateData = req.body;
            const userId = req.user._id;

            const result = await GroupService.updateGroup(groupId, updateData, userId);

            if (!result.success) {
                return res.status(403).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: "Grupo actualizado correctamente",
                data: result.data
            });

        } catch (error) {
            console.error("❌ Error en updateGroup:", error);
            return res.status(400).json({
                success: false,
                message: "Error al actualizar grupo"
            });
        }
    }



    /* ============================================================
DELETE - Eliminar grupo (CORREGIDO)
============================================================ */
    static async deleteGroup(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user._id;

            console.log(`🗑️ Eliminando grupo: ${groupId} por usuario: ${userId}`);

            // ✅ CORRECCIÓN: Usar getGroupById en lugar de findById
            const group = await GroupRepository.getGroupById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            // Verificar que el usuario es el creador
            if (group.createdBy._id.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo el creador puede eliminar el grupo'
                });
            }

            // ✅ CORRECCIÓN: Usar deleteGroup del Repository
            const deleted = await GroupRepository.deleteGroup(groupId);

            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el grupo'
                });
            }

            console.log(`✅ Grupo eliminado exitosamente: ${groupId}`);

            return res.status(200).json({
                success: true,
                message: 'Grupo eliminado exitosamente'
            });

        } catch (error) {
            console.error('❌ Error eliminando grupo:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }



    /* ============================================================
    ADD MEMBER - Agregar usuario al grupo
    ============================================================ */
    static async addMember(req, res) {
        try {
            const { groupId } = req.params;
            const { memberId } = req.body;
            const userId = req.user._id;

            const result = await GroupService.addMember(groupId, memberId, userId);

            if (!result.success) {
                return res.status(403).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: "Miembro agregado correctamente",
                data: result.data
            });

        } catch (error) {
            console.error("❌ Error en addMember:", error);
            return res.status(400).json({
                success: false,
                message: "Error al agregar miembro"
            });
        }
    }



    /* ============================================================
    REMOVE MEMBER - Sacar usuario del grupo
    ============================================================ */
    static async removeMember(req, res) {
        try {
            const { groupId } = req.params;
            const { memberId } = req.body;
            const userId = req.user._id;

            const result = await GroupService.removeMember(groupId, memberId, userId);

            if (!result.success) {
                return res.status(403).json({
                    success: false,
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: "Miembro removido correctamente",
                data: result.data
            });

        } catch (error) {
            console.error("❌ Error en removeMember:", error);
            return res.status(400).json({
                success: false,
                message: "Error al remover miembro"
            });
        }
    }



    /* ============================================================
    EMERGENCY FIX - Reparar membresías malas
    ============================================================ */
    static async emergencyFix(req, res) {
        try {
            const userId = req.user._id;

            const allGroups = await Group.find({ isActive: true });

            let repaired = 0;
            let errors = [];

            for (const group of allGroups) {
                try {
                    let fixed = false;

                    const creatorIsMember = group.members.some(m =>
                        m.userId.toString() === group.createdBy.toString()
                    );

                    const userIsMember = group.members.some(m =>
                        m.userId.toString() === userId.toString()
                    );

                    if (!creatorIsMember) {
                        group.members.push({
                            userId: group.createdBy,
                            role: 'admin',
                            joinedAt: new Date()
                        });
                        fixed = true;
                    }

                    if (!userIsMember && group.createdBy.toString() === userId.toString()) {
                        group.members.push({
                            userId,
                            role: 'admin',
                            joinedAt: new Date()
                        });
                        fixed = true;
                    }

                    if (fixed) {
                        await group.save();
                        repaired++;
                    }

                } catch (error) {
                    errors.push({
                        group: group.name,
                        error: error.message
                    });
                }
            }

            res.json({
                success: true,
                message: `Reparación completada: ${repaired} grupos reparados`,
                repaired,
                errors
            });

        } catch (error) {
            console.error('💥 Error en emergencyFix:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default GroupController;
