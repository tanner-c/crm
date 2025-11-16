import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Accounts Routes
 * GET /api/accounts - Get all accounts (admin only)
 * POST /api/accounts - Create a new account (admin only)
 * GET /api/accounts/:id - Get a single account by ID with related contacts, deals, activities, and user (admin only)
 * GET /api/accounts/user/:userId - Get accounts belonging to a specific user (admin only)
 * PATCH /api/accounts/:id - Update account info (admin only)
 * DELETE /api/accounts/:id - Delete an account (admin only)
 */

// GET all accounts
router.get("/", requireAdmin,async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// POST create account
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, website, industry, ownerId, userId } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Name is required" });
    }

    const account = await prisma.account.create({
      data: {
        name,
        website: website ?? null,
        industry: industry ?? null,
        ownerId: ownerId ?? null,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

// GET get single account with related contacts, deals, activities, and user
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id: String(id) },
      include: { contacts: true, deals: true, activities: true, owner: true },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// GET accounts belonging to a specific user
router.get("/user/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const accounts = await prisma.account.findMany({
      where: { ownerId: String(userId) },
      orderBy: { createdAt: "desc" },
    });

    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts for user" });
  }
});

// PATCH update account info
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website, industry, ownerId, userId } = req.body;

    const data: any = {};

    if (name !== undefined) data.name = name;
    if (website !== undefined) data.website = website;
    if (industry !== undefined) data.industry = industry;
    if (ownerId !== undefined) data.ownerId = ownerId;
    if (userId !== undefined) data.userId = userId;

    const account = await prisma.account.update({
      where: { id: String(id) },
      data,
    });

    res.json(account);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(500).json({ error: "Failed to update account" });
  }
});

// DELETE account
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({
      where: { id: String(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Account not found" });
    }
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
