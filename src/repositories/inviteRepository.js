import Invite from "../models/Invite.model.js";

export default class InviteRepository {

    static async createInvite(inviterId, email){

        const exists = await Invite.findOne({ inviter: inviterId, email });
        if(exists) throw new Error("Ya enviaste invitación a este email");

        const inv = await Invite.create({
            inviter: inviterId,
            email
        });

        return inv;
    }

    // cuando usuario registra
    static async markAccepted(email){
        await Invite.updateMany({ email }, { accepted:true });
    }

    static async getMyInvites(inviterId){
        return await Invite.find({ inviter: inviterId }).sort({ createdAt:-1 });
    }
}
