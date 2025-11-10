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

export default router;
