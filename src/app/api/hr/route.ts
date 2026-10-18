import { NextResponse } from 'next/server';
import { getEmployees, addEmployee } from '@/lib/data-service';

export async function GET() {
  const employees = await getEmployees();
  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const employee = await addEmployee(body);
    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

