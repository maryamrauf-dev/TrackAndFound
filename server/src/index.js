import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { uploadDir } from './middleware/upload.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import adminRoutes from './routes/admin.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 60 }), authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong on our side' });
});

await connectDB();
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API on :${port}`));
