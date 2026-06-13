// Mock middleware to bypass auth for tests
jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => next(),
    requireAdmin: (req: any, _res: any, next: any) => next(),
    requireAuth: (req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../src/index';

// Mock prisma client
jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        customer: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 'c1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-0001',
                    loyaltyTier: 'GOLD',
                    totalSpent: 500.00,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ])),
            findUnique: jest.fn(({ where }: any) => {
                if (where.id === 'c1') {
                    return Promise.resolve({
                        id: 'c1',
                        name: 'John Doe',
                        email: 'john@example.com',
                        phone: '555-0001',
                        loyaltyTier: 'GOLD',
                        totalSpent: 500.00,
                        sales: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            count: jest.fn(() => Promise.resolve(1)),
            create: jest.fn(({ data }: any) => Promise.resolve({
                id: 'c_new',
                ...data,
                totalSpent: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            })),
            update: jest.fn(({ where, data }: any) => Promise.resolve({
                id: where.id,
                ...data,
                updatedAt: new Date(),
            })),
            delete: jest.fn(() => Promise.resolve()),
        }
    }
}));

describe('Customers API (mocked)', () => {
    test('GET /api/customers returns paginated list', async () => {
        const res = await request(app).get('/api/customers?page=1&limit=10');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
    });

    test('GET /api/customers/:id returns single customer', async () => {
        const res = await request(app).get('/api/customers/c1');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'c1');
        expect(res.body.data).toHaveProperty('name', 'John Doe');
        expect(res.body.data).toHaveProperty('loyaltyTier');
        expect(res.body.data).toHaveProperty('totalSpent');
    });

    // TC-05: Add Customer
    test('POST /api/customers creates customer', async () => {
        const res = await request(app).post('/api/customers').send({
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '555-0002',
            loyaltyTier: 'STANDARD'
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', 'Jane Smith');
    });

    test('PATCH /api/customers/:id updates customer', async () => {
        const res = await request(app).patch('/api/customers/c1').send({
            loyaltyTier: 'PLATINUM'
        });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'c1');
    });

    test('DELETE /api/customers/:id deletes customer', async () => {
        const res = await request(app).delete('/api/customers/c1');
        expect(res.status).toBe(200);
    });

    // TC-06: Validation Check (Customer empty name)
    test('POST /api/customers validates required name field', async () => {
        const res = await request(app).post('/api/customers').send({
            email: 'test@example.com'
        });
        expect(res.status).toBe(400);
    });

    // TC-07: Owner Lookup
    test('GET /api/customers/user/:userId returns customers for a user', async () => {
        const res = await request(app).get('/api/customers/user/u1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
