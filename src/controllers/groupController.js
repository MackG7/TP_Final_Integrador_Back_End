import GroupService from "../services/groupService.js";
import GroupRepository from "../repositories/groupRepository.js";
import Group from "../models/Group.model.js";

class GroupController {

    static async createGroup(req, res) {
        try {
            const userId = req.user._id;
            const { name, description, url_img, members } = req.body;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "El nombre del grupo es obligatorio"
                });
            }

            const newGroup = await Group.create({
                name,
                description: description || "",
                url_img: url_img || "",
                createdBy: userId, 
                members: [
                    {
                        userId: userId,
                        role: "admin",
                        joinedAt: new Date()
                    },
                    ...(members || []).map(memberId => ({
                        userId: memberId,
                        role: "member", 
                        joinedAt: new Date()
                    }))
                ]
            });

            const populated = await Group.findById(newGroup._id)
                .populate("createdBy", "username email avatar")
                .populate("members.userId", "username email avatar");

            return res.status(201).json({
                success: true,
                message: "Grupo creado exitosamente",
                data: populated
            });

        } catch (error) {
            console.error("❌ Error al crear grupo:", error);
            return res.status(500).json({
                success: false,
                message: "Error al crear grupo",
                error: error.message
            });
        }
    }

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

    static async deleteGroup(req, res) {
        try {
            const { groupId } = req.params;
            const userId = req.user._id;

            console.log(`🗑️ Eliminando grupo: ${groupId} por usuario: ${userId}`);

            const group = await GroupRepository.getGroupById(groupId);
            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            if (group.createdBy._id.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo el creador puede eliminar el grupo'
                });
            }

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

    static async addMemberToGroup(req, res) {
        try {
            const { groupId } = req.params;
            const { userId } = req.body;
            const currentUserId = req.user._id;

            console.log(`👥 Agregando usuario ${userId} al grupo ${groupId} por ${currentUserId}`);

            const group = await Group.findById(groupId)
                .populate("members.userId", "username email avatar")
                .populate("createdBy", "username email");

            if (!group) {
                return res.status(404).json({
                    success: false,
                    message: "Grupo no encontrado"
                });
            }

            // Verificar que el usuario actual es admin del grupo
            const isAdmin = group.members.some(member => 
                (member.userId._id.toString() === currentUserId.toString() || 
                 member.userId.toString() === currentUserId.toString()) && 
                member.role === 'admin'
            );

            if (!isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Solo los administradores pueden agregar miembros"
                });
            }

            // Verificar si el usuario ya es miembro
            const isAlreadyMember = group.members.some(member => 
                (member.userId._id.toString() === userId.toString() ||
                 member.userId.toString() === userId.toString())
            );

            if (isAlreadyMember) {
                return res.status(400).json({
                    success: false,
                    message: "El usuario ya es miembro del grupo"
                });
            }

            // Agregar el nuevo miembro
            group.members.push({
                userId: userId,
                role: 'member',
                joinedAt: new Date()
            });

            await group.save();
            
            // Volver a populate para devolver datos actualizados
            await group.populate('members.userId', 'username email avatar');
            await group.populate('createdBy', 'username email');

            console.log(`✅ Usuario ${userId} agregado exitosamente al grupo ${group.name}`);

            return res.json({
                success: true,
                message: "Usuario agregado al grupo exitosamente",
                data: group
            });

        } catch (error) {
            console.error("❌ Error agregando miembro al grupo:", error);
            return res.status(500).json({
                success: false,
                message: "Error al agregar usuario al grupo",
                error: error.message
            });
        }
    }

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