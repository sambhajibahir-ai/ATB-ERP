import { NextResponse } from 'next/server';
import { getSuppliers, addSupplier } from '@/lib/data-service';

export async function GET() {
  try {
    const suppliers = await getSuppliers();
    return NextResponse.json(suppliers);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Supplier company name is required.' }, { status: 400 });
    }
    const supplier = await addSupplier(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

