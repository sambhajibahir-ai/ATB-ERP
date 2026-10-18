import { NextResponse } from 'next/server';
import { getFinancialTransactions, addFinancialTransaction, getInvoices, markInvoicePaid } from '@/lib/data-service';

export async function GET() {
  const [transactions, invoices] = await Promise.all([
    getFinancialTransactions(),
    getInvoices(),
  ]);
  return NextResponse.json({ transactions, invoices });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'mark_paid') {
      const invoice = await markInvoicePaid(body.invoiceId);
      return NextResponse.json(invoice);
    }
    const tx = await addFinancialTransaction(body);
    return NextResponse.json(tx, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

