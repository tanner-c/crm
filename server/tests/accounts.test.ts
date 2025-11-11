// Mock middleware to bypass auth for tests
jest.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => next(),
  requireAdmin: (req: any, _res: any, next: any) => next(),
  requireAuth: (req: any, _res: any, next: any) => next(),
  requireOwnerOrAdmin: (_getOwnerId: any) => (req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../src/index';

// Mock prisma client
jest.mock('../src/prisma/client', () => ({
  __esModule: true,
  default: {
    account: {
      findMany: jest.fn(() => Promise.resolve([
        { id: 'a1', name: 'Test Account', website: 'https://example.com', industry: 'Software', createdAt: new Date(), updatedAt: new Date() }
      ])),
      findUnique: jest.fn(({ where }: any) => {
        if (where.id === 'a1') return Promise.resolve({ id: 'a1', name: 'Test Account', website: 'https://example.com', industry: 'Software', contacts: [], deals: [], activities: [], createdAt: new Date(), updatedAt: new Date() });
        return Promise.resolve(null);
      }),
      create: jest.fn(({ data }: any) => Promise.resolve({ id: 'new', ...data, createdAt: new Date(), updatedAt: new Date() })),
      update: jest.fn(({ where, data }: any) => Promise.resolve({ id: where.id, ...data, updatedAt: new Date() })),
      delete: jest.fn(() => Promise.resolve()),
    }
  }
}));

describe('Accounts API (mocked)', () => {
  test('GET /api/accounts returns mocked list', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('id', 'a1');
  });

  test('GET /api/accounts/:id returns single account', async () => {
    const res = await request(app).get('/api/accounts/a1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'a1');
    expect(res.body).toHaveProperty('contacts');
    expect(res.body).toHaveProperty('deals');
  });

  test('POST /api/accounts creates account', async () => {
    const res = await request(app).post('/api/accounts').send({ name: 'New Co', website: 'https://new.co' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id', 'new');
    expect(res.body).toHaveProperty('name', 'New Co');
  });
});
