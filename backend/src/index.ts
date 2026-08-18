import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { getEtherealTransporter } from './services/etherealService';
import { startEmailWorker } from './queues/emailWorker';
import { recoverScheduledJobsOnStartup } from './queues/emailQueue';
import emailRoutes from './routes/emailRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health & Root Check Endpoints
app.get('/', (req, res) => {
  res.json({ success: true, service: 'ReachInbox Email Scheduler Backend API', health: '/health', time: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ReachInbox Email Scheduler Backend', time: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

async function startServer() {
  console.log('🚀 Starting ReachInbox Scheduler Backend...');

  // 1. Connect to Relational DB
  await connectDB();

  // 2. Initialize Ethereal SMTP Transporter
  await getEtherealTransporter();

  // 3. Start BullMQ Worker Process
  startEmailWorker();

  // 4. Run Restart Recovery Scan (Zero-Cron job persistence check)
  await recoverScheduledJobsOnStartup();

  // 5. Start Express Listener
  app.listen(PORT, () => {
    console.log(`📡 Backend Server listening on http://localhost:${PORT}`);
    console.log(`✨ Health Check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
