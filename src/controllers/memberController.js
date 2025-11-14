import MemberRepository from "../repositories/memberRepository.js";

class MemberController {

    static async addMember(req, res) {
        try {

            console.log("BODY RECIBIDO ADD MEMBER =>", req.body);

            const { userId, groupId, role } = req.body;   

            const group = await MemberRepository.addMemberToGroup(groupId, userId);

            return res.status(200).json({
                ok: true,
                message: "Miembro agregado correctamente",
                data: group
            });
        } catch (error) {
            console.error("MemberController - addMember error:", error.message);
            return res.status(400).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async updateRole(req, res) {
        try {
            const { userId, groupId } = req.params;
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({
                    ok: false,
                    message: "Nuevo rol requerido"
                });
            }

            const member = await MemberRepository.updateMemberRole(userId, groupId, role);

            return res.status(200).json({
                ok: true,
                message: "Rol actualizado correctamente",
                data: member
            });

        } catch (error) {
            console.error("MemberController - updateRole error:", error.message);
            return res.status(400).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async deleteMember(req, res) {
        try {
            const { userId, groupId } = req.params;

            const removed = await MemberRepository.removeMemberFromGroup(userId, groupId);

            return res.status(200).json({
                ok: true,
                message: "Miembro eliminado correctamente",
                data: removed
            });

        } catch (error) {
            console.error("MemberController - deleteMember error:", error.message);
            return res.status(400).json({
                ok: false,
                message: error.message
            });
        }
    }

    static async getUserGroups(req, res) {
        try {
            const userId = req.user._id;

            const groups = await MemberRepository.getGroupsByUserId(userId);

            return res.status(200).json({
                ok: true,
                data: groups
            });

        } catch (error) {
            console.error("MemberController - getUserGroups", error.message);
            return res.status(400).json({
                ok: false,
                message: error.message
            });
        }
    }
}

export default MemberController;


