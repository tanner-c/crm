jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            req.user = { id: 'u1', role: req.headers.authorization === 'Bearer admin-token' ? 'ADMIN' : 'USER' };
        }
        next();
    },
    requireAdmin: (req: any, _res: any, next: any) => {
        if (!req.user) {
            return _res.status(401).json({ error: 'Authentication required' });
        }
        if (req.user.role !== 'ADMIN') {
            return _res.status(403).json({ error: 'Admin role required' });
        }
        next();
    },
    requireAuth: (req: any, _res: any, next: any) => {
        if (!req.user) {
            return _res.status(401).json({ error: 'Authentication required' });
        }
        next();
    },
}));

jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        sale: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    totalAmount: 100,
                    customerId: 'c1',
                    lineItems: [{ quantity: 2 }]
                },
                {
                    totalAmount: 50,
                    customerId: 'c2',
                    lineItems: [{ quantity: 1 }, { quantity: 1 }]
                }
            ]))
        },
        customer: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 'c1',
                    name: 'Customer 1',
                    sales: [{ totalAmount: 100 }]
                },
                {
                    id: 'c2',
                    name: 'Customer 2',
                    sales: [{ totalAmount: 50 }]
                }
            ]))
        },
        saleLineItem: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    gameId: 'g1',
                    quantity: 2,
                    subtotal: 100,
                    pricePerUnit: 50,
                    game: { name: 'Cyberpunk 2077', platform: 'PC' }
                },
                {
                    gameId: 'g2',
                    quantity: 1,
                    subtotal: 30,
                    pricePerUnit: 30,
                    game: { name: 'The Witcher 3', platform: 'PC' }
                }
            ]))
        },
        user: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 'u1',
                    name: 'User 1',
                    sales: [
                        { totalAmount: 100, lineItems: [{ quantity: 2 }] }
                    ]
                }
            ]))
        }
    }
}));

import request from 'supertest';
import app from '../src/index';

const userToken = 'Bearer token';
const adminToken = 'Bearer admin-token';

describe('Reports API', () => {
    describe('GET /api/reports/sales-summary', () => {
        test('returns sales summary when authenticated', async () => {
            const res = await request(app)
                .get('/api/reports/sales-summary')
                .set('Authorization', userToken);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('totalSales', 2);
            expect(res.body.data).toHaveProperty('totalRevenue', 150);
            expect(res.body.data).toHaveProperty('averageSaleValue', 75);
            expect(res.body.data).toHaveProperty('totalCustomers', 2);
            expect(res.body.data).toHaveProperty('totalGamiesSold', 4);
        });

        test('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/reports/sales-summary');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/reports/revenue-by-customer', () => {
        test('returns customer revenue when authenticated', async () => {
            const res = await request(app)
                .get('/api/reports/revenue-by-customer')
                .set('Authorization', userToken);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toHaveProperty('customerName', 'Customer 1');
            expect(res.body.data[0]).toHaveProperty('totalRevenue', 100);
            expect(res.body.data[1]).toHaveProperty('customerName', 'Customer 2');
            expect(res.body.data[1]).toHaveProperty('totalRevenue', 50);
        });

        test('supports limit parameter', async () => {
            const res = await request(app)
                .get('/api/reports/revenue-by-customer?limit=1')
                .set('Authorization', userToken);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
        });

        test('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/reports/revenue-by-customer');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/reports/top-selling-games', () => {
        test('returns top selling games when authenticated', async () => {
            const res = await request(app)
                .get('/api/reports/top-selling-games')
                .set('Authorization', userToken);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toHaveProperty('gameName', 'Cyberpunk 2077');
            expect(res.body.data[0]).toHaveProperty('totalRevenue', 100);
        });

        test('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/reports/top-selling-games');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/reports/user-performance', () => {
        test('returns user performance when admin', async () => {
            const res = await request(app)
                .get('/api/reports/user-performance')
                .set('Authorization', adminToken);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toHaveProperty('userName', 'User 1');
            expect(res.body.data[0]).toHaveProperty('totalRevenue', 100);
        });

        test('returns 403 when not admin', async () => {
            const res = await request(app)
                .get('/api/reports/user-performance')
                .set('Authorization', userToken);
            expect(res.status).toBe(403);
        });

        test('returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/reports/user-performance');
            expect(res.status).toBe(401);
        });
    });
});
