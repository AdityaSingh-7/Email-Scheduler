import { Router } from 'express';
import {
  scheduleEmails,
  getScheduledEmails,
  getSentEmails,
  getDashboardStats,
  cancelScheduledEmail,
} from '../controllers/emailController';

const router = Router();

router.post('/schedule', scheduleEmails);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/stats', getDashboardStats);
router.delete('/:id/cancel', cancelScheduledEmail);

export default router;
