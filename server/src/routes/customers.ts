import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Customers Routes
 * GET /api/customers - Get all customers with pagination
 *   Query params: page (default 1), limit (default 10, max 100)
 * POST /api/customers - Create a new customer
 * GET /api/customers/:id - Get a single customer with related sales and activities
 * GET /api/customers/user/:userId - Get customers belonging to a specific user
 * PATCH /api/customers/:id - Update customer info
 * DELETE /api/customers/:id - Delete a customer
 */

// GET all customers with pagination
router.get('/', requireAuth, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page)) || 1);
        const limit = Math.min(Math.max(1, parseInt(String(req.query.limit)) || 10), 100);
        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                include: {
                    owner: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.customer.count(),
        ]);

        const hasMore = skip + limit < total;

        res.json({
            data: customers,
            total,
            page,
            limit,
            hasMore,
        });
    } catch (error) {
        console.error('Customers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// POST create customer
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, email, phone, loyaltyTier, ownerId } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        const customer = await prisma.customer.create({
            data: {
                name: name.trim(),
                email: email ? email.trim() : null,
                phone: phone ? phone.trim() : null,
                loyaltyTier: loyaltyTier || 'STANDARD',
                ownerId: ownerId || null,
            },
            include: {
                owner: true,
            },
        });

        res.status(201).json({ data: customer });
    } catch (error) {
        console.error('Customer creation error:', error);
        res.status(500).json({ error: 'Failed to create customer' });
    }
});

// GET single customer with related sales and activities
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const customer = await prisma.customer.findUnique({
            where: { id: req.params.id },
            include: {
                sales: {
                    include: {
                        lineItems: {
                            include: {
                                game: true,
                            },
                        },
                        owner: true,
                    },
                    orderBy: { saleDate: 'desc' },
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                },
                owner: true,
            },
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json({ data: customer });
    } catch (error) {
        console.error('Customer fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
});

// GET customers belonging to a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            where: { ownerId: req.params.userId },
            include: {
                owner: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ data: customers });
    } catch (error) {
        console.error('Customers for user fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch customers for user' });
    }
});

// PATCH update customer info
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { name, email, phone, loyaltyTier, totalSpent, ownerId } = req.body;

        const updateData: any = {};

        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email ? email.trim() : null;
        if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
        if (loyaltyTier !== undefined) updateData.loyaltyTier = loyaltyTier;
        if (totalSpent !== undefined) updateData.totalSpent = parseFloat(totalSpent);
        if (ownerId !== undefined) updateData.ownerId = ownerId;

        const customer = await prisma.customer.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                owner: true,
            },
        });

        res.json({ data: customer });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.error('Customer update error:', error);
        res.status(500).json({ error: 'Failed to update customer' });
    }
});

// DELETE customer
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.customer.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Customer not found' });
        }
        console.error('Customer deletion error:', error);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

export default router;
