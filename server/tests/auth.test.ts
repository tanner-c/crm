process.env.JWT_SECRET = 'test-secret';

let mockUsers: any[] = [];

jest.mock('../src/prisma/client', () => ({
    __esModule: true,
    default: {
        user: {
            create: jest.fn(({ data }: any) => {
                const newUser = {
                    id: 'u_' + Math.random().toString(36).substr(2, 9),
                    name: data.name,
                    email: data.email,
                    password: data.password, // hashed
                    role: data.role || 'USER',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                mockUsers.push(newUser);
                return Promise.resolve(newUser);
            }),
            findUnique: jest.fn(({ where }: any) => {
                const user = mockUsers.find(u => u.email === where.email || u.id === where.id);
                return Promise.resolve(user || null);
            })
        }
    }
}));

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/index';
import { isAdmin, getUserFromRequest, isAuthenticated } from '../src/utils/auth';

describe('Auth API and Utilities', () => {
    beforeEach(() => {
        mockUsers = [];
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('email', 'john@example.com');
            expect(res.body.user).not.toHaveProperty('password');
            expect(mockUsers).toHaveLength(1);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login successfully with correct credentials', async () => {
            // First register a user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'john@example.com');
        });

        test('should return 401 for incorrect password', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'john@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid email or password');
        });

        test('should return 401 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid email or password');
        });
    });

    describe('GET /api/auth/me', () => {
        test('should return current user when authenticated', async () => {
            const regRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123'
                });

            const token = regRes.body.token;

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty('email', 'john@example.com');
        });

        test('should return 401 when token is missing', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        test('should return 401 when token is invalid', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });
    });

    describe('Auth Utilities', () => {
        test('getUserFromRequest extracts user from valid token', async () => {
            const user = { id: 'u1', email: 'user@example.com', role: 'USER' };
            mockUsers.push(user);

            const token = jwt.sign({ userId: 'u1' }, 'test-secret');
            const req = { headers: { authorization: `Bearer ${token}` } };

            const result = await getUserFromRequest(req);
            expect(result).toEqual(user);
        });

        test('getUserFromRequest returns null for invalid token', async () => {
            const req = { headers: { authorization: 'Bearer invalid-token' } };
            const result = await getUserFromRequest(req);
            expect(result).toBeNull();
        });

        test('getUserFromRequest returns null when auth header is missing', async () => {
            const req = { headers: {} };
            const result = await getUserFromRequest(req);
            expect(result).toBeNull();
        });

        test('isAdmin returns true for admin users', async () => {
            const adminUser = { id: 'u_admin', email: 'admin@example.com', role: 'ADMIN' };
            mockUsers.push(adminUser);

            const token = jwt.sign({ userId: 'u_admin' }, 'test-secret');
            const req = { headers: { authorization: `Bearer ${token}` } };

            const result = await isAdmin(req);
            expect(result).toBe(true);
        });

        test('isAdmin returns false for non-admin users', async () => {
            const user = { id: 'u1', email: 'user@example.com', role: 'USER' };
            mockUsers.push(user);

            const token = jwt.sign({ userId: 'u1' }, 'test-secret');
            const req = { headers: { authorization: `Bearer ${token}` } };

            const result = await isAdmin(req);
            expect(result).toBe(false);
        });

        test('isAdmin returns false on error/invalid token', async () => {
            const req = { headers: { authorization: 'Bearer invalid-token' } };
            const result = await isAdmin(req);
            expect(result).toBe(false);
        });

        test('isAuthenticated returns true for valid token', async () => {
            const user = { id: 'u1', email: 'user@example.com', role: 'USER' };
            mockUsers.push(user);

            const token = jwt.sign({ userId: 'u1' }, 'test-secret');
            const req = { headers: { authorization: `Bearer ${token}` } };

            const result = await isAuthenticated(req);
            expect(result).toBe(true);
        });

        test('isAuthenticated returns false for invalid token', async () => {
            const req = { headers: { authorization: 'Bearer invalid-token' } };
            const result = await isAuthenticated(req);
            expect(result).toBe(false);
        });
    });
});
