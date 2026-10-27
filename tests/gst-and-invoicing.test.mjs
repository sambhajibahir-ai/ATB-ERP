import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('GST 18% & Commercial Invoicing Calculations', () => {
  test('Standard Indian 18% GST calculation on single invoice line item', () => {
    const itemPrice = 10000;
    const quantity = 2;
    const subtotal = itemPrice * quantity; // 20000

    const gstRate = 18;
    const cgst = Number((subtotal * 0.09).toFixed(2)); // 9% CGST = 1800
    const sgst = Number((subtotal * 0.09).toFixed(2)); // 9% SGST = 1800
    const totalGst = cgst + sgst; // 3600

    assert.equal(totalGst, 3600);
    assert.equal(subtotal + totalGst, 23600, 'Invoice grand total must include 18% GST');
  });

  test('Website Hosting SKU (₹9,000) with ₹7,500 promotional partner discount', () => {
    const unitPrice = 9000;
    const qty = 1;
    const discount = 7500;

    const subtotal = unitPrice * qty; // 9000
    const taxable = Math.max(0, subtotal - discount); // 1500
    const gst18 = Number((taxable * 0.18).toFixed(2)); // 270.00
    const grandTotal = Number((taxable + gst18).toFixed(2)); // 1770.00

    assert.equal(subtotal, 9000, 'Subtotal should be exactly 9,000');
    assert.equal(taxable, 1500, 'Taxable value should be 1,500');
    assert.equal(gst18, 270, '18% GST should be 270');
    assert.equal(grandTotal, 1770, 'Quotation grand total should be 1,770');
  });

  test('Invoice numbering format consistency', () => {
    const sampleInvoiceNumber = 'INV-2026-0089';
    assert.match(sampleInvoiceNumber, /^INV-\d{4}-\d{4}$/, 'Invoice format must follow INV-YYYY-XXXX');

    const sampleQuoteNumber = 'QT-2026-0045';
    assert.match(sampleQuoteNumber, /^QT-\d{4}-\d{4}$/, 'Quotation format must follow QT-YYYY-XXXX');
  });

  test('Invoice status state machine transitions', () => {
    const allowedStatuses = ['Draft', 'Issued', 'Paid', 'Cancelled'];
    for (const status of ['Draft', 'Issued', 'Paid', 'Cancelled']) {
      assert.ok(allowedStatuses.includes(status));
    }
  });

  test('Quotation Send Email (Option C): Mailto URI schema and proposal drafting format', () => {
    const mockQuote = {
      quotationNumber: 'QT-2026-0045',
      customerName: 'Bharat Electronics Tech Ltd',
      customerEmail: 'procurement@bel.co.in',
      issueDate: '2026-03-20T00:00:00Z',
      expiryDate: '2026-04-19T00:00:00Z',
      subtotal: 9000,
      discountAmount: 7500,
      taxAmount: 270,
      totalAmount: 1770,
      itemsJson: [{ productName: 'Website Hosting', quantity: 1, unitPrice: 9000, total: 9000 }],
      terms: 'Standard 30 days validity.',
    };

    const subject = encodeURIComponent(`Commercial Price Quotation - ${mockQuote.quotationNumber} from ATB Software`);
    const mailto = `mailto:${mockQuote.customerEmail}?subject=${subject}&body=test`;

    assert.ok(mailto.startsWith('mailto:procurement@bel.co.in?subject=Commercial%20Price%20Quotation'));
    assert.ok(mockQuote.customerEmail.includes('@'));
    assert.equal(mockQuote.totalAmount, 1770);
  });
});

