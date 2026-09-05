import { z } from 'zod';

const trimmed = (max) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), 'Must be a valid http(s) URL')
  .optional();

/* -------------------------------- Research --------------------------------- */

export const researchCreateSchema = z.object({
  title: trimmed(300).min(3, 'Title is required'),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  journal: trimmed(200).optional(),
  topic: trimmed(120).optional(),
  summary: trimmed(6000).min(10, 'Summary is required'),
  pdfUrl: optionalUrl,
  externalLink: optionalUrl,
  keywords: z.array(trimmed(60)).max(30).optional(),
  featured: z.coerce.boolean().optional(),
  status: z.enum(['draft', 'pending_review', 'published']).optional(),
});

export const researchUpdateSchema = researchCreateSchema.partial();

/* --------------------------------- Events ---------------------------------- */
// Multipart: every field arrives as a string; images handled separately.

export const eventBodySchema = z
  .object({
    name: trimmed(200).min(3, 'Name is required'),
    role: trimmed(120).min(2, 'Role is required'),
    date: z.coerce.date(),
    location: trimmed(200).optional(),
    description: trimmed(6000).optional(),
    link: optionalUrl.or(z.literal('')),
    materialsUrl: optionalUrl.or(z.literal('')),
    existingImages: z.union([z.string(), z.array(z.string())]).optional(),
    clearImages: z.string().optional(),
  })
  .passthrough();

export const eventUpdateSchema = eventBodySchema.partial();

/* -------------------------------- Messages --------------------------------- */

export const messageCreateSchema = z.object({
  name: trimmed(120).min(2, 'Name is required'),
  email: trimmed(200).email('A valid email is required'),
  requestType: z.enum(['speaking', 'training', 'research', 'consultation', 'other']).optional(),
  message: trimmed(4000).min(10, 'Message is too short'),
});

export const messageReplySchema = z.object({
  message: trimmed(6000).min(2, 'Reply cannot be empty'),
});

/* --------------------------------- Content --------------------------------- */

export const contentUpdateSchema = z
  .object({
    heroHeadline: trimmed(200).optional(),
    heroSubtext: trimmed(600).optional(),
    heroCtas: z.array(z.object({ label: trimmed(60), href: trimmed(400) })).max(4).optional(),
    intro: trimmed(1200).optional(),
    bio: trimmed(8000).optional(),
    roles: z.array(trimmed(200)).max(50).optional(),
    expertise: z.array(trimmed(200)).max(50).optional(),
    stats: z
      .object({
        yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
        rolesHandled: z.coerce.number().int().min(0).max(500).optional(),
        researchCount: z.coerce.number().int().min(0).max(5000).optional(),
        countriesImpacted: z.coerce.number().int().min(0).max(300).optional(),
      })
      .optional(),
  })
  .passthrough();

/* ---------------------------------- Auth ----------------------------------- */

const password = z.string().min(8, 'Password must be at least 8 characters').max(200);

export const loginSchema = z.object({
  email: trimmed(200).email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const userCreateSchema = z
  .object({
    name: trimmed(120).min(2, 'Name is required'),
    email: trimmed(200).email('A valid email is required'),
    password,
    role: z.enum(['admin', 'editor']).optional(),
    titles: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .passthrough();

export const userUpdateSchema = z
  .object({
    name: trimmed(120).min(2).optional(),
    email: trimmed(200).email().optional(),
    password: password.optional(),
    role: z.enum(['admin', 'editor']).optional(),
    titles: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .passthrough();

export const profileSchema = z.object({
  name: trimmed(120).min(2, 'Name is required'),
  email: trimmed(200).email('A valid email is required'),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: password,
});
