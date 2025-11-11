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

/**
 * Middleware to authenticate user from JWT token in request headers.
 */
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

/**
 * Middleware to require authentication.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

/**
 * Middleware to require admin role.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Admin role required" });
  next();
};

/**
 * Middleware to require either ownership or admin role.
 */
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