import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
// GET all contacts
router.get("/", requireAuth, async (_req, res) => {
    const contacts = await prisma.contact.findMany({
        orderBy: { createdAt: "desc" },
        include: { account: true, owner: true, activities: true },
    });
    res.json(contacts);
});

// POST create contact
router.post("/", requireAuth, async (req, res) => {
    const { firstName, lastName, email, phone, title, accountId, ownerId } = req.body;
    if (!firstName || !lastName) {
        return res.status(400).json({ error: "firstName and lastName are required" });
    }
    const contact = await prisma.contact.create({
        data: { firstName, lastName, email, phone, title, accountId, ownerId },
        include: { account: true, owner: true, activities: true },
    });
    res.status(201).json(contact);
});

// GET single contact
router.get("/:id", requireAuth, async (req, res) => {
    const id = String(req.params.id);
    const contact = await prisma.contact.findUnique({
        where: { id },
        include: { account: true, owner: true, activities: true },
    });
    if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
    }
    res.json(contact);
});

// PATCH update contact info
router.patch("/:id", requireAuth, async (req, res) => {
    const id = String(req.params.id);
    const { firstName, lastName, email, phone, title, accountId, ownerId } = req.body;

    try {
        const contact = await prisma.contact.update({
            where: { id },
            data: { firstName, lastName, email, phone, title, accountId, ownerId },
            include: { account: true, owner: true, activities: true },
        });
        res.json(contact);
    } catch (err) {
        return res.status(404).json({ error: "Contact not found" });
    }
});

// DELETE contact
router.delete("/:id", requireAuth, async (req, res) => {
    const id = String(req.params.id);
    try {
        await prisma.contact.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        return res.status(404).json({ error: "Contact not found" });
    }
});

export default router;