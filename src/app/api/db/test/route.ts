import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/data-service';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  const result = await checkDatabaseConnection();
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const { connectionString } = await req.json();
    if (!connectionString || !connectionString.startsWith('postgres')) {
      return NextResponse.json(
        { connected: false, message: 'Invalid PostgreSQL connection string format.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const sql = neon(connectionString);
    const rows = await sql`SELECT 1 as ping, current_database() as db_name, version() as version`;
    const latency = Date.now() - startTime;

    return NextResponse.json({
      connected: true,
      type: 'Neon Serverless PostgreSQL',
      latencyMs: latency,
      databaseName: rows[0]?.db_name || 'neondb',
      version: rows[0]?.version || 'PostgreSQL (Neon)',
      message: `Connection successful! Database responded in ${latency}ms.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { connected: false, message: `Connection failed: ${err.message}` },
      { status: 500 }
    );
  }
}

