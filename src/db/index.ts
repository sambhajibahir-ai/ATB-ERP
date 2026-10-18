import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function isNeonConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url &&
    url.trim().length > 0 &&
    !url.includes('example_pass') &&
    url.startsWith('postgres')
  );
}

export function getDb() {
  if (!isNeonConfigured()) {
    return null;
  }
  try {
    const sql = neon(process.env.DATABASE_URL!);
    return drizzle(sql, { schema });
  } catch (err) {
    console.error('[Neon DB] Failed to create neon client:', err);
    return null;
  }
}

export * from './schema';

