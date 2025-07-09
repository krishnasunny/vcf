import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    founderId?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      founderId: user.founderId || undefined,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

export const requireAdminOrOwnCompany = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role === "ADMIN") {
    return next();
  }

  if (req.user.role === "PORTFOLIO_COMPANY") {
    const companyId = req.params.companyId || req.body.companyId;
    
    if (!req.user.founderId) {
      return res.status(403).json({ message: "No associated founder" });
    }

    const founder = await storage.getFounderById(req.user.founderId);
    if (!founder || founder.companyId !== companyId) {
      return res.status(403).json({ message: "Access denied to this company" });
    }

    return next();
  }

  return res.status(403).json({ message: "Insufficient permissions" });
};
