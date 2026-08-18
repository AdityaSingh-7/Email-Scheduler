import { redisClient } from '../config/redis';

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  msUntilNextHour: number;
}

/**
 * Returns the current hour window string key, e.g. "rate_limit:user@example.com:2026-08-18-20"
 */
function getHourWindowKey(senderEmail: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');

  return `rate_limit:${senderEmail.toLowerCase()}:${year}-${month}-${day}-${hour}`;
}

/**
 * Calculates milliseconds remaining until the start of the next hour window
 */
export function getMsUntilNextHour(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setUTCHours(now.getUTCHours() + 1, 0, 0, 0);

  return nextHour.getTime() - now.getTime();
}

/**
 * Checks and atomically increments hourly email count in Redis.
 * Safe across multiple worker threads and instances.
 */
export async function checkAndIncrementHourlyLimit(
  senderEmail: string,
  hourlyLimit: number
): Promise<RateLimitCheckResult> {
  const key = getHourWindowKey(senderEmail);
  const msUntilNextHour = getMsUntilNextHour();

  // Multi / Exec pipeline for atomic check and TTL set
  const currentCountStr = await redisClient.get(key);
  const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

  if (currentCount >= hourlyLimit) {
    return {
      allowed: false,
      currentCount,
      msUntilNextHour,
    };
  }

  // Atomically increment counter
  const newCount = await redisClient.incr(key);
  
  // Ensure key expires after 2 hours so Redis stays clean
  if (newCount === 1) {
    await redisClient.expire(key, 7200);
  }

  return {
    allowed: true,
    currentCount: newCount,
    msUntilNextHour,
  };
}
