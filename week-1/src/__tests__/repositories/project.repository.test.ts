import { projectRepository } from '../../repositories/project.repository';
import { Project, IProject } from '../../models/project.model';
import mongoose from 'mongoose';

jest.mock('../../models/project.model');

describe('ProjectRepository', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const projectId = new mongoose.Types.ObjectId().toString();
  const memberId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        owner: new mongoose.Types.ObjectId(userId),
      } as IProject;

      const createdProject = { _id: projectId, ...projectData };
      (Project.create as jest.Mock).mockResolvedValue(createdProject);

      const result = await projectRepository.create(projectData);

      expect(Project.create).toHaveBeenCalledWith(projectData);
      expect(result).toEqual(createdProject);
    });
  });

  describe('findById', () => {
    it('should find project by id excluding deleted', async () => {
      const project = { _id: projectId, name: 'Test', deletedAt: null };
      (Project.findOne as jest.Mock).mockResolvedValue(project);

      const result = await projectRepository.findById(projectId);

      expect(Project.findOne).toHaveBeenCalledWith({ _id: projectId, deletedAt: null });
      expect(result).toEqual(project);
    });

    it('should return null for deleted projects', async () => {
      (Project.findOne as jest.Mock).mockResolvedValue(null);

      const result = await projectRepository.findById(projectId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all projects for user', async () => {
      const projects = [
        { _id: '1', name: 'Project 1', owner: userId },
        { _id: '2', name: 'Project 2', owner: userId },
      ];
      (Project.find as jest.Mock).mockResolvedValue(projects);

      const result = await projectRepository.findAll(userId);

      expect(Project.find).toHaveBeenCalledWith({
        $or: [{ owner: userId }],
      });
      expect(result).toEqual(projects);
    });
  });

  describe('softDelete', () => {
    it('should soft delete project', async () => {
      const deletedProject = {
        _id: projectId,
        owner: userId,
        deletedAt: new Date(),
      };
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue(deletedProject);

      const result = await projectRepository.softDelete(projectId, userId);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: projectId, owner: userId, deletedAt: null },
        { $set: { deletedAt: expect.any(Date) } },
        { new: true }
      );
      expect(result).toEqual(deletedProject);
    });
  });

  describe('addMember', () => {
    it('should add member to project', async () => {
      const updatedProject = {
        _id: projectId,
        owner: userId,
        members: [memberId],
      };
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectRepository.addMember(projectId, userId, memberId);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: projectId, owner: userId, deletedAt: null },
        { $addToSet: { members: memberId } },
        { new: true }
      );
      expect(result).toEqual(updatedProject);
    });
  });

  describe('removeMember', () => {
    it('should remove member from project', async () => {
      const updatedProject = {
        _id: projectId,
        owner: userId,
        members: [],
      };
      (Project.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedProject);

      const result = await projectRepository.removeMember(projectId, userId, memberId);

      expect(Project.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: projectId, owner: userId, deletedAt: null },
        { $pull: { members: memberId } },
        { new: true }
      );
      expect(result).toEqual(updatedProject);
    });
  });
});