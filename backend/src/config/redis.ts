import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

function parseRedisOptions() {
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379', 10),
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      };
    } catch (e) {
      console.error('Error parsing REDIS_URL:', e);
    }
  }

  let host = process.env.REDIS_HOST || 'localhost';
  if (host.startsWith('redis://') || host.startsWith('rediss://')) {
    try {
      const parsed = new URL(host);
      host = parsed.hostname;
    } catch {
      host = host.replace(/^rediss?:\/\//, '').split(':')[0];
    }
  }

  return {
    host: host,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

export const redisConnectionOptions = parseRedisOptions();

export const redisClient = new Redis(redisConnectionOptions as any);

redisClient.on('connect', () => {
  console.log(`✅ Redis connected to ${redisConnectionOptions.host}:${redisConnectionOptions.port}`);
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});
