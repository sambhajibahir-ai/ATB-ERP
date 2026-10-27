import { NextResponse } from 'next/server';
import { getCustomers, addCustomer } from '@/lib/data-service';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(customers);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.company) {
      return NextResponse.json(
        { error: 'Contact person name and company entity name are required.' },
        { status: 400 }
      );
    }
    const customer = await addCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

