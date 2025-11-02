import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';

export const taskController = {
  /**
   * POST /api/projects/:projectId/tasks
   * Create a new task
   */
  createTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const projectId = req.params.projectId;
      const taskData = req.body;

      const task = await taskService.createTask(projectId, taskData, userId);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/projects/:projectId/tasks
   * Get all tasks in a project with optional filters
   */
  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const projectId = req.params.projectId;

      // Parse filters from query params
      const filters: any = {};
      if (req.query.status) {
        filters.status = req.query.status;
      }
      if (req.query.priority) {
        filters.priority = req.query.priority;
      }
      if (req.query.assignee) {
        filters.assignee = req.query.assignee;
      }

      const tasks = await taskService.getTasks(projectId, userId, filters);

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/tasks/:id
   * Get a single task by ID
   */
  getTaskById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      const task = await taskService.getTaskById(taskId, userId);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/tasks/:id
   * Update a task
   */
  updateTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;
      const updateData = req.body;

      const task = await taskService.updateTask(taskId, updateData, userId);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/tasks/:id
   * Delete a task (soft delete)
   */
  deleteTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;

      await taskService.deleteTask(taskId, userId);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/tasks/:id/assign
   * Assign a task to a user
   */
  assignTask: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const taskId = req.params.id;
      const { assigneeId } = req.body;

      if (!assigneeId) {
        return res.status(400).json({
          success: false,
          error: 'Assignee ID is required'
        });
      }

      const task = await taskService.assignTask(taskId, assigneeId, userId);

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
};