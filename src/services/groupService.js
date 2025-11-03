import GroupRepository from "../repositories/groupRepository.js";
import Message from "../models/Message.model.js";

export default class GroupService {
    /**
     * 🆕 Crear nuevo grupo
     */
    static async createGroup(data, creatorId) {
        try {
            console.log('🔍 GroupService - Datos recibidos:', data);
            console.log('👤 GroupService - Creador:', creatorId);
            
            const groupData = {
                name: data.name,
                description: data.description || "",
                avatar: data.avatar || "",
                createdBy: creatorId,
                members: [{
                    user: creatorId,
                    role: "admin",
                    joinedAt: new Date()
                }],
                settings: data.settings || {
                    allowInvites: true,
                    onlyAdminsCanPost: false,
                    approvalRequired: false
                }
            };

            console.log('📦 GroupService - Datos a enviar al Repository:', groupData);
            
            const group = await GroupRepository.create(groupData);
            
            return {
                success: true,
                message: "Grupo creado exitosamente",
                group: {
                    _id: group._id,
                    name: group.name,
                    description: group.description,
                    createdBy: group.createdBy,
                    members: group.members
                }
            };
        } catch (error) {
            console.error("❌ GroupService - Error en createGroup:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📋 Obtener todos los grupos
     */
    static async getAllGroups() {
        try {
            return await GroupRepository.findAll();
        } catch (error) {
            console.error("❌ GroupService - Error en getAllGroups:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔎 Obtener grupo por ID
     */
    static async getGroupById(id) {
        try {
            return await GroupRepository.findById(id);
        } catch (error) {
            console.error("❌ GroupService - Error en getGroupById:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✏️ Actualizar grupo
     */
    static async updateGroup(id, data) {
        try {
            return await GroupRepository.update(id, data);
        } catch (error) {
            console.error("❌ GroupService - Error en updateGroup:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ❌ Eliminar grupo (soft delete)
     */
    static async deleteGroup(id) {
        try {
            return await GroupRepository.delete(id);
        } catch (error) {
            console.error("❌ GroupService - Error en deleteGroup:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ➕ Agregar miembro al grupo
     */
    static async addMember(groupId, memberId) {
        try {
            return await GroupRepository.addMember(groupId, memberId);
        } catch (error) {
            console.error("❌ GroupService - Error en addMember:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 💬 Enviar mensaje a un grupo
     */
    static async sendMessage(groupId, userId, messageData) {
        try {
            console.log("📨 Enviando mensaje - Service:", { groupId, userId, messageData });

            // 1️⃣ Verificar que el grupo exista
            const group = await GroupRepository.findById(groupId);
            if (!group) {
                return { success: false, message: "Grupo no encontrado" };
            }

            // 2️⃣ Verificar que el usuario sea miembro del grupo
            const isMember = group.members.some(
                member => member.user.toString() === userId.toString()
            );
            if (!isMember) {
                return { success: false, message: "No eres miembro de este grupo" };
            }

            // 3️⃣ Validar texto
            const { text } = messageData;
            if (!text || text.trim() === "") {
                return { success: false, message: "El mensaje no puede estar vacío" };
            }

            // 4️⃣ Crear mensaje
            const message = new Message({
                sender: userId,
                group: groupId,
                text,
            });
            const savedMessage = await message.save();

            // 5️⃣ Agregar el mensaje al grupo
            await GroupRepository.addMessage(groupId, savedMessage._id);

            console.log("✅ Mensaje guardado correctamente:", savedMessage);

            return { success: true, message: "Mensaje enviado con éxito", data: savedMessage };
        } catch (error) {
            console.error("❌ Error en GroupService.sendMessage:", error);
            return { success: false, message: "Error al enviar mensaje", error: error.message };
        }
    }
}