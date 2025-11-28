import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import GroupMessageController from "../controllers/GroupMessageController.js";

const router = Router();
router.use(protect);

router.get("/:groupId/messages", GroupMessageController.getMessages);
router.post("/:groupId/message", GroupMessageController.sendMessage);

export default router;
