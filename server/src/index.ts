import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import customerRoutes from './routes/customers';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
import reportRoutes from './routes/reports';

import { authenticate } from './middleware/auth';

// Load environment variables
// Variables set outside this file (e.g., in tests) will override these
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticate); // attach user to req if token is valid

const PORT = process.env.PORT || 5000;

app.get('/', (_req, res) => {
  res.send('🎮 Game Store Management System is running');
});

// Only start listening if not running under tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.get('/api/status', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Game Store Routes
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);

export default app;
