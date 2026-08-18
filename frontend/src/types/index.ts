export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export type EmailStatus = 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'RATE_LIMITED' | 'CANCELLED';

export interface EmailRecord {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  senderEmail: string;
  scheduledFor: string;
  sentAt?: string | null;
  status: EmailStatus;
  delayBetween: number;
  hourlyLimit: number;
  etherealPreviewUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalEmails: number;
  totalScheduled: number;
  totalSent: number;
  totalFailed: number;
}

export interface SchedulePayload {
  recipients: string[];
  subject: string;
  body: string;
  scheduledFor?: string;
  delayBetween?: number;
  hourlyLimit?: number;
  senderEmail?: string;
}
