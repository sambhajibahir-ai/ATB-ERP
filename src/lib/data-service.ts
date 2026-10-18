import {
  initialCustomers,
  initialSuppliers,
  initialProducts,
  initialSalesOrders,
  initialInvoices,
  initialPurchaseOrders,
  initialFinancialTransactions,
  initialEmployees,
  initialWorkOrders,
  initialAuditLogs,
  Customer,
  Supplier,
  Product,
  SalesOrder,
  PurchaseOrder,
  Invoice,
  FinancialTransaction,
  Employee,
  WorkOrder,
  AuditLog,
} from './mock-data';
import { getDb, isNeonConfigured } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

// In-Memory resilient store for instant responsiveness
class EnterpriseDataStore {
  customers: Customer[] = [...initialCustomers];
  suppliers: Supplier[] = [...initialSuppliers];
  products: Product[] = [...initialProducts];
  salesOrders: SalesOrder[] = [...initialSalesOrders];
  invoices: Invoice[] = [...initialInvoices];
  purchaseOrders: PurchaseOrder[] = [...initialPurchaseOrders];
  financialTransactions: FinancialTransaction[] = [...initialFinancialTransactions];
  employees: Employee[] = [...initialEmployees];
  workOrders: WorkOrder[] = [...initialWorkOrders];
  auditLogs: AuditLog[] = [...initialAuditLogs];
}

const globalStoreKey = Symbol.for('atb_software_erp_store');
const globalAny = globalThis as unknown as { [key: symbol]: EnterpriseDataStore };

if (!globalAny[globalStoreKey]) {
  globalAny[globalStoreKey] = new EnterpriseDataStore();
}

const store = globalAny[globalStoreKey];

// =========================================================================
// Data Service Methods
// =========================================================================

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  type: 'Neon Serverless PostgreSQL' | 'In-Memory Enterprise Store';
  latencyMs?: number;
  message: string;
  tablesCount?: number;
}> {
  if (!isNeonConfigured()) {
    return {
      connected: false,
      type: 'In-Memory Enterprise Store',
      message: 'Running in Local Memory Mode. Neon connection string not set or using placeholder.',
    };
  }

  const startTime = Date.now();
  try {
    const db = getDb();
    if (!db) {
      return {
        connected: false,
        type: 'In-Memory Enterprise Store',
        message: 'Could not create Neon client from DATABASE_URL.',
      };
    }

    // Ping Neon with a lightweight query
    const result = await db.execute(sql`SELECT 1 as ping, current_database() as db_name, version() as version`);
    const latency = Date.now() - startTime;

    return {
      connected: true,
      type: 'Neon Serverless PostgreSQL',
      latencyMs: latency,
      message: `Successfully connected to Neon PostgreSQL (${result.rows[0]?.db_name || 'neondb'}) in ${latency}ms.`,
      tablesCount: 12,
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      connected: false,
      type: 'In-Memory Enterprise Store',
      latencyMs: Date.now() - startTime,
      message: `Neon connection failed: ${err.message}. Falling back safely to in-memory store.`,
    };
  }
}

// -------------------------------------------------------------
// Dashboard Metrics
// -------------------------------------------------------------
export async function getDashboardMetrics() {
  const totalRevenue = store.financialTransactions
    .filter((tx) => tx.type === 'Income' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = store.financialTransactions
    .filter((tx) => tx.type === 'Expense' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalRevenue - totalExpenses;

  const lowStockCount = store.products.filter(
    (p) => p.currentStock <= p.minStock
  ).length;

  const activeEmployeesCount = store.employees.filter(
    (e) => e.status === 'Active'
  ).length;

  const unpaidInvoicesAmount = store.invoices
    .filter((inv) => inv.status === 'Unpaid' || inv.status === 'Partial')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  // Monthly Revenue & Expense trends (sample 6-month timeline)
  const monthlyTrends = [
    { month: 'Oct', revenue: 38200, expenses: 19400, profit: 18800 },
    { month: 'Nov', revenue: 42500, expenses: 22100, profit: 20400 },
    { month: 'Dec', revenue: 51000, expenses: 28400, profit: 22600 },
    { month: 'Jan', revenue: 46800, expenses: 21300, profit: 25500 },
    { month: 'Feb', revenue: 54200, expenses: 24700, profit: 29500 },
    { month: 'Mar', revenue: Math.round(totalRevenue), expenses: Math.round(totalExpenses), profit: Math.round(netCashFlow) },
  ];

  // Category distribution of products
  const categoryMap: { [cat: string]: number } = {};
  store.products.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.currentStock;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  return {
    totalRevenue,
    totalExpenses,
    netCashFlow,
    ordersCount: store.salesOrders.length,
    lowStockCount,
    activeEmployeesCount,
    unpaidInvoicesAmount,
    recentOrders: store.salesOrders.slice(0, 5),
    lowStockProducts: store.products.filter((p) => p.currentStock <= p.minStock),
    monthlyTrends,
    categoryBreakdown,
    recentLogs: store.auditLogs.slice(0, 5),
  };
}

// -------------------------------------------------------------
// Customers
// -------------------------------------------------------------
export async function getCustomers(): Promise<Customer[]> {
  return [...store.customers];
}

export async function addCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const newCustomer: Customer = {
    ...data,
    id: store.customers.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.customers.unshift(newCustomer);
  addAuditLog('User', 'Created Customer', 'Sales & CRM', `Added customer ${newCustomer.name} (${newCustomer.code})`);
  return newCustomer;
}

// -------------------------------------------------------------
// Suppliers
// -------------------------------------------------------------
export async function getSuppliers(): Promise<Supplier[]> {
  return [...store.suppliers];
}

export async function addSupplier(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
  const newSupplier: Supplier = {
    ...data,
    id: store.suppliers.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.suppliers.unshift(newSupplier);
  addAuditLog('User', 'Created Supplier', 'Purchasing', `Added supplier ${newSupplier.name} (${newSupplier.code})`);
  return newSupplier;
}

// -------------------------------------------------------------
// Products & Inventory
// -------------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  return [...store.products];
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<Product> {
  const status: Product['status'] =
    data.currentStock === 0
      ? 'Out of Stock'
      : data.currentStock <= data.minStock
      ? 'Low Stock'
      : 'Active';

  const newProduct: Product = {
    ...data,
    status,
    id: store.products.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.products.unshift(newProduct);
  addAuditLog('User', 'Created Product', 'Inventory', `Added product ${newProduct.name} (${newProduct.sku})`);
  return newProduct;
}

export async function adjustProductStock(productId: number, quantityChange: number, reason: string): Promise<Product | null> {
  const product = store.products.find((p) => p.id === productId);
  if (!product) return null;

  product.currentStock = Math.max(0, product.currentStock + quantityChange);
  product.status =
    product.currentStock === 0
      ? 'Out of Stock'
      : product.currentStock <= product.minStock
      ? 'Low Stock'
      : 'Active';

  addAuditLog(
    'User',
    'Adjusted Stock',
    'Inventory',
    `${product.sku}: ${quantityChange > 0 ? '+' : ''}${quantityChange} units (${reason}). New stock: ${product.currentStock}`
  );

  return product;
}

// -------------------------------------------------------------
// Sales Orders
// -------------------------------------------------------------
export async function getSalesOrders(): Promise<SalesOrder[]> {
  return [...store.salesOrders];
}

export async function createSalesOrder(data: {
  customerId: number;
  customerName: string;
  items: Array<{ productId: number; quantity: number }>;
  notes?: string;
}): Promise<SalesOrder> {
  const calculatedItems = data.items.map((item) => {
    const prod = store.products.find((p) => p.id === item.productId);
    const unitPrice = prod ? prod.sellingPrice : 100;
    const name = prod ? prod.name : 'Custom Item';
    const sku = prod ? prod.sku : 'SKU-GEN';
    return {
      productId: item.productId,
      productName: name,
      sku,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
    };
  });

  const subtotal = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);
  const taxAmount = Number((subtotal * 0.1).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  const newOrder: SalesOrder = {
    id: store.salesOrders.length + 1,
    orderNumber: `SO-2026-${String(store.salesOrders.length + 93).padStart(4, '0')}`,
    customerId: data.customerId,
    customerName: data.customerName,
    orderDate: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    subtotal,
    taxAmount,
    discountAmount: 0,
    totalAmount,
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    itemsJson: calculatedItems,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.salesOrders.unshift(newOrder);

  // Auto-generate matching Invoice
  const newInvoice: Invoice = {
    id: store.invoices.length + 1,
    invoiceNumber: `INV-2026-${String(store.invoices.length + 49).padStart(4, '0')}`,
    salesOrderId: newOrder.id,
    customerId: newOrder.customerId,
    customerName: newOrder.customerName,
    customerEmail: 'billing@client.com',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    subtotal,
    taxRate: 10,
    taxAmount,
    totalAmount,
    amountPaid: 0,
    status: 'Unpaid',
    itemsJson: calculatedItems,
    terms: 'Net 30 days. Standard enterprise warranty applies.',
    createdAt: new Date().toISOString(),
  };
  store.invoices.unshift(newInvoice);

  // Deduct inventory
  for (const item of calculatedItems) {
    adjustProductStock(item.productId, -item.quantity, `Fulfilled Sales Order ${newOrder.orderNumber}`);
  }

  addAuditLog(
    'User',
    'Created Sales Order',
    'Sales & CRM',
    `Created ${newOrder.orderNumber} for ${newOrder.customerName} ($${newOrder.totalAmount.toLocaleString()})`
  );

  return newOrder;
}

export async function updateSalesOrderStatus(
  orderId: number,
  status: SalesOrder['orderStatus']
): Promise<SalesOrder | null> {
  const order = store.salesOrders.find((o) => o.id === orderId);
  if (!order) return null;
  order.orderStatus = status;
  addAuditLog('User', 'Updated Order Status', 'Sales & CRM', `${order.orderNumber} set to ${status}`);
  return order;
}

// -------------------------------------------------------------
// Purchase Orders
// -------------------------------------------------------------
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return [...store.purchaseOrders];
}

export async function createPurchaseOrder(data: {
  supplierId: number;
  supplierName: string;
  items: Array<{ productId: number; quantity: number }>;
  notes?: string;
}): Promise<PurchaseOrder> {
  const calculatedItems = data.items.map((item) => {
    const prod = store.products.find((p) => p.id === item.productId);
    const unitPrice = prod ? prod.costPrice : 50;
    const name = prod ? prod.name : 'Purchased Item';
    const sku = prod ? prod.sku : 'SUP-ITEM';
    return {
      productId: item.productId,
      productName: name,
      sku,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
    };
  });

  const totalAmount = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);

  const newPO: PurchaseOrder = {
    id: store.purchaseOrders.length + 1,
    poNumber: `PO-2026-${String(store.purchaseOrders.length + 23).padStart(4, '0')}`,
    supplierId: data.supplierId,
    supplierName: data.supplierName,
    orderDate: new Date().toISOString(),
    expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString(),
    totalAmount,
    status: 'Ordered',
    itemsJson: calculatedItems,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.purchaseOrders.unshift(newPO);
  addAuditLog(
    'User',
    'Created Purchase Order',
    'Purchasing',
    `Created ${newPO.poNumber} for ${newPO.supplierName} ($${newPO.totalAmount.toLocaleString()})`
  );

  return newPO;
}

export async function receivePurchaseOrder(poId: number): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Received';

  // Automatically increment inventory stock
  for (const item of po.itemsJson) {
    adjustProductStock(item.productId, item.quantity, `Received PO ${po.poNumber}`);
  }

  // Create financial transaction expense
  addFinancialTransaction({
    type: 'Expense',
    category: 'Procurement & Raw Materials',
    amount: po.totalAmount,
    paymentMethod: 'Bank Transfer',
    reference: po.poNumber,
    description: `Settlement for goods received from ${po.supplierName}`,
  });

  addAuditLog('User', 'Received Purchase Order', 'Purchasing', `Goods received for ${po.poNumber}. Stock updated.`);
  return po;
}

// -------------------------------------------------------------
// Invoices
// -------------------------------------------------------------
export async function getInvoices(): Promise<Invoice[]> {
  return [...store.invoices];
}

export async function markInvoicePaid(invoiceId: number): Promise<Invoice | null> {
  const invoice = store.invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  invoice.amountPaid = invoice.totalAmount;
  invoice.status = 'Paid';

  // Record income in financial ledger
  addFinancialTransaction({
    type: 'Income',
    category: 'Product Sales',
    amount: invoice.totalAmount,
    paymentMethod: 'Direct Transfer',
    reference: invoice.invoiceNumber,
    description: `Full payment settlement from ${invoice.customerName}`,
  });

  addAuditLog('User', 'Marked Invoice Paid', 'Finance & Accounts', `Invoice ${invoice.invoiceNumber} paid in full`);
  return invoice;
}

// -------------------------------------------------------------
// Financial Transactions & General Ledger
// -------------------------------------------------------------
export async function getFinancialTransactions(): Promise<FinancialTransaction[]> {
  return [...store.financialTransactions];
}

export async function addFinancialTransaction(
  data: Omit<FinancialTransaction, 'id' | 'txNumber' | 'date' | 'createdAt' | 'status'> & {
    status?: FinancialTransaction['status'];
  }
): Promise<FinancialTransaction> {
  const newTx: FinancialTransaction = {
    ...data,
    status: data.status || 'Completed',
    id: store.financialTransactions.length + 1,
    txNumber: `TX-2026-${String(store.financialTransactions.length + 107).padStart(4, '0')}`,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  store.financialTransactions.unshift(newTx);
  addAuditLog(
    'User',
    `Recorded ${newTx.type}`,
    'Finance & Accounts',
    `${newTx.txNumber}: $${newTx.amount.toLocaleString()} - ${newTx.category}`
  );

  return newTx;
}

// -------------------------------------------------------------
// Employees & HR
// -------------------------------------------------------------
export async function getEmployees(): Promise<Employee[]> {
  return [...store.employees];
}

export async function addEmployee(data: Omit<Employee, 'id' | 'employeeCode' | 'createdAt'>): Promise<Employee> {
  const newEmp: Employee = {
    ...data,
    id: store.employees.length + 1,
    employeeCode: `EMP-${String(store.employees.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.employees.unshift(newEmp);
  addAuditLog('User', 'Added Employee', 'Human Resources', `Onboarded ${newEmp.firstName} ${newEmp.lastName} (${newEmp.department})`);
  return newEmp;
}

// -------------------------------------------------------------
// Work Orders & Operations
// -------------------------------------------------------------
export async function getWorkOrders(): Promise<WorkOrder[]> {
  return [...store.workOrders];
}

export async function updateWorkOrderStatus(
  orderId: number,
  status: WorkOrder['status'],
  progress?: number
): Promise<WorkOrder | null> {
  const order = store.workOrders.find((w) => w.id === orderId);
  if (!order) return null;
  order.status = status;
  if (typeof progress === 'number') order.progress = progress;
  addAuditLog('User', 'Updated Work Order', 'Operations', `${order.orderNumber} status set to ${status}`);
  return order;
}

// -------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------
export async function getAuditLogs(): Promise<AuditLog[]> {
  return [...store.auditLogs];
}

export function addAuditLog(actor: string, action: string, module: string, details: string): AuditLog {
  const log: AuditLog = {
    id: store.auditLogs.length + 1,
    actor,
    action,
    module,
    details,
    createdAt: new Date().toISOString(),
  };
  store.auditLogs.unshift(log);
  return log;
}

// -------------------------------------------------------------
// Live Neon Database Seeding / Initialization
// -------------------------------------------------------------
export async function seedNeonDatabase(): Promise<{ success: boolean; message: string; rowsInserted?: number }> {
  const db = getDb();
  if (!db) {
    return {
      success: false,
      message: 'Cannot seed Neon: DATABASE_URL is not set or invalid in .env.local',
    };
  }

  try {
    // 1. Create tables if not exist (DDL statements for Neon)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Admin',
        department VARCHAR(100) NOT NULL DEFAULT 'Executive',
        avatar TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(255),
        tax_number VARCHAR(100),
        address TEXT,
        credit_limit NUMERIC(12, 2) DEFAULT 10000.00,
        outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        payment_terms VARCHAR(50) DEFAULT 'Net 30',
        rating INTEGER DEFAULT 5,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        unit VARCHAR(20) DEFAULT 'pcs',
        cost_price NUMERIC(12, 2) NOT NULL,
        selling_price NUMERIC(12, 2) NOT NULL,
        current_stock INTEGER DEFAULT 0 NOT NULL,
        min_stock INTEGER DEFAULT 10 NOT NULL,
        max_stock INTEGER DEFAULT 1000 NOT NULL,
        warehouse_location VARCHAR(100) DEFAULT 'Main Warehouse',
        barcode VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivery_date TIMESTAMP WITH TIME ZONE,
        subtotal NUMERIC(12, 2) NOT NULL,
        tax_amount NUMERIC(12, 2) DEFAULT 0.00,
        discount_amount NUMERIC(12, 2) DEFAULT 0.00,
        total_amount NUMERIC(12, 2) NOT NULL,
        payment_status VARCHAR(30) DEFAULT 'Pending',
        order_status VARCHAR(30) DEFAULT 'Confirmed',
        items_json JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expected_delivery TIMESTAMP WITH TIME ZONE,
        total_amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(30) DEFAULT 'Ordered',
        items_json JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        sales_order_id INTEGER,
        customer_id INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        tax_rate NUMERIC(5, 2) DEFAULT 10.00,
        tax_amount NUMERIC(12, 2) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        amount_paid NUMERIC(12, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'Unpaid',
        items_json JSONB NOT NULL,
        terms TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS financial_transactions (
        id SERIAL PRIMARY KEY,
        tx_number VARCHAR(50) UNIQUE NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        type VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
        reference VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Completed',
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_code VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        department VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        salary NUMERIC(12, 2) NOT NULL,
        join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Insert Products if empty
    let count = 0;
    const existingProducts = await db.select().from(schema.products).limit(1);
    if (existingProducts.length === 0) {
      for (const p of initialProducts) {
        await db.insert(schema.products).values({
          sku: p.sku,
          name: p.name,
          description: p.description,
          category: p.category,
          unit: p.unit,
          costPrice: p.costPrice.toString(),
          sellingPrice: p.sellingPrice.toString(),
          currentStock: p.currentStock,
          minStock: p.minStock,
          maxStock: p.maxStock,
          warehouseLocation: p.warehouseLocation,
          barcode: p.barcode,
          status: p.status,
        });
        count++;
      }
    }

    // 3. Insert Customers if empty
    const existingCust = await db.select().from(schema.customers).limit(1);
    if (existingCust.length === 0) {
      for (const c of initialCustomers) {
        await db.insert(schema.customers).values({
          code: c.code,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          taxNumber: c.taxNumber,
          address: c.address,
          creditLimit: c.creditLimit.toString(),
          outstandingBalance: c.outstandingBalance.toString(),
          status: c.status,
        });
        count++;
      }
    }

    return {
      success: true,
      message: 'Successfully initialized Neon PostgreSQL schema and seeded enterprise data!',
      rowsInserted: count,
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error seeding Neon database:', err);
    return {
      success: false,
      message: `Failed to seed Neon database: ${err.message}`,
    };
  }
}

