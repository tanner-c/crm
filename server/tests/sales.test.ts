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
        sale: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 's1',
                    customerId: 'c1',
                    totalAmount: 99.98,
                    status: 'COMPLETED',
                    saleDate: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ])),
            findUnique: jest.fn(({ where }: any) => {
                if (where.id === 's1') {
                    return Promise.resolve({
                        id: 's1',
                        customerId: 'c1',
                        totalAmount: 99.98,
                        status: 'COMPLETED',
                        saleDate: new Date(),
                        lineItems: [
                            {
                                id: 'li1',
                                saleId: 's1',
                                gameId: 'g1',
                                quantity: 2,
                                pricePerUnit: 49.99,
                                subtotal: 99.98,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }
                        ],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            count: jest.fn(() => Promise.resolve(1)),
            create: jest.fn(({ data }: any) => Promise.resolve({
                id: 's_new',
                ...data,
                lineItems: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            })),
            update: jest.fn(({ where, data }: any) => Promise.resolve({
                id: where.id,
                ...data,
                updatedAt: new Date(),
            })),
            delete: jest.fn(() => Promise.resolve()),
        },
        customer: {
            findUnique: jest.fn(() => Promise.resolve({
                id: 'c1',
                name: 'John Doe',
                totalSpent: 500,
            })),
        },
        game: {
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 'g1',
                    name: 'Cyberpunk 2077',
                    price: 49.99,
                    stockLevel: 25,
                    platform: 'PC',
                    genre: 'RPG',
                    releaseDate: new Date(),
                    description: 'An action RPG',
                    coverImageUrl: 'https://example.com/cover.jpg',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ])),
            findUnique: jest.fn(() => Promise.resolve({
                id: 'g1',
                name: 'Cyberpunk 2077',
                price: 49.99,
                stockLevel: 25,
                platform: 'PC',
                genre: 'RPG',
                releaseDate: new Date(),
                description: 'An action RPG',
                coverImageUrl: 'https://example.com/cover.jpg',
            })),
        },
        saleLineItem: {
            createMany: jest.fn(() => Promise.resolve({})),
        }
    }
}));

describe('Sales API (mocked)', () => {
    test('GET /api/sales returns paginated list', async () => {
        const res = await request(app).get('/api/sales?page=1&limit=10');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
    });

    test('GET /api/sales/:id returns single sale with line items', async () => {
        const res = await request(app).get('/api/sales/s1');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 's1');
        expect(res.body.data).toHaveProperty('customerId', 'c1');
        expect(res.body.data).toHaveProperty('totalAmount');
        expect(res.body.data).toHaveProperty('status', 'COMPLETED');
        expect(res.body.data).toHaveProperty('lineItems');
    });

    // TC-11: Create Pending Sale
    test('POST /api/sales creates sale in PENDING status', async () => {
        const res = await request(app).post('/api/sales').send({
            customerId: 'c1',
            lineItems: [
                { gameId: 'g1', quantity: 2 }
            ],
            status: 'PENDING'
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('status', 'PENDING');
    });

    // TC-12: Complete Sale
    test('POST /api/sales creates sale with line items', async () => {
        const res = await request(app).post('/api/sales').send({
            customerId: 'c1',
            lineItems: [
                { gameId: 'g1', quantity: 2 }
            ],
            status: 'COMPLETED'
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('customerId', 'c1');
        expect(res.body.data).toHaveProperty('totalAmount');
    });

    // TC-13: Cancel Completed Sale
    test('PATCH /api/sales/:id updates sale', async () => {
        const res = await request(app).patch('/api/sales/s1').send({
            status: 'CANCELLED'
        });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 's1');
    });

    // TC-14: Delete Completed Sale
    test('DELETE /api/sales/:id deletes sale', async () => {
        const res = await request(app).delete('/api/sales/s1');
        expect(res.status).toBe(200);
    });

    test('POST /api/sales validates required customerId', async () => {
        const res = await request(app).post('/api/sales').send({
            lineItems: [{ gameId: 'g1', quantity: 1 }]
        });
        expect(res.status).toBe(400);
    });

    test('POST /api/sales validates at least one line item', async () => {
        const res = await request(app).post('/api/sales').send({
            customerId: 'c1',
            lineItems: []
        });
        expect(res.status).toBe(400);
    });

    test('POST /api/sales validates line item quantity', async () => {
        const res = await request(app).post('/api/sales').send({
            customerId: 'c1',
            lineItems: [{ gameId: 'g1', quantity: 0 }]
        });
        expect(res.status).toBe(400);
    });
});
