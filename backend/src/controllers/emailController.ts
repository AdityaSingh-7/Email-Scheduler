import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { scheduleEmailJob } from '../queues/emailQueue';
import { z } from 'zod';

const ScheduleEmailSchema = z.object({
  recipients: z.array(z.string().email()).min(1, 'At least one recipient email is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  scheduledFor: z.string().optional(), // ISO String or ISO date-time format
  delayBetween: z.number().int().nonnegative().optional().default(2000), // ms
  hourlyLimit: z.number().int().positive().optional().default(200),
  senderEmail: z.string().email().optional().default('reachinbox-demo@ethereal.email'),
});

/**
 * Schedule New Emails Endpoint
 */
export async function scheduleEmails(req: Request, res: Response) {
  try {
    const validatedData = ScheduleEmailSchema.parse(req.body);

    const scheduledDate = validatedData.scheduledFor
      ? new Date(validatedData.scheduledFor)
      : new Date();

    const createdRecords = [];

    let index = 0;
    for (const recipient of validatedData.recipients) {
      // Stagger initial schedule time for each lead by delayBetween ms to enforce sequential delay throttling
      const leadScheduledDate = new Date(scheduledDate.getTime() + index * validatedData.delayBetween);

      // 1. Create Relational DB Record
      const emailRecord = await prisma.scheduledEmail.create({
        data: {
          recipient,
          subject: validatedData.subject,
          body: validatedData.body,
          senderEmail: validatedData.senderEmail,
          scheduledFor: leadScheduledDate,
          delayBetween: validatedData.delayBetween,
          hourlyLimit: validatedData.hourlyLimit,
          status: 'SCHEDULED',
        },
      });

      // 2. Add to BullMQ Delayed Queue
      await scheduleEmailJob(emailRecord);
      createdRecords.push(emailRecord);
      index++;
    }

    return res.status(201).json({
      success: true,
      message: `Successfully scheduled ${createdRecords.length} email(s)`,
      count: createdRecords.length,
      data: createdRecords,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error('Error scheduling emails:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
}

/**
 * Fetch Scheduled Emails
 */
export async function getScheduledEmails(req: Request, res: Response) {
  try {
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        status: { in: ['SCHEDULED', 'PROCESSING', 'RATE_LIMITED'] },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    return res.json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Fetch Sent / Failed Emails
 */
export async function getSentEmails(req: Request, res: Response) {
  try {
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        status: { in: ['SENT', 'FAILED'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Fetch Dashboard Statistics
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const totalScheduled = await prisma.scheduledEmail.count({
      where: { status: { in: ['SCHEDULED', 'PROCESSING', 'RATE_LIMITED'] } },
    });

    const totalSent = await prisma.scheduledEmail.count({
      where: { status: 'SENT' },
    });

    const totalFailed = await prisma.scheduledEmail.count({
      where: { status: 'FAILED' },
    });

    const totalEmails = await prisma.scheduledEmail.count();

    return res.json({
      success: true,
      data: {
        totalEmails,
        totalScheduled,
        totalSent,
        totalFailed,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Cancel a Scheduled Email
 */
export async function cancelScheduledEmail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const emailRecord = await prisma.scheduledEmail.findUnique({ where: { id } });
    if (!emailRecord) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    if (emailRecord.status === 'SENT') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an email that is already sent' });
    }

    await prisma.scheduledEmail.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return res.json({ success: true, message: 'Scheduled email cancelled successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
