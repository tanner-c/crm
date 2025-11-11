import { Router } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '../utils/auth';

const router = Router();

// POST /register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
    });

    // Log user in
    const token = jwt.sign({ userId: user.id },
        process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(201).json({ user, token });
});

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id }, 
        process.env.JWT_SECRET as string, { expiresIn: '1h' });
    res.json({ token });
});

// GET /me
router.get('/me', async (req, res) => {
    getUserFromRequest(req).then(user => {
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.json(user);
    }).catch(() => {
        res.status(401).json({ error: 'Unauthorized' });
    });
});

export default router;