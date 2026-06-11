jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => next(),
    requireAdmin: (req: any, _res: any, next: any) => next(),
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'u1', role: 'ADMIN' };
        next();
    },
}));

import request from 'supertest';
import app from '../src/index';

jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        activity: {
            findMany: jest.fn(() =>
                Promise.resolve([
                    {
                        id: 'act1',
                        type: 'NOTE',
                        subject: 'Follow up',
                        body: 'Call customer',
                        completed: false,
                        dueAt: null,
                        ownerId: 'u1',
                        customerId: 'c1',
                        saleId: null,
                        owner: { id: 'u1', name: 'Admin' },
                        customer: { id: 'c1', name: 'Customer' },
                        sale: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ])
            ),
            findUnique: jest.fn(({ where }: any) => {
                if (where.id === 'act1') {
                    return Promise.resolve({
                        id: 'act1',
                        type: 'NOTE',
                        subject: 'Follow up',
                        body: 'Call customer',
                        completed: false,
                        dueAt: null,
                        ownerId: 'u1',
                        customerId: 'c1',
                        saleId: null,
                        owner: { id: 'u1', name: 'Admin' },
                        customer: { id: 'c1', name: 'Customer' },
                        sale: null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            create: jest.fn(({ data }: any) =>
                Promise.resolve({
                    id: 'act_new',
                    type: data.type,
                    subject: data.subject,
                    body: data.body || null,
                    completed: data.completed || false,
                    dueAt: data.dueAt || null,
                    ownerId: data.ownerId || 'u1',
                    customerId: data.customerId || null,
                    saleId: data.saleId || null,
                    owner: { id: 'u1', name: 'Admin' },
                    customer: null,
                    sale: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            ),
            update: jest.fn(({ where, data }: any) =>
                Promise.resolve({
                    id: where.id,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            ),
            delete: jest.fn(() => Promise.resolve()),
        },
    },
}));

describe('Activities API (mocked)', () => {
    test('GET /api/activities returns list', async () => {
        const res = await request(app)
            .get('/api/activities')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0]).toHaveProperty('id', 'act1');
        expect(res.body.data[0]).toHaveProperty('type', 'NOTE');
    });

    test('GET /api/activities/:id returns single activity', async () => {
        const res = await request(app)
            .get('/api/activities/act1')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'act1');
        expect(res.body.data).toHaveProperty('subject', 'Follow up');
    });

    test('GET /api/activities/:id returns 404 for invalid ID', async () => {
        const res = await request(app)
            .get('/api/activities/invalid')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(404);
    });

    test('POST /api/activities creates activity', async () => {
        const res = await request(app)
            .post('/api/activities')
            .set('Authorization', 'Bearer token')
            .send({
                type: 'CALL',
                subject: 'Sales call',
                body: 'Discussed pricing',
                customerId: 'c1',
            });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('type', 'CALL');
    });

    test('POST /api/activities validates type', async () => {
        const res = await request(app)
            .post('/api/activities')
            .set('Authorization', 'Bearer token')
            .send({ type: 'INVALID', subject: 'Test' });

        expect(res.status).toBe(400);
    });

    test('POST /api/activities validates subject', async () => {
        const res = await request(app)
            .post('/api/activities')
            .set('Authorization', 'Bearer token')
            .send({ type: 'NOTE', subject: '' });

        expect(res.status).toBe(400);
    });

    test('PATCH /api/activities/:id updates activity', async () => {
        const res = await request(app)
            .patch('/api/activities/act1')
            .set('Authorization', 'Bearer token')
            .send({ completed: true });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('id', 'act1');
    });

    test('DELETE /api/activities/:id deletes activity', async () => {
        const res = await request(app)
            .delete('/api/activities/act1')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(204);
    });
});
