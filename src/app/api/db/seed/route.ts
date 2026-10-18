import { NextResponse } from 'next/server';
import { seedNeonDatabase } from '@/lib/data-service';

export async function POST() {
  const result = await seedNeonDatabase();
  return NextResponse.json(result);
}

