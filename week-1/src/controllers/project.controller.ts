import * as z from 'zod';
import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const createProjectSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' })
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional()
});

const addMemberSchema = z.object({
  memberId: z.string().min(1, { message: 'Member ID is required' })
});

export const projectController = {
  async createProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const { name, description } = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject({ name, description } as any, userId);

      return res.status(201).json({
        message: 'Project created',
        project
      });
    } catch (error: any) {
      console.error('Error in createProject:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.message
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async getProjects(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const filter = req.query.status as string;
      const projects = await ProjectService.getAllProjects(userId, filter);

      return res.status(200).json({
        projects
      });
    } catch (error) {
      console.error('Error in getProjects:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async getProjectById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const projectId = req.params.id;
      const project = await ProjectService.getprojectById(projectId, userId);
      if (!project) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      return res.status(200).json({
        project
      });
    } catch (error) {
      console.error('Error in getProjectById:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async updateProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const projectId = req.params.id;
      const updateData = updateProjectSchema.parse(req.body);
      const project = await ProjectService.updateProject(projectId, updateData, userId);

      return res.status(200).json({
        message: 'Project updated',
        project
      });
    } catch (error: any) {
      console.error('Error in updateProject:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.message
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async deleteProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const projectId = req.params.id;
      const result = await ProjectService.deleteProject(projectId, userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteProject:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async addMember(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const projectId = req.params.id;
      const { memberId } = addMemberSchema.parse(req.body);
      const project = await ProjectService.addMemberFromProject(projectId, userId, memberId);

      return res.status(200).json({
        message: 'Member added',
        project
      });
    } catch (error: any) {
      console.error('Error in addMember:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.message
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async removeMember(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const projectId = req.params.id;
      const memberId = req.params.memberId;
      const project = await ProjectService.removeMemberFromProject(projectId, memberId, userId);

      return res.status(200).json({
        message: 'Member removed',
        project
      });
    } catch (error) {
      console.error('Error in removeMember:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}