import request from 'supertest';
import app from '../src/index';

describe('Basic API', () => {
  test('GET / responds', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('CRM Server is running');
  });

  test('GET /api/status returns OK', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});
