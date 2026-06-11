import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAdmin, requireAuth } from '../middleware/auth';
import { searchGames, getGameDetails, formatGameForInventory } from '../services/mobygames';

const router = Router();

/**
 * Inventory Routes (Games Management)
 * GET /api/inventory - Get all games with pagination
 * POST /api/inventory - Add a new game to inventory (admin only)
 * GET /api/inventory/search?q=query - Search MobyGames API for games
 * GET /api/inventory/:id - Get a specific game by ID
 * PATCH /api/inventory/:id - Update game details (admin only)
 * DELETE /api/inventory/:id - Remove game from inventory (admin only)
 */

// GET all games with pagination and optional filters
router.get('/', requireAuth, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(String(req.query.page)) || 1);
        const limit = Math.min(Math.max(1, parseInt(String(req.query.limit)) || 10), 100);
        const skip = (page - 1) * limit;

        // Optional filters
        const platform = req.query.platform ? String(req.query.platform).toUpperCase() : undefined;
        const genre = req.query.genre ? String(req.query.genre) : undefined;
        const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
        const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;

        const where: any = {};
        if (platform) where.platform = platform;
        if (genre) where.genre = { contains: genre, mode: 'insensitive' };
        if (minPrice !== undefined) where.price = { gte: minPrice };
        if (maxPrice !== undefined)
            where.price = where.price ? { ...where.price, lte: maxPrice } : { lte: maxPrice };

        const [games, total] = await Promise.all([
            prisma.game.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.game.count({ where }),
        ]);

        const hasMore = skip + limit < total;

        res.json({
            data: games,
            total,
            page,
            limit,
            hasMore,
        });
    } catch (error) {
        console.error('Inventory fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// GET search MobyGames API for games
router.get('/search', requireAuth, async (req, res) => {
    try {
        const query = String(req.query.q || '').trim();

        if (query.length < 2) {
            return res.json({
                data: [],
                query,
                message: 'Query must be at least 2 characters',
            });
        }

        const results = await searchGames(query);

        res.json({
            data: results,
            query,
            count: results.length,
        });
    } catch (error) {
        console.error('MobyGames search error:', error);
        res.status(500).json({ error: 'Failed to search games' });
    }
});

// POST add new game to inventory
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, platform, genre, description, coverArtUrl, releaseDate, price, stockLevel } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Game name is required' });
        }

        if (!platform) {
            return res.status(400).json({ error: 'Platform is required' });
        }

        if (price === undefined || price === null || price < 0) {
            return res.status(400).json({ error: 'Valid price is required' });
        }

        const game = await prisma.game.create({
            data: {
                name: name.trim(),
                platform: platform.toUpperCase(),
                genre: genre ? genre.trim() : null,
                description: description ? description.trim() : null,
                coverArtUrl: coverArtUrl ? coverArtUrl.trim() : null,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
                price: parseFloat(price),
                stockLevel: parseInt(stockLevel) || 0,
            },
        });

        res.status(201).json({ data: game });
    } catch (error) {
        console.error('Game creation error:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

// POST add game from MobyGames search result
router.post('/add-from-search', requireAdmin, async (req, res) => {
    try {
        const { mobyGameId, name, platform, genre, description, coverArtUrl, releaseDate, price, stockLevel } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Game name is required' });
        }

        // Check if game already exists
        if (mobyGameId) {
            const existing = await prisma.game.findFirst({
                where: {
                    mobyGameId,
                    platform: platform.toUpperCase(),
                },
            });

            if (existing) {
                return res.status(400).json({ error: 'Game already exists in inventory' });
            }
        }

        const game = await prisma.game.create({
            data: {
                mobyGameId: mobyGameId || null,
                name: name.trim(),
                platform: platform.toUpperCase(),
                genre: genre ? genre.trim() : null,
                description: description ? description.trim() : null,
                coverArtUrl: coverArtUrl ? coverArtUrl.trim() : null,
                releaseDate: releaseDate ? new Date(releaseDate) : null,
                price: parseFloat(price) || 29.99,
                stockLevel: parseInt(stockLevel) || 0,
            },
        });

        res.status(201).json({ data: game });
    } catch (error) {
        console.error('Game creation from search error:', error);
        res.status(500).json({ error: 'Failed to add game from search' });
    }
});

// GET specific game by ID
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const game = await prisma.game.findUnique({
            where: { id: req.params.id },
            include: {
                lineItems: {
                    include: {
                        sale: true,
                    },
                },
            },
        });

        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ data: game });
    } catch (error) {
        console.error('Game fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch game' });
    }
});

// PATCH update game details
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, platform, genre, description, coverArtUrl, releaseDate, price, stockLevel } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (platform !== undefined) updateData.platform = platform.toUpperCase();
        if (genre !== undefined) updateData.genre = genre ? genre.trim() : null;
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (coverArtUrl !== undefined) updateData.coverArtUrl = coverArtUrl ? coverArtUrl.trim() : null;
        if (releaseDate !== undefined) updateData.releaseDate = releaseDate ? new Date(releaseDate) : null;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (stockLevel !== undefined) updateData.stockLevel = parseInt(stockLevel);

        const game = await prisma.game.update({
            where: { id: req.params.id },
            data: updateData,
        });

        res.json({ data: game });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Game not found' });
        }
        console.error('Game update error:', error);
        res.status(500).json({ error: 'Failed to update game' });
    }
});

// DELETE remove game from inventory
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const game = await prisma.game.delete({
            where: { id: req.params.id },
        });

        res.json({ data: game, message: 'Game removed from inventory' });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Game not found' });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete game that has sales' });
        }
        console.error('Game deletion error:', error);
        res.status(500).json({ error: 'Failed to delete game' });
    }
});

export default router;
