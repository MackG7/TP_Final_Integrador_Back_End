import express from 'express';
import { 
    createGroup, 
    getGroups, 
    getGroupById, 
    inviteUserToGroup,
    updateGroup,
    deleteGroup,
    getGroupMembers 
} from '../controllers/groupControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ TODAS las rutas protegidas con autenticación
router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);
router.post('/:id/invite', protect, inviteUserToGroup);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);
router.get('/:id/members', protect, getGroupMembers);

export default router;