import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Task routes nested under projects
router.post('/projects/:projectId/tasks', taskController.createTask);
router.get('/projects/:projectId/tasks', taskController.getTasks);

// Direct task routes
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/:id/assign', taskController.assignTask);

export default router;