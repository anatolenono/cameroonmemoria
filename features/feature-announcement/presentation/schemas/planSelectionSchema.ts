import { z } from 'zod';
import { AnnouncementPlan } from '@/features/feature-announcement/domain/types/announcement';

export const planSelectionSchema = z.object({
  plan: z.enum([
    AnnouncementPlan.FREE,
    AnnouncementPlan.ESSENTIAL,
    AnnouncementPlan.COMPLETE,
    AnnouncementPlan.PREMIUM,
  ]).default(AnnouncementPlan.FREE),
});

export type PlanSelectionFormData = z.infer<typeof planSelectionSchema>;
