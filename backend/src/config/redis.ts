import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;
let redisHost = process.env.REDIS_HOST || 'localhost';

// Clean up redisHost if user passed redis:// prefix
if (redisHost.startsWith('redis://')) {
  redisHost = redisHost.replace('redis://', '').split(':')[0];
}

const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnectionOptions: any = redisUrl
  ? redisUrl
  : {
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
    };

export const redisClient = typeof redisConnectionOptions === 'string'
  ? new Redis(redisConnectionOptions, { maxRetriesPerRequest: null, enableReadyCheck: false })
  : new Redis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log(`✅ Redis connected to ${redisHost}:${redisPort}`);
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});
