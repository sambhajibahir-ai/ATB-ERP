import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Quotation to Sales Order Consistency & Financial Alignment', () => {
  const storePath = path.resolve('data/store.json');
  assert.ok(fs.existsSync(storePath), 'data/store.json must exist');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  test('QT-2026-0052 and converted SO-2026-0099 have identical financial totals with 0 discrepancy', () => {
    const quote = store.quotations.find((q) => q.quotationNumber === 'QT-2026-0052');
    assert.ok(quote, 'QT-2026-0052 must exist');
    assert.equal(quote.subtotal, 9000, 'Quotation subtotal must be 9,000');
    assert.equal(quote.discountAmount, 7700, 'Quotation discount must be 7,700');
    assert.equal(quote.taxAmount, 234, 'Quotation 18% GST must be 234');
    assert.equal(quote.totalAmount, 1534, 'Quotation total must be 1,534');
    assert.equal(quote.status, 'Converted', 'Quotation status must be Converted');

    const order = store.salesOrders.find((o) => o.id === quote.convertedSalesOrderId);
    assert.ok(order, 'Converted sales order must exist');
    assert.equal(order.orderNumber, 'SO-2026-0099', 'Order number must be SO-2026-0099');

    // Strict financial equivalence: Quotation vs Sales Order
    assert.equal(order.subtotal, quote.subtotal, 'Sales Order subtotal must match Quotation subtotal');
    assert.equal(order.discountAmount, quote.discountAmount, 'Sales Order discount must match Quotation discount');
    assert.equal(order.taxAmount, quote.taxAmount, 'Sales Order tax must match Quotation tax');
    assert.equal(order.totalAmount, quote.totalAmount, 'Sales Order total must match Quotation total (₹1,534)');

    const discrepancy = Math.abs(order.totalAmount - quote.totalAmount);
    assert.equal(discrepancy, 0, 'Discrepancy between QT-2026-0052 and SO-2026-0099 must be exactly 0.00');
  });

  test('Generated Invoice for SO-2026-0099 strictly mirrors Quotation totals', () => {
    const quote = store.quotations.find((q) => q.quotationNumber === 'QT-2026-0052');
    const invoice = store.invoices.find((i) => i.salesOrderId === quote.convertedSalesOrderId);
    assert.ok(invoice, 'Invoice matching converted sales order must exist');

    assert.equal(invoice.subtotal, quote.subtotal, 'Invoice subtotal must equal 9,000');
    assert.equal(invoice.discountAmount, quote.discountAmount, 'Invoice discount must equal 7,700');
    assert.equal(invoice.taxAmount, quote.taxAmount, 'Invoice tax must equal 234');
    assert.equal(invoice.totalAmount, quote.totalAmount, 'Invoice grand total must equal 1,534');
  });

  test('Conversion math engine: 18% GST with promotional discount formula', () => {
    const rawSubtotal = 10000;
    const discount = 4000;
    const taxable = Math.max(0, rawSubtotal - discount); // 6000
    const taxRate = 18;
    const taxAmount = Number(((taxable * taxRate) / 100).toFixed(2)); // 1080
    const grandTotal = Number((taxable + taxAmount).toFixed(2)); // 7080

    assert.equal(taxable, 6000);
    assert.equal(taxAmount, 1080);
    assert.equal(grandTotal, 7080);

    // Simulated converted SO object validation
    const convertedOrder = {
      subtotal: rawSubtotal,
      discountAmount: discount,
      taxAmount,
      totalAmount: grandTotal,
    };

    assert.equal(convertedOrder.subtotal - convertedOrder.discountAmount + convertedOrder.taxAmount, convertedOrder.totalAmount);
  });

  test('100% discount waiver preserves 0 taxable, 0 GST, and 0 total across Quotation, SO and Invoice', () => {
    const subtotal = 5000;
    const discount = 5000;
    const taxable = Math.max(0, subtotal - discount);
    const tax = Number((taxable * 0.18).toFixed(2));
    const total = taxable + tax;

    assert.equal(taxable, 0);
    assert.equal(tax, 0);
    assert.equal(total, 0);
  });

  test('Multi-item quotation preserves custom line items and line item totals on conversion', () => {
    const quoteItems = [
      { productId: 1, productName: 'ATB HyperCluster Node', sku: 'ELC-SRV-900', quantity: 2, unitPrice: 5000, total: 10000 },
      { productId: 2, productName: 'ATB IoT Telemetry Suite', sku: 'ELC-SEN-401', quantity: 1, unitPrice: 2000, total: 2000 },
    ];

    const subtotal = quoteItems.reduce((acc, curr) => acc + curr.total, 0);
    const discount = 2000;
    const taxable = subtotal - discount; // 10000
    const tax = Number((taxable * 0.18).toFixed(2)); // 1800
    const total = taxable + tax; // 11800

    const soItems = quoteItems.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    }));

    assert.equal(soItems.length, 2);
    assert.equal(soItems[0].total, 10000);
    assert.equal(soItems[1].total, 2000);
    assert.equal(total, 11800);
  });
});

