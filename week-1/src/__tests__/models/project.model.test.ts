import mongoose from 'mongoose';
import { Project, IProject } from '../../models/project.model';

describe('Project Model', () => {
  describe('Schema Validation', () => {
    it('should have correct schema structure', () => {
      const schemaObj = Project.schema.obj;

      expect(schemaObj.name).toBeDefined();
      expect(schemaObj.description).toBeDefined();
      expect(schemaObj.owner).toBeDefined();
      expect(schemaObj.members).toBeDefined();
      expect(schemaObj.status).toBeDefined();
    });

    it('should require name field', () => {
      const schemaObj = Project.schema.obj;
      expect(schemaObj.name.required).toBe(true);
    });

    it('should require description field', () => {
      const schemaObj = Project.schema.obj;
      expect(schemaObj.description.required).toBe(true);
    });

    it('should have status enum with correct values', () => {
      const schemaObj = Project.schema.obj;
      expect(schemaObj.status.enum).toEqual(['ACTIVE', 'COMPLETED', 'ARCHIVED']);
    });

    it('should have default status as ACTIVE', () => {
      const schemaObj = Project.schema.obj;
      expect(schemaObj.status.default).toBe('ACTIVE');
    });

    it('should have timestamps enabled', () => {
      const schemaOptions = Project.schema.options;
      expect(schemaOptions.timestamps).toBe(true);
    });
  });

  describe('Model Name', () => {
    it('should have correct model name', () => {
      expect(Project.modelName).toBe('Project');
    });
  });
});