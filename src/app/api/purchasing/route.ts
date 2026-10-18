import { NextResponse } from 'next/server';
import { getPurchaseOrders, getSuppliers, createPurchaseOrder, receivePurchaseOrder } from '@/lib/data-service';

export async function GET() {
  const [purchaseOrders, suppliers] = await Promise.all([getPurchaseOrders(), getSuppliers()]);
  return NextResponse.json({ purchaseOrders, suppliers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'receive') {
      const received = await receivePurchaseOrder(body.poId);
      return NextResponse.json(received);
    }
    const po = await createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

