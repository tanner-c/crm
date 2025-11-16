import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Activities Routes
 * GET /api/activities - Get all activities
 * POST /api/activities - Create a new activity
 * GET /api/activities/:id - Get a single activity by ID
 * PATCH /api/activities/:id - Update activity info
 * DELETE /api/activities/:id - Delete an activity
 */

// GET all activities
router.get("/", requireAdmin, async (_req, res) => {
    try {
        const activities = await prisma.activity.findMany({
            orderBy: { createdAt: "desc" },
            include: { owner: true, deal: true, contact: true, account: true },
        });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});

// POST create activity
router.post("/", requireAuth, async (req, res) => {
    try {
        const { type, subject, body, dueAt, completed, ownerId, dealId, contactId, accountId } = req.body;

        // Basic validation
        const allowedTypes = ["NOTE", "TASK", "CALL", "MEETING"];
        if (!type || !allowedTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid or missing type" });
        }
        if (!subject || typeof subject !== "string") {
            return res.status(400).json({ error: "Missing subject" });
        }

        const data: any = {
            type,
            subject,
            completed: completed ?? false,
        };

        if (body !== undefined) data.body = body;
        if (dueAt !== undefined && dueAt !== null) {
            const parsed = new Date(dueAt);
            if (isNaN(parsed.getTime())) return res.status(400).json({ error: "Invalid dueAt" });
            data.dueAt = parsed;
        }
        if (ownerId !== undefined) data.ownerId = ownerId;
        if (dealId !== undefined) data.dealId = dealId;
        if (contactId !== undefined) data.contactId = contactId;
        if (accountId !== undefined) data.accountId = accountId;

        const activity = await prisma.activity.create({
            data,
            include: { owner: true, deal: true, contact: true, account: true },
        });

        res.status(201).json(activity);
    } catch (err) {
        res.status(500).json({ error: "Failed to create activity" });
    }
});

// GET get single activity
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const activity = await prisma.activity.findUnique({
            where: { id: String(id) },
            include: { owner: true, deal: true, contact: true, account: true },
        });
        if (!activity) {
            return res.status(404).json({ error: "Activity not found" });
        }
        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch activity" });
    }
});

// PATCH update activity info (partial updates allowed)
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { type, subject, body, dueAt, completed, ownerId, dealId, contactId, accountId } = req.body;

        // Ensure activity exists first
        const existing = await prisma.activity.findUnique({ where: { id: String(id) } });
        if (!existing) return res.status(404).json({ error: "Activity not found" });

        const allowedTypes = ["NOTE", "TASK", "CALL", "MEETING"];
        if (type !== undefined && !allowedTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid type" });
        }

        const data: any = {};
        if (type !== undefined) data.type = type;
        if (subject !== undefined) data.subject = subject;
        if (body !== undefined) data.body = body;
        if (completed !== undefined) data.completed = completed;
        if (dueAt !== undefined) {
            if (dueAt === null) {
                data.dueAt = null;
            } else {
                const parsed = new Date(dueAt);
                if (isNaN(parsed.getTime())) return res.status(400).json({ error: "Invalid dueAt" });
                data.dueAt = parsed;
            }
        }
        if (ownerId !== undefined) data.ownerId = ownerId;
        if (dealId !== undefined) data.dealId = dealId;
        if (contactId !== undefined) data.contactId = contactId;
        if (accountId !== undefined) data.accountId = accountId;

        const activity = await prisma.activity.update({
            where: { id: String(id) },
            data,
            include: { owner: true, deal: true, contact: true, account: true },
        });

        res.json(activity);
    } catch (err) {
        res.status(500).json({ error: "Failed to update activity" });
    }
});

// DELETE activity
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.activity.findUnique({ where: { id: String(id) } });
        if (!existing) return res.status(404).json({ error: "Activity not found" });

        await prisma.activity.delete({ where: { id: String(id) } });
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete activity" });
    }
});

export default router;