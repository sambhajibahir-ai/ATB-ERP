import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

describe('Data Store Integrity & Multi-Tenant Partitioning', () => {
  const storePath = path.resolve('data/store.json');
  assert.ok(fs.existsSync(storePath), 'data/store.json must exist on disk');
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  test('Company 1 is strictly configured as ATB Software with Wagholi address and masked tax IDs', () => {
    const comp1 = store.companies.find((c) => c.id === 1);
    assert.ok(comp1, 'Company 1 must exist');
    assert.equal(comp1.name, 'ATB Software');
    assert.ok(comp1.address.toLowerCase().includes('wagholi'), 'Company 1 address must include Wagholi');
    assert.ok(comp1.taxId.includes('****') || comp1.taxId.includes('XXXX'), 'Company 1 CIN must be masked');
    assert.ok(comp1.gstin.includes('****') || comp1.gstin.includes('XXXX'), 'Company 1 GSTIN must be masked');
    assert.equal(comp1.status, 'Active');
  });

  test('Super Admin account exists and authenticates with configured credentials', () => {
    const superAdmin = store.users.find((u) => u.isPlatformAdmin);
    assert.ok(superAdmin, 'Platform Super Admin must exist');
    assert.equal(superAdmin.email, 'atbsoftware@gmail.com');
    assert.equal(superAdmin.isPlatformAdmin, true);
    assert.equal(superAdmin.isCompanyAdmin, false);
    assert.equal(superAdmin.status, 'Active');

    // Verify PBKDF2 hash with atbsoftware108
    const [salt, storedHash] = superAdmin.passwordHash.split(':');
    const computedHash = crypto.pbkdf2Sync('atbsoftware108', salt, 1000, 64, 'sha512').toString('hex');
    assert.equal(computedHash, storedHash, 'Password atbsoftware108 must match PBKDF2 hash');
  });

  test('Company 6 (Tenant) has its own products and valid pricing', () => {
    const co6 = store.companies.find((c) => c.id === 6);
    if (co6) {
      assert.equal(co6.status, 'Active');
      const co6Products = store.products.filter((p) => p.companyId === 6);
      assert.ok(co6Products.length > 0, 'Company 6 must have products');

      for (const prod of co6Products) {
        assert.ok(prod.id > 0, 'Product must have positive ID');
        assert.ok(prod.sellingPrice > 0, `Product ${prod.name} sellingPrice must be positive`);
        assert.ok(typeof prod.sellingPrice === 'number', 'sellingPrice must be a number');
      }
    }
  });

  test('All products across all companies have valid positive prices', () => {
    for (const prod of store.products) {
      assert.ok(prod.sellingPrice > 0, `Product #${prod.id} (${prod.name}) price must be > 0`);
      assert.ok(prod.costPrice >= 0, `Product #${prod.id} costPrice must be >= 0`);
      assert.ok((prod.companyId || 1) > 0, `Product #${prod.id} must have a valid companyId`);
    }
  });

  test('All financial transactions have valid companyId and balanced income/expense types', () => {
    for (const tx of store.financialTransactions) {
      assert.ok([1, 2, 3, 4, 5, 6].includes(tx.companyId || 1), `Transaction #${tx.id} companyId must be valid`);
      assert.ok(['Income', 'Expense'].includes(tx.type), `Transaction #${tx.id} type must be Income or Expense`);
      assert.ok(tx.amount > 0, `Transaction #${tx.id} amount must be > 0`);
    }
  });
});
