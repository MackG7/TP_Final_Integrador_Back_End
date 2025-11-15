import express from 'express';
import GroupController from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// ✅ RUTAS ESPECÍFICAS PRIMERO
router.get('/my', protect, GroupController.getMyGroups); 
router.get('/debug/my-groups', protect, GroupController.debugMyGroups);
router.get('/debug/access/:groupId', protect, GroupController.debugGroupAccess);

// ✅ RUTAS DINÁMICAS DESPUÉS
router.get('/:groupId', protect, GroupController.getGroupById); 

// Otras rutas...
router.post('/', protect, GroupController.createGroup);
router.put('/:groupId', protect, GroupController.updateGroup);
router.delete('/:groupId', protect, GroupController.deleteGroup);
router.post('/:groupId/members', protect, GroupController.addMember);
router.delete('/:groupId/members', protect, GroupController.removeMember);
router.post('/emergency-fix', protect, GroupController.emergencyFix);

export default router;
