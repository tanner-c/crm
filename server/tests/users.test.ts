jest.mock('../src/middleware/auth', () => ({
    authenticate: (req: any, _res: any, next: any) => next(),
    requireAdmin: (req: any, _res: any, next: any) => next(),
    requireAuth: (req: any, _res: any, next: any) => {
        req.user = { id: 'u1', role: 'ADMIN' };
        next();
    },
}));

jest.mock('../src/utils/auth', () => ({
    isAdmin: jest.fn((req: any) => {
        if (req.body && req.body.email === 'not-admin@example.com') {
            return Promise.resolve(false);
        }
        return Promise.resolve(true);
    }),
    getUserFromRequest: jest.fn(() => ({ id: 'u1', role: 'ADMIN' })),
}));

import request from 'supertest';
import app from '../src/index';
import { Prisma } from '@prisma/client';

jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        user: {
            findMany: jest.fn(() =>
                Promise.resolve([
                    {
                        id: 'u1',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'ADMIN',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                ])
            ),
            findUnique: jest.fn(({ where }: any) => {
                if (where.id === 'u1') {
                    return Promise.resolve({
                        id: 'u1',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        role: 'ADMIN',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
                return Promise.resolve(null);
            }),
            create: jest.fn(({ data }: any) => {
                if (data.email === 'duplicate@example.com') {
                    const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
                    err.code = 'P2002';
                    err.message = 'Unique constraint failed';
                    err.clientVersion = 'mock';
                    return Promise.reject(err);
                }
                return Promise.resolve({
                    id: 'u_new',
                    name: data.name,
                    email: data.email,
                    role: data.role || 'USER',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }),
            update: jest.fn(({ where, data }: any) => {
                if (where.id === 'invalid') {
                    const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
                    err.code = 'P2025';
                    err.message = 'User not found';
                    err.clientVersion = 'mock';
                    return Promise.reject(err);
                }
                if (data.email === 'duplicate@example.com') {
                    const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
                    err.code = 'P2002';
                    err.message = 'Unique constraint failed';
                    err.clientVersion = 'mock';
                    return Promise.reject(err);
                }
                return Promise.resolve({
                    id: where.id,
                    name: data.name || 'Admin User',
                    email: data.email || 'admin@example.com',
                    role: data.role || 'ADMIN',
                    updatedAt: new Date(),
                });
            }),
            delete: jest.fn(({ where }: any) => {
                if (where.id === 'invalid') {
                    const err = Object.create(Prisma.PrismaClientKnownRequestError.prototype);
                    err.code = 'P2025';
                    err.message = 'User not found';
                    err.clientVersion = 'mock';
                    return Promise.reject(err);
                }
                return Promise.resolve({
                    id: where.id,
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'ADMIN',
                });
            }),
        },
    },
}));

describe('Users API (mocked)', () => {
    test('GET /api/users returns list of users', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('id', 'u1');
        expect(res.body[0]).toHaveProperty('email');
    });

    test('GET /api/users/:id returns single user', async () => {
        const res = await request(app)
            .get('/api/users/u1')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', 'u1');
        expect(res.body).toHaveProperty('name', 'Admin User');
        expect(res.body).not.toHaveProperty('password');
    });

    test('GET /api/users/:id returns 404 for non-existent user', async () => {
        const res = await request(app)
            .get('/api/users/invalid')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(404);
    });

    test('POST /api/users creates user', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'SecurePass123',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('name', 'New User');
        expect(res.body).not.toHaveProperty('password');
    });

    test('POST /api/users validates required fields', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ email: 'test@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('PATCH /api/users/:id updates user', async () => {
        const res = await request(app)
            .patch('/api/users/u1')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Updated Name' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', 'u1');
    });

    test('DELETE /api/users/:id deletes user', async () => {
        const res = await request(app)
            .delete('/api/users/u1')
            .set('Authorization', 'Bearer token');

        expect(res.status).toBe(200);
    });

    test('POST /api/users rejects invalid role', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'New User',
                email: 'new@example.com',
                password: 'password123',
                role: 'INVALID_ROLE'
            });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid role');
    });

    // TC-04: Role Restrictions
    test('POST /api/users prevents non-admin setting a role', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'New User',
                email: 'not-admin@example.com',
                password: 'password123',
                role: 'ADMIN'
            });
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('error', 'Forbidden to set role');
    });

    test('POST /api/users handles duplicate email error', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'New User',
                email: 'duplicate@example.com',
                password: 'password123'
            });
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error', 'Email already in use');
    });

    test('PATCH /api/users/:id rejects invalid role', async () => {
        const res = await request(app)
            .patch('/api/users/u1')
            .set('Authorization', 'Bearer token')
            .send({ role: 'INVALID_ROLE' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid role');
    });

    test('PATCH /api/users/:id rejects empty fields', async () => {
        const res = await request(app)
            .patch('/api/users/u1')
            .set('Authorization', 'Bearer token')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'No updatable fields provided');
    });

    test('PATCH /api/users/:id handles duplicate email error', async () => {
        const res = await request(app)
            .patch('/api/users/u1')
            .set('Authorization', 'Bearer token')
            .send({ email: 'duplicate@example.com' });
        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error', 'Email already in use');
    });

    test('PATCH /api/users/:id returns 404 for non-existent user', async () => {
        const res = await request(app)
            .patch('/api/users/invalid')
            .set('Authorization', 'Bearer token')
            .send({ name: 'Update' });
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found');
    });

    test('DELETE /api/users/:id returns 404 for non-existent user', async () => {
        const res = await request(app)
            .delete('/api/users/invalid')
            .set('Authorization', 'Bearer token');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found');
    });
});
