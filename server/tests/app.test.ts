import request from 'supertest';
import app from '../src/index';

describe('Basic API - Game Store Server', () => {
  test('GET / responds with server running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Game Store Management System');
  });

  test('GET /api/status returns OK', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });

  test('GET /api returns 404 for empty path', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(404);
  });

  test('Invalid endpoints return 404', async () => {
    const res = await request(app).get('/api/invalid-endpoint');
    expect(res.status).toBe(404);
  });

  test('Server handles CORS headers', async () => {
    const res = await request(app).options('/api/customers');
    expect(res.status).toBeLessThan(500);
  });
});

describe('Authentication Endpoints', () => {
  test('POST /api/auth/login requires email and password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

