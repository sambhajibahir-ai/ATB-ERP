import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Multi-Tenant Data Isolation Rules', () => {
  const store = JSON.parse(fs.readFileSync(path.resolve('data/store.json'), 'utf8'));

  test('Tenant isolation: Company 2 cannot see Company 1 customers', () => {
    const co1Customers = store.customers.filter((c) => (c.companyId || 1) === 1);
    const co2Customers = store.customers.filter((c) => c.companyId === 2);

    for (const c2 of co2Customers) {
      assert.ok(!co1Customers.some((c1) => c1.id === c2.id), 'Cross-company customer collision detected');
    }
  });

  test('Tenant isolation: Company 2 cannot see Company 1 sales orders', () => {
    const co1Orders = store.salesOrders.filter((o) => (o.companyId || 1) === 1);
    const co2Orders = store.salesOrders.filter((o) => o.companyId === 2);

    for (const o2 of co2Orders) {
      assert.ok(!co1Orders.some((o1) => o1.id === o2.id), 'Cross-company order collision detected');
    }
  });

  test('Company accounts have distinct registration codes and license tiers', () => {
    const codes = new Set();
    for (const comp of store.companies) {
      assert.ok(!codes.has(comp.code), `Duplicate company code detected: ${comp.code}`);
      codes.add(comp.code);
      assert.ok(['Trial', 'Starter', 'Growth', 'Enterprise'].includes(comp.licenseTier), `Invalid tier: ${comp.licenseTier}`);
      assert.ok(['Active', 'Pending', 'Suspended'].includes(comp.status), `Invalid status: ${comp.status}`);
    }
  });

  test('Each company has seat quotas enforced by maxUsers', () => {
    for (const comp of store.companies) {
      assert.ok(comp.maxUsers > 0, `Company ${comp.name} maxUsers must be > 0`);
      const userCount = store.users.filter((u) => u.companyId === comp.id).length;
      assert.ok(userCount <= comp.maxUsers, `Company ${comp.name} exceeds seat quota (${userCount}/${comp.maxUsers})`);
    }
  });
});

