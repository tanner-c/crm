import { Router } from 'express';
import prisma from '../prisma/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Reports Routes (Game Store)
 * GET /api/reports/sales-summary - Overall sales summary
 * GET /api/reports/revenue-by-customer - Revenue breakdown by customer
 * GET /api/reports/top-selling-games - Top selling games by quantity and revenue
 * GET /api/reports/user-performance - Sales staff performance metrics
 */

interface SalesSummaryReport {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  totalCustomers: number;
  totalGamiesSold: number;
}

interface RevenueByCustomerReport {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  saleCount: number;
  averageSaleValue: number;
}

interface TopSellingGameReport {
  gameId: string;
  gameName: string;
  platform: string;
  quantitySold: number;
  totalRevenue: number;
  averagePricePerUnit: number;
}

interface UserPerformanceReport {
  userId: string;
  userName: string;
  saleCount: number;
  totalRevenue: number;
  averageSaleValue: number;
  gamesSold: number;
}

/**
 * GET /api/reports/sales-summary
 * Overall sales metrics summary
 */
router.get('/sales-summary', requireAuth, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      select: {
        totalAmount: true,
        customerId: true,
        lineItems: {
          select: {
            quantity: true,
          },
        },
      },
    });

    const uniqueCustomers = new Set(sales.map((s) => s.customerId)).size;
    const totalGamiesSold = sales.reduce((sum, s) => sum + s.lineItems.reduce((q, li) => q + li.quantity, 0), 0);
    const totalRevenue = Math.round(sales.reduce((sum, s) => sum + s.totalAmount, 0) * 100) / 100;
    const averageSaleValue = sales.length > 0 ? Math.round((totalRevenue / sales.length) * 100) / 100 : 0;

    const data: SalesSummaryReport = {
      totalSales: sales.length,
      totalRevenue,
      averageSaleValue,
      totalCustomers: uniqueCustomers,
      totalGamiesSold,
    };

    res.json({
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary report' });
  }
});

/**
 * GET /api/reports/revenue-by-customer
 * Revenue breakdown showing total amount per customer
 * Query params:
 *   - userId (optional): Filter by specific user's sales
 *   - limit (optional): Maximum number of customers to return (default: 50)
 */
router.get('/revenue-by-customer', requireAuth, async (req, res) => {
  try {
    const { userId, limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(String(limit)), 100);

    const whereClause = userId ? { ownerId: String(userId) } : {};

    // Get customers with sales aggregation
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        sales: {
          where: whereClause,
          select: {
            totalAmount: true,
          },
        },
      },
      take: limitNum,
    });

    const data: RevenueByCustomerReport[] = customers
      .filter((c) => c.sales.length > 0)
      .map((customer) => {
        const totalRevenue = Math.round(customer.sales.reduce((sum, s) => sum + s.totalAmount, 0) * 100) / 100;
        const saleCount = customer.sales.length;
        const averageSaleValue = Math.round((totalRevenue / saleCount) * 100) / 100;

        return {
          customerId: customer.id,
          customerName: customer.name,
          totalRevenue,
          saleCount,
          averageSaleValue,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate grand total
    const total = data.reduce((sum, c) => sum + c.totalRevenue, 0);

    res.json({
      data,
      total: Math.round(total * 100) / 100,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching revenue by customer:', error);
    res.status(500).json({ error: 'Failed to fetch revenue by customer report' });
  }
});

/**
 * GET /api/reports/top-selling-games
 * Top selling games by quantity and revenue
 * Query params:
 *   - limit (optional): Maximum number of games to return (default: 20)
 */
router.get('/top-selling-games', requireAuth, async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const limitNum = Math.min(parseInt(String(limit)), 100);

    // Get all line items with game data
    const lineItems = await prisma.saleLineItem.findMany({
      select: {
        gameId: true,
        quantity: true,
        subtotal: true,
        pricePerUnit: true,
        game: {
          select: {
            name: true,
            platform: true,
          },
        },
      },
    });

    // Aggregate by game
    const gameMap = new Map<
      string,
      {
        gameName: string;
        platform: string;
        quantitySold: number;
        totalRevenue: number;
        totalPricePerUnit: number;
        count: number;
      }
    >();

    lineItems.forEach((item) => {
      const key = item.gameId;
      const current = gameMap.get(key) || {
        gameName: item.game.name,
        platform: item.game.platform,
        quantitySold: 0,
        totalRevenue: 0,
        totalPricePerUnit: 0,
        count: 0,
      };

      current.quantitySold += item.quantity;
      current.totalRevenue += item.subtotal;
      current.totalPricePerUnit += item.pricePerUnit;
      current.count += 1;

      gameMap.set(key, current);
    });

    // Convert to array and sort
    const data: TopSellingGameReport[] = Array.from(gameMap.entries())
      .map(([gameId, stats]) => ({
        gameId,
        gameName: stats.gameName,
        platform: stats.platform,
        quantitySold: stats.quantitySold,
        totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
        averagePricePerUnit: Math.round((stats.totalPricePerUnit / stats.count) * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limitNum);

    res.json({
      data,
      count: data.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching top selling games:', error);
    res.status(500).json({ error: 'Failed to fetch top selling games report' });
  }
});

/**
 * GET /api/reports/user-performance
 * Sales staff performance metrics
 * Query params:
 *   - limit (optional): Maximum number of users to return (default: 50)
 */
router.get('/user-performance', requireAdmin, async (req, res) => {
  try {
    const { limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(String(limit)), 100);

    // Get all users with their sales
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        sales: {
          select: {
            totalAmount: true,
            lineItems: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
      take: limitNum,
    });

    const data: UserPerformanceReport[] = users
      .filter((u) => u.sales.length > 0)
      .map((user) => {
        const saleCount = user.sales.length;
        const totalRevenue = Math.round(user.sales.reduce((sum, s) => sum + s.totalAmount, 0) * 100) / 100;
        const averageSaleValue = Math.round((totalRevenue / saleCount) * 100) / 100;
        const gamesSold = user.sales.reduce((sum, s) => sum + s.lineItems.reduce((q, li) => q + li.quantity, 0), 0);

        return {
          userId: user.id,
          userName: user.name,
          saleCount,
          totalRevenue,
          averageSaleValue,
          gamesSold,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      data,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user performance:', error);
    res.status(500).json({ error: 'Failed to fetch user performance report' });
  }
});

export default router;
