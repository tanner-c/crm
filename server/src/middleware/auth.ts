import { Request, Response, NextFunction } from "express";
import { getUserFromRequest } from "../utils/auth";

declare global {
  // extend express Request to include user
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin role required" });
  next();
};

// ownerField is the user id field on the resource or a function to check ownership
export const requireOwnerOrAdmin = (getOwnerId: (req: Request) => Promise<string | null>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (req.user.role === "ADMIN") return next();

    try {
      const ownerId = await getOwnerId(req);
      if (ownerId && ownerId === req.user.id) return next();
      return res.status(403).json({ error: "Not authorized" });
    } catch (err) {
      next(err);
    }
  };
};