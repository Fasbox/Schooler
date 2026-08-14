import { z } from 'zod';

export const notificationIdSchema = z.uuid();
export const pushSubscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  user_agent: z.string().max(500).optional(),
});
