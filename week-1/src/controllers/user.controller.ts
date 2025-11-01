import * as z from 'zod';
import { Request, Response } from "express";
import { authService } from "../services/auth.service";


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required ' })
});
const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password must not be empty' }),
  name: z.string().min(1, { message: 'Name is required ' })
});
export const userController = {
  async register(req: Request, res: Response) {
    try {
      const { name, password, email } = registerSchema.parse(req.body);
      const user = await authService.register(name, password, email);

      return res.status(201).json(user);
    } catch (error: any) {
      console.error('Error parsing register schema:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.message
        })
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }, async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { token, user } = await authService.login(email, password);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days        
      })
      // Also return token for Postman usage
      return res.status(200).json({
        message: "Login successful",
        token,
        user,
      });

    } catch (error) {
      console.error('Error in login controller:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          errors: error.message
        })
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async logout(req : Request, res : Response) {
    try {
      res.clearCookie('token', {
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production',
        sameSite : 'strict'
      });
      return res.status(201).json({
        message : 'Logout successful'
      });
    } catch (error) {
      console.error('Error in logout controller:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
  async profile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({
          message: 'Unauthorized'
        });
      }
      const user = await authService.profile(userId);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        })
      }
      return res.status(200).json({
        message: 'User profile fetched', user
      })
    } catch (error) {
      console.error('Error in profile controller:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}