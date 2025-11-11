import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import accountRoutes from './routes/accounts';
import authRoutes from './routes/auth';
import activityRoutes from './routes/activities';
import contactRoutes from './routes/contacts';
import dealRoutes from './routes/deals';

import { authenticate } from './middleware/auth';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticate); // attach user to req if token is valid

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('CRM Server is running');
});

// Only start listening if not running under tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


app.use('/api/accounts', accountRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);

export default app;
