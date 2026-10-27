import { NextResponse } from 'next/server';
import {
  getPurchaseOrders,
  getSuppliers,
  createPurchaseOrder,
  receivePurchaseOrder,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  transmitPurchaseOrder,
  updatePurchaseOrderStatus,
  addSupplier,
} from '@/lib/data-service';

export async function GET() {
  const [purchaseOrders, suppliers] = await Promise.all([getPurchaseOrders(), getSuppliers()]);
  return NextResponse.json({ purchaseOrders, suppliers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === 'create_supplier') {
      const supplier = await addSupplier(body.supplier || body);
      return NextResponse.json(supplier, { status: 201 });
    }

    if (body.action === 'approve') {
      const approved = await approvePurchaseOrder(body.poId, body.reviewer);
      if (!approved) return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
      return NextResponse.json(approved);
    }

    if (body.action === 'reject') {
      const rejected = await rejectPurchaseOrder(body.poId, body.reason, body.reviewer);
      if (!rejected) return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
      return NextResponse.json(rejected);
    }

    if (body.action === 'transmit') {
      const transmitted = await transmitPurchaseOrder(body.poId);
      if (!transmitted) return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
      return NextResponse.json(transmitted);
    }

    if (body.action === 'receive') {
      const received = await receivePurchaseOrder(body.poId);
      if (!received) return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
      return NextResponse.json(received);
    }

    if (body.action === 'update_status') {
      const updated = await updatePurchaseOrderStatus(body.poId, body.status);
      if (!updated) return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
      return NextResponse.json(updated);
    }

    const po = await createPurchaseOrder(body);
    return NextResponse.json(po, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
