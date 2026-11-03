import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(''),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_OWNER_ID: z.string().optional().default(''),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  APP_URL: z.string().optional().default('http://localhost:3000'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.string().default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('[Env] Validation warning:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_OWNER_ID: process.env.TELEGRAM_OWNER_ID || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const hasGeminiKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5);
export const hasTelegramToken = Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.includes(':'));
export const hasTelegramOwner = Boolean(env.TELEGRAM_OWNER_ID && env.TELEGRAM_OWNER_ID.length > 0);
export const hasSupabase = Boolean(env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY));
