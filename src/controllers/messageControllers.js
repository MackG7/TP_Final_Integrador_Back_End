import Message from "../models/Message.model.js";
import Group from "../models/Group.model.js";

/**
 * 📩 Enviar mensaje a un grupo
 * @route POST /api/messages/:groupId
 * @access Privado
 */
const sendMessageToGroup = async (req, res) => {
    try {
        const { text } = req.body;
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Grupo no encontrado" });
        }

        const message = await Message.create({
            sender: req.user._id,
            group: groupId,
            text,
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error al enviar mensaje:", error);
        res.status(500).json({ message: "Error al enviar mensaje" });
    }
};

/**
 * 💬 Obtener todos los mensajes de un grupo
 * @route GET /api/messages/:groupId
 * @access Privado
 */
const getMessagesByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await Message.find({ group: groupId })
            .populate("sender", "name email avatar")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error al obtener mensajes:", error);
        res.status(500).json({ message: "Error al obtener los mensajes" });
    }
};

/**
 * ✏️ Actualizar un mensaje
 * @route PUT /api/messages/:messageId
 * @access Privado (solo autor o admin)
 */
const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Mensaje no encontrado" });
        }

        // Solo el autor o admin puede editar
        if (message.sender.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: "No autorizado para editar este mensaje" });
        }

        message.text = text || message.text;
        const updatedMessage = await message.save();

        res.json(updatedMessage);
    } catch (error) {
        console.error("Error al actualizar mensaje:", error);
        res.status(500).json({ message: "Error al actualizar el mensaje" });
    }
};

/**
 * ❌ Eliminar mensaje
 * @route DELETE /api/messages/:messageId
 * @access Privado (solo autor o admin)
 */
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Mensaje no encontrado" });
        }

        // Solo el autor o admin puede eliminarlo
        if (message.sender.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(401).json({ message: "No autorizado para eliminar este mensaje" });
        }

        await message.deleteOne();

        res.json({ message: "Mensaje eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar mensaje:", error);
        res.status(500).json({ message: "Error al eliminar el mensaje" });
    }
};

export { sendMessageToGroup, getMessagesByGroup, updateMessage, deleteMessage };