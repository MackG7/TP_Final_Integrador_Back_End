import { Router } from "express";
import MemberController from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

// agregar miembro
router.post("/add", MemberController.addMember);

// obtener grupos donde el user logueado pertenece
router.get("/my-groups", MemberController.getUserGroups);

// actualizar rol dentro del grupo
router.put("/:userId/:groupId/role", MemberController.updateRole);

// eliminar miembro del grupo
router.delete("/:userId/:groupId", MemberController.deleteMember);

export default router;
