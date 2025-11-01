import mongoose from "mongoose";
import { IProject, Project } from "../models/project.model";



export const ProjectService = {
  async createProject(data: IProject, userId: string) {
    const project = await Project.create({
      ...data,
      owner: userId
    })
    return project;
  },
  async getAllProjects(userId: string, filter?: string) {
    const matchStage: any = {
      deletedAt: null,
      $or: [{ owner: userId }, { members: userId }],
    };
    if (filter) matchStage.status = filter.toUpperCase();

    const projects = await Project.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          priority: {
            $cond: {
              if: { $eq: ['$owner', new mongoose.Types.ObjectId(userId)] },
              then: 1,
              else: {
                $cond: {
                  if: { $in: [new mongoose.Types.ObjectId(userId), '$members'] },
                  then: 2,
                  else: 3
                }
              }
            }
          },
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'ACTIVE'] }, then: 1 },
                { case: { $eq: ['$status', 'COMPLETED'] }, then: 2 },
                { case: { $eq: ['$status', 'ARCHIVED'] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        $sort: {
          priority: 1,
          statusOrder: 1,
          updatedAt: -1,
          name: 1
        }
      }
    ]);

    return projects;
  },
  async getprojectById(id: string, userId: string) {
    const project = await Project.findOne({
      _id: id,
      deletedAt: null,
      $or: [{ owner: userId }, { members: userId }],
    });
    if (!project) throw new Error('Project not found or access denied');
    return project;
  },
  async updateProject(projectId: string, data: Partial<IProject>, userId: string) {
    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
      $or: [{ owner: userId }, { members: userId }]
    });
    if (!project) {
      throw new Error('Project not found or access denied');
    }
    if (project.owner.toString() !== userId) {
      throw new Error('Not authorized');
    }
    Object.assign(project, data, {
      updatedAt: new Date()
    });
    await project.save();
    return project;
  },
  async deleteProject(projectId: string, userId: string) {
    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
      owner: userId
    });
    if (!project) throw new Error('Project not found or access denied');
    project.deletedAt = new Date();
    await project.save();
    return {
      message: 'Project deleted'
    }
  },
  async addMemberFromProject(projectId: string, userId: string, memberId: string) {
    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
      owner: userId
    });
    if (!project) {
      throw new Error('Project not found or access denied');
    }
    if (project.members.some(id => id.toString() === memberId)) {
      throw new Error('Member already exists in the project');
    }
    project.members.push(new mongoose.Schema.Types.ObjectId(memberId));
    await project.save();
    return project;
  },
  async removeMemberFromProject(projectId: string, memberId: string, userId: string) {
    const project = await Project.findOne({
      _id: projectId,
      deletedAt: null,
      owner: userId
    });
    if (!project) {
      throw new Error('Project not found or access denied');
    }
    project.members = project.members.filter((id) => id.toString() !== memberId);
    await project.save();
    return project;
  },
}