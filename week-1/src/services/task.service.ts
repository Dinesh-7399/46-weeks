import { taskRepository } from '../repositories/task.repository';
import { ProjectService } from './project.service';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '../types/task.types';
import { ITask } from '../models/task.model';
import mongoose from 'mongoose';

export const taskService = {
  async createTask(
    projectId: string,
    data: CreateTaskDTO,
    userId: string
  ): Promise<ITask> {
    // Verify user has access to project
    const project = await ProjectService.getprojectById(projectId, userId);

    // Validate data
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters');
    }

    if (data.title.length > 200) {
      throw new Error('Title cannot exceed 200 characters');
    }

    // Validate due date
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
    }

    // Prepare task data
    const taskData: any = {
      title: data.title.trim(),
      description: data.description?.trim() || '',
      project: projectId,
      createdBy: userId,
      status: 'TODO',
      priority: data.priority || 'MEDIUM',
      dueDate: data.dueDate || null,
      assignee: null
    };

    return await taskRepository.create(taskData);
  },

  async getTasks(
    projectId: string,
    userId: string,
    filters: TaskFilters = {}
  ): Promise<ITask[]> {
    // Verify access
    await ProjectService.getprojectById(projectId, userId);

    return await taskRepository.findByProject(projectId, filters);
  },

  async getTaskById(taskId: string, userId: string): Promise<ITask> {
    const task = await taskRepository.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.deletedAt) {
      throw new Error('Task not found');
    }

    // Verify user has access to task's project
    await ProjectService.getprojectById(task.project.toString(), userId);

    return task;
  },

  async updateTask(
    taskId: string,
    data: UpdateTaskDTO,
    userId: string
  ): Promise<ITask> {
    const task = await taskRepository.findById(taskId);

    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    // Verify access
    await ProjectService.getprojectById(task.project.toString(), userId);

    // Validate updates
    if (data.title !== undefined) {
      if (data.title.trim().length < 3) {
        throw new Error('Title must be at least 3 characters');
      }
      if (data.title.length > 200) {
        throw new Error('Title cannot exceed 200 characters');
      }
    }

    if (data.status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(data.status)) {
      throw new Error('Invalid status');
    }

    if (data.priority && !['LOW', 'MEDIUM', 'HIGH'].includes(data.priority)) {
      throw new Error('Invalid priority');
    }

    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    const updated = await taskRepository.update(taskId, updateData);

    if (!updated) {
      throw new Error('Failed to update task');
    }

    return updated;
  },

  async assignTask(
    taskId: string,
    assigneeId: string,
    userId: string
  ): Promise<ITask> {
    const task = await taskRepository.findById(taskId);

    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    // Get project and verify access
    const project = await ProjectService.getprojectById(
      task.project.toString(),
      userId
    );

    // Verify assignee is a project member
    const isMember = project.members.some(
      (member: any) => member._id?.toString() === assigneeId || member.toString() === assigneeId
    );

    if (!isMember) {
      throw new Error('Assignee must be a project member');
    }

    const updated = await taskRepository.update(taskId, { assignee: new mongoose.Types.ObjectId(assigneeId) });

    if (!updated) {
      throw new Error('Failed to assign task');
    }

    return updated;
  },

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await taskRepository.findById(taskId);

    if (!task || task.deletedAt) {
      throw new Error('Task not found');
    }

    // Verify access
    await ProjectService.getprojectById(task.project.toString(), userId);

    await taskRepository.softDelete(taskId);
  }
};