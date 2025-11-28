import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './db/mongodb.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';
import artistRoutes from './routes/artists.js';
import searchRoutes from './routes/search.js';
import subscriptionRoutes from './routes/subscriptions.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(rateLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Music Provider: ${process.env.MUSIC_PROVIDER || 'spotify'}`);
});

export default app;
