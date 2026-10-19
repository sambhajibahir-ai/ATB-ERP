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
  UserPlus,
  Trash2,
  Edit3,
  Lock,
  UserCheck,
  X,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AuditLog, User } from '@/lib/mock-data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'neon' | 'users' | 'company' | 'roles' | 'audit'>('neon');

  // Users Management state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Finance' | 'Inventory' | 'Sales' | 'HR' | 'Operations'>('Sales');
  const [newUserDept, setNewUserDept] = useState('Sales & Client Relations');

  // Edit / Reset password form state
  const [editRole, setEditRole] = useState<'Admin' | 'Finance' | 'Inventory' | 'Sales' | 'HR' | 'Operations'>('Admin');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended'>('Active');
  const [newPasswordReset, setNewPasswordReset] = useState('');

  const [userActionError, setUserActionError] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  async function fetchUsers() {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data?.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    // Check initial connection
    fetch('/api/db/test')
      .then((res) => res.json())
      .then((data) => setTestResult(data))
      .catch(() => {});

    // Fetch initial users
    fetchUsers();

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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setUserActionError('');
    setUserActionSuccess('');
    setIsSubmittingUser(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          department: newUserDept,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserActionError(data.error || 'Failed to create user');
        return;
      }

      setUserActionSuccess(`User ${newUserName} created successfully.`);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsers();
      setTimeout(() => setUserActionSuccess(''), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setUserActionError(error.message || 'Network error creating user');
    } finally {
      setIsSubmittingUser(false);
    }
  }

  function openEditModal(user: User) {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditDept(user.department);
    setEditStatus(user.status);
    setNewPasswordReset('');
    setUserActionError('');
    setShowEditUserModal(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setUserActionError('');
    setUserActionSuccess('');
    setIsSubmittingUser(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          name: selectedUser.name,
          role: editRole,
          department: editDept,
          status: editStatus,
          password: newPasswordReset.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserActionError(data.error || 'Failed to update user');
        return;
      }

      setUserActionSuccess(`User ${selectedUser.name} credentials updated successfully.`);
      setShowEditUserModal(false);
      fetchUsers();
      setTimeout(() => setUserActionSuccess(''), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setUserActionError(error.message || 'Network error updating user');
    } finally {
      setIsSubmittingUser(false);
    }
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`Are you sure you want to decommission access for ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to decommission user');
        return;
      }
      setUserActionSuccess(`User ${user.name} decommissioned successfully.`);
      fetchUsers();
      setTimeout(() => setUserActionSuccess(''), 4000);
    } catch {
      alert('Network error decommissioning user');
    }
  }

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
          onClick={() => {
            setActiveTab('users');
            fetchUsers();
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Users & Credentials</span>
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

      {/* TAB: Users & Credentials */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Accounts</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{users.length}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">Corporate directory</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Personnel</div>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {users.filter((u) => u.status === 'Active').length}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Authorized personnel</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">Security Standard</div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">PBKDF2-SHA512</div>
              <div className="mt-0.5 text-[10px] text-slate-400">10,000 salt iterations</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Session Protocol</div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">HMAC-SHA256</div>
              <div className="mt-0.5 text-[10px] text-slate-400">HttpOnly signed token</div>
            </div>
          </div>

          {/* Feedback alerts */}
          {userActionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {userActionSuccess}
              </span>
              <button onClick={() => setUserActionSuccess('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {userActionError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                {userActionError}
              </span>
              <button onClick={() => setUserActionError('')} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by name, email, department, role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchUsers}
                disabled={isLoadingUsers}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Refresh user directory"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setUserActionError('');
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User & Contact</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.role.toLowerCase().includes(q) ||
                        u.department.toLowerCase().includes(q)
                      );
                    })
                    .map((user) => {
                      const roleColors: Record<string, string> = {
                        Admin: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                        Finance: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                        Inventory: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                        Sales: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                        HR: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                        Operations: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                      };

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {user.id === 1 && (
                                    <span className="text-[10px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                roleColors[user.role] || roleColors.Operations
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {user.department}
                          </td>
                          <td className="py-3.5 px-4">
                            {user.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Active Session'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                title="Edit Role & Reset Password"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {user.id !== 1 && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Decommission user access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-900">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Provision New User Account
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates authenticated login credentials with PBKDF2 hashing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.patel@atbsoftware.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter secure password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-3 pr-10 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role *
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Finance">Finance (CFO / Ledgers)</option>
                    <option value="Inventory">Inventory (Warehouse)</option>
                    <option value="Sales">Sales (CRM / Orders)</option>
                    <option value="HR">HR (People / Payroll)</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {userActionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {userActionError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmittingUser ? 'Provisioning...' : 'Provision User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User & Reset Password Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-900">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Update User Credentials & Role
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                    {selectedUser.name} ({selectedUser.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Finance">Finance</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reset Password (PBKDF2)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep existing password"
                    value={newPasswordReset}
                    onChange={(e) => setNewPasswordReset(e.target.value)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-3 pr-10 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Password will be hashed using PBKDF2 (10,000 rounds) before being saved.
                </p>
              </div>

              {userActionError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {userActionError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmittingUser ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

