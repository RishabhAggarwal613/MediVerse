// src/lib/validators.js
import { z } from 'zod';
import { LIMITS, MIME } from './constants.js';

// Auth
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[a-z]/, 'At least one lowercase letter')
    .regex(/[0-9]/, 'At least one number'),
});

// Profile
export const profileSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0).max(120).optional().nullable(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  heightCm: z.number().min(50).max(250).optional().nullable(),
  weightKg: z.number().min(10).max(400).optional().nullable(),
});

// Diet planner
export const dietPreferencesSchema = z.object({
  dietType: z.enum(['balanced', 'keto', 'vegan', 'vegetarian', 'low-carb', 'high-protein']),
  caloriesTarget: z.number().min(1000).max(5000).optional(),
  allergies: z.array(z.string()).default([]),
  mealsPerDay: z.number().int().min(1).max(8).default(3),
  duration: z.enum(['week', 'month']).default('week'),
});

// Report upload (browser File object)
export const reportFileSchema = z
  .instanceof(File, { message: 'Please select a file' })
  .refine((f) => f.size <= LIMITS.REPORT_MAX_MB * 1024 * 1024, `Max ${LIMITS.REPORT_MAX_MB} MB`)
  .refine((f) => MIME.REPORTS.includes(f.type), 'Only PDF, PNG, or JPG allowed');

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  return { ok: parsed.success, data: parsed.success ? parsed.data : null, errors: parsed.error?.flatten?.().fieldErrors || {} };
}
