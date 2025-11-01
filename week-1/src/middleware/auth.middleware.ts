import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = {
  verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.token;
      if (!token) {
        return res.status(401).json({ message: "Authorization token missing" });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET not defined");

      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("JWT verification error:", error);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  },
};
