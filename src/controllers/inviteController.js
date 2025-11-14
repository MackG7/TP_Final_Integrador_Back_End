import Invite from "../models/Invite.model.js";
import crypto from "crypto";

class InviteController {

    static async createInvite(req, res){
        try{
            const { email } = req.body;
            const owner = req.user._id;

            if(!email) return res.status(400).json({ ok:false, message:"Email requerido" });

            const token = crypto.randomBytes(30).toString("hex");

            const expiresAt = new Date(Date.now() + (1000 * 60 * 60 * 24 * 3)); // 3 dias

            const invite = await Invite.create({
                owner,
                email,
                token,
                expiresAt
            });

            return res.status(201).json({
                ok:true,
                message:"Invitación creada",
                data:invite
            });

        }catch(error){
            console.error(error);
            return res.status(500).json({ ok:false, message:"Error creando invitación" });
        }
    }

    static async validateInvite(req,res){
        try{
            const { token } = req.params;

            const invite = await Invite.findOne({ token, status:"pending" });

            if(!invite) return res.status(404).json({ ok:false, message:"Invitación inválida o expirada" });

            return res.status(200).json({
                ok:true,
                data:invite
            });

        }catch(error){
            console.error(error);
            return res.status(500).json({ ok:false, message:"Error validando invitación" });
        }
    }

    static async markUsed(req, res) {
    try {
        const { token } = req.params;

        const invite = await Invite.findOne({ token });

        if (!invite) {
            return res.status(404).json({ ok: false, message: "Invitación inválida" });
        }

        if (invite.used) {
            return res.status(400).json({ ok: false, message: "Esta invitación ya fue usada" });
        }

        // acá el usuario que aceptó se toma de la request
        const userId = req.user._id.toString();

        invite.used = true;
        invite.usedBy = userId;
        await invite.save();

        // *** CONTACTO AUTOMÁTICO BIDIRECCIONAL ***

        // A -> B
        await Contact.findOneAndUpdate(
            { owner: invite.owner, contactUser: userId },
            { $set: { alias: "" } },
            { upsert: true }
        );

        // B -> A
        await Contact.findOneAndUpdate(
            { owner: userId, contactUser: invite.owner },
            { $set: { alias: "" } },
            { upsert: true }
        );

        return res.json({
            ok: true,
            message: "Invitación marcada como usada y contactos conectados"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: "Error" });
    }
}
}

export default InviteController;

