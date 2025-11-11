import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import accountRoutes from './routes/accounts';
import authRoutes from './routes/auth';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('CRM Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);

export default app;
