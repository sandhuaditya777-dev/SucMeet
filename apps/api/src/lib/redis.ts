import Redis from 'ioredis';
import { logger } from './logger';

let redisClient: Redis;

export function getRedis(): Redis {
  if (!redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = new Redis(url, { lazyConnect: true });

  redisClient.on('connect', () => logger.info('✅ Redis connected'));
  redisClient.on('error', (err) => logger.error('Redis error:', err));

  await redisClient.connect();
}
