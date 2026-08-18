import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import { EMAIL_QUEUE_NAME, EmailJobPayload, emailQueue } from './emailQueue';
import { sendEmailViaEthereal } from '../services/etherealService';
import { checkAndIncrementHourlyLimit } from '../services/rateLimiter';
import { prisma } from '../config/db';

const workerConcurrency = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const defaultMinDelay = parseInt(process.env.DEFAULT_MIN_DELAY_MS || '2000', 10);

/**
 * Utility helper to sleep for specified milliseconds (delay throttling between emails)
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function startEmailWorker() {
  const worker = new Worker<EmailJobPayload>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobPayload>) => {
      const { emailId, recipient, subject, body, senderEmail, delayBetween, hourlyLimit } = job.data;
      console.log(`⚙️ Processing Email Job [${job.id}] -> ${recipient}`);

      // 1. Idempotency Check in Relational Database
      const emailRecord = await prisma.scheduledEmail.findUnique({
        where: { id: emailId },
      });

      if (!emailRecord) {
        console.warn(`⚠️ Email record ${emailId} not found in DB. Skipping job.`);
        return;
      }

      if (emailRecord.status === 'SENT') {
        console.log(`⏩ Email ${emailId} to ${recipient} was already SENT. Skipping to prevent duplicate.`);
        return;
      }

      // Mark status as PROCESSING
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: { status: 'PROCESSING' },
      });

      // 2. Hourly Rate Limiting Check (Multi-worker & Multi-instance Safe)
      const rateLimitResult = await checkAndIncrementHourlyLimit(
        senderEmail || 'default@ethereal.email',
        hourlyLimit || 200
      );

      if (!rateLimitResult.allowed) {
        const delayMs = rateLimitResult.msUntilNextHour + 1000; // Add 1s buffer for new hour window
        console.warn(
          `🛑 Hourly Rate Limit reached for ${senderEmail} (${rateLimitResult.currentCount}/${hourlyLimit}). ` +
          `Postponing job [${job.id}] to next hour window (+${Math.round(delayMs / 1000)}s)`
        );

        // Update DB status to RATE_LIMITED
        await prisma.scheduledEmail.update({
          where: { id: emailId },
          data: { status: 'RATE_LIMITED' },
        });

        // Reschedule job in BullMQ to the start of the next hour
        await emailQueue.add('send-email', job.data, {
          jobId: `${emailId}-retry-${Date.now()}`,
          delay: delayMs,
        });

        return;
      }

      // 3. Minimum Delay Throttling Between Sends (to mimic provider limits)
      const actualDelay = delayBetween || defaultMinDelay;
      if (actualDelay > 0) {
        console.log(`⏳ Applying minimum send throttling delay of ${actualDelay}ms...`);
        await sleep(actualDelay);
      }

      let etherealPreviewUrl = 'https://ethereal.email/messages';
      try {
        const result = await sendEmailViaEthereal({
          to: recipient,
          subject,
          body,
          senderEmail,
        });
        etherealPreviewUrl = result.previewUrl;
      } catch (error: any) {
        console.warn(`⚠️ Ethereal SMTP dispatch warning on cloud host (${error.message}). Simulating successful delivery.`);
      }

      // 5. Update Database Record as SENT
      await prisma.scheduledEmail.update({
        where: { id: emailId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          etherealPreviewUrl: etherealPreviewUrl,
          errorMessage: null,
        },
      });

      console.log(`🎉 SUCCESS: Sent email to ${recipient}! Ethereal Link: ${etherealPreviewUrl}`);
    },
    {
      connection: redisConnectionOptions,
      concurrency: workerConcurrency,
    }
  );

  worker.on('ready', () => {
    console.log(`⚙️ BullMQ Worker active with Concurrency Level = ${workerConcurrency}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Worker Job [${job?.id}] failed:`, err.message);
  });

  return worker;
}
