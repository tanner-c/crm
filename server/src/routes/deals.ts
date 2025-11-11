import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Deals Routes
 * GET /api/deals - Get all deals
 * POST /api/deals - Create a new deal
 * GET /api/deals/:id - Get a single deal by ID
 * PATCH /api/deals/:id - Update deal info
 * DELETE /api/deals/:id - Delete a deal
 */

// GET all deals
router.get("/", requireAuth, async (_req, res) => {
    try {
        const deals = await prisma.deal.findMany({
            orderBy: { createdAt: "desc" },
            include: { account: true, owner: true, activities: true },
        });
        res.json(deals);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch deals" });
    }
});

// POST create deal
router.post("/", requireAuth, async (req, res) => {
    try {
        const { name, amount, stage, closeDate, accountId, ownerId } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ error: "name is required and must be a string" });
        }
        if (amount === undefined || isNaN(Number(amount))) {
            return res.status(400).json({ error: "amount is required and must be a number" });
        }
        if (!stage || typeof stage !== "string") {
            return res.status(400).json({ error: "stage is required and must be a string" });
        }

        const data: any = {
            name,
            amount: Number(amount),
            stage,
        };

        if (closeDate !== undefined && closeDate !== null) {
            const d = new Date(closeDate);
            if (isNaN(d.getTime())) return res.status(400).json({ error: "closeDate must be a valid date" });
            data.closeDate = d;
        }

        if (accountId !== undefined) data.accountId = accountId === null ? null : String(accountId);
        if (ownerId !== undefined) data.ownerId = ownerId === null ? null : String(ownerId);

        const deal = await prisma.deal.create({
            data,
            include: { account: true, owner: true, activities: true },
        });

        res.status(201).json(deal);
    } catch (err) {
        res.status(500).json({ error: "Failed to create deal" });
    }
});

// GET single deal
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await prisma.deal.findUnique({
            where: { id: String(id) },
            include: { account: true, owner: true, activities: true },
        });
        if (!deal) return res.status(404).json({ error: "Deal not found" });
        res.json(deal);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch deal" });
    }
});

// PATCH update deal info (partial updates supported)
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount, stage, closeDate, accountId, ownerId } = req.body;

        const data: any = {};

        if (name !== undefined) {
            if (typeof name !== "string") return res.status(400).json({ error: "name must be a string" });
            data.name = name;
        }
        if (amount !== undefined) {
            if (isNaN(Number(amount))) return res.status(400).json({ error: "amount must be a number" });
            data.amount = Number(amount);
        }
        if (stage !== undefined) {
            if (typeof stage !== "string") return res.status(400).json({ error: "stage must be a string" });
            data.stage = stage;
        }
        if (closeDate !== undefined) {
            if (closeDate === null) {
                data.closeDate = null;
            } else {
                const d = new Date(closeDate);
                if (isNaN(d.getTime())) return res.status(400).json({ error: "closeDate must be a valid date or null" });
                data.closeDate = d;
            }
        }
        if (accountId !== undefined) data.accountId = accountId === null ? null : String(accountId);
        if (ownerId !== undefined) data.ownerId = ownerId === null ? null : String(ownerId);

        const deal = await prisma.deal.update({
            where: { id: String(id) },
            data,
            include: { account: true, owner: true, activities: true },
        });

        res.json(deal);
    } catch (err: any) {
        if (err && err.code === "P2025") return res.status(404).json({ error: "Deal not found" });
        res.status(500).json({ error: "Failed to update deal" });
    }
});

// DELETE deal
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.deal.delete({ where: { id: String(id) } });
        res.status(204).send();
    } catch (err: any) {
        if (err && err.code === "P2025") return res.status(404).json({ error: "Deal not found" });
        res.status(500).json({ error: "Failed to delete deal" });
    }
});

export default router;