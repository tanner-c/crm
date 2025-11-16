import { Router } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserFromRequest } from '../utils/auth';

const router = Router();

/**
 * Authentication Routes
 * POST /register - Register a new user
 * POST /login - Login user and return JWT token
 * GET /me - Get current authenticated user
 */

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

    const { password: _, ...safeUser } = user;

    res.status(201).json({ user: safeUser, token });
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
    
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
});

// GET /me
router.get('/me', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json(req.user);
});

export default router;