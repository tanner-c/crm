import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * Sales Routes (formerly Deals)
 * GET /api/sales - Get all sales with pagination
 *   Query params: page (default 1), limit (default 10, max 100)
 * POST /api/sales - Create a new sale with line items
 *   Body: { customerId, lineItems: [{gameId, quantity}, ...], ownerId? }
 * GET /api/sales/:id - Get a single sale with line items and game details
 * GET /api/sales/user/:userId - Get sales belonging to a specific user
 * PATCH /api/sales/:id - Update sale info
 * DELETE /api/sales/:id - Delete a sale
 */

// GET all sales with pagination
router.get('/', requireAuth, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page)) || 1);
        const limit = Math.min(Math.max(1, parseInt(String(req.query.limit)) || 10), 100);
        const skip = (page - 1) * limit;

        const [sales, total] = await Promise.all([
            prisma.sale.findMany({
                include: {
                    customer: true,
                    owner: true,
                    lineItems: {
                        include: {
                            game: true,
                        },
                    },
                },
                orderBy: { saleDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.sale.count(),
        ]);

        const hasMore = skip + limit < total;

        res.json({
            data: sales,
            total,
            page,
            limit,
            hasMore,
        });
    } catch (error) {
        console.error('Sales fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

// POST create sale with line items
router.post('/', requireAuth, async (req, res) => {
    try {
        const { customerId, lineItems, ownerId, status = 'PENDING', saleDate } = req.body;

        // Validation
        if (!customerId || typeof customerId !== 'string') {
            return res.status(400).json({ error: 'customerId is required' });
        }

        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            return res.status(400).json({ error: 'lineItems array is required and must have at least one item' });
        }

        // Validate line items
        for (const item of lineItems) {
            if (!item.gameId || !item.quantity) {
                return res.status(400).json({ error: 'Each line item must have gameId and quantity' });
            }
            if (item.quantity < 1) {
                return res.status(400).json({ error: 'Quantity must be at least 1' });
            }
        }

        // Fetch games to calculate line item totals and total amount
        const gameIds = lineItems.map((item) => item.gameId);
        const games = await prisma.game.findMany({
            where: { id: { in: gameIds } },
        });

        const gameMap = new Map(games.map((g) => [g.id, g]));
        let totalAmount = 0;
        const lineItemsData = [];

        for (const item of lineItems) {
            const game = gameMap.get(item.gameId);
            if (!game) {
                return res.status(400).json({ error: `Game ${item.gameId} not found` });
            }

            const subtotal = game.price * item.quantity;
            totalAmount += subtotal;

            lineItemsData.push({
                gameId: item.gameId,
                quantity: item.quantity,
                pricePerUnit: game.price,
                subtotal,
            });
        }

        // Create sale with line items
        const sale = await prisma.sale.create({
            data: {
                customerId,
                ownerId: ownerId || null,
                totalAmount,
                status,
                saleDate: saleDate ? new Date(saleDate) : new Date(),
                lineItems: {
                    create: lineItemsData,
                },
            },
            include: {
                customer: true,
                owner: true,
                lineItems: {
                    include: {
                        game: true,
                    },
                },
            },
        });

        res.status(201).json({ data: sale });
    } catch (error) {
        console.error('Sale creation error:', error);
        res.status(500).json({ error: 'Failed to create sale' });
    }
});

// GET single sale with line items
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: req.params.id },
            include: {
                customer: true,
                owner: true,
                lineItems: {
                    include: {
                        game: true,
                    },
                },
            },
        });

        if (!sale) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json({ data: sale });
    } catch (error) {
        console.error('Sale fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch sale' });
    }
});

// GET sales belonging to a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({
            where: { ownerId: req.params.userId },
            include: {
                customer: true,
                owner: true,
                lineItems: {
                    include: {
                        game: true,
                    },
                },
            },
            orderBy: { saleDate: 'desc' },
        });

        res.json({ data: sales });
    } catch (error) {
        console.error('User sales fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch user sales' });
    }
});

// PATCH update sale info (status, date, etc. - NOT line items)
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const { status, saleDate, ownerId } = req.body;

        const updateData: any = {};

        if (status !== undefined) updateData.status = status;
        if (saleDate !== undefined) updateData.saleDate = new Date(saleDate);
        if (ownerId !== undefined) updateData.ownerId = ownerId;

        const sale = await prisma.sale.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                customer: true,
                owner: true,
                lineItems: {
                    include: {
                        game: true,
                    },
                },
            },
        });

        res.json({ data: sale });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Sale not found' });
        }
        console.error('Sale update error:', error);
        res.status(500).json({ error: 'Failed to update sale' });
    }
});

// DELETE sale (deletes all associated line items automatically due to cascade)
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        await prisma.sale.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Sale deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Sale not found' });
        }
        console.error('Sale deletion error:', error);
        res.status(500).json({ error: 'Failed to delete sale' });
    }
});

export default router;
