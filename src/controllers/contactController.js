import ContactRepository from "../repositories/contactRepository.js";
import Invite from "../models/Invite.model.js";
import User from "../models/User.model.js";
import { EmailService } from "../services/email.service.js";

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
            const { email } = req.body; 
            const ownerId = req.user._id;

            if (!email) {
                return res.status(400).json({
                    ok: false,
                    message: "El email es requerido"
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    ok: false,
                    message: "El formato del email no es válido"
                });
            }

            const crypto = await import('crypto');
            const token = crypto.randomBytes(32).toString('hex');

            const invite = await Invite.create({
                token,
                ownerId: ownerId,
                invitedEmail: email,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const inviteLink = `${frontendUrl}/register?ref=${token}`;

            const ownerUser = await User.findById(ownerId);
            const ownerName = ownerUser?.username || ownerUser?.email || "Un usuario";

            try {
                await EmailService.sendInvitationEmail(email, ownerName, inviteLink);

                return res.status(201).json({
                    ok: true,
                    data: {
                        token,
                        link: inviteLink,
                        invitedEmail: email,
                        message: "Invitación creada y enviada correctamente"
                    }
                });

            } catch (emailError) {
                console.error('Error enviando email:', emailError);

                return res.status(201).json({
                    ok: true,
                    data: {
                        token,
                        link: inviteLink,
                        invitedEmail: email,
                        warning: "Invitación creada pero el email no pudo ser enviado. Comparte el enlace manualmente."
                    }
                });
            }

        } catch (err) {
            console.error('Error en createInviteLink:', err);
            return res.status(500).json({
                ok: false,
                message: "Error al crear la invitación: " + err.message
            });
        }
    }

    static async resolveInvitePublic(req, res) {
        try {
            const { token } = req.params;

            const invite = await Invite.findOne({
                token,
                used: false,
                expiresAt: { $gt: new Date() } 
            });

            if (!invite) {
                return res.status(404).json({
                    ok: false,
                    message: "Invitación inválida, usada o expirada"
                });
            }

            const ownerUser = await User.findById(invite.ownerId);
            if (!ownerUser) {
                return res.status(404).json({
                    ok: false,
                    message: "El usuario que te invitó ya no existe"
                });
            }

            return res.json({
                ok: true,
                invitedEmail: invite.invitedEmail,
                ownerName: ownerUser.username || ownerUser.email,
                ownerId: ownerUser._id
            });

        } catch (e) {
            console.error('Error en resolveInvitePublic:', e);
            return res.status(500).json({
                ok: false,
                message: "Error al validar la invitación"
            });
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