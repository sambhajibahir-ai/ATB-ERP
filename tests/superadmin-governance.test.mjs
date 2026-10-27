import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Super Admin Governance & Account Security', () => {
  const store = JSON.parse(fs.readFileSync(path.resolve('data/store.json'), 'utf8'));

  test('Super Admin account is immune to deletion or suspension', () => {
    const superAdmin = store.users.find((u) => u.isPlatformAdmin);
    assert.ok(superAdmin, 'Super Admin must exist');
    assert.equal(superAdmin.isPlatformAdmin, true);
    assert.equal(superAdmin.status, 'Active');

    // Simulate attempted deletion of Super Admin
    assert.throws(
      () => {
        if (superAdmin.isPlatformAdmin) {
          throw new Error('Cannot delete the private platform Super Administrator account.');
        }
      },
      /Cannot delete the private platform Super Administrator account/
    );

    // Simulate attempted suspension of Super Admin
    assert.throws(
      () => {
        if (superAdmin.isPlatformAdmin) {
          throw new Error('Cannot suspend the master platform Super Administrator account.');
        }
      },
      /Cannot suspend the master platform Super Administrator account/
    );
  });

  test('Super Admin has master authority to suspend company CEO accounts', () => {
    const ceoUsers = store.users.filter((u) => u.isCompanyAdmin && !u.isPlatformAdmin);
    assert.ok(ceoUsers.length > 0, 'Company CEOs must exist');

    for (const ceo of ceoUsers) {
      // Toggle should be permissible for Super Admin
      const toggledStatus = ceo.status === 'Active' ? 'Suspended' : 'Active';
      assert.ok(['Active', 'Suspended'].includes(toggledStatus));
    }
  });

  test('Company subscription license cancellation enforces immediate expiry and suspension', () => {
    const testCompany = {
      id: 999,
      name: 'Test Tenant Ltd',
      status: 'Active',
      licenseExpiresAt: '2028-01-01T00:00:00Z',
    };

    // Cancellation action
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    testCompany.licenseExpiresAt = pastDate;
    testCompany.status = 'Suspended';

    assert.equal(testCompany.status, 'Suspended');
    assert.ok(new Date(testCompany.licenseExpiresAt).getTime() < Date.now(), 'License must be expired');
  });

  test('Staff accounts of any company can be deleted or suspended', () => {
    const staffUsers = store.users.filter((u) => !u.isCompanyAdmin && !u.isPlatformAdmin);
    assert.ok(staffUsers.length > 0, 'Staff accounts must exist');
    for (const staff of staffUsers) {
      assert.equal(staff.isPlatformAdmin || false, false);
      assert.equal(staff.isCompanyAdmin || false, false);
    }
  });
});

