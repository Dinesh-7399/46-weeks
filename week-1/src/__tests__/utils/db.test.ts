import mongoose from 'mongoose';
import { connectDB } from '../../utils/db';

jest.mock('mongoose');

describe('Database Connection Utility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('connectDB', () => {
    it('should connect to database successfully', async () => {
      process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
      const mockConnection = {
        connection: {
          host: 'localhost:27017',
        },
      };

      (mongoose.connect as jest.Mock).mockResolvedValue(mockConnection);

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test');
      expect(console.log).toHaveBeenCalledWith('Database connected: localhost:27017');
    });

    it('should throw error if DATABASE_URL is not defined', async () => {
      delete process.env.DATABASE_URL;

      await expect(connectDB()).rejects.toThrow('DATABASE_URL not defined');
      expect(mongoose.connect).not.toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
      const error = new Error('Connection failed');

      (mongoose.connect as jest.Mock).mockRejectedValue(error);

      await expect(connectDB()).rejects.toThrow('Connection failed');
      expect(console.error).toHaveBeenCalledWith('Database connection failed', error);
    });

    it('should handle empty DATABASE_URL', async () => {
      process.env.DATABASE_URL = '';

      await expect(connectDB()).rejects.toThrow('DATABASE_URL not defined');
    });
  });
});