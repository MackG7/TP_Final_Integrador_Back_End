import ContactRepository from "../repositories/contactRepository.js";

export default class ContactController {

    static async addContact(req, res) {
        try {
            const { email, alias } = req.body;
            const ownerId = req.user._id;

            const c = await ContactRepository.addContact(ownerId, email, alias);

            return res.status(201).json({ success: true, data: c });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    static async createInviteLink(req, res) {
        try {
            const ownerId = req.user._id;
            const token = Buffer.from(ownerId + "-" + Date.now()).toString("base64");

            return res.status(201).json({
                ok: true,
                data: { token }
            });

        } catch (err) {
            return res.status(400).json({ ok: false, message: err.message });
        }
    }

    static async resolveInvitePublic(req, res) {
        try {
            const { token } = req.params;

            const invite = await Invite.findOne({ token, used: false });
            if (!invite) return res.status(404).json({ ok: false, message: "Invite inválido o usado" });

            const ownerUser = await User.findById(invite.owner);
            if (!ownerUser) return res.status(404).json({ ok: false, message: "Owner no existe" });

            return res.json({
                ok: true,
                invitedEmail: invite.invitedEmail,
                ownerName: ownerUser.username || ownerUser.email
            });

        } catch (e) {
            return res.status(500).json({ ok: false, message: e.message });
        }
    }

    static async getContacts(req, res) {
        try {
            const ownerId = req.user._id;
            const contacts = await ContactRepository.getContacts(ownerId);
            return res.status(200).json({ success: true, data: contacts });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    static async updateAlias(req, res) {
        try {
            const ownerId = req.user._id;
            const { contactId } = req.params;
            const { alias } = req.body;

            const updated = await ContactRepository.updateAlias(ownerId, contactId, alias);
            return res.status(200).json({ success: true, data: updated });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    static async deleteContact(req, res) {
        try {
            const ownerId = req.user._id;
            const { contactId } = req.params;
            const deleted = await ContactRepository.softDelete(ownerId, contactId);
            return res.status(200).json({ success: true, data: deleted });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
}
