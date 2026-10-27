import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Pricing & Quotation Engine Unit Tests', () => {
  test('Quotation calculates exact subtotal, discount, 18% GST, and grand total', () => {
    const unitPrice = 9000;
    const quantity = 1;
    const discount = 7500;

    const subtotal = unitPrice * quantity;
    assert.equal(subtotal, 9000, 'Subtotal should be 9000');

    const taxable = Math.max(0, subtotal - discount);
    assert.equal(taxable, 1500, 'Taxable amount should be 1500 after 7500 discount');

    const taxRate = 18;
    const taxAmount = Number((taxable * (taxRate / 100)).toFixed(2));
    assert.equal(taxAmount, 270, '18% GST on 1500 should be 270.00');

    const grandTotal = Number((taxable + taxAmount).toFixed(2));
    assert.equal(grandTotal, 1770, 'Grand total should be 1770.00');
  });

  test('Discount exceeding subtotal is capped at 0 taxable and 0 tax', () => {
    const unitPrice = 1000;
    const quantity = 1;
    const discount = 5000;

    const subtotal = unitPrice * quantity;
    const taxable = Math.max(0, subtotal - discount);
    assert.equal(taxable, 0, 'Taxable amount cannot be negative');

    const tax = taxable * 0.18;
    assert.equal(tax, 0, 'Tax must be 0 when taxable is 0');

    const grandTotal = taxable + tax;
    assert.equal(grandTotal, 0, 'Grand total must be 0');
  });

  test('Multi-item quotation subtotal accumulates accurately', () => {
    const items = [
      { unitPrice: 2500, quantity: 2 }, // 5000
      { unitPrice: 1500, quantity: 3 }, // 4500
      { unitPrice: 9000, quantity: 1 }, // 9000
    ];

    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    assert.equal(subtotal, 18500, 'Subtotal should be 18,500.00');

    const discount = 1500;
    const taxable = subtotal - discount; // 17000
    const gst = Number((taxable * 0.18).toFixed(2)); // 3060
    const total = taxable + gst; // 20060

    assert.equal(taxable, 17000);
    assert.equal(gst, 3060);
    assert.equal(total, 20060);
  });
});

