import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), 'Enter a valid URL (http/https)')
  .optional()
  .or(z.literal(''));

export const researchSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(300),
  year: z.coerce
    .number({ invalid_type_error: 'Year must be a number' })
    .int()
    .min(1950, 'Year looks too early')
    .max(new Date().getFullYear() + 1, 'Year is in the future'),
  journal: z.string().trim().max(200).optional(),
  topic: z.string().trim().max(120).optional(),
  summary: z.string().trim().min(10, 'Add a short summary').max(4000),
  pdfUrl: optionalUrl,
  externalLink: optionalUrl,
  status: z.enum(['draft', 'pending_review', 'published']),
});
export type ResearchFormValues = z.infer<typeof researchSchema>;

export const eventSchema = z.object({
  name: z.string().trim().min(3, 'Name is required').max(200),
  role: z.string().trim().min(2, 'Role is required').max(120),
  date: z.string().min(1, 'Date is required'),
  location: z.string().trim().max(200).optional(),
  description: z.string().trim().max(4000).optional(),
  link: optionalUrl,
  materialsUrl: optionalUrl,
});
export type EventFormValues = z.infer<typeof eventSchema>;

export const userSchema = (isEdit: boolean) =>
  z.object({
    name: z.string().trim().min(2, 'Name is required').max(120),
    email: z.string().trim().email('Enter a valid email'),
    password: isEdit
      ? z.string().min(8, 'Use at least 8 characters').optional().or(z.literal(''))
      : z.string().min(8, 'Use at least 8 characters'),
    role: z.enum(['admin', 'user']),
    titles: z.string().trim().max(400).optional(),
  });

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email'),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const contentHomeSchema = z.object({
  heroHeadline: z.string().trim().max(200).optional(),
  heroSubtext: z.string().trim().max(600).optional(),
  intro: z.string().trim().max(1200).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  rolesHandled: z.coerce.number().int().min(0).max(200).optional(),
  researchCount: z.coerce.number().int().min(0).max(2000).optional(),
  countriesImpacted: z.coerce.number().int().min(0).max(200).optional(),
});

export const contentAboutSchema = z.object({
  intro: z.string().trim().max(1200).optional(),
  bio: z.string().trim().max(6000).optional(),
  roles: z.string().trim().max(1200).optional(),
  expertise: z.string().trim().max(1200).optional(),
});
