import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis';
import { prisma } from '../config/db';

export const EMAIL_QUEUE_NAME = 'email-queue';

export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { age: 86400, count: 1000 }, // Keep completed history for 24h
    removeOnFail: { age: 86400 * 7, count: 5000 },
  },
});

export interface EmailJobPayload {
  emailId: string;
  recipient: string;
  subject: string;
  body: string;
  senderEmail: string;
  scheduledFor: string;
  delayBetween: number;
  hourlyLimit: number;
}

/**
 * Adds an email job to the BullMQ delayed queue
 */
export async function scheduleEmailJob(emailRecord: {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  senderEmail: string;
  scheduledFor: Date;
  delayBetween: number;
  hourlyLimit: number;
}) {
  const now = Date.now();
  const scheduledTime = new Date(emailRecord.scheduledFor).getTime();
  const delay = Math.max(0, scheduledTime - now);

  const payload: EmailJobPayload = {
    emailId: emailRecord.id,
    recipient: emailRecord.recipient,
    subject: emailRecord.subject,
    body: emailRecord.body,
    senderEmail: emailRecord.senderEmail,
    scheduledFor: emailRecord.scheduledFor.toISOString(),
    delayBetween: emailRecord.delayBetween,
    hourlyLimit: emailRecord.hourlyLimit,
  };

  const job = await emailQueue.add('send-email', payload, {
    jobId: emailRecord.id,
    delay: delay,
  });

  // Save BullMQ job ID back to DB
  await prisma.scheduledEmail.update({
    where: { id: emailRecord.id },
    data: { bullJobId: job.id },
  });

  console.log(`📥 Enqueued BullMQ delayed job [${job.id}] for ${emailRecord.recipient} in ${Math.round(delay / 1000)}s`);
  return job;
}

/**
 * Restart Recovery: Scans DB for SCHEDULED emails on server startup
 * and re-registers any missing Redis delayed jobs.
 */
export async function recoverScheduledJobsOnStartup() {
  console.log('🔄 Checking database for pending SCHEDULED emails to recover after restart...');
  try {
    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'SCHEDULED',
      },
    });

    if (pendingEmails.length === 0) {
      console.log('✅ No pending SCHEDULED emails found. System ready.');
      return;
    }

    console.log(`📌 Found ${pendingEmails.length} SCHEDULED emails in database. Verifying queue alignment...`);
    let reQueuedCount = 0;

    for (const email of pendingEmails) {
      const existingJob = await emailQueue.getJob(email.id);
      
      if (!existingJob) {
        await scheduleEmailJob(email);
        reQueuedCount++;
      }
    }

    console.log(`✅ Restart Recovery Completed. Re-enqueued ${reQueuedCount} missing jobs to BullMQ.`);
  } catch (error) {
    console.error('❌ Error during job recovery scan:', error);
  }
}
