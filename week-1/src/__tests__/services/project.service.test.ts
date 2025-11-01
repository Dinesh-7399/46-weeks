import mongoose from 'mongoose';
import { ProjectService } from '../../services/project.service';
import { Project, IProject } from '../../models/project.model';

jest.mock('../../models/project.model');

describe('ProjectService', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const projectId = new mongoose.Types.ObjectId().toString();
  const memberId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project with owner', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      } as IProject;

      const createdProject = {
        _id: projectId,
        ...projectData,
        owner: userId,
        members: [],
        status: 'ACTIVE',
      };

      (Project.create as jest.Mock).mockResolvedValue(createdProject);

      const result = await ProjectService.createProject(projectData, userId);

      expect(Project.create).toHaveBeenCalledWith({
        ...projectData,
        owner: userId,
      });
      expect(result).toEqual(createdProject);
    });

    it('should handle database errors during creation', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      } as IProject;

      (Project.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(ProjectService.createProject(projectData, userId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getAllProjects', () => {
    it('should get all projects for user without filter', async () => {
      const projects = [
        { _id: '1', name: 'Project 1', owner: userId, status: 'ACTIVE' },
        { _id: '2', name: 'Project 2', owner: userId, status: 'COMPLETED' },
      ];

      (Project.aggregate as jest.Mock).mockResolvedValue(projects);

      const result = await ProjectService.getAllProjects(userId);

      expect(Project.aggregate).toHaveBeenCalled();
      expect(result).toEqual(projects);
    });

    it('should filter projects by status', async () => {
      const projects = [{ _id: '1', name: 'Project 1', owner: userId, status: 'ACTIVE' }];

      (Project.aggregate as jest.Mock).mockResolvedValue(projects);

      const result = await ProjectService.getAllProjects(userId, 'active');

      expect(Project.aggregate).toHaveBeenCalled();
      const aggregateCall = (Project.aggregate as jest.Mock).mock.calls[0][0];
      expect(aggregateCall[0].$match.status).toBe('ACTIVE');
      expect(result).toEqual(projects);
    });

    it('should exclude soft-deleted projects', async () => {
      (Project.aggregate as jest.Mock).mockResolvedValue([]);

      await ProjectService.getAllProjects(userId);

      const aggregateCall = (Project.aggregate as jest.Mock).mock.calls[0][0];
      expect(aggregateCall[0].$match.deletedAt).toBe(null);
    });
  });

  describe('getprojectById', () => {
    it('should get project by id for owner', async () => {
      const project = {
        _id: projectId,
        name: 'Test Project',
        owner: new mongoose.Types.ObjectId(userId),
        members: [],
        deletedAt: null,
      };

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.getprojectById(projectId, userId);

      expect(Project.findOne).toHaveBeenCalledWith({
        _id: projectId,
        deletedAt: null,
        $or: [{ owner: userId }, { members: userId }],
      });
      expect(result).toEqual(project);
    });

    it('should throw error if project not found', async () => {
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await expect(ProjectService.getprojectById(projectId, userId)).rejects.toThrow(
        'Project not found or access denied'
      );
    });
  });

  describe('updateProject', () => {
    it('should update project successfully as owner', async () => {
      const updateData = { name: 'Updated Name' };
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        members: [],
        save: jest.fn().mockResolvedValue(true),
      };
      (project.owner as any).toString = () => userId;

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.updateProject(projectId, updateData, userId);

      expect(project.save).toHaveBeenCalled();
      expect(project.name).toBe('Updated Name');
    });

    it('should throw error if user is not the owner', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(otherUserId),
        members: [new mongoose.Types.ObjectId(userId)],
      };
      (project.owner as any).toString = () => otherUserId;

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      await expect(
        ProjectService.updateProject(projectId, { name: 'New' }, userId)
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('deleteProject', () => {
    it('should soft delete project successfully', async () => {
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        deletedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.deleteProject(projectId, userId);

      expect(project.deletedAt).toBeInstanceOf(Date);
      expect(project.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Project deleted' });
    });

    it('should throw error if project not found', async () => {
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      await expect(ProjectService.deleteProject(projectId, userId)).rejects.toThrow(
        'Project not found or access denied'
      );
    });
  });

  describe('addMemberFromProject', () => {
    it('should add member to project successfully', async () => {
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        members: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.addMemberFromProject(projectId, userId, memberId);

      expect(project.members).toHaveLength(1);
      expect(project.save).toHaveBeenCalled();
    });

    it('should throw error if member already exists', async () => {
      const existingMemberId = new mongoose.Types.ObjectId(memberId);
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        members: [existingMemberId],
      };
      (existingMemberId as any).toString = () => memberId;

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      await expect(
        ProjectService.addMemberFromProject(projectId, userId, memberId)
      ).rejects.toThrow('Member already exists in the project');
    });
  });

  describe('removeMemberFromProject', () => {
    it('should remove member from project successfully', async () => {
      const existingMemberId = new mongoose.Types.ObjectId(memberId);
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        members: [existingMemberId],
        save: jest.fn().mockResolvedValue(true),
      };
      (existingMemberId as any).toString = () => memberId;

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.removeMemberFromProject(projectId, memberId, userId);

      expect(project.members).toHaveLength(0);
      expect(project.save).toHaveBeenCalled();
    });

    it('should handle removing non-existent member gracefully', async () => {
      const project = {
        _id: projectId,
        owner: new mongoose.Types.ObjectId(userId),
        members: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await ProjectService.removeMemberFromProject(projectId, memberId, userId);

      expect(project.members).toHaveLength(0);
      expect(project.save).toHaveBeenCalled();
    });
  });
});