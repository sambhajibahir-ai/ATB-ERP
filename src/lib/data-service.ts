import {
  initialCompanies,
  initialCustomers,
  initialSuppliers,
  initialProducts,
  initialQuotations,
  initialSalesOrders,
  initialInvoices,
  initialPurchaseOrders,
  initialFinancialTransactions,
  initialEmployees,
  initialWorkOrders,
  initialAuditLogs,
  initialUsers,
  Company,
  Customer,
  Supplier,
  Product,
  Quotation,
  SalesOrder,
  PurchaseOrder,
  Invoice,
  FinancialTransaction,
  Employee,
  WorkOrder,
  AuditLog,
  User,
} from './mock-data';
import { hashPassword, verifyPassword, verifySessionToken, COOKIE_NAME } from './auth';
import { getDb, isNeonConfigured } from '@/db';
import * as schema from '@/db/schema';
import { sql } from 'drizzle-orm';

// In-Memory resilient store for instant responsiveness
class EnterpriseDataStore {
  companies: Company[] = [...initialCompanies];
  users: User[] = [...initialUsers];
  customers: Customer[] = [...initialCustomers];
  suppliers: Supplier[] = [...initialSuppliers];
  products: Product[] = [...initialProducts];
  quotations: Quotation[] = [...initialQuotations];
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
// Multi-Tenant Context Resolution Helper
// =========================================================================
export async function getEffectiveCompanyId(overrideCompanyId?: number): Promise<number> {
  if (overrideCompanyId !== undefined && overrideCompanyId > 0) {
    return overrideCompanyId;
  }
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifySessionToken(token);
      if (payload && payload.companyId) {
        return payload.companyId;
      }
    }
  } catch {
    // In static rendering or non-request contexts
  }
  return 1;
}

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
      tablesCount: 14,
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
// Company Accounts Management & Licensing
// -------------------------------------------------------------
export async function getCompanies(): Promise<Company[]> {
  return [...store.companies];
}

export async function getCompanyById(id: number): Promise<Company | null> {
  const comp = store.companies.find((c) => c.id === id);
  return comp ? { ...comp } : null;
}

export async function createCompany(data: {
  name: string;
  code?: string;
  email: string;
  phone?: string;
  taxId?: string;
  gstin?: string;
  address?: string;
  status?: 'Active' | 'Pending';
  licenseTier?: 'Trial' | 'Starter' | 'Growth' | 'Enterprise';
  maxUsers?: number;
  licenseDays?: number;
}): Promise<Company> {
  const existingName = store.companies.find(
    (c) => c.name.toLowerCase() === data.name.trim().toLowerCase()
  );
  if (existingName) {
    throw new Error('A company with this legal name already exists');
  }

  const code = data.code || data.name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15);
  const now = new Date();
  const days = data.licenseDays || (data.licenseTier === 'Trial' ? 30 : 365);
  const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const newCompany: Company = {
    id: store.companies.length + 1,
    name: data.name.trim(),
    code,
    email: data.email.trim(),
    phone: data.phone?.trim(),
    taxId: data.taxId?.trim(),
    gstin: data.gstin?.trim(),
    address: data.address?.trim(),
    status: data.status || 'Active',
    licenseTier: data.licenseTier || 'Trial',
    licenseExpiresAt: expiry,
    maxUsers: data.maxUsers || (data.licenseTier === 'Starter' ? 5 : data.licenseTier === 'Growth' ? 20 : 50),
    approvedBy: data.status === 'Active' ? 'Self-Serve Onboarding' : undefined,
    approvedAt: data.status === 'Active' ? now.toISOString() : undefined,
    createdAt: now.toISOString(),
  };

  store.companies.push(newCompany);
  addAuditLog(
    'System',
    'Registered Company',
    'Platform Administration',
    `New tenant company registered: ${newCompany.name} (License: ${newCompany.licenseTier}, Status: ${newCompany.status})`
  );
  return newCompany;
}

export async function approveCompany(companyId: number, approvedBy: string): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  company.status = 'Active';
  company.approvedBy = approvedBy;
  company.approvedAt = new Date().toISOString();

  // If license was expired or near expiry, extend to at least 30 days
  const now = new Date();
  if (new Date(company.licenseExpiresAt).getTime() < now.getTime()) {
    company.licenseExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  addAuditLog(
    approvedBy,
    'Approved Company Account',
    'Platform Administration',
    `Approved company ${company.name} (License: ${company.licenseTier}, Valid until: ${new Date(company.licenseExpiresAt).toLocaleDateString()})`
  );
  return { ...company };
}

export async function updateCompanyLicense(
  companyId: number,
  data: {
    licenseTier?: Company['licenseTier'];
    licenseExpiresAt?: string;
    maxUsers?: number;
    status?: Company['status'];
  },
  actor = 'Platform Admin'
): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  if (data.licenseTier) company.licenseTier = data.licenseTier;
  if (data.licenseExpiresAt) company.licenseExpiresAt = data.licenseExpiresAt;
  if (data.maxUsers !== undefined) company.maxUsers = Number(data.maxUsers);
  if (data.status) company.status = data.status;

  addAuditLog(
    actor,
    'Updated Company License',
    'Platform Administration',
    `Updated license for ${company.name}: Tier=${company.licenseTier}, MaxUsers=${company.maxUsers}, Expires=${company.licenseExpiresAt}`
  );
  return { ...company };
}

export async function toggleCompanyStatus(companyId: number, actor = 'Platform Admin'): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) throw new Error('Company not found');

  if (company.id === 1) {
    throw new Error('Cannot suspend the primary platform company');
  }

  company.status = company.status === 'Active' ? 'Suspended' : 'Active';
  addAuditLog(
    actor,
    `${company.status} Company`,
    'Platform Administration',
    `Toggled company ${company.name} status to ${company.status}`
  );
  return { ...company };
}

// -------------------------------------------------------------
// Dashboard Metrics (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getDashboardMetrics(companyId?: number) {
  const targetId = await getEffectiveCompanyId(companyId);

  const companyTxs = store.financialTransactions.filter((tx) => (tx.companyId || 1) === targetId);
  const companyOrders = store.salesOrders.filter((o) => (o.companyId || 1) === targetId);
  const companyProducts = store.products.filter((p) => (p.companyId || 1) === targetId);
  const companyEmployees = store.employees.filter((e) => (e.companyId || 1) === targetId);
  const companyInvoices = store.invoices.filter((inv) => (inv.companyId || 1) === targetId);
  const companyQuotations = store.quotations.filter((q) => (q.companyId || 1) === targetId);
  const companyLogs = store.auditLogs.filter((al) => (al.companyId || 1) === targetId);
  const company = store.companies.find((c) => c.id === targetId) || store.companies[0];

  const totalRevenue = companyTxs
    .filter((tx) => tx.type === 'Income' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = companyTxs
    .filter((tx) => tx.type === 'Expense' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalRevenue - totalExpenses;

  const lowStockCount = companyProducts.filter(
    (p) => p.currentStock <= p.minStock
  ).length;

  const activeEmployeesCount = companyEmployees.filter(
    (e) => e.status === 'Active'
  ).length;

  const unpaidInvoicesAmount = companyInvoices
    .filter((inv) => inv.status === 'Unpaid' || inv.status === 'Partial')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

  // Monthly Revenue & Expense trends
  const monthlyTrends = [
    { month: 'Oct', revenue: Math.round(totalRevenue * 0.7), expenses: Math.round(totalExpenses * 0.65), profit: Math.round((totalRevenue * 0.7) - (totalExpenses * 0.65)) },
    { month: 'Nov', revenue: Math.round(totalRevenue * 0.8), expenses: Math.round(totalExpenses * 0.75), profit: Math.round((totalRevenue * 0.8) - (totalExpenses * 0.75)) },
    { month: 'Dec', revenue: Math.round(totalRevenue * 0.9), expenses: Math.round(totalExpenses * 0.85), profit: Math.round((totalRevenue * 0.9) - (totalExpenses * 0.85)) },
    { month: 'Jan', revenue: Math.round(totalRevenue * 0.85), expenses: Math.round(totalExpenses * 0.7), profit: Math.round((totalRevenue * 0.85) - (totalExpenses * 0.7)) },
    { month: 'Feb', revenue: Math.round(totalRevenue * 0.95), expenses: Math.round(totalExpenses * 0.9), profit: Math.round((totalRevenue * 0.95) - (totalExpenses * 0.9)) },
    { month: 'Mar', revenue: Math.round(totalRevenue), expenses: Math.round(totalExpenses), profit: Math.round(netCashFlow) },
  ];

  // Category distribution of products
  const categoryMap: { [cat: string]: number } = {};
  companyProducts.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.currentStock;
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
  }));

  const quotationsCount = companyQuotations.length;
  const pendingQuotationsCount = companyQuotations.filter(
    (q) => q.status === 'Sent' || q.status === 'Draft'
  ).length;

  return {
    company,
    totalRevenue,
    totalExpenses,
    netCashFlow,
    ordersCount: companyOrders.length,
    quotationsCount,
    pendingQuotationsCount,
    lowStockCount,
    activeEmployeesCount,
    unpaidInvoicesAmount,
    recentOrders: companyOrders.slice(0, 5),
    recentQuotations: companyQuotations.slice(0, 5),
    lowStockProducts: companyProducts.filter((p) => p.currentStock <= p.minStock),
    monthlyTrends,
    categoryBreakdown,
    recentLogs: companyLogs.slice(0, 5),
  };
}

// -------------------------------------------------------------
// Users & Credentials Authentication
// -------------------------------------------------------------
export async function getUsers(companyId?: number): Promise<Omit<User, 'passwordHash'>[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.users
    .filter((u) => u.companyId === targetId)
    .map(({ passwordHash, ...rest }) => rest);
}

export async function getAllUsersForPlatformAdmin(): Promise<Omit<User, 'passwordHash'>[]> {
  return store.users.map(({ passwordHash, ...rest }) => rest);
}

export async function getUserById(id: number): Promise<Omit<User, 'passwordHash'> | null> {
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: User['role'];
  department: string;
  companyId?: number;
  isCompanyAdmin?: boolean;
}): Promise<Omit<User, 'passwordHash'>> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const company = store.companies.find((c) => c.id === targetCompanyId);
  if (!company) {
    throw new Error('Target company not found');
  }

  const existing = store.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error('A user with this corporate email address already exists');
  }

  // Enforce company license user seat quota
  const currentCount = store.users.filter((u) => u.companyId === targetCompanyId).length;
  if (currentCount >= company.maxUsers) {
    throw new Error(
      `Company license user seat limit reached (${company.maxUsers} seats). Please upgrade ${company.name}'s license to provision more accounts.`
    );
  }

  const initials = data.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const newUser: User = {
    id: store.users.length + 1,
    companyId: targetCompanyId,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: hashPassword(data.password),
    role: data.role,
    department: data.department || 'Enterprise Operations',
    avatar: initials,
    status: 'Active',
    isCompanyAdmin: data.isCompanyAdmin || false,
    isPlatformAdmin: false,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  addAuditLog(
    'Admin',
    'Created User Sub-Account',
    'User Management',
    `Created sub-account ${newUser.name} (${newUser.email}) with role ${newUser.role} for company ${company.name}`
  );
  const { passwordHash, ...safeUser } = newUser;
  return safeUser;
}

export async function updateUser(
  id: number,
  data: Partial<Pick<User, 'name' | 'role' | 'department' | 'status'>> & { password?: string }
): Promise<Omit<User, 'passwordHash'> | null> {
  const user = store.users.find((u) => u.id === id);
  if (!user) return null;

  if (data.name) user.name = data.name;
  if (data.role) user.role = data.role;
  if (data.department) user.department = data.department;
  if (data.status) user.status = data.status;
  if (data.password) {
    user.passwordHash = hashPassword(data.password);
    addAuditLog('Admin', 'Reset User Password', 'Administration', `Reset password credentials for ${user.email}`);
  }

  addAuditLog('Admin', 'Updated User', 'Administration', `Updated profile/credentials for ${user.email}`);
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function deleteUser(id: number): Promise<boolean> {
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  const user = store.users[index];

  if (user.isCompanyAdmin) {
    throw new Error('Cannot delete the primary CEO / Admin account of a company.');
  }

  const removed = store.users.splice(index, 1)[0];
  addAuditLog('Admin', 'Deleted User', 'Administration', `Decommissioned user profile for ${removed.email}`);
  return true;
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<(Omit<User, 'passwordHash'> & { company: Company }) | null> {
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  if (user.status !== 'Active') {
    throw new Error('Your user account has been suspended or deactivated');
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) return null;

  const company = store.companies.find((c) => c.id === user.companyId);
  if (!company) {
    throw new Error('Your company organization could not be found');
  }

  // Check company status & approval
  if (company.status === 'Pending') {
    throw new Error(
      `Your company account (${company.name}) is currently pending approval by the Platform Administrator. Please contact support or await verification.`
    );
  }

  if (company.status === 'Suspended') {
    throw new Error(
      `Your company account (${company.name}) has been suspended. Please contact the platform administrator.`
    );
  }

  // Check license expiry
  if (new Date(company.licenseExpiresAt).getTime() < Date.now()) {
    throw new Error(
      `Your company enterprise license expired on ${new Date(company.licenseExpiresAt).toLocaleDateString()}. Please contact your CEO or administrator to renew.`
    );
  }

  user.lastLogin = new Date().toISOString();
  addAuditLog(user.name, 'User Sign In', 'Authentication', `Successful login for ${user.email} (${company.name})`);
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, company };
}

// -------------------------------------------------------------
// Customers (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getCustomers(companyId?: number): Promise<Customer[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.customers.filter((c) => (c.companyId || 1) === targetId);
}

export async function addCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const newCustomer: Customer = {
    ...data,
    companyId: targetCompanyId,
    id: store.customers.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.customers.unshift(newCustomer);
  addAuditLog('User', 'Created Customer', 'Sales & CRM', `Added customer ${newCustomer.name} (${newCustomer.code})`);
  return newCustomer;
}

// -------------------------------------------------------------
// Suppliers (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getSuppliers(companyId?: number): Promise<Supplier[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.suppliers.filter((s) => (s.companyId || 1) === targetId);
}

export async function addSupplier(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const newSupplier: Supplier = {
    ...data,
    companyId: targetCompanyId,
    id: store.suppliers.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.suppliers.unshift(newSupplier);
  addAuditLog('User', 'Created Supplier', 'Purchasing', `Added supplier ${newSupplier.name} (${newSupplier.code})`);
  return newSupplier;
}

// -------------------------------------------------------------
// Products & Inventory (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getProducts(companyId?: number): Promise<Product[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.products.filter((p) => (p.companyId || 1) === targetId);
}

export async function addProduct(data: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<Product> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const status: Product['status'] =
    data.currentStock === 0
      ? 'Out of Stock'
      : data.currentStock <= data.minStock
      ? 'Low Stock'
      : 'Active';

  const newProduct: Product = {
    ...data,
    companyId: targetCompanyId,
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
// Quotations & Price Estimates (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getQuotations(companyId?: number): Promise<Quotation[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.quotations.filter((q) => (q.companyId || 1) === targetId);
}

export async function getQuotationById(id: number): Promise<Quotation | null> {
  const quote = store.quotations.find((q) => q.id === id);
  return quote ? { ...quote } : null;
}

export async function createQuotation(data: {
  customerId: number;
  customerName: string;
  customerEmail?: string;
  items: Array<{ productId: number; quantity: number }>;
  validityDays?: number;
  discountAmount?: number;
  terms?: string;
  notes?: string;
  companyId?: number;
}): Promise<Quotation> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());

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
  const discountAmount = data.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = 18;
  const taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));
  const validityDays = data.validityDays || 30;

  const newQuote: Quotation = {
    id: store.quotations.length + 1,
    companyId: targetCompanyId,
    quotationNumber: `QT-2026-${String(store.quotations.length + 45).padStart(4, '0')}`,
    customerId: data.customerId,
    customerName: data.customerName,
    customerEmail: data.customerEmail || 'billing@client.com',
    issueDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + validityDays * 86400000).toISOString(),
    subtotal,
    taxRate,
    taxAmount,
    discountAmount,
    totalAmount,
    status: 'Draft',
    itemsJson: calculatedItems,
    terms:
      data.terms ||
      `Official price proposal valid for ${validityDays} calendar days. Delivery terms: Standard freight. Standard enterprise warranty applies.`,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.quotations.unshift(newQuote);

  addAuditLog(
    'User',
    'Created Quotation',
    'Sales & CRM',
    `Created ${newQuote.quotationNumber} for ${newQuote.customerName} (₹${newQuote.totalAmount.toLocaleString('en-IN')})`
  );

  return newQuote;
}

export async function updateQuotationStatus(
  id: number,
  status: Quotation['status']
): Promise<Quotation | null> {
  const quote = store.quotations.find((q) => q.id === id);
  if (!quote) return null;
  quote.status = status;
  addAuditLog(
    'User',
    'Updated Quotation Status',
    'Sales & CRM',
    `${quote.quotationNumber} status set to ${status}`
  );
  return quote;
}

export async function convertQuotationToSalesOrder(
  quotationId: number
): Promise<{ salesOrder: SalesOrder; quotation: Quotation } | null> {
  const quote = store.quotations.find((q) => q.id === quotationId);
  if (!quote) return null;

  const items = quote.itemsJson.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  const salesOrder = await createSalesOrder({
    customerId: quote.customerId,
    customerName: quote.customerName,
    items,
    notes: `Converted from Quotation ${quote.quotationNumber}. ${quote.notes || ''}`.trim(),
    companyId: quote.companyId,
  });

  quote.status = 'Converted';
  quote.convertedSalesOrderId = salesOrder.id;

  addAuditLog(
    'User',
    'Converted Quotation',
    'Sales & CRM',
    `Converted ${quote.quotationNumber} into ${salesOrder.orderNumber} (₹${salesOrder.totalAmount.toLocaleString('en-IN')})`
  );

  return { salesOrder, quotation: quote };
}

// -------------------------------------------------------------
// Sales Orders (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getSalesOrders(companyId?: number): Promise<SalesOrder[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.salesOrders.filter((o) => (o.companyId || 1) === targetId);
}

export async function createSalesOrder(data: {
  customerId: number;
  customerName: string;
  items: Array<{ productId: number; quantity: number }>;
  notes?: string;
  companyId?: number;
}): Promise<SalesOrder> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());

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
  const taxAmount = Number((subtotal * 0.18).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  const newOrder: SalesOrder = {
    id: store.salesOrders.length + 1,
    companyId: targetCompanyId,
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

  // Auto-generate matching Invoice for this company
  const newInvoice: Invoice = {
    id: store.invoices.length + 1,
    companyId: targetCompanyId,
    invoiceNumber: `INV-2026-${String(store.invoices.length + 49).padStart(4, '0')}`,
    salesOrderId: newOrder.id,
    customerId: newOrder.customerId,
    customerName: newOrder.customerName,
    customerEmail: 'billing@client.com',
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    subtotal,
    taxRate: 18,
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
    `Created ${newOrder.orderNumber} for ${newOrder.customerName} (₹${newOrder.totalAmount.toLocaleString('en-IN')})`
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
// Purchase Orders (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getPurchaseOrders(companyId?: number): Promise<PurchaseOrder[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.purchaseOrders.filter((po) => (po.companyId || 1) === targetId);
}

export async function createPurchaseOrder(data: {
  supplierId: number;
  supplierName: string;
  items: Array<{ productId: number; quantity: number }>;
  notes?: string;
  companyId?: number;
}): Promise<PurchaseOrder> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());

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
    companyId: targetCompanyId,
    poNumber: `PO-2026-${String(store.purchaseOrders.length + 23).padStart(4, '0')}`,
    supplierId: data.supplierId,
    supplierName: data.supplierName,
    orderDate: new Date().toISOString(),
    expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString(),
    totalAmount,
    status: 'Pending Review',
    itemsJson: calculatedItems,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.purchaseOrders.unshift(newPO);
  addAuditLog(
    'User',
    'Created Purchase Order',
    'Purchasing',
    `Created ${newPO.poNumber} for ${newPO.supplierName} (₹${newPO.totalAmount.toLocaleString('en-IN')}) - Status: Pending Review`
  );

  return newPO;
}

export async function approvePurchaseOrder(
  poId: number,
  reviewer: string = 'Sneha Kulkarni (Director of Supply Chain)'
): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Approved';
  po.approvedBy = reviewer;
  po.approvedAt = new Date().toISOString();
  po.rejectionReason = undefined;

  addAuditLog(
    reviewer,
    'Approved Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} for ${po.supplierName} (₹${po.totalAmount.toLocaleString('en-IN')}) approved and cleared for procurement`
  );
  return po;
}

export async function rejectPurchaseOrder(
  poId: number,
  reason: string,
  reviewer: string = 'Ananya Iyer (Chief Financial Officer)'
): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Rejected';
  po.approvedBy = reviewer;
  po.approvedAt = new Date().toISOString();
  po.rejectionReason = reason || 'Departmental procurement budget exceeded or re-negotiation required.';

  addAuditLog(
    reviewer,
    'Rejected Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} rejected. Reason: ${po.rejectionReason}`
  );
  return po;
}

export async function transmitPurchaseOrder(poId: number): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Ordered';

  addAuditLog(
    'User',
    'Transmitted Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} transmitted to vendor ${po.supplierName}. Delivery tracking initiated.`
  );
  return po;
}

export async function updatePurchaseOrderStatus(
  poId: number,
  status: PurchaseOrder['status']
): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;
  po.status = status;
  addAuditLog('User', 'Updated PO Status', 'Purchasing', `${po.poNumber} status set to ${status}`);
  return po;
}

export async function receivePurchaseOrder(poId: number): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Received';

  // Automatically increment inventory stock
  for (const item of po.itemsJson) {
    adjustProductStock(item.productId, item.quantity, `Received PO ${po.poNumber}`);
  }

  // Create financial transaction expense tagged to company
  addFinancialTransaction({
    type: 'Expense',
    category: 'Procurement & Raw Materials',
    amount: po.totalAmount,
    paymentMethod: 'Bank Transfer',
    reference: po.poNumber,
    description: `Settlement for goods received from ${po.supplierName}`,
    companyId: po.companyId,
  });

  addAuditLog('User', 'Received Purchase Order', 'Purchasing', `Goods received for ${po.poNumber}. Stock updated.`);
  return po;
}

// -------------------------------------------------------------
// Invoices (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getInvoices(companyId?: number): Promise<Invoice[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.invoices.filter((i) => (i.companyId || 1) === targetId);
}

export async function markInvoicePaid(invoiceId: number): Promise<Invoice | null> {
  const invoice = store.invoices.find((i) => i.id === invoiceId);
  if (!invoice) return null;

  invoice.amountPaid = invoice.totalAmount;
  invoice.status = 'Paid';

  // Record income in financial ledger for this company
  addFinancialTransaction({
    type: 'Income',
    category: 'Product Sales',
    amount: invoice.totalAmount,
    paymentMethod: 'Direct Transfer',
    reference: invoice.invoiceNumber,
    description: `Full payment settlement from ${invoice.customerName}`,
    companyId: invoice.companyId,
  });

  addAuditLog('User', 'Marked Invoice Paid', 'Finance & Accounts', `Invoice ${invoice.invoiceNumber} paid in full`);
  return invoice;
}

// -------------------------------------------------------------
// Financial Transactions & General Ledger (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getFinancialTransactions(companyId?: number): Promise<FinancialTransaction[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.financialTransactions.filter((tx) => (tx.companyId || 1) === targetId);
}

export async function addFinancialTransaction(
  data: Omit<FinancialTransaction, 'id' | 'txNumber' | 'date' | 'createdAt' | 'status'> & {
    status?: FinancialTransaction['status'];
    companyId?: number;
  }
): Promise<FinancialTransaction> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const newTx: FinancialTransaction = {
    ...data,
    companyId: targetCompanyId,
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
    `${newTx.txNumber}: ₹${newTx.amount.toLocaleString('en-IN')} - ${newTx.category}`
  );

  return newTx;
}

// -------------------------------------------------------------
// Employees & HR (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getEmployees(companyId?: number): Promise<Employee[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.employees.filter((e) => (e.companyId || 1) === targetId);
}

export async function addEmployee(data: Omit<Employee, 'id' | 'employeeCode' | 'createdAt'>): Promise<Employee> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const newEmp: Employee = {
    ...data,
    companyId: targetCompanyId,
    id: store.employees.length + 1,
    employeeCode: `EMP-${String(store.employees.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.employees.unshift(newEmp);
  addAuditLog('User', 'Added Employee', 'Human Resources', `Onboarded ${newEmp.firstName} ${newEmp.lastName} (${newEmp.department})`);
  return newEmp;
}

// -------------------------------------------------------------
// Work Orders & Operations (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getWorkOrders(companyId?: number): Promise<WorkOrder[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.workOrders.filter((wo) => (wo.companyId || 1) === targetId);
}

export async function createWorkOrder(data: Omit<WorkOrder, 'id' | 'createdAt'>): Promise<WorkOrder> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());
  const newWO: WorkOrder = {
    ...data,
    companyId: targetCompanyId,
    id: store.workOrders.length + 1,
    createdAt: new Date().toISOString(),
  };
  store.workOrders.unshift(newWO);
  addAuditLog('User', 'Created Work Order', 'Operations', `Created work order ${newWO.orderNumber} - ${newWO.title}`);
  return newWO;
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
// Audit Logs (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getAuditLogs(companyId?: number): Promise<AuditLog[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.auditLogs.filter((al) => (al.companyId || 1) === targetId);
}

export function addAuditLog(actor: string, action: string, module: string, details: string, companyId = 1): AuditLog {
  const log: AuditLog = {
    id: store.auditLogs.length + 1,
    companyId,
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
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        tax_id VARCHAR(100),
        gstin VARCHAR(50),
        address TEXT,
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        license_tier VARCHAR(50) NOT NULL DEFAULT 'Enterprise',
        license_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        max_users INTEGER DEFAULT 10 NOT NULL,
        approved_by VARCHAR(255),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Admin',
        department VARCHAR(100) NOT NULL DEFAULT 'Executive Administration',
        avatar TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Active',
        is_company_admin BOOLEAN NOT NULL DEFAULT FALSE,
        is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
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
        company_id INTEGER NOT NULL DEFAULT 1,
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
        company_id INTEGER NOT NULL DEFAULT 1,
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

      CREATE TABLE IF NOT EXISTS quotations (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        quotation_number VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        tax_rate NUMERIC(5, 2) DEFAULT 18.00,
        tax_amount NUMERIC(12, 2) NOT NULL,
        discount_amount NUMERIC(12, 2) DEFAULT 0.00,
        total_amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(30) DEFAULT 'Draft',
        converted_sales_order_id INTEGER,
        items_json JSONB NOT NULL,
        terms TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sales_orders (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
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
        company_id INTEGER NOT NULL DEFAULT 1,
        po_number VARCHAR(50) UNIQUE NOT NULL,
        supplier_id INTEGER NOT NULL,
        supplier_name VARCHAR(255) NOT NULL,
        order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expected_delivery TIMESTAMP WITH TIME ZONE,
        total_amount NUMERIC(12, 2) NOT NULL,
        status VARCHAR(30) DEFAULT 'Pending Review',
        approved_by VARCHAR(255),
        approved_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        items_json JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        sales_order_id INTEGER,
        customer_id INTEGER NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        due_date TIMESTAMP WITH TIME ZONE NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL,
        tax_rate NUMERIC(5, 2) DEFAULT 18.00,
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
        company_id INTEGER NOT NULL DEFAULT 1,
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
        company_id INTEGER NOT NULL DEFAULT 1,
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
        company_id INTEGER NOT NULL DEFAULT 1,
        actor VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Insert Companies if empty
    let count = 0;
    const existingCompanies = await db.select().from(schema.companies).limit(1);
    if (existingCompanies.length === 0) {
      for (const comp of initialCompanies) {
        await db.insert(schema.companies).values({
          name: comp.name,
          code: comp.code,
          email: comp.email,
          phone: comp.phone,
          taxId: comp.taxId,
          gstin: comp.gstin,
          address: comp.address,
          status: comp.status,
          licenseTier: comp.licenseTier,
          licenseExpiresAt: new Date(comp.licenseExpiresAt),
          maxUsers: comp.maxUsers,
          approvedBy: comp.approvedBy,
          approvedAt: comp.approvedAt ? new Date(comp.approvedAt) : null,
        });
        count++;
      }
    }

    // 3. Insert Products if empty
    const existingProducts = await db.select().from(schema.products).limit(1);
    if (existingProducts.length === 0) {
      for (const p of initialProducts) {
        await db.insert(schema.products).values({
          companyId: p.companyId || 1,
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

    // 4. Insert Customers if empty
    const existingCust = await db.select().from(schema.customers).limit(1);
    if (existingCust.length === 0) {
      for (const c of initialCustomers) {
        await db.insert(schema.customers).values({
          companyId: c.companyId || 1,
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

    // 5. Insert Users if empty
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length === 0) {
      for (const u of initialUsers) {
        await db.insert(schema.users).values({
          companyId: u.companyId || 1,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          department: u.department,
          avatar: u.avatar || 'U',
          status: u.status,
          isCompanyAdmin: u.isCompanyAdmin || false,
          isPlatformAdmin: u.isPlatformAdmin || false,
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
