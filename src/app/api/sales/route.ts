import { NextResponse } from 'next/server';
import {
  getSalesOrders,
  getCustomers,
  createSalesOrder,
  updateSalesOrderStatus,
  addCustomer,
  generateInvoiceForSalesOrder,
  getInvoiceBySalesOrderId,
} from '@/lib/data-service';

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
    if (body.action === 'create_customer') {
      const customer = await addCustomer(body.customer || body);
      return NextResponse.json(customer, { status: 201 });
    }
    if (body.action === 'generate_invoice') {
      const invoice = await generateInvoiceForSalesOrder(Number(body.orderId));
      if (!invoice) {
        return NextResponse.json({ error: 'Sales Order not found' }, { status: 404 });
      }
      return NextResponse.json(invoice, { status: 201 });
    }
    const order = await createSalesOrder(body);
    const invoice = await getInvoiceBySalesOrderId(order.id);
    return NextResponse.json({ ...order, order, invoice }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


