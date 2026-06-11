// Mock middleware to bypass auth for tests
jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => next(),
    requireAdmin: (req: any, _res: any, next: any) => next(),
    requireAuth: (req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../src/index';

// Mock mobygames service
jest.mock('../src/services/mobygames', () => ({
    searchGames: jest.fn(() => Promise.resolve([
        {
            mobyGameId: 12345,
            name: 'Cyberpunk 2077',
            description: 'An open-world action RPG',
            platforms: ['PC'],
            genres: ['RPG'],
            coverUrl: 'https://example.com/cover.jpg',
            releaseDate: new Date('2020-12-10'),
        }
    ])),
}));

// Mock prisma client
jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        game: {
            findFirst: jest.fn(({ where }: any) => {
                if (where && where.mobyGameId === 12345 && where.platform === 'PC') {
                    return Promise.resolve({
                        id: 'g1',
                        mobyGameId: 12345,
                        name: 'Cyberpunk 2077',
                        platform: 'PC',
                        price: 49.99,
                        stockLevel: 25,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            findMany: jest.fn(() => Promise.resolve([
                {
                    id: 'g1',
                    name: 'Cyberpunk 2077',
                    platform: 'PC',
                    genre: 'RPG',
                    description: 'An open-world action RPG',
                    price: 49.99,
                    stockLevel: 25,
                    coverUrl: 'https://example.com/cover.jpg',
                    mobyGameId: 12345,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ])),
            findUnique: jest.fn(({ where }: any) => {
                if (where.id === 'g1') {
                    return Promise.resolve({
                        id: 'g1',
                        name: 'Cyberpunk 2077',
                        platform: 'PC',
                        genre: 'RPG',
                        description: 'An open-world action RPG',
                        price: 49.99,
                        stockLevel: 25,
                        coverUrl: 'https://example.com/cover.jpg',
                        mobyGameId: 12345,
                        lineItems: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            count: jest.fn(() => Promise.resolve(1)),
            create: jest.fn(({ data }: any) => Promise.resolve({
                id: 'g_new',
                ...data,
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

describe('Inventory (Games) API (mocked)', () => {
    test('GET /api/inventory returns paginated list', async () => {
        const res = await request(app).get('/api/inventory?page=1&limit=10');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body).toHaveProperty('total');
    });

    test('GET /api/inventory/:id returns single game', async () => {
        const res = await request(app).get('/api/inventory/g1');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'g1');
        expect(res.body.data).toHaveProperty('name', 'Cyberpunk 2077');
        expect(res.body.data).toHaveProperty('platform', 'PC');
        expect(res.body.data).toHaveProperty('price');
        expect(res.body.data).toHaveProperty('stockLevel');
    });

    test('POST /api/inventory creates game', async () => {
        const res = await request(app).post('/api/inventory').send({
            name: 'The Witcher 3',
            platform: 'PC',
            genre: 'RPG',
            description: 'Open-world fantasy RPG',
            price: 39.99,
            stockLevel: 50
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', 'The Witcher 3');
    });

    test('PATCH /api/inventory/:id updates game', async () => {
        const res = await request(app).patch('/api/inventory/g1').send({
            price: 29.99,
            stockLevel: 10
        });
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'g1');
    });

    test('DELETE /api/inventory/:id deletes game', async () => {
        const res = await request(app).delete('/api/inventory/g1');
        expect(res.status).toBe(200);
    });

    test('POST /api/inventory validates required fields', async () => {
        const res = await request(app).post('/api/inventory').send({
            genre: 'RPG'
        });
        expect(res.status).toBe(400);
    });

    test('GET /api/inventory filters by platform', async () => {
        const res = await request(app).get('/api/inventory?platform=PC');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

    test('GET /api/inventory/search returns games from MobyGames', async () => {
        const res = await request(app).get('/api/inventory/search?q=Cyberpunk');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toHaveProperty('name', 'Cyberpunk 2077');
    });

    test('GET /api/inventory/search validates query length', async () => {
        const res = await request(app).get('/api/inventory/search?q=C');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body).toHaveProperty('message', 'Query must be at least 2 characters');
    });

    test('POST /api/inventory/add-from-search creates game successfully', async () => {
        const res = await request(app).post('/api/inventory/add-from-search').send({
            mobyGameId: 67890,
            name: 'New Game',
            platform: 'PLAYSTATION',
            genre: 'Action',
            price: 59.99,
            stockLevel: 10
        });
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('name', 'New Game');
    });

    test('POST /api/inventory/add-from-search prevents duplicate games', async () => {
        const res = await request(app).post('/api/inventory/add-from-search').send({
            mobyGameId: 12345,
            name: 'Cyberpunk 2077',
            platform: 'PC',
            price: 49.99
        });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Game already exists in inventory');
    });

    test('POST /api/inventory/add-from-search validates required name', async () => {
        const res = await request(app).post('/api/inventory/add-from-search').send({
            mobyGameId: 9999,
            name: '',
            platform: 'PC'
        });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Game name is required');
    });
});
