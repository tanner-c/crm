import { Router } from 'express';
import prisma from '../prisma/client';
import { isAdmin } from '../utils/auth';
import { requireAdmin, requireAuth } from '../middleware/auth';
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

const router = Router();

/**
 * Users Routes
 * GET /api/users - Get all users (admin only)
 * GET /api/users/:id - Get one user by ID (do NOT return password)
 * POST /api/users - Create new user (public registration). If role is provided, only admin can set it.
 * PATCH /api/users/:id - Update user info (admin only)
 * DELETE /api/users/:id - Delete user (admin only)
 */

// Helper: fields to return (exclude password)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

// Allowed roles
const ALLOWED_ROLES = ["USER", "MANAGER", "ADMIN"] as const;

// GET all users
router.get("/", requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userSelect,
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET one user by ID (do NOT return password)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: String(id) },
      select: userSelect,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST create new user (public registration). If role is provided, only admin can set it.
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (role && !(await isAdmin(req))) {
      // Only admins may set role on creation
      return res.status(403).json({ error: "Forbidden to set role" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role ?? undefined, // let DB default to USER if omitted
      },
      select: userSelect,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Unique constraint failed (likely email)
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH update user info (admin only)
router.patch("/:id", requireAdmin, async (req, res) => {
  try {

    const { id } = req.params;
    const { name, email, role } = req.body;

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data,
      select: userSelect,
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Email already in use" });
      }
      if (err.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE user (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.delete({
      where: { id: String(id) },
      select: userSelect,
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;