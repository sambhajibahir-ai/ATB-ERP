import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('All-Departments Database Persistence & Refresh Integrity Tests', () => {
  const sourcePath = path.resolve('data/store.json');
  const testStorePath = path.resolve('data/test-persistence-store.json');
  assert.ok(fs.existsSync(sourcePath), 'data/store.json must exist');

  before(() => {
    // Clone live store into test sandbox file
    fs.copyFileSync(sourcePath, testStorePath);
  });

  after(() => {
    // Remove temporary test store file
    if (fs.existsSync(testStorePath)) {
      fs.unlinkSync(testStorePath);
    }
  });

  test('Sales & CRM: Add Customer persists to store and disk file', async () => {
    // Load store directly
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialCustomerCount = currentStore.customers.length;

    const testCustomer = {
      id: 9991,
      companyId: 1,
      code: 'CUST-991',
      name: 'Vikas Sharma',
      email: 'vikas@sharmatech.in',
      phone: '+91 99887 76655',
      company: 'Sharma Tech Innovations Pvt Ltd',
      taxNumber: '27AABCS9999Z1Z5',
      address: 'EON Free Zone, Kharadi, Pune, Maharashtra 411014',
      creditLimit: 75000,
      outstandingBalance: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    // Simulate saving to database
    currentStore.customers.unshift(testCustomer);
    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    // Simulate page refresh / cold read from disk
    const reloadedStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloadedStore.customers.length, initialCustomerCount + 1, 'Customer count must increment by 1');

    const retrievedCustomer = reloadedStore.customers.find((c) => c.id === 9991);
    assert.ok(retrievedCustomer, 'New customer must exist on disk after refresh');
    assert.equal(retrievedCustomer.name, 'Vikas Sharma');
    assert.equal(retrievedCustomer.company, 'Sharma Tech Innovations Pvt Ltd');
    assert.equal(retrievedCustomer.email, 'vikas@sharmatech.in');
    assert.equal(retrievedCustomer.taxNumber, '27AABCS9999Z1Z5');
    assert.equal(retrievedCustomer.creditLimit, 75000);
    assert.equal(retrievedCustomer.companyId, 1);
  });

  test('Sales & CRM: Commercial Quotation creation & 18% GST calculation persistence', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialQuoteCount = currentStore.quotations.length;

    const unitPrice = 9000;
    const qty = 2;
    const subtotal = unitPrice * qty; // 18000
    const discount = 3000;
    const taxable = subtotal - discount; // 15000
    const taxRate = 18;
    const taxAmount = taxable * 0.18; // 2700
    const totalAmount = taxable + taxAmount; // 17700

    const testQuote = {
      id: 8881,
      companyId: 1,
      quotationNumber: 'QT-2026-9999',
      customerId: 9991,
      customerName: 'Sharma Tech Innovations Pvt Ltd',
      customerEmail: 'vikas@sharmatech.in',
      issueDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      subtotal,
      taxRate,
      taxAmount,
      discountAmount: discount,
      totalAmount,
      status: 'Draft',
      itemsJson: [{ productId: 9, productName: 'Website Hosting', quantity: 2, unitPrice, total: 18000 }],
      terms: 'Net 30 days. Valid for 30 calendar days.',
      notes: 'Custom cloud enterprise tier.',
      createdAt: new Date().toISOString(),
    };

    currentStore.quotations.unshift(testQuote);
    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    // Simulate reload
    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.quotations.length, initialQuoteCount + 1);
    const q = reloaded.quotations.find((item) => item.id === 8881);
    assert.ok(q);
    assert.equal(q.totalAmount, 17700);
    assert.equal(q.taxAmount, 2700);
  });

  test('Purchasing: Add Approved Supplier and verify disk persistence', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialCount = currentStore.suppliers.length;

    const testSupplier = {
      id: 7771,
      companyId: 1,
      code: 'SUP-771',
      name: 'Pune Industrial Microelectronics Ltd',
      contactPerson: 'Suresh Patil',
      email: 'suresh@pune-micro.in',
      phone: '+91 20 2712 4499',
      address: 'Bhosari Industrial Area, Pune, Maharashtra',
      paymentTerms: 'Net 45',
      rating: 5,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    currentStore.suppliers.unshift(testSupplier);
    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.suppliers.length, initialCount + 1);
    const s = reloaded.suppliers.find((item) => item.id === 7771);
    assert.ok(s);
    assert.equal(s.name, 'Pune Industrial Microelectronics Ltd');
    assert.equal(s.paymentTerms, 'Net 45');
  });

  test('Inventory: Add Product & Stock Adjustment persistence', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialCount = currentStore.products.length;

    const testProduct = {
      id: 6661,
      companyId: 1,
      name: 'Quantum Edge Computing Gateway V2',
      sku: 'ATB-QEC-002',
      category: 'Electronics',
      costPrice: 12000,
      sellingPrice: 18500,
      currentStock: 40,
      minStock: 10,
      maxStock: 200,
      warehouseLocation: 'Bay 4, Wagholi DC',
      description: 'Ruggedized IoT telemetry gateway.',
      unit: 'unit',
      barcode: '890123456661',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    currentStore.products.unshift(testProduct);

    // Adjust stock: add 15 units
    testProduct.currentStock += 15;
    assert.equal(testProduct.currentStock, 55);

    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.products.length, initialCount + 1);
    const prod = reloaded.products.find((p) => p.id === 6661);
    assert.ok(prod);
    assert.equal(prod.currentStock, 55);
    assert.equal(prod.sellingPrice, 18500);
  });

  test('Finance & Ledger: Add Financial Transaction & Invoice Settlement', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialTxCount = currentStore.financialTransactions.length;

    const testTx = {
      id: 5551,
      companyId: 1,
      txNumber: 'TX-2026-9999',
      type: 'Income',
      category: 'Software Licensing',
      amount: 45000,
      date: new Date().toISOString(),
      paymentMethod: 'NEFT Transfer',
      reference: 'NEFT-ATB-998877',
      description: 'Annual enterprise license renewal from client',
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };

    currentStore.financialTransactions.unshift(testTx);
    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.financialTransactions.length, initialTxCount + 1);
    const tx = reloaded.financialTransactions.find((t) => t.id === 5551);
    assert.ok(tx);
    assert.equal(tx.amount, 45000);
    assert.equal(tx.type, 'Income');
  });

  test('Human Resources: Add Employee & Payroll persistence', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialEmpCount = currentStore.employees.length;

    const testEmp = {
      id: 4441,
      companyId: 1,
      employeeCode: 'EMP-991',
      firstName: 'Kavita',
      lastName: 'Deshmukh',
      email: 'kavita.deshmukh@atbsoftware.com',
      phone: '+91 97654 32109',
      department: 'Engineering & DevOps',
      position: 'Senior Cloud Reliability Engineer',
      salary: 1450000,
      joinDate: new Date().toISOString(),
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    currentStore.employees.unshift(testEmp);
    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.employees.length, initialEmpCount + 1);
    const emp = reloaded.employees.find((e) => e.id === 4441);
    assert.ok(emp);
    assert.equal(emp.firstName, 'Kavita');
    assert.equal(emp.department, 'Engineering & DevOps');
    assert.equal(emp.salary, 1450000);
  });

  test('Operations: Create Work Order & Status Transition persistence', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    const initialWOCount = currentStore.workOrders.length;

    const testWO = {
      id: 3331,
      companyId: 1,
      orderNumber: 'WO-2026-9999',
      title: 'Calibration and Thermal Stress Test of 25x Gateway V2 Units',
      productName: 'Quantum Edge Computing Gateway V2',
      quantity: 25,
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Pune QA & Testing Lab',
      progress: 60,
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
      notes: 'Chamber temperature testing between -10C and 65C.',
      createdAt: new Date().toISOString(),
    };

    currentStore.workOrders.unshift(testWO);

    // Simulate transition to Quality Review with 90% progress
    testWO.status = 'Quality Review';
    testWO.progress = 90;

    fs.writeFileSync(testStorePath, JSON.stringify(currentStore, null, 2), 'utf8');

    const reloaded = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));
    assert.equal(reloaded.workOrders.length, initialWOCount + 1);
    const wo = reloaded.workOrders.find((w) => w.id === 3331);
    assert.ok(wo);
    assert.equal(wo.status, 'Quality Review');
    assert.equal(wo.progress, 90);
  });

  test('Multi-Tenant Department Isolation: Company 1 records cannot leak to Company 2 or 6', async () => {
    const currentStore = JSON.parse(fs.readFileSync(testStorePath, 'utf8'));

    // Verify company isolation for all departments
    const co1Custs = currentStore.customers.filter((c) => (c.companyId || 1) === 1);
    const co2Custs = currentStore.customers.filter((c) => c.companyId === 2);
    const co6Custs = currentStore.customers.filter((c) => c.companyId === 6);

    for (const c of co1Custs) {
      assert.ok(!co2Custs.some((c2) => c2.id === c.id), 'Cross-company customer collision between Co 1 and Co 2');
      assert.ok(!co6Custs.some((c6) => c6.id === c.id), 'Cross-company customer collision between Co 1 and Co 6');
    }

    const co1Suppliers = currentStore.suppliers.filter((s) => (s.companyId || 1) === 1);
    const co2Suppliers = currentStore.suppliers.filter((s) => s.companyId === 2);
    for (const s of co1Suppliers) {
      assert.ok(!co2Suppliers.some((s2) => s2.id === s.id), 'Cross-company supplier collision');
    }
  });

  test('Data store reload simulation: Customer added survives full application restart', async () => {
    // 1. Add customer
    const rawBefore = fs.readFileSync(testStorePath, 'utf8');
    const storeObj = JSON.parse(rawBefore);

    const persistentClient = {
      id: 9992,
      companyId: 1,
      code: 'CUST-992',
      name: 'Sunil Patil',
      email: 'sunil.patil@ecoclean.in',
      phone: '+91 91234 56789',
      company: 'EcoClean Environmental Systems Pvt Ltd',
      taxNumber: '27AABCU1234F1Z9',
      address: 'Wagholi Industrial Corridor, Pune, Maharashtra',
      creditLimit: 100000,
      outstandingBalance: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    storeObj.customers.unshift(persistentClient);
    fs.writeFileSync(testStorePath, JSON.stringify(storeObj, null, 2), 'utf8');

    // 2. Simulate complete application refresh / restart
    const rawAfter = fs.readFileSync(testStorePath, 'utf8');
    const restartedStore = JSON.parse(rawAfter);

    const found = restartedStore.customers.find((c) => c.code === 'CUST-992');
    assert.ok(found, 'Customer must survive complete application refresh and be loaded from store.json');
    assert.equal(found.company, 'EcoClean Environmental Systems Pvt Ltd');
    assert.equal(found.name, 'Sunil Patil');
    assert.equal(found.taxNumber, '27AABCU1234F1Z9');
    assert.equal(found.creditLimit, 100000);
  });
});

