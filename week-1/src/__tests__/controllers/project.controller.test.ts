import { Request, Response } from 'express';
import { projectController } from '../../controllers/project.controller';
import { ProjectService } from '../../services/project.service';
import * as z from 'zod';

// Mock the ProjectService
jest.mock('../../services/project.service');

describe('ProjectController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    
    mockRequest = {
      body: {},
      params: {},
      query: {},
      cookies: {},
    };
    
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      };
      const createdProject = {
        _id: '507f1f77bcf86cd799439012',
        ...projectData,
        owner: userId,
        members: [],
        status: 'ACTIVE',
      };

      mockRequest.body = projectData;
      (mockRequest as any).user = { id: userId };

      (ProjectService.createProject as jest.Mock).mockResolvedValue(createdProject);

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Project created',
        project: createdProject,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = {
        name: 'Test Project',
        description: 'Test Description',
      };
      (mockRequest as any).user = undefined;

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should return 400 if name is missing', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRequest.body = {
        description: 'Test Description',
      };
      (mockRequest as any).user = { id: userId };

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should return 400 if description is missing', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRequest.body = {
        name: 'Test Project',
      };
      (mockRequest as any).user = { id: userId };

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should return 400 if name is empty string', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRequest.body = {
        name: '',
        description: 'Test Description',
      };
      (mockRequest as any).user = { id: userId };

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should return 500 if ProjectService throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockRequest.body = {
        name: 'Test Project',
        description: 'Test Description',
      };
      (mockRequest as any).user = { id: userId };

      (ProjectService.createProject as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.createProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getProjects', () => {
    it('should get all projects for authenticated user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projects = [
        { _id: '1', name: 'Project 1', owner: userId },
        { _id: '2', name: 'Project 2', owner: userId },
      ];

      (mockRequest as any).user = { id: userId };
      (ProjectService.getAllProjects as jest.Mock).mockResolvedValue(projects);

      await projectController.getProjects(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ projects });
      expect(ProjectService.getAllProjects).toHaveBeenCalledWith(userId, undefined);
    });

    it('should get filtered projects by status', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projects = [{ _id: '1', name: 'Project 1', status: 'ACTIVE' }];

      (mockRequest as any).user = { id: userId };
      mockRequest.query = { status: 'ACTIVE' };
      (ProjectService.getAllProjects as jest.Mock).mockResolvedValue(projects);

      await projectController.getProjects(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ projects });
      expect(ProjectService.getAllProjects).toHaveBeenCalledWith(userId, 'ACTIVE');
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;

      await projectController.getProjects(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      (mockRequest as any).user = { id: userId };
      (ProjectService.getAllProjects as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjects(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getProjectById', () => {
    it('should get project by id successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const project = { _id: projectId, name: 'Test Project', owner: userId };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      (ProjectService.getprojectById as jest.Mock).mockResolvedValue(project);

      await projectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ project });
      expect(ProjectService.getprojectById).toHaveBeenCalledWith(projectId, userId);
    });

    it('should return 404 if project is not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      (ProjectService.getprojectById as jest.Mock).mockResolvedValue(null);

      await projectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Project not found' });
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;
      mockRequest.params = { id: '507f1f77bcf86cd799439012' };

      await projectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      (ProjectService.getprojectById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.getProjectById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const updateData = { name: 'Updated Project' };
      const updatedProject = { _id: projectId, ...updateData, owner: userId };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = updateData;
      (ProjectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Project updated',
        project: updatedProject,
      });
    });

    it('should update project status', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const updateData = { status: 'COMPLETED' as const };
      const updatedProject = { _id: projectId, status: 'COMPLETED', owner: userId };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = updateData;
      (ProjectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Project updated',
        project: updatedProject,
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;
      mockRequest.params = { id: '507f1f77bcf86cd799439012' };
      mockRequest.body = { name: 'Updated' };

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 for invalid status value', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = { status: 'INVALID_STATUS' };

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const updateData = { description: 'New description' };
      const updatedProject = { _id: projectId, ...updateData, owner: userId };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = updateData;
      (ProjectService.updateProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Project updated',
        project: updatedProject,
      });
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = { name: 'Updated' };
      (ProjectService.updateProject as jest.Mock).mockRejectedValue(new Error('Database error'));

      await projectController.updateProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const result = { message: 'Project deleted' };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      (ProjectService.deleteProject as jest.Mock).mockResolvedValue(result);

      await projectController.deleteProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(result);
      expect(ProjectService.deleteProject).toHaveBeenCalledWith(projectId, userId);
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;
      mockRequest.params = { id: '507f1f77bcf86cd799439012' };

      await projectController.deleteProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      (ProjectService.deleteProject as jest.Mock).mockRejectedValue(new Error('Access denied'));

      await projectController.deleteProject(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('addMember', () => {
    it('should add member successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const memberId = '507f1f77bcf86cd799439013';
      const updatedProject = {
        _id: projectId,
        owner: userId,
        members: [memberId],
      };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = { memberId };
      (ProjectService.addMemberFromProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.addMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Member added',
        project: updatedProject,
      });
      expect(ProjectService.addMemberFromProject).toHaveBeenCalledWith(projectId, userId, memberId);
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;
      mockRequest.params = { id: '507f1f77bcf86cd799439012' };
      mockRequest.body = { memberId: '507f1f77bcf86cd799439013' };

      await projectController.addMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 400 if memberId is missing', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = {};

      await projectController.addMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should return 400 if memberId is empty string', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = { memberId: '' };

      await projectController.addMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalled();
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const memberId = '507f1f77bcf86cd799439013';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId };
      mockRequest.body = { memberId };
      (ProjectService.addMemberFromProject as jest.Mock).mockRejectedValue(
        new Error('Member already exists')
      );

      await projectController.addMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const memberId = '507f1f77bcf86cd799439013';
      const updatedProject = {
        _id: projectId,
        owner: userId,
        members: [],
      };

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId, memberId };
      (ProjectService.removeMemberFromProject as jest.Mock).mockResolvedValue(updatedProject);

      await projectController.removeMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Member removed',
        project: updatedProject,
      });
      expect(ProjectService.removeMemberFromProject).toHaveBeenCalledWith(projectId, memberId, userId);
    });

    it('should return 401 if user is not authenticated', async () => {
      (mockRequest as any).user = undefined;
      mockRequest.params = { id: '507f1f77bcf86cd799439012', memberId: '507f1f77bcf86cd799439013' };

      await projectController.removeMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });

    it('should return 500 if service throws an error', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const projectId = '507f1f77bcf86cd799439012';
      const memberId = '507f1f77bcf86cd799439013';

      (mockRequest as any).user = { id: userId };
      mockRequest.params = { id: projectId, memberId };
      (ProjectService.removeMemberFromProject as jest.Mock).mockRejectedValue(
        new Error('Project not found')
      );

      await projectController.removeMember(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});