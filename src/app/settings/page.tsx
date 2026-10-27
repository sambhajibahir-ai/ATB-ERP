'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Building2,
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
  Award,
  Ban,
  Calendar,
  Layers,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { AuditLog, User, Company } from '@/lib/mock-data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'neon' | 'companies' | 'users' | 'company' | 'roles' | 'audit'>('companies');

  // Active Session context
  const [currentSession, setCurrentSession] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    companyId: number;
    companyName: string;
    isCompanyAdmin?: boolean;
    isPlatformAdmin?: boolean;
  } | null>(null);

  // Companies Management (Multi-Tenant Platform Governance)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [editLicenseTier, setEditLicenseTier] = useState<Company['licenseTier']>('Enterprise');
  const [editLicenseExpiry, setEditLicenseExpiry] = useState('');
  const [editMaxUsers, setEditMaxUsers] = useState(10);
  const [editCompanyStatus, setEditCompanyStatus] = useState<Company['status']>('Active');

  const [companyFeedbackSuccess, setCompanyFeedbackSuccess] = useState('');
  const [companyFeedbackError, setCompanyFeedbackError] = useState('');
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);

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
  const [operationsName, setOperationsName] = useState('ATB Software Enterprise Operations');
  const [registrationNumber, setRegistrationNumber] = useState('ATB-REG-2026-99');
  const [documentTypeNote, setDocumentTypeNote] = useState('Official Commercial Price Quotation');
  const [taxId, setTaxId] = useState('CIN: U72200MH2026PTC******');
  const [gstin, setGstin] = useState('27AABCU****R1Z*');
  const [companyEmail, setCompanyEmail] = useState('billing@atbsoftware.com');
  const [companyPhone, setCompanyPhone] = useState('+91 20 4129 9000');
  const [companyAddress, setCompanyAddress] = useState('ATB Towers, Wagholi, Pune, Maharashtra 412207');
  const [currency, setCurrency] = useState('INR (₹)');
  const [companySaved, setCompanySaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [companySaveError, setCompanySaveError] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  async function fetchSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setCurrentSession(data.user);
        if (!data.user.isPlatformAdmin) {
          setActiveTab('users');
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCompanies() {
    setIsLoadingCompanies(true);
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data?.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setIsLoadingCompanies(false);
    }
  }

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
    fetchSession();
    fetchCompanies();
    fetchUsers();

    // Check initial connection
    fetch('/api/db/test')
      .then((res) => res.json())
      .then((data) => setTestResult(data))
      .catch(() => {});

    // Load audit logs
    fetch('/api/sales')
      .then(() => {
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

  // Company Platform Actions
  async function handleApproveCompany(company: Company) {
    setCompanyFeedbackError('');
    setCompanyFeedbackSuccess('');
    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          companyId: company.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve company');
      }
      setCompanyFeedbackSuccess(`Company ${company.name} approved! The tenant CEO can now sign in.`);
      fetchCompanies();
      setTimeout(() => setCompanyFeedbackSuccess(''), 4500);
    } catch (err: unknown) {
      const error = err as Error;
      setCompanyFeedbackError(error.message);
    }
  }

  async function handleToggleCompanyStatus(company: Company) {
    setCompanyFeedbackError('');
    setCompanyFeedbackSuccess('');
    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          companyId: company.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update company status');
      }
      setCompanyFeedbackSuccess(`Company ${company.name} status updated to ${data.company.status}.`);
      fetchCompanies();
      setTimeout(() => setCompanyFeedbackSuccess(''), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setCompanyFeedbackError(error.message);
    }
  }

  function openEditLicenseModal(company: Company) {
    setSelectedCompany(company);
    setEditLicenseTier(company.licenseTier);
    setEditLicenseExpiry(company.licenseExpiresAt ? company.licenseExpiresAt.slice(0, 10) : '');
    setEditMaxUsers(company.maxUsers);
    setEditCompanyStatus(company.status);
    setCompanyFeedbackError('');
    setShowEditLicenseModal(true);
  }

  async function handleSaveLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompany) return;
    setIsUpdatingCompany(true);
    setCompanyFeedbackError('');

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_license',
          companyId: selectedCompany.id,
          licenseTier: editLicenseTier,
          licenseExpiresAt: new Date(editLicenseExpiry + 'T23:59:59Z').toISOString(),
          maxUsers: editMaxUsers,
          status: editCompanyStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update company license parameters');
      }

      setCompanyFeedbackSuccess(`License parameters updated for ${selectedCompany.name}.`);
      setShowEditLicenseModal(false);
      fetchCompanies();
      setTimeout(() => setCompanyFeedbackSuccess(''), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setCompanyFeedbackError(error.message);
    } finally {
      setIsUpdatingCompany(false);
    }
  }

  // User Actions
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

      setUserActionSuccess(`Sub-account ${newUserName} provisioned successfully under your company license.`);
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

  function openEditUserModal(user: User) {
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
    if (user.isCompanyAdmin) {
      alert('The primary CEO / Administrator account of a company cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to decommission sub-account access for ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to decommission user');
        return;
      }
      setUserActionSuccess(`Sub-account ${user.name} decommissioned successfully.`);
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

  // Active Company for Tenant
  const myCompany = companies.find((c) => c.id === currentSession?.companyId) || companies[0];

  useEffect(() => {
    if (myCompany) {
      setCompanyName(myCompany.name || '');
      setOperationsName(myCompany.operationsName || `${myCompany.name || 'ATB Software'} Enterprise Operations`);
      setRegistrationNumber(myCompany.registrationNumber || myCompany.code || 'ATB-REG-2026-99');
      setDocumentTypeNote(myCompany.documentTypeNote || 'Official Commercial Price Quotation');
      setTaxId(myCompany.taxId || 'CIN: U72200MH2026PTC******');
      setGstin(myCompany.gstin || '27AABCU****R1Z*');
      setCompanyEmail(myCompany.email || 'billing@atbsoftware.com');
      setCompanyPhone(myCompany.phone || '+91 20 4129 9000');
      setCompanyAddress(myCompany.address || 'ATB Towers, Wagholi, Pune, Maharashtra 412207');
      setCurrency(myCompany.currency || 'INR (₹)');
    }
  }, [companies, currentSession]);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!myCompany) return;
    setIsSavingProfile(true);
    setCompanySaveError('');
    setCompanySaved(false);

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          companyId: myCompany.id,
          name: companyName,
          operationsName,
          registrationNumber,
          documentTypeNote,
          taxId,
          gstin,
          email: companyEmail,
          phone: companyPhone,
          address: companyAddress,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update company profile');
      }

      setCompanySaved(true);
      await fetchCompanies();
      setTimeout(() => setCompanySaved(false), 3500);
    } catch (err: unknown) {
      const error = err as Error;
      setCompanySaveError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise Settings & Platform Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-Tenant Company Licensing, Sub-Account Provisioning, Role Matrices, and Database Management
          </p>
        </div>

        {myCompany && (
          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">{myCompany.name}</span>
              <span className="mx-1.5 text-slate-400">•</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {myCompany.licenseTier} License
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Console Callout Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Looking for Organization & User Management?
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Visit the dedicated Admin Console for 1-click approvals, company registration, sub-account credentials, and subscription renewals.
            </div>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
        >
          <span>Open Admin Console</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap pb-px">
        {/* Company Accounts & Approvals (Visible to Super Admin or all) */}
        <button
          onClick={() => {
            setActiveTab('companies');
            fetchCompanies();
          }}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'companies'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Accounts & Approval</span>
          {companies.filter((c) => c.status === 'Pending').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {companies.filter((c) => c.status === 'Pending').length}
            </span>
          )}
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
          <span>Sub-Accounts & Credentials</span>
        </button>

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

      {/* TAB: Company Accounts & Approval */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Companies</div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{companies.length}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">Enterprise tenants</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Workspaces</div>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {companies.filter((c) => c.status === 'Active').length}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Approved & licensed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Approvals</div>
              <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {companies.filter((c) => c.status === 'Pending').length}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-400">Awaiting admin review</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Tenant Data Isolation</div>
              <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">Strict Row-Level</div>
              <div className="mt-0.5 text-[10px] text-slate-400">Filtered by company_id</div>
            </div>
          </div>

          {/* Feedback banners */}
          {companyFeedbackSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {companyFeedbackSuccess}
              </span>
              <button onClick={() => setCompanyFeedbackSuccess('')} className="p-1 hover:bg-emerald-100 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {companyFeedbackError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                {companyFeedbackError}
              </span>
              <button onClick={() => setCompanyFeedbackError('')} className="p-1 hover:bg-rose-100 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pending Companies Notification Alert */}
          {companies.filter((c) => c.status === 'Pending').length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    New Company Registration Awaiting Approval
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    There are {companies.filter((c) => c.status === 'Pending').length} company workspace(s) awaiting verification. Click &quot;Approve Workspace&quot; below to grant immediate access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Companies Toolbar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies by name, code, email, tax ID..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchCompanies}
                disabled={isLoadingCompanies}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Refresh companies"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCompanies ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Companies Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Company Entity & Code</th>
                    <th className="py-3 px-4">Corporate Contact</th>
                    <th className="py-3 px-4">Tax / GSTIN</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">License Tier & Quota</th>
                    <th className="py-3 px-4">License Valid Until</th>
                    <th className="py-3 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {companies
                    .filter((c) => {
                      const q = companySearch.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        c.code.toLowerCase().includes(q) ||
                        c.email.toLowerCase().includes(q) ||
                        (c.taxId && c.taxId.toLowerCase().includes(q))
                      );
                    })
                    .map((comp) => {
                      const isExpired = new Date(comp.licenseExpiresAt).getTime() < Date.now();
                      const daysLeft = Math.ceil(
                        (new Date(comp.licenseExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );

                      return (
                        <tr key={comp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {comp.code.slice(0, 3)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{comp.name}</span>
                                  {comp.id === 1 && (
                                    <span className="text-[10px] px-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                                      Platform HQ
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">Code: {comp.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 dark:text-slate-200">{comp.email}</div>
                            <div className="text-[11px] text-slate-400">{comp.phone || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-700 dark:text-slate-300">{comp.gstin || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400">{comp.taxId || 'N/A'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {comp.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : comp.status === 'Pending' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pending Review
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {comp.licenseTier}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                ({comp.maxUsers} seats)
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">
                              {new Date(comp.licenseExpiresAt).toLocaleDateString()}
                            </div>
                            <div className={`text-[10px] font-semibold ${isExpired ? 'text-rose-500' : daysLeft < 30 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              {isExpired ? 'License Expired' : `${daysLeft} days remaining`}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {comp.status === 'Pending' && (
                                <button
                                  onClick={() => handleApproveCompany(comp)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                                  title="Approve Company & Grant Access"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}

                              <button
                                onClick={() => openEditLicenseModal(comp)}
                                className="flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                title="Manage License Tier & Expiration Date"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span className="text-[11px] hidden md:inline">License</span>
                              </button>

                              {comp.id !== 1 && (
                                <button
                                  onClick={() => handleToggleCompanyStatus(comp)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    comp.status === 'Active'
                                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                      : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                  }`}
                                  title={comp.status === 'Active' ? 'Suspend Company Access' : 'Reactivate Company'}
                                >
                                  <Ban className="w-3.5 h-3.5" />
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

      {/* TAB: Users & Sub-Accounts Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Company License Quota Banner */}
          {myCompany && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{myCompany.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {myCompany.licenseTier} Plan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    User Seat Quota: <strong>{users.length}</strong> / <strong>{myCompany.maxUsers}</strong> accounts provisioned • License Valid until: <strong>{new Date(myCompany.licenseExpiresAt).toLocaleDateString()}</strong>
                  </p>
                </div>
              </div>

              {users.length >= myCompany.maxUsers && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                  Seat Limit Reached
                </span>
              )}
            </div>
          )}

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
                placeholder="Search team member by name, email, department, role..."
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
                disabled={myCompany && users.length >= myCompany.maxUsers}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-colors disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Sub-Account</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Member Name & Contact</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Access Level</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Last Activity</th>
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
                                  {user.isCompanyAdmin && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                                      Company CEO / Admin
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
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {user.isCompanyAdmin ? 'Company Administrator' : 'Sub-Account Staff'}
                            </span>
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
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditUserModal(user)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                title="Edit Role & Reset Password"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {!user.isCompanyAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Decommission sub-account access"
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

      {/* TAB 1: Neon Database Studio */}
      {activeTab === 'neon' && (
        <div className="space-y-6">
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

              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Live Ping</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Company Profile */}
      {activeTab === 'company' && (
        <div className="space-y-6 max-w-4xl">
          {/* Live Document Header Preview */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Live Quotation & Commercial Invoice Header Preview
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-lg font-black tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                <span>{companyName || 'ATB Software'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                <span className="block font-medium text-slate-700 dark:text-slate-300">
                  {operationsName || `${companyName || 'ATB Software'} Enterprise Operations`}
                </span>
                <span className="block">
                  Registration: <span className="font-mono font-semibold">{registrationNumber || 'ATB-REG-2026-99'}</span> • {companyEmail || 'billing@atbsoftware.com'}
                </span>
                <span className="block text-[11px] text-slate-400">
                  Document Type: {documentTypeNote || 'Official Commercial Price Quotation'}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <form onSubmit={handleSaveCompany} className="space-y-5">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Corporate Document & Quotation Branding
                </h3>
                <p className="text-xs text-slate-500">
                  Configure corporate credentials and identifiers rendered on estimates, quotations, and commercial invoices.
                </p>
              </div>

              {companySaveError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {companySaveError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Legal Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ATB Software"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enterprise Operations / Division Name
                  </label>
                  <input
                    type="text"
                    required
                    value={operationsName}
                    onChange={(e) => setOperationsName(e.target.value)}
                    placeholder="e.g. ATB Software Enterprise Operations"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Registration Number / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. ATB-REG-2026-99"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type Label / Subtitle
                  </label>
                  <input
                    type="text"
                    required
                    value={documentTypeNote}
                    onChange={(e) => setDocumentTypeNote(e.target.value)}
                    placeholder="e.g. Official Commercial Price Quotation"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
                  Billing, Communication & Tax Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Billing & Quotation Contact Email
                    </label>
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="e.g. billing@atbsoftware.com"
                      className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Contact Phone
                    </label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="e.g. +91 20 4129 9000"
                      className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CIN / Corporate Identity Number
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="e.g. CIN: U72200MH2026PTC******"
                      className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      placeholder="e.g. 27AABCU****R1Z*"
                      className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Default Currency
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="e.g. INR (₹)"
                      className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Corporate Address
                  </label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="e.g. ATB Towers, Wagholi, Pune, Maharashtra 412207"
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                {companySaved && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Company profile saved & updated across all documents!</span>
                  </span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? 'Saving Profile...' : 'Save Profile'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
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
                  <th className="py-3 px-4">Sub-Accounts Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { role: 'Company CEO (Admin)', perms: [true, true, true, true, true, true, true] },
                  { role: 'Chief Financial Officer', perms: [true, true, false, true, true, false, false] },
                  { role: 'Supply Chain Director', perms: [true, false, true, true, false, false, false] },
                  { role: 'Commercial Sales Lead', perms: [true, true, false, false, false, false, false] },
                  { role: 'People Operations Lead', perms: [true, false, false, false, false, true, false] },
                ].map((r) => (
                  <tr key={r.role}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.role}</td>
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
                  <span className="font-bold text-slate-900 dark:text-white">{log.actor}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {log.module}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{log.details}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Company License Modal */}
      {showEditLicenseModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 border border-blue-200 dark:border-blue-900">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Manage Enterprise License
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                    {selectedCompany.name} ({selectedCompany.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditLicenseModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLicense} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    License Tier
                  </label>
                  <select
                    value={editLicenseTier}
                    onChange={(e) => setEditLicenseTier(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Trial">Trial (Free 30 Days)</option>
                    <option value="Starter">Starter (5 Seats)</option>
                    <option value="Growth">Growth (20 Seats)</option>
                    <option value="Enterprise">Enterprise (50+ Seats)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max User Seats
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={editMaxUsers}
                    onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                    className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  License Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={editLicenseExpiry}
                  onChange={(e) => setEditLicenseExpiry(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Account Status
                </label>
                <select
                  value={editCompanyStatus}
                  onChange={(e) => setEditCompanyStatus(e.target.value as any)}
                  className="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active (Authorized)</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Suspended">Suspended (Access Blocked)</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {companyFeedbackError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {companyFeedbackError}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditLicenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCompany}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingCompany ? 'Saving...' : 'Save License'}</span>
                </button>
              </div>
            </form>
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
                    Provision Team Sub-Account
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Creates authenticated staff login under {myCompany?.name || 'your company'}
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
                  placeholder="e.g. ramesh.patel@company.com"
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
                    <option value="Finance">Finance (CFO / Invoices)</option>
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
                  <span>{isSubmittingUser ? 'Provisioning...' : 'Provision Sub-Account'}</span>
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
                    Update Sub-Account Credentials
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
                    {selectedUser.isCompanyAdmin && <option value="Admin">Admin (CEO)</option>}
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
