import { NextResponse } from 'next/server';
import { getProducts, addProduct, adjustProductStock } from '@/lib/data-service';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'adjust_stock') {
      const updated = await adjustProductStock(body.productId, body.quantityChange, body.reason || 'Manual Adjustment');
      return NextResponse.json(updated);
    }
    const product = await addProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

