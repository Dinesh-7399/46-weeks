import { Task, ITask } from '../models/task.model';
import { TaskFilters } from '../types/task.types';

export const taskRepository = {

  async create(taskData: Partial<ITask>): Promise<ITask> {
    return await Task.create(taskData);
  },
  async findById(taskId: string): Promise<ITask | null> {
    return await Task.findById(taskId)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name');
  },
  async findByProject(
    projectId: string,
    filters: TaskFilters = {}
  ): Promise<ITask[]> {
    const query: any = {
      project: projectId,
      deletedAt: null
    };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assignee) {
      query.assignee = filters.assignee;
    }

    return await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  },
  async update(taskId: string, updateData: Partial<ITask>): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
  },

  async softDelete(taskId: string): Promise<ITask | null> {
    return await Task.findByIdAndUpdate(
      taskId,
      { deletedAt: new Date() },
      { new: true }
    );
  },
  async countByProject(projectId: string): Promise<number> {
    return await Task.countDocuments({
      project: projectId,
      deletedAt: null
    });
  }
}