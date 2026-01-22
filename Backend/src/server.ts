import express from 'express';
import prisma from './config/database.js'; // Importa o cliente
import authRoutes from './routes/authRoutes.ts';
import paymentRoutes from './routes/paymentRoutes.ts';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Endpoint de teste para verificar DB
app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ status: 'OK', usersInDb: userCount });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT} with Prisma connected`);
});