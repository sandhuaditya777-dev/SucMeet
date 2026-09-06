import 'dotenv/config';
import app from './app';
import { connectDB } from './lib/mongoose';
import { connectRedis } from './lib/redis';
import { logger } from './lib/logger';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`🚀 SucMeet API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
