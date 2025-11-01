import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import projectRouter from '../../routes/project.routes';
import { projectController } from '../../controllers/project.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

jest.mock('../../controllers/project.controller');
jest.mock('../../middleware/auth.middleware');

describe('Project Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/project', projectRouter);

    (authMiddleware.verifyToken as jest.Mock).mockImplementation(
      (req: Request, res: Response, next: NextFunction) => {
        (req as any).user = { id: '507f1f77bcf86cd799439011' };
        next();
      }
    );
  });

  describe('POST /', () => {
    it('should call createProject controller', async () => {
      (projectController.createProject as jest.Mock).mockImplementation(
        (req: Request, res: Response) => {
          res.status(201).json({ message: 'Project created' });
        }
      );

      const response = await request(app)
        .post('/api/project')
        .send({ name: 'Test', description: 'Test desc' });

      expect(projectController.createProject).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });
  });

  describe('GET /', () => {
    it('should call getProjects controller', async () => {
      (projectController.getProjects as jest.Mock).mockImplementation(
        (req: Request, res: Response) => {
          res.status(200).json({ projects: [] });
        }
      );

      const response = await request(app).get('/api/project');

      expect(projectController.getProjects).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('GET /:id', () => {
    it('should call getProjectById controller', async () => {
      const projectId = '507f1f77bcf86cd799439012';
      (projectController.getProjectById as jest.Mock).mockImplementation(
        (req: Request, res: Response) => {
          res.status(200).json({ project: { _id: projectId } });
        }
      );

      const response = await request(app).get(`/api/project/${projectId}`);

      expect(projectController.getProjectById).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('PUT /:id', () => {
    it('should call updateProject controller', async () => {
      const projectId = '507f1f77bcf86cd799439012';
      (projectController.updateProject as jest.Mock).mockImplementation(
        (req: Request, res: Response) => {
          res.status(200).json({ message: 'Updated' });
        }
      );

      const response = await request(app)
        .put(`/api/project/${projectId}`)
        .send({ name: 'Updated' });

      expect(projectController.updateProject).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    it('should call deleteProject controller', async () => {
      const projectId = '507f1f77bcf86cd799439012';
      (projectController.deleteProject as jest.Mock).mockImplementation(
        (req: Request, res: Response) => {
          res.status(200).json({ message: 'Deleted' });
        }
      );

      const response = await request(app).delete(`/api/project/${projectId}`);

      expect(projectController.deleteProject).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });
});