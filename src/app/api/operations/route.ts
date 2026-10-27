import { NextResponse } from 'next/server';
import { getWorkOrders, createWorkOrder, updateWorkOrderStatus } from '@/lib/data-service';

export async function GET() {
  try {
    const workOrders = await getWorkOrders();
    return NextResponse.json(workOrders);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'update_status') {
      const updated = await updateWorkOrderStatus(body.orderId, body.status, body.progress);
      if (!updated) return NextResponse.json({ error: 'Work Order not found' }, { status: 404 });
      return NextResponse.json(updated);
    }
    if (!body.title || !body.productName) {
      return NextResponse.json({ error: 'Title and Product Name are required for Work Order.' }, { status: 400 });
    }
    const wo = await createWorkOrder(body);
    return NextResponse.json(wo, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

