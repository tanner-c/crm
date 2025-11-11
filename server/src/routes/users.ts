import { Router } from 'express';
import prisma from '../prisma/client';
import { isAdmin } from '../utils/auth';

const router = Router();

// GET all users (admin only)
router.get("/", async (req, res) => {
    
    if (!(await isAdmin(req))) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(users);
});

// GET one user by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
        where: { id: String(id) },
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
});

// PATCH update user info (admin only)
router.patch("/:id", async (req, res) => {
    if (!(await isAdmin(req))) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
        where: { id: String(id) },
        data: { name, email, role },
    });
    res.json(user);
});

// DELETE user (admin only)
router.delete("/:id", async (req, res) => {
    if (!(await isAdmin(req))) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const user = await prisma.user.delete({
        where: { id: String(id) },
    });
    res.json(user);
});

export default router;