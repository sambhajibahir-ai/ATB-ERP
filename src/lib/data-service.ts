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
import { sql, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Helper to perform resilient asynchronous sync with live Neon PostgreSQL
async function syncNeon(op: (db: NonNullable<ReturnType<typeof getDb>>) => Promise<unknown>): Promise<void> {
  try {
    const db = getDb();
    if (db) {
      await op(db);
    }
  } catch (err) {
    console.warn('[Neon Sync]', err);
  }
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function loadStoreFromDisk(): Partial<EnterpriseDataStore> | null {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      if (raw && raw.trim().length > 0) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('[EnterpriseDataStore] Failed to read store from disk:', err);
  }
  return null;
}

// Enterprise Data Store with local file persistence and Neon sync
class EnterpriseDataStore {
  companies: Company[];
  users: User[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  quotations: Quotation[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  financialTransactions: FinancialTransaction[];
  employees: Employee[];
  workOrders: WorkOrder[];
  auditLogs: AuditLog[];

  constructor() {
    const loaded = loadStoreFromDisk();
    this.companies = loaded?.companies && Array.isArray(loaded.companies) && loaded.companies.length > 0 ? loaded.companies : [...initialCompanies];
    this.users = loaded?.users && Array.isArray(loaded.users) && loaded.users.length > 0 ? loaded.users : [...initialUsers];
    this.customers = loaded?.customers && Array.isArray(loaded.customers) && loaded.customers.length > 0 ? loaded.customers : [...initialCustomers];
    this.suppliers = loaded?.suppliers && Array.isArray(loaded.suppliers) && loaded.suppliers.length > 0 ? loaded.suppliers : [...initialSuppliers];
    this.products = loaded?.products && Array.isArray(loaded.products) && loaded.products.length > 0 ? loaded.products : [...initialProducts];
    this.quotations = loaded?.quotations && Array.isArray(loaded.quotations) && loaded.quotations.length > 0 ? loaded.quotations : [...initialQuotations];
    this.salesOrders = loaded?.salesOrders && Array.isArray(loaded.salesOrders) && loaded.salesOrders.length > 0 ? loaded.salesOrders : [...initialSalesOrders];
    this.invoices = loaded?.invoices && Array.isArray(loaded.invoices) && loaded.invoices.length > 0 ? loaded.invoices : [...initialInvoices];
    this.purchaseOrders = loaded?.purchaseOrders && Array.isArray(loaded.purchaseOrders) && loaded.purchaseOrders.length > 0 ? loaded.purchaseOrders : [...initialPurchaseOrders];
    this.financialTransactions = loaded?.financialTransactions && Array.isArray(loaded.financialTransactions) && loaded.financialTransactions.length > 0 ? loaded.financialTransactions : [...initialFinancialTransactions];
    this.employees = loaded?.employees && Array.isArray(loaded.employees) && loaded.employees.length > 0 ? loaded.employees : [...initialEmployees];
    this.workOrders = loaded?.workOrders && Array.isArray(loaded.workOrders) && loaded.workOrders.length > 0 ? loaded.workOrders : [...initialWorkOrders];
    this.auditLogs = loaded?.auditLogs && Array.isArray(loaded.auditLogs) && loaded.auditLogs.length > 0 ? loaded.auditLogs : [...initialAuditLogs];

    // Ensure the dedicated private Super Admin account exists with configured credentials
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'atbsoftware@gmail.com').toLowerCase();
    const superAdminPass = process.env.SUPERADMIN_PASSWORD || 'atbsoftware108';

    let superAdmin = this.users.find(
      (u) => u.isPlatformAdmin || u.email.toLowerCase() === superAdminEmail || u.email.toLowerCase() === 'superadmin@atb-erp.com'
    );

    if (superAdmin) {
      superAdmin.email = superAdminEmail;
      superAdmin.name = 'Platform Super Admin';
      superAdmin.isPlatformAdmin = true;
      superAdmin.isCompanyAdmin = false;
      superAdmin.status = 'Active';
      if (superAdminPass === 'atbsoftware108') {
        superAdmin.passwordHash = 'atb_superadmin_salt:e51e42d8974bcc910790a05fe2663d5c2f44361a02451786ddd64a20c75add5a2094709361b32640ed013e952c9327f2b458a9202d03eb5f3a2ae5b2e71ee9ce';
      } else {
        superAdmin.passwordHash = hashPassword(superAdminPass);
      }
    } else {
      this.users.unshift({
        id: 10,
        companyId: 1,
        name: 'Platform Super Admin',
        email: superAdminEmail,
        passwordHash: 'atb_superadmin_salt:e51e42d8974bcc910790a05fe2663d5c2f44361a02451786ddd64a20c75add5a2094709361b32640ed013e952c9327f2b458a9202d03eb5f3a2ae5b2e71ee9ce',
        role: 'Admin',
        department: 'Platform Governance & Master Security',
        avatar: 'SA',
        status: 'Active',
        isCompanyAdmin: false,
        isPlatformAdmin: true,
        lastLogin: new Date().toISOString(),
        createdAt: '2026-01-01T00:00:00Z',
      });
    }

    // Ensure Aarav Mehta is company CEO, not platform super admin
    const aarav = this.users.find((u) => u.email.toLowerCase() === 'aarav.mehta@atbsoftware.com');
    if (aarav) {
      aarav.isPlatformAdmin = false;
      aarav.isCompanyAdmin = true;
    }

    // Ensure Company 1 details are strictly 'ATB Software' with Wagholi address and masked CIN/GSTIN
    const comp1 = this.companies.find((c) => c.id === 1);
    if (comp1) {
      comp1.name = 'ATB Software';
      comp1.taxId = 'CIN: U72200MH2026PTC******';
      comp1.gstin = '27AABCU****R1Z*';
      comp1.address = 'ATB Towers, Wagholi, Pune, Maharashtra 412207';
      comp1.phone = '+91 20 4129 9000';
      comp1.email = 'billing@atbsoftware.com';
      comp1.operationsName = comp1.operationsName || 'ATB Software Enterprise Operations';
      comp1.registrationNumber = comp1.registrationNumber || 'ATB-REG-2026-99';
      comp1.documentTypeNote = comp1.documentTypeNote || 'Official Commercial Price Quotation';
      comp1.currency = comp1.currency || 'INR (₹)';
    }

    // Ensure all products have explicit companyId
    for (const prod of this.products) {
      if (!prod.companyId) prod.companyId = 1;
    }

    this.persist();
  }

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Always guarantee Company 1 standards in persisted data
      const comp1 = this.companies.find((c) => c.id === 1);
      if (comp1) {
        comp1.name = 'ATB Software';
        comp1.taxId = 'CIN: U72200MH2026PTC******';
        comp1.gstin = '27AABCU****R1Z*';
        comp1.address = 'ATB Towers, Wagholi, Pune, Maharashtra 412207';
        comp1.phone = '+91 20 4129 9000';
        comp1.email = 'billing@atbsoftware.com';
        comp1.operationsName = comp1.operationsName || 'ATB Software Enterprise Operations';
        comp1.registrationNumber = comp1.registrationNumber || 'ATB-REG-2026-99';
        comp1.documentTypeNote = comp1.documentTypeNote || 'Official Commercial Price Quotation';
        comp1.currency = comp1.currency || 'INR (₹)';
      }

      // Always ensure converted orders keep their quotation discount
      for (const order of this.salesOrders) {
        if (order.notes && order.notes.includes('Converted from Quotation')) {
          const match = order.notes.match(/QT-\d{4}-\d{4}/);
          if (match) {
            const q = this.quotations.find((quote) => quote.quotationNumber === match[0]);
            if (q && q.discountAmount > 0 && (!order.discountAmount || order.discountAmount === 0)) {
              order.discountAmount = q.discountAmount;
              order.taxAmount = q.taxAmount;
              order.totalAmount = q.totalAmount;
              order.subtotal = q.subtotal;
            }
          }
        }
      }

      // Always ensure invoices matching converted orders keep discount & total
      for (const invoice of this.invoices) {
        if (invoice.salesOrderId) {
          const order = this.salesOrders.find((o) => o.id === invoice.salesOrderId);
          if (order && order.discountAmount && order.discountAmount > 0) {
            invoice.discountAmount = order.discountAmount;
            invoice.taxAmount = order.taxAmount;
            invoice.totalAmount = order.totalAmount;
            invoice.subtotal = order.subtotal;
          }
        }
      }

      const data = {
        companies: this.companies,
        users: this.users,
        customers: this.customers,
        suppliers: this.suppliers,
        products: this.products,
        quotations: this.quotations,
        salesOrders: this.salesOrders,
        invoices: this.invoices,
        purchaseOrders: this.purchaseOrders,
        financialTransactions: this.financialTransactions,
        employees: this.employees,
        workOrders: this.workOrders,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('[EnterpriseDataStore] Failed to write store to disk:', err);
    }
  }
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

  const nextId = store.companies.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
  const newCompany: Company = {
    id: nextId,
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
  store.persist();
  addAuditLog(
    'System',
    'Registered Company',
    'Platform Administration',
    `New tenant company registered: ${newCompany.name} (License: ${newCompany.licenseTier}, Status: ${newCompany.status})`
  );

  syncNeon(async (db) => {
    await db.insert(schema.companies).values({
      name: newCompany.name,
      code: newCompany.code,
      email: newCompany.email,
      phone: newCompany.phone || null,
      taxId: newCompany.taxId || null,
      gstin: newCompany.gstin || null,
      address: newCompany.address || null,
      operationsName: newCompany.operationsName || null,
      registrationNumber: newCompany.registrationNumber || null,
      documentTypeNote: newCompany.documentTypeNote || null,
      currency: newCompany.currency || 'INR (₹)',
      status: newCompany.status,
      licenseTier: newCompany.licenseTier,
      licenseExpiresAt: new Date(newCompany.licenseExpiresAt),
      maxUsers: newCompany.maxUsers,
      approvedBy: newCompany.approvedBy || null,
      approvedAt: newCompany.approvedAt ? new Date(newCompany.approvedAt) : null,
    });
  });

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

  // Also activate the primary CEO user if pending
  const ceoUser = store.users.find((u) => u.companyId === companyId && u.isCompanyAdmin);
  if (ceoUser) {
    ceoUser.status = 'Active';
  }

  // If license was expired or near expiry, extend to at least 30 days
  const now = new Date();
  if (new Date(company.licenseExpiresAt).getTime() < now.getTime()) {
    company.licenseExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  store.persist();
  addAuditLog(
    approvedBy,
    'Approved Company Account',
    'Platform Administration',
    `Approved company ${company.name} (License: ${company.licenseTier}, Valid until: ${new Date(company.licenseExpiresAt).toLocaleDateString()})`
  );

  syncNeon(async (db) => {
    await db.update(schema.companies)
      .set({
        status: company.status,
        approvedBy: company.approvedBy || null,
        approvedAt: company.approvedAt ? new Date(company.approvedAt) : null,
        licenseExpiresAt: new Date(company.licenseExpiresAt),
      })
      .where(eq(schema.companies.id, company.id));
  });

  return { ...company };
}

export async function updateCompanyProfile(
  companyId: number,
  data: Partial<Company>,
  actor = 'Company Admin'
): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) {
    throw new Error('Company not found');
  }

  if (data.name) company.name = data.name;
  if (data.operationsName !== undefined) company.operationsName = data.operationsName;
  if (data.registrationNumber !== undefined) company.registrationNumber = data.registrationNumber;
  if (data.documentTypeNote !== undefined) company.documentTypeNote = data.documentTypeNote;
  if (data.taxId !== undefined) company.taxId = data.taxId;
  if (data.gstin !== undefined) company.gstin = data.gstin;
  if (data.email !== undefined) company.email = data.email;
  if (data.phone !== undefined) company.phone = data.phone;
  if (data.address !== undefined) company.address = data.address;
  if (data.currency !== undefined) company.currency = data.currency;

  store.persist();
  addAuditLog(
    actor,
    'Updated Company Profile',
    'Settings',
    `Updated company profile for ${company.name}`,
    company.id
  );

  syncNeon(async (db) => {
    await db.update(schema.companies)
      .set({
        name: company.name,
        operationsName: company.operationsName || null,
        registrationNumber: company.registrationNumber || null,
        documentTypeNote: company.documentTypeNote || null,
        taxId: company.taxId || null,
        gstin: company.gstin || null,
        email: company.email,
        phone: company.phone || null,
        address: company.address || null,
        currency: company.currency || 'INR (₹)',
      })
      .where(eq(schema.companies.id, company.id));
  });

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

  store.persist();
  addAuditLog(
    actor,
    'Updated Company License',
    'Platform Administration',
    `Updated license for ${company.name}: Tier=${company.licenseTier}, MaxUsers=${company.maxUsers}, Expires=${company.licenseExpiresAt}`
  );

  syncNeon(async (db) => {
    await db.update(schema.companies)
      .set({
        licenseTier: company.licenseTier,
        licenseExpiresAt: new Date(company.licenseExpiresAt),
        maxUsers: company.maxUsers,
        status: company.status,
      })
      .where(eq(schema.companies.id, company.id));
  });

  return { ...company };
}

export async function toggleCompanyStatus(companyId: number, actor = 'Platform Admin'): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) throw new Error('Company not found');

  if (company.id === 1) {
    throw new Error('Cannot suspend the primary platform company');
  }

  company.status = company.status === 'Active' ? 'Suspended' : 'Active';
  store.persist();
  addAuditLog(
    actor,
    `${company.status} Company`,
    'Platform Administration',
    `Set company status for ${company.name} to ${company.status}`
  );

  syncNeon(async (db) => {
    await db.update(schema.companies)
      .set({ status: company.status })
      .where(eq(schema.companies.id, company.id));
  });

  return { ...company };
}

export async function cancelCompanyLicense(companyId: number, actor = 'Platform Super Admin'): Promise<Company> {
  const company = store.companies.find((c) => c.id === companyId);
  if (!company) throw new Error('Company not found');

  // Immediately expire license and suspend company access
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  company.licenseExpiresAt = pastDate;
  company.status = 'Suspended';
  store.persist();

  addAuditLog(
    actor,
    'Cancelled Subscription License',
    'Platform Administration',
    `Cancelled and revoked subscription license for ${company.name}. License expired and workspace suspended.`,
    companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.companies)
      .set({
        licenseExpiresAt: new Date(company.licenseExpiresAt),
        status: company.status,
      })
      .where(eq(schema.companies.id, company.id));
  });

  return { ...company };
}

export async function deleteCompany(companyId: number, actor = 'Platform Admin'): Promise<boolean> {
  if (companyId === 1) {
    throw new Error('Cannot delete the primary platform company');
  }
  const idx = store.companies.findIndex((c) => c.id === companyId);
  if (idx === -1) return false;
  const deleted = store.companies.splice(idx, 1)[0];

  // Clean up associated tenant records
  store.users = store.users.filter((u) => u.companyId !== companyId);
  store.customers = store.customers.filter((c) => c.companyId !== companyId);
  store.products = store.products.filter((p) => p.companyId !== companyId);
  store.quotations = store.quotations.filter((q) => q.companyId !== companyId);
  store.salesOrders = store.salesOrders.filter((s) => s.companyId !== companyId);
  store.invoices = store.invoices.filter((i) => i.companyId !== companyId);
  store.purchaseOrders = store.purchaseOrders.filter((p) => p.companyId !== companyId);
  store.financialTransactions = store.financialTransactions.filter((t) => t.companyId !== companyId);
  store.employees = store.employees.filter((e) => e.companyId !== companyId);
  store.workOrders = store.workOrders.filter((w) => w.companyId !== companyId);
  store.auditLogs = store.auditLogs.filter((l) => l.companyId !== companyId);

  store.persist();
  addAuditLog(
    actor,
    'Deleted Company',
    'Platform Administration',
    `Decommissioned company workspace for ${deleted.name} (${deleted.code})`
  );
  return true;
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
  const rawCompany = store.companies.find((c) => c.id === targetId) || store.companies[0];
  const company = rawCompany ? {
    ...rawCompany,
    name: (rawCompany.id === 1 || rawCompany.name?.includes('ATB Software')) ? 'ATB Software' : rawCompany.name,
  } : null;

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

  const nextUserId = store.users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
  const newUser: User = {
    id: nextUserId,
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
  store.persist();
  addAuditLog(
    'Admin',
    'Created User Sub-Account',
    'User Management',
    `Created sub-account ${newUser.name} (${newUser.email}) with role ${newUser.role} for company ${company.name}`
  );

  syncNeon(async (db) => {
    await db.insert(schema.users).values({
      companyId: newUser.companyId,
      name: newUser.name,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
      role: newUser.role,
      department: newUser.department,
      avatar: newUser.avatar || 'U',
      status: newUser.status,
      isCompanyAdmin: newUser.isCompanyAdmin,
      isPlatformAdmin: newUser.isPlatformAdmin,
    });
  });

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

  store.persist();
  addAuditLog('Admin', 'Updated User', 'Administration', `Updated profile/credentials for ${user.email}`);

  syncNeon(async (db) => {
    await db.update(schema.users)
      .set({
        name: user.name,
        role: user.role,
        department: user.department,
        status: user.status,
        passwordHash: user.passwordHash,
      })
      .where(eq(schema.users.id, user.id));
  });

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function deleteUser(id: number, isPlatformAdmin = false): Promise<boolean> {
  const index = store.users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  const user = store.users[index];

  if (user.isPlatformAdmin) {
    throw new Error('Cannot delete the private platform Super Administrator account.');
  }

  if (user.isCompanyAdmin && !isPlatformAdmin) {
    throw new Error('Cannot delete a company CEO account without Platform Super Admin privileges.');
  }

  const removed = store.users.splice(index, 1)[0];
  store.persist();
  addAuditLog(
    isPlatformAdmin ? 'Platform Super Admin' : 'Admin',
    'Deleted User Account',
    'Administration',
    `Permanently deleted ${removed.isCompanyAdmin ? 'Company CEO' : 'Staff'} login for ${removed.email} (${removed.name})`,
    removed.companyId
  );
  return true;
}

export async function resetUserPassword(
  userId: number,
  newPassword: string,
  actor = 'Platform Super Admin'
): Promise<boolean> {
  const user = store.users.find((u) => u.id === userId);
  if (!user) return false;

  user.passwordHash = hashPassword(newPassword);
  store.persist();
  addAuditLog(
    actor,
    'Reset User Password',
    'Authentication',
    `Credentials reset for login: ${user.email} (${user.name})`,
    user.companyId
  );
  return true;
}

export async function toggleUserStatus(
  userId: number,
  actor = 'Platform Super Admin'
): Promise<Omit<User, 'passwordHash'>> {
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  if (user.isPlatformAdmin) {
    throw new Error('Cannot suspend the master platform Super Administrator account.');
  }

  user.status = user.status === 'Active' ? 'Suspended' : 'Active';
  store.persist();
  addAuditLog(
    actor,
    `${user.status} User Login`,
    'Authentication',
    `Login access for ${user.email} toggled to ${user.status}`,
    user.companyId
  );
  const { passwordHash, ...safeUser } = user;
  return safeUser;
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

  // Check company status & approval (Platform Super Admin bypasses company restrictions to maintain platform)
  if (!user.isPlatformAdmin) {
    if (company.status === 'Pending') {
      throw new Error(
        `Your company account (${company.name}) is currently pending approval by the Platform Administrator. Please contact support or await verification.`
      );
    }

    if (company.status === 'Suspended') {
      throw new Error(
        `Your company account (${company.name}) has been suspended or its subscription license has been cancelled. Please contact the platform administrator.`
      );
    }

    // Check license expiry
    if (new Date(company.licenseExpiresAt).getTime() < Date.now()) {
      throw new Error(
        `Your company enterprise license expired on ${new Date(company.licenseExpiresAt).toLocaleDateString()}. Please contact your CEO or platform administrator to renew.`
      );
    }
  }

  user.lastLogin = new Date().toISOString();
  const effectiveCompany = user.isPlatformAdmin ? { ...company, name: 'ATB Software' } : company;
  addAuditLog(user.name, 'User Sign In', 'Authentication', `Successful login for ${user.email} (${effectiveCompany.name})`, company.id);
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, company: effectiveCompany };
}

export async function getAllAuditLogsForPlatformAdmin(): Promise<AuditLog[]> {
  return [...store.auditLogs];
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
  const nextId = store.customers.reduce((max, c) => Math.max(max, c.id || 0), 0) + 1;
  const newCustomer: Customer = {
    ...data,
    companyId: targetCompanyId,
    id: nextId,
    code: data.code || `CUST-${String(nextId).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.customers.unshift(newCustomer);
  store.persist();
  addAuditLog('User', 'Created Customer', 'Sales & CRM', `Added customer ${newCustomer.name} (${newCustomer.code})`, targetCompanyId);

  // Sync to Neon PostgreSQL if configured
  try {
    const db = getDb();
    if (db) {
      await db.insert(schema.customers).values({
        companyId: targetCompanyId,
        code: newCustomer.code,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || null,
        company: newCustomer.company || null,
        taxNumber: newCustomer.taxNumber || null,
        address: newCustomer.address || null,
        creditLimit: String(newCustomer.creditLimit || 25000),
        outstandingBalance: String(newCustomer.outstandingBalance || 0),
        status: newCustomer.status || 'Active',
      });
    }
  } catch (neonErr) {
    console.warn('[Neon Sync] Failed to sync new customer to Neon:', neonErr);
  }

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
  const nextId = store.suppliers.reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
  const newSupplier: Supplier = {
    ...data,
    companyId: targetCompanyId,
    id: nextId,
    code: data.code || `SUP-${String(nextId).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.suppliers.unshift(newSupplier);
  store.persist();
  addAuditLog('User', 'Created Supplier', 'Purchasing', `Added supplier ${newSupplier.name} (${newSupplier.code})`, targetCompanyId);

  // Sync to Neon PostgreSQL if configured
  try {
    const db = getDb();
    if (db) {
      await db.insert(schema.suppliers).values({
        companyId: targetCompanyId,
        code: newSupplier.code,
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson || null,
        email: newSupplier.email,
        phone: newSupplier.phone || null,
        address: newSupplier.address || null,
        paymentTerms: newSupplier.paymentTerms || 'Net 30',
        rating: newSupplier.rating || 5,
        status: newSupplier.status || 'Active',
      });
    }
  } catch (neonErr) {
    console.warn('[Neon Sync] Failed to sync new supplier to Neon:', neonErr);
  }

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

  const nextId = store.products.reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
  const newProduct: Product = {
    ...data,
    companyId: targetCompanyId,
    status,
    id: nextId,
    createdAt: new Date().toISOString(),
  };
  store.products.unshift(newProduct);
  store.persist();
  addAuditLog('User', 'Created Product', 'Inventory', `Added product ${newProduct.name} (${newProduct.sku})`, targetCompanyId);

  syncNeon(async (db) => {
    await db.insert(schema.products).values({
      companyId: newProduct.companyId,
      sku: newProduct.sku,
      name: newProduct.name,
      description: newProduct.description || null,
      category: newProduct.category,
      unit: newProduct.unit || 'pcs',
      costPrice: String(newProduct.costPrice),
      sellingPrice: String(newProduct.sellingPrice),
      currentStock: newProduct.currentStock,
      minStock: newProduct.minStock,
      maxStock: newProduct.maxStock,
      warehouseLocation: newProduct.warehouseLocation || 'Warehouse Zone A-1',
      barcode: newProduct.barcode || null,
      status: newProduct.status,
    });
  });

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

  store.persist();
  addAuditLog(
    'User',
    'Adjusted Stock',
    'Inventory',
    `${product.sku}: ${quantityChange > 0 ? '+' : ''}${quantityChange} units (${reason}). New stock: ${product.currentStock}`,
    product.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.products)
      .set({
        currentStock: product.currentStock,
        status: product.status,
      })
      .where(eq(schema.products.id, product.id));

    await db.insert(schema.inventoryTransactions).values({
      companyId: product.companyId,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: quantityChange >= 0 ? 'IN' : 'OUT',
      quantity: Math.abs(quantityChange),
      reference: reason.slice(0, 100),
      notes: reason,
      performedBy: 'System',
    });
  });

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

  const nextQuoteId = store.quotations.reduce((max, q) => Math.max(max, q.id || 0), 0) + 1;
  const newQuote: Quotation = {
    id: nextQuoteId,
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
  store.persist();

  addAuditLog(
    'User',
    'Created Quotation',
    'Sales & CRM',
    `Created ${newQuote.quotationNumber} for ${newQuote.customerName} (₹${newQuote.totalAmount.toLocaleString('en-IN')})`,
    targetCompanyId
  );

  syncNeon(async (db) => {
    await db.insert(schema.quotations).values({
      companyId: newQuote.companyId,
      quotationNumber: newQuote.quotationNumber,
      customerId: newQuote.customerId,
      customerName: newQuote.customerName,
      customerEmail: newQuote.customerEmail || null,
      issueDate: new Date(newQuote.issueDate),
      expiryDate: new Date(newQuote.expiryDate),
      subtotal: String(newQuote.subtotal),
      taxRate: String(newQuote.taxRate),
      taxAmount: String(newQuote.taxAmount),
      discountAmount: String(newQuote.discountAmount),
      totalAmount: String(newQuote.totalAmount),
      status: newQuote.status,
      itemsJson: newQuote.itemsJson,
      terms: newQuote.terms || null,
      notes: newQuote.notes || null,
    });
  });

  return newQuote;
}

export async function updateQuotationStatus(
  id: number,
  status: Quotation['status']
): Promise<Quotation | null> {
  const quote = store.quotations.find((q) => q.id === id);
  if (!quote) return null;
  quote.status = status;
  store.persist();
  addAuditLog(
    'User',
    'Updated Quotation Status',
    'Sales & CRM',
    `${quote.quotationNumber} status set to ${status}`,
    quote.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.quotations)
      .set({
        status,
        ...(quote.convertedSalesOrderId ? { convertedSalesOrderId: quote.convertedSalesOrderId } : {}),
      })
      .where(eq(schema.quotations.id, quote.id));
  });

  return quote;
}

export async function convertQuotationToSalesOrder(
  quotationId: number
): Promise<{ salesOrder: SalesOrder; quotation: Quotation } | null> {
  const quote = store.quotations.find((q) => q.id === quotationId);
  if (!quote) return null;

  // Preserve complete quotation line items with negotiated unit prices
  const items = quote.itemsJson.map((i) => ({
    productId: i.productId,
    productName: i.productName,
    sku: i.sku,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    total: i.total,
  }));

  const salesOrder = await createSalesOrder({
    customerId: quote.customerId,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    items,
    subtotal: quote.subtotal,
    discountAmount: quote.discountAmount,
    taxRate: quote.taxRate,
    taxAmount: quote.taxAmount,
    totalAmount: quote.totalAmount,
    terms: quote.terms,
    notes: `Converted from Quotation ${quote.quotationNumber}. ${quote.notes || ''}`.trim(),
    companyId: quote.companyId,
  });

  quote.status = 'Converted';
  quote.convertedSalesOrderId = salesOrder.id;
  store.persist();

  addAuditLog(
    'User',
    'Converted Quotation',
    'Sales & CRM',
    `Converted ${quote.quotationNumber} into ${salesOrder.orderNumber} (₹${salesOrder.totalAmount.toLocaleString('en-IN')})`,
    quote.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.quotations)
      .set({
        status: 'Converted',
        convertedSalesOrderId: salesOrder.id,
      })
      .where(eq(schema.quotations.id, quote.id));
  });

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
  customerEmail?: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice?: number;
    productName?: string;
    sku?: string;
    total?: number;
  }>;
  subtotal?: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  terms?: string;
  notes?: string;
  companyId?: number;
}): Promise<SalesOrder> {
  const targetCompanyId = data.companyId || (await getEffectiveCompanyId());

  const calculatedItems = data.items.map((item) => {
    const prod = store.products.find((p) => p.id === item.productId);
    const unitPrice = item.unitPrice !== undefined ? Number(item.unitPrice) : (prod ? prod.sellingPrice : 100);
    const name = item.productName || (prod ? prod.name : 'Custom Item');
    const sku = item.sku || (prod ? prod.sku : 'SKU-GEN');
    const total = item.total !== undefined ? Number(item.total) : Number((unitPrice * item.quantity).toFixed(2));
    return {
      productId: item.productId,
      productName: name,
      sku,
      quantity: item.quantity,
      unitPrice,
      total,
    };
  });

  const rawSubtotal = calculatedItems.reduce((acc, curr) => acc + curr.total, 0);
  const subtotal = data.subtotal !== undefined ? Number(data.subtotal) : Number(rawSubtotal.toFixed(2));
  const discountAmount = Math.max(0, Number(data.discountAmount || 0));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = data.taxRate !== undefined ? Number(data.taxRate) : 18;
  const taxAmount = data.taxAmount !== undefined
    ? Number(data.taxAmount)
    : Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const totalAmount = data.totalAmount !== undefined
    ? Number(data.totalAmount)
    : Number((taxableAmount + taxAmount).toFixed(2));

  const nextOrderId = store.salesOrders.reduce((max, o) => Math.max(max, o.id || 0), 0) + 1;
  const newOrder: SalesOrder = {
    id: nextOrderId,
    companyId: targetCompanyId,
    orderNumber: `SO-2026-${String(store.salesOrders.length + 93).padStart(4, '0')}`,
    customerId: data.customerId,
    customerName: data.customerName,
    orderDate: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    itemsJson: calculatedItems,
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
  };

  store.salesOrders.unshift(newOrder);

  // Auto-generate matching Invoice for this company with preserved discount & taxation
  let custEmail = data.customerEmail;
  if (!custEmail) {
    const cust = store.customers.find((c) => c.id === data.customerId);
    custEmail = cust ? cust.email : 'billing@client.com';
  }

  const nextInvoiceId = store.invoices.reduce((max, i) => Math.max(max, i.id || 0), 0) + 1;
  const newInvoice: Invoice = {
    id: nextInvoiceId,
    companyId: targetCompanyId,
    invoiceNumber: `INV-2026-${String(store.invoices.length + 49).padStart(4, '0')}`,
    salesOrderId: newOrder.id,
    customerId: newOrder.customerId,
    customerName: newOrder.customerName,
    customerEmail: custEmail,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    subtotal,
    discountAmount,
    taxRate,
    taxAmount,
    totalAmount,
    amountPaid: 0,
    status: 'Unpaid',
    itemsJson: calculatedItems,
    terms: data.terms || 'Net 30 days. Standard enterprise warranty applies.',
    createdAt: new Date().toISOString(),
  };
  store.invoices.unshift(newInvoice);

  // Deduct inventory
  for (const item of calculatedItems) {
    adjustProductStock(item.productId, -item.quantity, `Fulfilled Sales Order ${newOrder.orderNumber}`);
  }

  store.persist();

  addAuditLog(
    'User',
    'Created Sales Order',
    'Sales & CRM',
    `Created ${newOrder.orderNumber} for ${newOrder.customerName} (₹${newOrder.totalAmount.toLocaleString('en-IN')})`,
    targetCompanyId
  );

  syncNeon(async (db) => {
    await db.insert(schema.salesOrders).values({
      companyId: newOrder.companyId,
      orderNumber: newOrder.orderNumber,
      customerId: newOrder.customerId,
      customerName: newOrder.customerName,
      orderDate: new Date(newOrder.orderDate),
      deliveryDate: newOrder.deliveryDate ? new Date(newOrder.deliveryDate) : null,
      subtotal: String(newOrder.subtotal),
      discountAmount: String(newOrder.discountAmount),
      taxAmount: String(newOrder.taxAmount),
      totalAmount: String(newOrder.totalAmount),
      paymentStatus: newOrder.paymentStatus,
      orderStatus: newOrder.orderStatus,
      itemsJson: newOrder.itemsJson,
      notes: newOrder.notes || null,
    });

    await db.insert(schema.invoices).values({
      companyId: newInvoice.companyId,
      invoiceNumber: newInvoice.invoiceNumber,
      salesOrderId: newInvoice.salesOrderId || null,
      customerId: newInvoice.customerId,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail || null,
      issueDate: new Date(newInvoice.issueDate),
      dueDate: new Date(newInvoice.dueDate),
      subtotal: String(newInvoice.subtotal),
      discountAmount: String(newInvoice.discountAmount),
      taxRate: String(newInvoice.taxRate),
      taxAmount: String(newInvoice.taxAmount),
      totalAmount: String(newInvoice.totalAmount),
      amountPaid: String(newInvoice.amountPaid),
      status: newInvoice.status,
      itemsJson: newInvoice.itemsJson,
      terms: newInvoice.terms || null,
    });
  });

  return newOrder;
}

export async function updateSalesOrderStatus(
  orderId: number,
  status: SalesOrder['orderStatus']
): Promise<SalesOrder | null> {
  const order = store.salesOrders.find((o) => o.id === orderId);
  if (!order) return null;
  order.orderStatus = status;
  store.persist();
  addAuditLog('User', 'Updated Order Status', 'Sales & CRM', `${order.orderNumber} set to ${status}`, order.companyId);

  syncNeon(async (db) => {
    await db.update(schema.salesOrders)
      .set({ orderStatus: status })
      .where(eq(schema.salesOrders.id, order.id));
  });

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

  const nextPOId = store.purchaseOrders.reduce((max, po) => Math.max(max, po.id || 0), 0) + 1;
  const newPO: PurchaseOrder = {
    id: nextPOId,
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
  store.persist();
  addAuditLog(
    'User',
    'Created Purchase Order',
    'Purchasing',
    `Created ${newPO.poNumber} for ${newPO.supplierName} (₹${newPO.totalAmount.toLocaleString('en-IN')}) - Status: Pending Review`,
    targetCompanyId
  );

  syncNeon(async (db) => {
    await db.insert(schema.purchaseOrders).values({
      companyId: newPO.companyId,
      poNumber: newPO.poNumber,
      supplierId: newPO.supplierId,
      supplierName: newPO.supplierName,
      orderDate: new Date(newPO.orderDate),
      expectedDelivery: newPO.expectedDelivery ? new Date(newPO.expectedDelivery) : null,
      totalAmount: String(newPO.totalAmount),
      status: newPO.status,
      itemsJson: newPO.itemsJson,
      notes: newPO.notes || null,
    });
  });

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
  store.persist();

  addAuditLog(
    reviewer,
    'Approved Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} for ${po.supplierName} (₹${po.totalAmount.toLocaleString('en-IN')}) approved and cleared for procurement`,
    po.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.purchaseOrders)
      .set({
        status: po.status,
        approvedBy: po.approvedBy || null,
        approvedAt: po.approvedAt ? new Date(po.approvedAt) : null,
        rejectionReason: null,
      })
      .where(eq(schema.purchaseOrders.id, po.id));
  });

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
  store.persist();

  addAuditLog(
    reviewer,
    'Rejected Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} rejected. Reason: ${po.rejectionReason}`,
    po.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.purchaseOrders)
      .set({
        status: po.status,
        approvedBy: po.approvedBy || null,
        approvedAt: po.approvedAt ? new Date(po.approvedAt) : null,
        rejectionReason: po.rejectionReason || null,
      })
      .where(eq(schema.purchaseOrders.id, po.id));
  });

  return po;
}

export async function transmitPurchaseOrder(poId: number): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;

  po.status = 'Ordered';
  store.persist();

  addAuditLog(
    'User',
    'Transmitted Purchase Order',
    'Purchasing',
    `Purchase Order ${po.poNumber} transmitted to vendor ${po.supplierName}. Delivery tracking initiated.`,
    po.companyId
  );

  syncNeon(async (db) => {
    await db.update(schema.purchaseOrders)
      .set({ status: po.status })
      .where(eq(schema.purchaseOrders.id, po.id));
  });

  return po;
}

export async function updatePurchaseOrderStatus(
  poId: number,
  status: PurchaseOrder['status']
): Promise<PurchaseOrder | null> {
  const po = store.purchaseOrders.find((p) => p.id === poId);
  if (!po) return null;
  po.status = status;
  store.persist();
  addAuditLog('User', 'Updated PO Status', 'Purchasing', `${po.poNumber} status set to ${status}`, po.companyId);

  syncNeon(async (db) => {
    await db.update(schema.purchaseOrders)
      .set({ status: po.status })
      .where(eq(schema.purchaseOrders.id, po.id));
  });

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

  store.persist();
  addAuditLog('User', 'Received Purchase Order', 'Purchasing', `Goods received for ${po.poNumber}. Stock updated.`, po.companyId);

  syncNeon(async (db) => {
    await db.update(schema.purchaseOrders)
      .set({ status: po.status })
      .where(eq(schema.purchaseOrders.id, po.id));
  });

  return po;
}

// -------------------------------------------------------------
// Invoices (Multi-Tenant Isolated)
// -------------------------------------------------------------
export async function getInvoices(companyId?: number): Promise<Invoice[]> {
  const targetId = await getEffectiveCompanyId(companyId);
  return store.invoices.filter((i) => (i.companyId || 1) === targetId);
}

export async function getInvoiceBySalesOrderId(salesOrderId: number): Promise<Invoice | null> {
  return store.invoices.find((i) => i.salesOrderId === salesOrderId) || null;
}

export async function generateInvoiceForSalesOrder(salesOrderId: number): Promise<Invoice | null> {
  const order = store.salesOrders.find((o) => o.id === salesOrderId);
  if (!order) return null;

  // Check if invoice already exists
  const existing = store.invoices.find((i) => i.salesOrderId === order.id);
  if (existing) return existing;

  let custEmail = 'billing@client.com';
  const cust = store.customers.find((c) => c.id === order.customerId);
  if (cust) custEmail = cust.email;

  const nextInvoiceId = store.invoices.reduce((max, i) => Math.max(max, i.id || 0), 0) + 1;
  const newInvoice: Invoice = {
    id: nextInvoiceId,
    companyId: order.companyId || 1,
    invoiceNumber: `INV-2026-${String(store.invoices.length + 49).padStart(4, '0')}`,
    salesOrderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: custEmail,
    issueDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount || 0,
    taxRate: 18,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    amountPaid: 0,
    status: 'Unpaid',
    itemsJson: order.itemsJson,
    terms: 'Net 30 days. Standard enterprise warranty applies.',
    createdAt: new Date().toISOString(),
  };

  store.invoices.unshift(newInvoice);
  store.persist();

  addAuditLog(
    'User',
    'Generated Invoice',
    'Finance & Accounts',
    `Generated ${newInvoice.invoiceNumber} for ${order.orderNumber} (₹${newInvoice.totalAmount.toLocaleString('en-IN')})`,
    order.companyId
  );

  syncNeon(async (db) => {
    await db.insert(schema.invoices).values({
      companyId: newInvoice.companyId,
      invoiceNumber: newInvoice.invoiceNumber,
      salesOrderId: newInvoice.salesOrderId || null,
      customerId: newInvoice.customerId,
      customerName: newInvoice.customerName,
      customerEmail: newInvoice.customerEmail || null,
      issueDate: new Date(newInvoice.issueDate),
      dueDate: new Date(newInvoice.dueDate),
      subtotal: String(newInvoice.subtotal),
      discountAmount: String(newInvoice.discountAmount),
      taxRate: String(newInvoice.taxRate),
      taxAmount: String(newInvoice.taxAmount),
      totalAmount: String(newInvoice.totalAmount),
      amountPaid: String(newInvoice.amountPaid),
      status: newInvoice.status,
      itemsJson: newInvoice.itemsJson,
      terms: newInvoice.terms || null,
    });
  });

  return newInvoice;
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

  store.persist();
  addAuditLog('User', 'Marked Invoice Paid', 'Finance & Accounts', `Invoice ${invoice.invoiceNumber} paid in full`, invoice.companyId);

  syncNeon(async (db) => {
    await db.update(schema.invoices)
      .set({
        amountPaid: String(invoice.amountPaid),
        status: invoice.status,
      })
      .where(eq(schema.invoices.id, invoice.id));
  });

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
  const nextTxId = store.financialTransactions.reduce((max, tx) => Math.max(max, tx.id || 0), 0) + 1;
  const newTx: FinancialTransaction = {
    ...data,
    companyId: targetCompanyId,
    status: data.status || 'Completed',
    id: nextTxId,
    txNumber: `TX-2026-${String(store.financialTransactions.length + 107).padStart(4, '0')}`,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  store.financialTransactions.unshift(newTx);
  store.persist();
  addAuditLog(
    'User',
    `Recorded ${newTx.type}`,
    'Finance & Accounts',
    `${newTx.txNumber}: ₹${newTx.amount.toLocaleString('en-IN')} - ${newTx.category}`,
    targetCompanyId
  );

  syncNeon(async (db) => {
    await db.insert(schema.financialTransactions).values({
      companyId: newTx.companyId,
      txNumber: newTx.txNumber,
      date: new Date(newTx.date),
      type: newTx.type,
      category: newTx.category,
      amount: String(newTx.amount),
      paymentMethod: newTx.paymentMethod || null,
      reference: newTx.reference || null,
      status: newTx.status,
      description: newTx.description || null,
    });
  });

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
  const nextEmpId = store.employees.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
  const newEmp: Employee = {
    ...data,
    companyId: targetCompanyId,
    id: nextEmpId,
    employeeCode: `EMP-${String(store.employees.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.employees.unshift(newEmp);
  store.persist();
  addAuditLog('User', 'Added Employee', 'Human Resources', `Onboarded ${newEmp.firstName} ${newEmp.lastName} (${newEmp.department})`, targetCompanyId);

  syncNeon(async (db) => {
    await db.insert(schema.employees).values({
      companyId: newEmp.companyId,
      employeeCode: newEmp.employeeCode,
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      email: newEmp.email,
      phone: newEmp.phone || null,
      department: newEmp.department,
      position: newEmp.position,
      salary: String(newEmp.salary),
      joinDate: new Date(newEmp.joinDate),
      status: newEmp.status || 'Active',
    });
  });

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
  const nextWOId = store.workOrders.reduce((max, w) => Math.max(max, w.id || 0), 0) + 1;
  const newWO: WorkOrder = {
    ...data,
    companyId: targetCompanyId,
    id: nextWOId,
    orderNumber: data.orderNumber || `WO-2026-${String(nextWOId + 300).padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
  };
  store.workOrders.unshift(newWO);
  store.persist();
  addAuditLog('User', 'Created Work Order', 'Operations', `Created work order ${newWO.orderNumber} - ${newWO.title}`, targetCompanyId);

  // Sync to Neon PostgreSQL if configured
  try {
    const db = getDb();
    if (db) {
      await db.insert(schema.workOrders).values({
        companyId: targetCompanyId,
        orderNumber: newWO.orderNumber,
        title: newWO.title,
        productName: newWO.productName,
        quantity: newWO.quantity,
        priority: newWO.priority,
        status: newWO.status,
        assignedTo: newWO.assignedTo,
        progress: newWO.progress,
        startDate: new Date(newWO.startDate),
        dueDate: new Date(newWO.dueDate),
        notes: newWO.notes || null,
      });
    }
  } catch (neonErr) {
    console.warn('[Neon Sync] Failed to sync new work order to Neon:', neonErr);
  }

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
  store.persist();
  addAuditLog('User', 'Updated Work Order', 'Operations', `${order.orderNumber} status set to ${status}`, order.companyId);

  syncNeon(async (db) => {
    await db.update(schema.workOrders)
      .set({
        status: order.status,
        ...(typeof progress === 'number' ? { progress } : {}),
      })
      .where(eq(schema.workOrders.id, order.id));
  });

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
  const nextLogId = store.auditLogs.reduce((max, l) => Math.max(max, l.id || 0), 0) + 1;
  const log: AuditLog = {
    id: nextLogId,
    companyId,
    actor,
    action,
    module,
    details,
    createdAt: new Date().toISOString(),
  };
  store.auditLogs.unshift(log);
  store.persist();

  syncNeon(async (db) => {
    await db.insert(schema.auditLogs).values({
      companyId: log.companyId,
      actor: log.actor,
      action: log.action,
      module: log.module,
      details: log.details || null,
    });
  });

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
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        tax_id VARCHAR(100),
        gstin VARCHAR(50),
        address TEXT,
        operations_name VARCHAR(255),
        registration_number VARCHAR(100),
        document_type_note VARCHAR(255),
        currency VARCHAR(50) DEFAULT 'INR (₹)',
        status VARCHAR(30) NOT NULL DEFAULT 'Active',
        license_tier VARCHAR(50) NOT NULL DEFAULT 'Enterprise',
        license_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        max_users INTEGER DEFAULT 10 NOT NULL,
        approved_by VARCHAR(255),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS operations_name VARCHAR(255)`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100)`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS document_type_note VARCHAR(255)`,
      `ALTER TABLE companies ADD COLUMN IF NOT EXISTS currency VARCHAR(50) DEFAULT 'INR (₹)'`,

      `CREATE TABLE IF NOT EXISTS users (
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
      )`,

      `CREATE TABLE IF NOT EXISTS customers (
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
      )`,

      `CREATE TABLE IF NOT EXISTS suppliers (
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
      )`,

      `CREATE TABLE IF NOT EXISTS products (
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
        warehouse_location VARCHAR(100) DEFAULT 'Warehouse Zone A-1',
        barcode VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS quotations (
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
      )`,

      `CREATE TABLE IF NOT EXISTS sales_orders (
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
      )`,

      `CREATE TABLE IF NOT EXISTS purchase_orders (
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
      )`,

      `CREATE TABLE IF NOT EXISTS invoices (
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
        discount_amount NUMERIC(12, 2) DEFAULT 0.00,
        tax_rate NUMERIC(5, 2) DEFAULT 18.00,
        tax_amount NUMERIC(12, 2) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        amount_paid NUMERIC(12, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'Unpaid',
        items_json JSONB NOT NULL,
        terms TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12, 2) DEFAULT 0.00`,

      `CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        product_id INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        sku VARCHAR(50) NOT NULL,
        type VARCHAR(30) NOT NULL,
        quantity INTEGER NOT NULL,
        reference VARCHAR(100),
        notes TEXT,
        performed_by VARCHAR(255) DEFAULT 'System',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS financial_transactions (
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
      )`,

      `CREATE TABLE IF NOT EXISTS employees (
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
      )`,

      `CREATE TABLE IF NOT EXISTS work_orders (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        product_name VARCHAR(255),
        quantity INTEGER DEFAULT 1 NOT NULL,
        priority VARCHAR(20) DEFAULT 'Medium',
        status VARCHAR(30) DEFAULT 'In Progress',
        assigned_to VARCHAR(255),
        progress INTEGER DEFAULT 0 NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        due_date TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL DEFAULT 1,
        actor VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    for (const ddl of ddlStatements) {
      await db.execute(sql.raw(ddl));
    }

    let count = 0;
    // Companies
    const existingComp = await db.select().from(schema.companies).limit(1);
    if (existingComp.length === 0) {
      for (const comp of store.companies) {
        await db.insert(schema.companies).values({
          id: comp.id,
          name: comp.name,
          code: comp.code,
          email: comp.email,
          phone: comp.phone || null,
          taxId: comp.taxId || null,
          gstin: comp.gstin || null,
          address: comp.address || null,
          operationsName: comp.operationsName || null,
          registrationNumber: comp.registrationNumber || null,
          documentTypeNote: comp.documentTypeNote || null,
          currency: comp.currency || 'INR (₹)',
          status: comp.status,
          licenseTier: comp.licenseTier,
          licenseExpiresAt: new Date(comp.licenseExpiresAt),
          maxUsers: comp.maxUsers,
          approvedBy: comp.approvedBy || null,
          approvedAt: comp.approvedAt ? new Date(comp.approvedAt) : null,
        });
        count++;
      }
      await db.execute(sql`SELECT setval('companies_id_seq', (SELECT COALESCE(MAX(id), 1) FROM companies))`);
    }

    // Customers
    const existingCust = await db.select().from(schema.customers).limit(1);
    if (existingCust.length === 0) {
      for (const c of store.customers) {
        await db.insert(schema.customers).values({
          id: c.id,
          companyId: c.companyId || 1,
          code: c.code,
          name: c.name,
          email: c.email,
          phone: c.phone || null,
          company: c.company || null,
          taxNumber: c.taxNumber || null,
          address: c.address || null,
          creditLimit: String(c.creditLimit),
          outstandingBalance: String(c.outstandingBalance),
          status: c.status,
        });
        count++;
      }
      await db.execute(sql`SELECT setval('customers_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customers))`);
    }

    // Users
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length === 0) {
      for (const u of store.users) {
        await db.insert(schema.users).values({
          id: u.id,
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
      await db.execute(sql`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
    }

    // Products
    const existingProd = await db.select().from(schema.products).limit(1);
    if (existingProd.length === 0) {
      for (const p of store.products) {
        await db.insert(schema.products).values({
          id: p.id,
          companyId: p.companyId || 1,
          sku: p.sku,
          name: p.name,
          description: p.description || null,
          category: p.category,
          unit: p.unit || 'pcs',
          costPrice: String(p.costPrice),
          sellingPrice: String(p.sellingPrice),
          currentStock: p.currentStock,
          minStock: p.minStock,
          maxStock: p.maxStock,
          warehouseLocation: p.warehouseLocation || 'Warehouse Zone A-1',
          barcode: p.barcode || null,
          status: p.status,
        });
        count++;
      }
      await db.execute(sql`SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products))`);
    }

    return {
      success: true,
      message: 'Successfully initialized Neon PostgreSQL schema and verified enterprise data persistence!',
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
