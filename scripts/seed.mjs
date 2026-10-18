import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || !connectionString.startsWith('postgres') || connectionString.includes('example_pass')) {
  console.log('---------------------------------------------------------');
  console.log('⚠️  DATABASE_URL is not configured with a live Neon URL.');
  console.log('   The ERP system will continue running seamlessly using');
  console.log('   its built-in enterprise in-memory repository.');
  console.log('   To connect to live Neon Postgres:');
  console.log('   1. Sign up for free at https://neon.tech');
  console.log('   2. Paste your connection string in .env.local:');
  console.log('      DATABASE_URL="postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"');
  console.log('   3. Run npm run db:seed or click "Seed" in Settings.');
  console.log('---------------------------------------------------------');
  process.exit(0);
}

console.log('🚀 Connecting to Neon PostgreSQL...');
const sql = neon(connectionString);

async function main() {
  const result = await sql`SELECT 1 as ping, current_database() as db_name, version() as version`;
  console.log(`✅ Connected successfully to Neon Postgres: ${result[0].db_name}`);
  console.log(`   Version: ${result[0].version}`);
  console.log('🎉 Database is ready for ERP operations!');
}

main().catch((err) => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
