import express from 'express';
import { projectController } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware.verifyToken, projectController.createProject);
router.get('/', authMiddleware.verifyToken, projectController.getProjects);
router.get('/:id', authMiddleware.verifyToken, projectController.getProjectById);
router.put('/:id', authMiddleware.verifyToken, projectController.updateProject);
router.delete('/:id', authMiddleware.verifyToken, projectController.deleteProject);
router.post('/:id/members', authMiddleware.verifyToken, projectController.addMember);
router.delete('/:id/members/:memberId', authMiddleware.verifyToken, projectController.removeMember);

export default router;