'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Server,
  Shield,
  Building,
  Key,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';
import { AuditLog } from '@/lib/mock-data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'neon' | 'company' | 'roles' | 'audit'>('neon');

  // Neon DB state
  const [connectionString, setConnectionString] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    connected?: boolean;
    message?: string;
    latencyMs?: number;
    databaseName?: string;
  } | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success?: boolean;
    message?: string;
    rowsInserted?: number;
  } | null>(null);

  // Company Profile State
  const [companyName, setCompanyName] = useState('ATB Software');
  const [taxId, setTaxId] = useState('ATB-REG-2026-99');
  const [currency, setCurrency] = useState('INR (₹)');
  const [fiscalYear, setFiscalYear] = useState('April 1 - March 31');
  const [companySaved, setCompanySaved] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // Check initial connection
    fetch('/api/db/test')
      .then((res) => res.json())
      .then((data) => setTestResult(data))
      .catch(() => {});

    // Load audit logs
    fetch('/api/sales')
      .then(() => {
        // mock audit logs
        const defaultLogs: AuditLog[] = [
          {
            id: 1,
            actor: 'Aarav Mehta (CEO)',
            action: 'Approved Sales Order',
            module: 'Sales & CRM',
            details: 'Approved SO-2026-0089 for Sharma Infotech Solutions (₹36,580.00)',
            createdAt: '2026-03-01T10:30:00Z',
          },
          {
            id: 2,
            actor: 'Ananya Iyer (CFO)',
            action: 'Recorded Payment',
            module: 'Finance & Accounts',
            details: 'Reconciled wire transfer WT-882910 of ₹36,580.00 against INV-2026-0045',
            createdAt: '2026-03-01T12:05:00Z',
          },
          {
            id: 3,
            actor: 'Sneha Kulkarni (Supply Chain)',
            action: 'Dispatched Goods',
            module: 'Inventory',
            details: 'Marked 4x ELC-SRV-900 and 1x NET-SW-100G as dispatched via express freight',
            createdAt: '2026-03-04T15:20:00Z',
          },
          {
            id: 4,
            actor: 'System Automation',
            action: 'Low Stock Alert Triggered',
            module: 'Inventory',
            details: 'Telemetry Sensor Suite (ELC-SEN-401) reached 6 units (below min 15)',
            createdAt: '2026-03-12T16:05:00Z',
          },
        ];
        setAuditLogs(defaultLogs);
      });
  }, []);

  async function handleTestConnection(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/db/test', {
        method: connectionString ? 'POST' : 'GET',
        headers: connectionString ? { 'Content-Type': 'application/json' } : undefined,
        body: connectionString ? JSON.stringify({ connectionString }) : undefined,
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: unknown) {
      const error = err as Error;
      setTestResult({
        connected: false,
        message: `Failed to ping database: ${error.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSeedDatabase() {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      const data = await res.json();
      setSeedResult(data);
    } catch (err: unknown) {
      const error = err as Error;
      setSeedResult({
        success: false,
        message: `Seed error: ${error.message}`,
      });
    } finally {
      setIsSeeding(false);
    }
  }

  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2500);
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Neon DB Connector
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure Neon PostgreSQL serverless database, company identity, role permissions, and system audits
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap pb-px">
        <button
          onClick={() => setActiveTab('neon')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'neon'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Neon PostgreSQL Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'company'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'roles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>System Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: Neon Database Studio */}
      {activeTab === 'neon' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-2xl border ${
                    testResult?.connected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-600'
                      : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900 text-amber-600'
                  }`}
                >
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {testResult?.connected
                        ? 'Neon PostgreSQL Connected'
                        : 'Local In-Memory Enterprise Store Active'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        testResult?.connected
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {testResult?.connected ? 'LIVE SERVERLESS' : 'OFFLINE / DEMO'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                    {testResult?.message ||
                      'The system is currently running on the high-fidelity preloaded in-memory store. Connect your Neon PostgreSQL serverless database URL below to enable persistence.'}
                  </p>
                  {testResult?.latencyMs && (
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span>Server Latency: <strong className="text-emerald-600">{testResult.latencyMs}ms</strong></span>
                      <span>•</span>
                      <span>Target DB: <strong className="text-slate-800 dark:text-slate-200">{testResult.databaseName || 'neondb'}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleTestConnection()}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>Re-test Connection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test / Configure Neon Connection String */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Configure Live Neon PostgreSQL URL</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  @neondatabase/serverless + Drizzle ORM
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Paste your pooled or direct Neon connection string. It is read from your project’s{' '}
                <code className="text-blue-600 dark:text-blue-400 font-mono">.env.local</code> file as{' '}
                <code className="text-blue-600 dark:text-blue-400 font-mono">DATABASE_URL</code>.
              </p>
            </div>

            <form onSubmit={handleTestConnection} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    placeholder="postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/neondb?sslmode=require"
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTesting || !connectionString}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors shrink-0"
                >
                  {isTesting ? 'Verifying...' : 'Validate Connection'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>Don’t have a database yet? Create a free serverless PostgreSQL database at Neon:</span>
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>neon.tech</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </form>
          </div>

          {/* Database Setup & Seeding Action Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Database Migrations & Seed Center
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  1-Click push DDL schema tables and initialize with realistic enterprise catalog, sales, suppliers, and ledger data.
                </p>
              </div>

              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-500/20 disabled:opacity-50 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Seeding Tables...' : 'Seed Neon Database'}</span>
              </button>
            </div>

            {seedResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  seedResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="font-semibold">{seedResult.message}</div>
                {seedResult.rowsInserted !== undefined && (
                  <div className="mt-1 text-[11px] opacity-90">
                    Inserted {seedResult.rowsInserted} initial corporate records across inventory and CRM.
                  </div>
                )}
              </div>
            )}

            {/* Drizzle Schema Tables Summary */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registered Enterprise Schema Tables (13 Entities)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
                {[
                  { table: 'users', desc: 'Team & RBAC' },
                  { table: 'customers', desc: 'CRM Accounts' },
                  { table: 'suppliers', desc: 'Approved Vendors' },
                  { table: 'products', desc: 'SKUs & Inventory' },
                  { table: 'quotations', desc: 'Price Estimates & Quotes' },
                  { table: 'sales_orders', desc: 'Client Orders' },
                  { table: 'purchase_orders', desc: 'Procurement' },
                  { table: 'invoices', desc: 'Commercial Billing' },
                  { table: 'inventory_transactions', desc: 'Stock Ledger' },
                  { table: 'financial_transactions', desc: 'General Ledger' },
                  { table: 'employees', desc: 'Staff Directory' },
                  { table: 'work_orders', desc: 'Manufacturing' },
                  { table: 'audit_logs', desc: 'Audit Trail' },
                ].map((item) => (
                  <div
                    key={item.table}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                  >
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.table}
                    </div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Company Profile */}
      {activeTab === 'company' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs max-w-2xl">
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Tax Identification / EIN
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Accounting Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                  <option value="USD ($)">USD - US Dollar ($)</option>
                  <option value="EUR (€)">EUR - Euro (€)</option>
                  <option value="GBP (£)">GBP - British Pound (£)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fiscal Financial Year Period
              </label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              {companySaved && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Company profile saved successfully!</span>
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Role Permissions Matrix */}
      {activeTab === 'roles' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Executive Dashboard</th>
                <th className="py-3 px-4">Sales & CRM</th>
                <th className="py-3 px-4">Inventory & Warehouse</th>
                <th className="py-3 px-4">Purchasing</th>
                <th className="py-3 px-4">Finance & Ledger</th>
                <th className="py-3 px-4">HR & Payroll</th>
                <th className="py-3 px-4">System Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { role: 'System Admin (CEO)', perms: [true, true, true, true, true, true, true] },
                { role: 'Chief Financial Officer', perms: [true, true, false, true, true, false, false] },
                { role: 'Supply Chain Director', perms: [true, false, true, true, false, false, false] },
                { role: 'Sales Account Director', perms: [true, true, false, false, false, false, false] },
                { role: 'People Operations Lead', perms: [true, false, false, false, false, true, false] },
              ].map((r) => (
                <tr key={r.role}>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {r.role}
                  </td>
                  {r.perms.map((p, idx) => (
                    <td key={idx} className="py-3.5 px-4">
                      {p ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          Full Access
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-slate-400">
                          Restricted
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* TAB 4: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.actor}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {log.module}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {log.details}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

