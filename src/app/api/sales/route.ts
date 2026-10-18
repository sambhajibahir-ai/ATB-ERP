import { NextResponse } from 'next/server';
import { getSalesOrders, getCustomers, createSalesOrder, updateSalesOrderStatus } from '@/lib/data-service';

export async function GET() {
  const [orders, customers] = await Promise.all([getSalesOrders(), getCustomers()]);
  return NextResponse.json({ orders, customers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'update_status') {
      const updated = await updateSalesOrderStatus(body.orderId, body.status);
      return NextResponse.json(updated);
    }
    const order = await createSalesOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

