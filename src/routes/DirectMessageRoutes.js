import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import DirectMessageController from "../controllers/DirectMessageController.js";

const router = Router();
router.use(protect);

router.get("/:userId", DirectMessageController.getConversation);
router.post("/", DirectMessageController.sendMessage);

export default router;
