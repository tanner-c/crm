import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

// GET all accounts
router.get("/", async (_req, res) => {
  const accounts = await prisma.account.findMany({ orderBy: { createdAt: "desc" } });
  res.json(accounts);
});

// POST create account
router.post("/", async (req, res) => {
  const { name, website, industry } = req.body;
  const account = await prisma.account.create({
    data: { name, website, industry },
  });
  res.status(201).json(account);
});

// POST get single account with related contacts and deals
router.post("/:id", async (req, res) => { 
  const { id } = req.params;
  const account = await prisma.account.findUnique({
    where: { id: String(id) },
    include: { contacts: true, deals: true },
  });
  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }
  res.json(account);
});

export default router;
