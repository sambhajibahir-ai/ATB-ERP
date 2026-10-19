import { NextResponse } from 'next/server';
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotationStatus,
  convertQuotationToSalesOrder,
} from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
      const quotation = await getQuotationById(Number(id));
      if (!quotation) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      }
      return NextResponse.json(quotation);
    }
    const quotations = await getQuotations();
    return NextResponse.json(quotations);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Convert quotation to confirmed sales order
    if (body.action === 'convert_to_order') {
      const result = await convertQuotationToSalesOrder(Number(body.quotationId));
      if (!result) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // 2. Update quotation status (Draft, Sent, Accepted, Declined)
    if (body.action === 'update_status') {
      const updated = await updateQuotationStatus(Number(body.quotationId), body.status);
      if (!updated) {
        return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    // 3. Create new quotation
    const newQuote = await createQuotation({
      customerId: Number(body.customerId),
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      items: body.items,
      validityDays: body.validityDays ? Number(body.validityDays) : undefined,
      discountAmount: body.discountAmount ? Number(body.discountAmount) : undefined,
      terms: body.terms,
      notes: body.notes,
    });

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

