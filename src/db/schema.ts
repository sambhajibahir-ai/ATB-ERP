import {
  pgTable,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  boolean,
  jsonb,
  serial,
} from 'drizzle-orm/pg-core';

// -------------------------------------------------------------
// 1. Users & Team Members
// -------------------------------------------------------------
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: varchar('role', { length: 50 }).notNull().default('Admin'), // Admin, Finance Manager, Inventory Manager, HR Manager, Sales Rep, Operations
  department: varchar('department', { length: 100 }).notNull().default('Executive'),
  avatar: text('avatar'),
  status: varchar('status', { length: 20 }).notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 2. Customers & CRM
// -------------------------------------------------------------
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  taxNumber: varchar('tax_number', { length: 100 }),
  address: text('address'),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).default('10000.00'),
  outstandingBalance: numeric('outstanding_balance', { precision: 12, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('Active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 3. Suppliers & Vendors
// -------------------------------------------------------------
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  paymentTerms: varchar('payment_terms', { length: 50 }).default('Net 30'),
  rating: integer('rating').default(5),
  status: varchar('status', { length: 20 }).default('Active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 4. Products & Inventory Items
// -------------------------------------------------------------
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(), // Electronics, Industrial Hardware, Raw Materials, Office Solutions, Software & Licensing
  unit: varchar('unit', { length: 20 }).default('pcs'),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull(),
  currentStock: integer('current_stock').default(0).notNull(),
  minStock: integer('min_stock').default(10).notNull(),
  maxStock: integer('max_stock').default(1000).notNull(),
  warehouseLocation: varchar('warehouse_location', { length: 100 }).default('Warehouse Zone A-1'),
  barcode: varchar('barcode', { length: 100 }),
  status: varchar('status', { length: 20 }).default('Active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 5. Quotations & Price Estimates
// -------------------------------------------------------------
export const quotations = pgTable('quotations', {
  id: serial('id').primaryKey(),
  quotationNumber: varchar('quotation_number', { length: 50 }).notNull().unique(),
  customerId: integer('customer_id').notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('10.00'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).default('Draft'), // Draft, Sent, Accepted, Declined, Converted
  convertedSalesOrderId: integer('converted_sales_order_id'),
  itemsJson: jsonb('items_json').notNull(), // Array of OrderItem
  terms: text('terms'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 6. Sales Orders
// -------------------------------------------------------------
export const salesOrders = pgTable('sales_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: integer('customer_id').notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  deliveryDate: timestamp('delivery_date'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).default('0.00'),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0.00'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  paymentStatus: varchar('payment_status', { length: 30 }).default('Pending'), // Paid, Partial, Pending, Refunded
  orderStatus: varchar('order_status', { length: 30 }).default('Confirmed'), // Draft, Confirmed, Processing, Shipped, Delivered, Cancelled
  itemsJson: jsonb('items_json').notNull(), // Array of { productId, productName, sku, quantity, unitPrice, total }
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 6. Purchase Orders
// -------------------------------------------------------------
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  poNumber: varchar('po_number', { length: 50 }).notNull().unique(),
  supplierId: integer('supplier_id').notNull(),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  expectedDelivery: timestamp('expected_delivery'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 30 }).default('Ordered'), // Draft, Ordered, Partially Received, Received, Cancelled
  itemsJson: jsonb('items_json').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 7. Invoices & Billing
// -------------------------------------------------------------
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  salesOrderId: integer('sales_order_id'),
  customerId: integer('customer_id').notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }),
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  dueDate: timestamp('due_date').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('10.00'),
  taxAmount: numeric('tax_amount', { precision: 12, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('Unpaid'), // Paid, Partial, Unpaid, Overdue, Cancelled
  itemsJson: jsonb('items_json').notNull(),
  terms: text('terms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 8. Inventory Stock Movements / Audit
// -------------------------------------------------------------
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 50 }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // IN, OUT, ADJUSTMENT, TRANSFER
  quantity: integer('quantity').notNull(),
  reference: varchar('reference', { length: 100 }), // SO-xxx, PO-xxx, MANUAL
  notes: text('notes'),
  performedBy: varchar('performed_by', { length: 255 }).default('System'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 9. Financial Ledger & Cash Flow
// -------------------------------------------------------------
export const financialTransactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  txNumber: varchar('tx_number', { length: 50 }).notNull().unique(),
  date: timestamp('date').defaultNow().notNull(),
  type: varchar('type', { length: 20 }).notNull(), // Income, Expense, Transfer
  category: varchar('category', { length: 100 }).notNull(), // Product Sales, Consulting, Raw Materials, Payroll, Cloud Infra, Office Utilities, Logistics
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).default('Bank Transfer'),
  reference: varchar('reference', { length: 100 }),
  status: varchar('status', { length: 20 }).default('Completed'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 10. Human Resources & Employees
// -------------------------------------------------------------
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  employeeCode: varchar('employee_code', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  department: varchar('department', { length: 100 }).notNull(), // Engineering, Sales & Marketing, Finance & Accounts, Operations & Supply, HR & Admin
  position: varchar('position', { length: 100 }).notNull(),
  salary: numeric('salary', { precision: 12, scale: 2 }).notNull(),
  joinDate: timestamp('join_date').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).default('Active'), // Active, On Leave, Resigned
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 11. Work Orders & Manufacturing / Operations
// -------------------------------------------------------------
export const workOrders = pgTable('work_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  productName: varchar('product_name', { length: 255 }),
  quantity: integer('quantity').default(1).notNull(),
  priority: varchar('priority', { length: 20 }).default('Medium'), // Low, Medium, High, Urgent
  status: varchar('status', { length: 30 }).default('In Progress'), // Pending, In Progress, Quality Review, Completed
  assignedTo: varchar('assigned_to', { length: 255 }),
  progress: integer('progress').default(0).notNull(), // 0 - 100 %
  startDate: timestamp('start_date').defaultNow().notNull(),
  dueDate: timestamp('due_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// -------------------------------------------------------------
// 12. System Audit Logs
// -------------------------------------------------------------
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actor: varchar('actor', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  module: varchar('module', { length: 100 }).notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

