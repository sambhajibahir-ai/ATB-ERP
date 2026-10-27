'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Edit3,
  Trash2,
  Key,
  KeyRound,
  RefreshCw,
  Clock,
  X,
  Check,
  Layers,
  Lock,
  Calendar,
  Award,
  Ban,
  Database,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  Copy,
  Shield,
  ShieldOff,
  FileText,
} from 'lucide-react';
import { Company, User, AuditLog } from '@/lib/mock-data';

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'companies' | 'logins' | 'subscriptions' | 'audit'>('logins');

  // Session context
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

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<'ALL' | 'Active' | 'Pending' | 'Suspended'>('ALL');

  // Register Company Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompCode, setNewCompCode] = useState('');
  const [newCompEmail, setNewCompEmail] = useState('');
  const [newCompPhone, setNewCompPhone] = useState('');
  const [newCompTaxId, setNewCompTaxId] = useState('');
  const [newCompGstin, setNewCompGstin] = useState('');
  const [newCompAddress, setNewCompAddress] = useState('');
  const [newCompTier, setNewCompTier] = useState<Company['licenseTier']>('Growth');
  const [newCompDays, setNewCompDays] = useState(365);
  const [newCompMaxUsers, setNewCompMaxUsers] = useState(15);
  const [newCeoName, setNewCeoName] = useState('');
  const [newCeoEmail, setNewCeoEmail] = useState('');
  const [newCeoPassword, setNewCeoPassword] = useState('');

  // Edit License Modal
  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editTier, setEditTier] = useState<Company['licenseTier']>('Growth');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editMaxUsers, setEditMaxUsers] = useState(10);
  const [editStatus, setEditStatus] = useState<Company['status']>('Active');

  // Feedback notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Logins Directory state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('all');
  const [loginStatusFilter, setLoginStatusFilter] = useState<'ALL' | 'Active' | 'Suspended'>('ALL');
  const [loginRoleFilter, setLoginRoleFilter] = useState<string>('ALL');

  // Provision Sub-Account Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Finance' | 'Inventory' | 'Sales' | 'HR' | 'Operations'>('Sales');
  const [newUserDept, setNewUserDept] = useState('Sales & Client Relations');
  const [newUserTargetCompanyId, setNewUserTargetCompanyId] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);

  // Edit User Profile Modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserRole, setEditUserRole] = useState<'Admin' | 'Finance' | 'Inventory' | 'Sales' | 'HR' | 'Operations'>('Admin');
  const [editUserDept, setEditUserDept] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'Active' | 'Suspended'>('Active');
  const [resetUserPassword, setResetUserPassword] = useState('');

  // Quick Reset Password Modal for Super Admin
  const [showQuickResetModal, setShowQuickResetModal] = useState(false);
  const [targetUserForReset, setTargetUserForReset] = useState<User | null>(null);
  const [directNewPassword, setDirectNewPassword] = useState('');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setCurrentSession(data.user);
        setNewUserTargetCompanyId(data.user.companyId || 1);
        loadCompanies();
        loadUsers(data.user.isPlatformAdmin);
        loadAuditLogs();
      }
    } catch {
      // Fallback
    }
  }

  async function loadCompanies() {
    try {
      setIsLoadingCompanies(true);
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data?.companies) {
        setCompanies(data.companies);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsLoadingCompanies(false);
    }
  }

  async function loadUsers(isSuperAdmin = true) {
    try {
      setIsLoadingUsers(true);
      const url = isSuperAdmin ? '/api/users?companyId=all' : '/api/users';
      const res = await fetch(url);
      const data = await res.json();
      if (data?.users) {
        setUsers(data.users);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function loadAuditLogs() {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data?.logs) {
        setAuditLogs(data.logs);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoadingLogs(false);
    }
  }

  function clearAlerts() {
    setFeedbackSuccess('');
    setFeedbackError('');
  }

  // --- Company Actions ---

  async function handleApproveCompany(companyId: number) {
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', companyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve company');

      setFeedbackSuccess(data.message || 'Company approved successfully!');
      loadCompanies();
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleCompanyStatus(companyId: number) {
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', companyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle company status');

      setFeedbackSuccess(data.message);
      loadCompanies();
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExtendLicense(companyId: number, additionalDays: number) {
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend_license', companyId, additionalDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extend license');

      setFeedbackSuccess(data.message);
      loadCompanies();
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterCompany(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompName,
          code: newCompCode,
          email: newCompEmail,
          phone: newCompPhone,
          taxId: newCompTaxId,
          gstin: newCompGstin,
          address: newCompAddress,
          licenseTier: newCompTier,
          licenseDays: newCompDays,
          maxUsers: newCompMaxUsers,
          adminName: newCeoName,
          adminEmail: newCeoEmail,
          adminPassword: newCeoPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register company');

      setFeedbackSuccess(data.message);
      setShowRegisterModal(false);
      // Reset form
      setNewCompName('');
      setNewCompCode('');
      setNewCompEmail('');
      setNewCompPhone('');
      setNewCompTaxId('');
      setNewCompGstin('');
      setNewCompAddress('');
      setNewCeoName('');
      setNewCeoEmail('');
      setNewCeoPassword('');
      loadCompanies();
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditLicense(company: Company) {
    setSelectedCompany(company);
    setEditTier(company.licenseTier);
    setEditExpiryDate(company.licenseExpiresAt.slice(0, 10));
    setEditMaxUsers(company.maxUsers);
    setEditStatus(company.status);
    setShowEditLicenseModal(true);
  }

  async function handleSaveLicenseChanges(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCompany) return;
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_license',
          companyId: selectedCompany.id,
          licenseTier: editTier,
          licenseExpiresAt: new Date(editExpiryDate).toISOString(),
          maxUsers: editMaxUsers,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update license parameters');

      setFeedbackSuccess(data.message);
      setShowEditLicenseModal(false);
      loadCompanies();
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCompany(companyId: number, companyName: string) {
    if (
      !confirm(
        `Are you sure you want to permanently decommission ${companyName}? All associated tenant data, user logins, and transactions will be removed.`
      )
    ) {
      return;
    }
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/companies?id=${companyId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete company');

      setFeedbackSuccess(data.message);
      loadCompanies();
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- User Logins Management Actions ---

  function openQuickReset(user: User) {
    setTargetUserForReset(user);
    const generated = `Pass#${Math.floor(1000 + Math.random() * 9000)}!`;
    setDirectNewPassword(generated);
    setCopiedToClipboard(false);
    setShowQuickResetModal(true);
  }

  function generateNewRandomPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = 'Pass#';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += '!';
    setDirectNewPassword(res);
    setCopiedToClipboard(false);
  }

  async function handleApplyDirectPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUserForReset) return;
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetUserForReset.id,
          action: 'reset_password',
          password: directNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setFeedbackSuccess(
        `Login credentials reset for ${targetUserForReset.email}! New Password: ${directNewPassword}`
      );
      setShowQuickResetModal(false);
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleUserStatus(userId: number, currentStatus: string, email: string) {
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          action: 'toggle_status',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user login status');

      setFeedbackSuccess(
        `Login access for ${email} set to ${currentStatus === 'Active' ? 'Suspended' : 'Active'}`
      );
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          department: newUserDept,
          companyId: newUserTargetCompanyId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create login account');

      setFeedbackSuccess(`Login account for ${data.user.name} (${data.user.email}) successfully provisioned!`);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditUser(user: User) {
    setSelectedUser(user);
    setEditUserRole(user.role);
    setEditUserDept(user.department);
    setEditUserStatus(user.status);
    setResetUserPassword('');
    setShowEditUserModal(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          role: editUserRole,
          department: editUserDept,
          status: editUserStatus,
          password: resetUserPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user profile');

      setFeedbackSuccess(`Profile and login credentials for ${data.user.name} updated successfully!`);
      setShowEditUserModal(false);
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteUser(userId: number, userName: string, isCeo = false) {
    const confirmMsg = isCeo
      ? `WARNING: You are about to permanently DELETE the primary CEO / Admin account for "${userName}"!\n\nAll company data, financial records, and staff logins will remain, but this CEO login will be permanently deleted. Are you sure you want to proceed?`
      : `Are you sure you want to permanently delete the login credentials for "${userName}"?`;

    if (!confirm(confirmMsg)) {
      return;
    }
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete login credentials');

      setFeedbackSuccess(data.message);
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelCompanyLicense(companyId: number, companyName: string) {
    if (
      !confirm(
        `Are you sure you want to CANCEL the subscription license for "${companyName}"?\n\nThis will immediately expire the license, suspend company access, and block all user logins for this organization.`
      )
    ) {
      return;
    }
    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_license', companyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription license');

      setFeedbackSuccess(data.message);
      setShowEditLicenseModal(false);
      loadCompanies();
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelUserLicense(userId: number, userName: string, companyName: string, isCeo: boolean) {
    const confirmMsg = isCeo
      ? `Are you sure you want to CANCEL the subscription license for CEO "${userName}" (${companyName})?\n\nThis will revoke the organization's enterprise subscription and suspend workspace logins for all users.`
      : `Are you sure you want to CANCEL the subscription seat license and suspend access for "${userName}" (${companyName})?`;

    if (!confirm(confirmMsg)) return;

    clearAlerts();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, action: 'cancel_license' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel subscription license');

      setFeedbackSuccess(data.message);
      loadCompanies();
      loadUsers(currentSession?.isPlatformAdmin);
      loadAuditLogs();
    } catch (err: unknown) {
      const error = err as Error;
      setFeedbackError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtered Companies
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.email.toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.gstin && c.gstin.toLowerCase().includes(companySearch.toLowerCase()));

    const matchesStatus =
      companyStatusFilter === 'ALL' || c.status === companyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered Users for Logins Management
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase());

    const matchesCompany =
      selectedCompanyFilter === 'all' || u.companyId === Number(selectedCompanyFilter);

    const matchesStatus =
      loginStatusFilter === 'ALL' || u.status === loginStatusFilter;

    const matchesRole =
      loginRoleFilter === 'ALL' || u.role === loginRoleFilter;

    return matchesSearch && matchesCompany && matchesStatus && matchesRole;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      l.actor.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.details.toLowerCase().includes(term) ||
      l.module.toLowerCase().includes(term)
    );
  });

  // Stats
  const pendingApprovalsCount = companies.filter((c) => c.status === 'Pending').length;
  const activeCompaniesCount = companies.filter((c) => c.status === 'Active').length;
  const totalUsersCount = users.length;
  const activeLoginsCount = users.filter((u) => u.status === 'Active').length;
  const suspendedLoginsCount = users.filter((u) => u.status === 'Suspended').length;

  const isSuperAdmin = !!currentSession?.isPlatformAdmin;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Platform Administration & Security Master
                  </h1>
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Private Super Admin Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-Tenant Company Governance, Private User Login Controls, and Master Credential Auditing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                loadCompanies();
                loadUsers(isSuperAdmin);
                loadAuditLogs();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-500/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Register Organization
              </button>
            )}

            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Provision Login Account
            </button>
          </div>
        </div>

        {/* Private Super Admin Authority Callout Banner */}
        {isSuperAdmin && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-950/40 border border-purple-500/40 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/30 shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Private Super Admin Session Active</span>
                  <span className="font-mono text-[11px] text-purple-300">({currentSession?.email})</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    ATB Software
                  </span>
                </div>
                <div className="text-[11px] text-purple-300/80 mt-0.5">
                  Master authority to manage, suspend, delete, or cancel subscription licenses of any company account (CEO or staff).
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('logins')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Manage All Logins
              </button>
            </div>
          </div>
        )}

        {/* Feedback Alert Banners */}
        {feedbackSuccess && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{feedbackSuccess}</span>
            </div>
            <button onClick={() => setFeedbackSuccess('')} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {feedbackError && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{feedbackError}</span>
            </div>
            <button onClick={() => setFeedbackError('')} className="p-1 hover:opacity-75">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Governance Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total User Logins</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {totalUsersCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {activeLoginsCount} Active • {suspendedLoginsCount} Suspended
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tenant Companies</span>
              <Building2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {activeCompaniesCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {companies.length} Total Tenant Workspaces
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Approvals</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingApprovalsCount}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {pendingApprovalsCount > 0 ? 'Requires Super Admin verification' : 'All accounts approved'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Security Audit Logs</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {auditLogs.length}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Authentication & Security events logged
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('logins')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'logins'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            User Logins & Security Master
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {filteredUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'companies'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Organizations & Approvals
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'subscriptions'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Subscriptions & Licensing
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Login & Security Audit Trail
          </button>
        </div>

        {/* TAB 1: USER LOGINS & SECURITY MASTER */}
        {activeTab === 'logins' && (
          <div className="space-y-4">
            {/* Filter and Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>

                {/* Company filter */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedCompanyFilter}
                      onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                      className="py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                    >
                      <option value="all">All Organizations ({users.length})</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({users.filter((u) => u.companyId === c.id).length})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Status filter */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                  {(['ALL', 'Active', 'Suspended'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setLoginStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        loginStatusFilter === st
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add User Login
              </button>
            </div>

            {/* User Logins Master Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">User Login Profile</th>
                      <th className="py-3 px-4">Account Type & Authority</th>
                      <th className="py-3 px-4">Assigned Company</th>
                      <th className="py-3 px-4">Role & Department</th>
                      <th className="py-3 px-4">Login Status</th>
                      <th className="py-3 px-4">Last Activity</th>
                      <th className="py-3 px-4 text-right">Login Security Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredUsers.map((user) => {
                      const userComp = companies.find((c) => c.id === user.companyId);
                      const isCurrentUser = currentSession?.id === user.id;

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                                  user.isPlatformAdmin
                                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                                    : user.isCompanyAdmin
                                    ? 'bg-gradient-to-tr from-indigo-600 to-blue-600'
                                    : 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                                }`}
                              >
                                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {user.isPlatformAdmin ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <Shield className="w-3 h-3 text-purple-600" />
                                Super Admin (Master)
                              </span>
                            ) : user.isCompanyAdmin ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                <Award className="w-3 h-3 text-indigo-600" />
                                Company CEO / Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                Staff Account
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {userComp?.name || `Company #${user.companyId}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Code: {userComp?.code || 'CORP'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                              {user.role}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {user.department}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {user.status === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Active Login
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Suspended / Locked
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-slate-700 dark:text-slate-300">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never Logged In'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending activation'}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Password Reset */}
                              <button
                                onClick={() => openQuickReset(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                                title="Reset User Password"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>

                              {/* Toggle Status (Lock/Unlock) */}
                              {!user.isPlatformAdmin && (
                                <button
                                  onClick={() => handleToggleUserStatus(user.id, user.status, user.email)}
                                  disabled={isSubmitting}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    user.status === 'Active'
                                      ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                                      : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                  }`}
                                  title={user.status === 'Active' ? (user.isCompanyAdmin ? 'Suspend CEO Login Access' : 'Suspend Login Access') : 'Unlock Login Access'}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Cancel Subscription License */}
                              {!user.isPlatformAdmin && (
                                <button
                                  onClick={() => handleCancelUserLicense(user.id, user.name, userComp?.name || `Company #${user.companyId}`, !!user.isCompanyAdmin)}
                                  disabled={isSubmitting}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                                  title={user.isCompanyAdmin ? "Cancel Company Subscription License" : "Cancel User Seat License"}
                                >
                                  <ShieldOff className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit Profile */}
                              <button
                                onClick={() => openEditUser(user)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Edit Role & Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Decommission Account (CEO or any staff) */}
                              {!user.isPlatformAdmin && (isSuperAdmin || !user.isCompanyAdmin) && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name, !!user.isCompanyAdmin)}
                                  disabled={isSubmitting}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-colors"
                                  title={user.isCompanyAdmin ? "Permanently Delete CEO Account" : "Decommission Login Account"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No user logins found matching your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY ACCOUNTS & APPROVALS */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by company name, GSTIN, code..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-[11px] text-slate-400 font-medium px-2">Status:</span>
                {(['ALL', 'Active', 'Pending', 'Suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setCompanyStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      companyStatusFilter === st
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Companies Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Company Organization</th>
                      <th className="py-3 px-4">Identifier / GSTIN</th>
                      <th className="py-3 px-4">Status & Approval</th>
                      <th className="py-3 px-4">Plan & Seat Quota</th>
                      <th className="py-3 px-4">License Expiry</th>
                      <th className="py-3 px-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredCompanies.map((company) => {
                      const expiryDays = Math.ceil(
                        (new Date(company.licenseExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                      );
                      const isExpired = expiryDays < 0;

                      return (
                        <tr key={company.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                                {company.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{company.name}</span>
                                  {company.id === 1 && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                      Root Host
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                                  {company.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                              {company.code}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {company.gstin || company.taxId || 'GSTIN Not Registered'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {company.status === 'Active' ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </div>
                            ) : company.status === 'Pending' ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Pending Approval
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </div>
                            )}

                            {company.approvedBy && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                By {company.approvedBy}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {company.licenseTier} Tier
                            </span>
                            <div className="text-[11px] text-slate-400">
                              Max {company.maxUsers} Users
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className={`font-semibold ${isExpired ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                              {new Date(company.licenseExpiresAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isExpired ? 'Expired' : `${expiryDays} days remaining`}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {company.status === 'Pending' && (
                                <button
                                  onClick={() => handleApproveCompany(company.id)}
                                  disabled={isSubmitting}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                                  title="Approve Company Registration"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                              )}

                              <button
                                onClick={() => openEditLicense(company)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="Edit License & Seats"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleExtendLicense(company.id, 30)}
                                disabled={isSubmitting}
                                className="px-2 py-1 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-semibold transition-colors"
                                title="Renew License for +30 Days"
                              >
                                +30d
                              </button>

                              {company.id !== 1 && (
                                <>
                                  <button
                                    onClick={() => handleCancelCompanyLicense(company.id, company.name)}
                                    disabled={isSubmitting}
                                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                                    title="Cancel & Revoke Subscription License"
                                  >
                                    <ShieldOff className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleToggleCompanyStatus(company.id)}
                                    disabled={isSubmitting}
                                    className={`p-1.5 rounded-lg border transition-colors ${
                                      company.status === 'Active'
                                        ? 'border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                                        : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                    }`}
                                    title={company.status === 'Active' ? 'Suspend Company' : 'Reactivate Company'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteCompany(company.id, company.name)}
                                    disabled={isSubmitting}
                                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-colors"
                                    title="Decommission Tenant Workspace"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No company organizations found matching the search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTIONS & LICENSING */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Plan Tier Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Trial Tier</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">Free <span className="text-xs font-normal text-slate-400">/ 30 Days</span></div>
                <div className="text-xs text-slate-500 mt-2">Up to 3 Seats. Essential Sales and Product Catalog access.</div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 3 Team Accounts</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Invoicing & Quotations</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic Inventory</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-xs relative">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Small Business</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Starter Tier</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">₹9,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <div className="text-xs text-slate-500 mt-2">Up to 5 Seats. Core ERP for growing operations.</div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5 Team Accounts</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Sales Orders & Invoicing</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Multi-Tax GSTIN Engine</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-500/10 via-white dark:via-slate-900 to-white dark:to-slate-900 border-2 border-purple-500 shadow-md relative">
                <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Expanding Firm</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Growth Tier</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">₹24,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <div className="text-xs text-slate-500 mt-2">Up to 20 Seats. Full Purchasing, Inventory & Finance.</div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 20 Team Accounts</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Full Purchasing Workflow</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Dual File & Neon Database</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Custom Scale</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Enterprise Tier</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">₹49,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <div className="text-xs text-slate-500 mt-2">50+ Seats. Dedicated tenant isolation & custom SLA.</div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 50+ Custom Seat Quota</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Full HR & Operations Module</div>
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 24/7 Priority Support</div>
                </div>
              </div>
            </div>

            {/* Organizations Subscription Quotas */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Active Tenant Subscriptions & Seat Utilization
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companies.map((company) => {
                  const companyUsers = users.filter((u) => u.companyId === company.id);
                  const seatPercentage = Math.min(100, Math.round((companyUsers.length / company.maxUsers) * 100));
                  const expiryDays = Math.ceil(
                    (new Date(company.licenseExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isExpiring = expiryDays <= 30;

                  return (
                    <div
                      key={company.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{company.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              {company.licenseTier}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500">{company.email}</div>
                        </div>

                        <div className="text-right">
                          <div className={`text-xs font-bold ${isExpiring ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {new Date(company.licenseExpiresAt).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {expiryDays < 0 ? 'Expired' : `${expiryDays} days remaining`}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                          <span>Seat Utilization</span>
                          <span>
                            {companyUsers.length} / {company.maxUsers} Users ({seatPercentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              seatPercentage >= 90
                                ? 'bg-rose-500'
                                : seatPercentage >= 70
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${seatPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick 1-click renewal actions */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">Quick Actions:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {company.id !== 1 && (
                            <button
                              onClick={() => handleCancelCompanyLicense(company.id, company.name)}
                              disabled={isSubmitting}
                              className="px-2 py-1 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1"
                              title="Cancel & Revoke Subscription License"
                            >
                              <ShieldOff className="w-3 h-3" />
                              <span>Cancel License</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleExtendLicense(company.id, 30)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            +30d
                          </button>
                          <button
                            onClick={() => handleExtendLicense(company.id, 90)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 transition-colors"
                          >
                            +90d
                          </button>
                          <button
                            onClick={() => handleExtendLicense(company.id, 365)}
                            disabled={isSubmitting}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors"
                          >
                            +1 Year
                          </button>
                          <button
                            onClick={() => openEditLicense(company)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            title="Custom Quota"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTHENTICATION & LOGIN AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter audit logs by actor, action, details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="text-xs text-slate-500">
                Showing {filteredAuditLogs.length} Security & Login Events
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Action Event</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Activity Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                    {filteredAuditLogs.slice(0, 50).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {log.actor}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes('Approved') || log.action.includes('Sign In')
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.action.includes('Reset') || log.action.includes('Updated')
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : log.action.includes('Deleted') || log.action.includes('Suspended')
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {log.module}
                        </td>
                        <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                          {log.details}
                        </td>
                      </tr>
                    ))}

                    {filteredAuditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No audit activity logs recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: QUICK RESET USER PASSWORD (SUPER ADMIN) */}
        {showQuickResetModal && targetUserForReset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Reset User Password</h3>
                    <p className="text-xs text-slate-500">{targetUserForReset.name} ({targetUserForReset.email})</p>
                  </div>
                </div>
                <button onClick={() => setShowQuickResetModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApplyDirectPasswordReset} className="mt-4 space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-600 dark:text-slate-400 font-semibold">New Password</label>
                    <button
                      type="button"
                      onClick={generateNewRandomPassword}
                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate Strong Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={directNewPassword}
                      onChange={(e) => setDirectNewPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(directNewPassword);
                        setCopiedToClipboard(true);
                        setTimeout(() => setCopiedToClipboard(false), 2000);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy to Clipboard"
                    >
                      {copiedToClipboard ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedToClipboard && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                      Copied password to clipboard!
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-[11px]">
                  As Super Admin, setting this password will immediately update the PBKDF2 credentials for this account across the system. Share this password with the user.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowQuickResetModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                  >
                    {isSubmitting ? 'Updating...' : 'Set Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: REGISTER COMPANY */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Register Organization & Provision CEO</h3>
                    <p className="text-xs text-slate-500">Create a new isolated multi-tenant company workspace</p>
                  </div>
                </div>
                <button onClick={() => setShowRegisterModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterCompany} className="mt-4 space-y-4 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">
                  1. Corporate Information
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={newCompName}
                      onChange={(e) => {
                        setNewCompName(e.target.value);
                        if (!newCompCode) {
                          setNewCompCode(e.target.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15));
                        }
                      }}
                      placeholder="e.g. Acme Industrial Corp"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tenant Code *</label>
                    <input
                      type="text"
                      required
                      value={newCompCode}
                      onChange={(e) => setNewCompCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ACME-IND"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={newCompEmail}
                      onChange={(e) => setNewCompEmail(e.target.value)}
                      placeholder="contact@acme.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newCompPhone}
                      onChange={(e) => setNewCompPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">GSTIN (India)</label>
                    <input
                      type="text"
                      value={newCompGstin}
                      onChange={(e) => setNewCompGstin(e.target.value.toUpperCase())}
                      placeholder="27ABCDE1234F1Z5"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Corporate Tax ID / PAN</label>
                    <input
                      type="text"
                      value={newCompTaxId}
                      onChange={(e) => setNewCompTaxId(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={newCompAddress}
                    onChange={(e) => setNewCompAddress(e.target.value)}
                    placeholder="Plot 12, Industrial Area, Mumbai, Maharashtra"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 pt-2">
                  2. Subscription & User Limit
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Plan Tier</label>
                    <select
                      value={newCompTier}
                      onChange={(e) => setNewCompTier(e.target.value as Company['licenseTier'])}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Trial">Trial (30 Days)</option>
                      <option value="Starter">Starter (5 Seats)</option>
                      <option value="Growth">Growth (20 Seats)</option>
                      <option value="Enterprise">Enterprise (50+ Seats)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">License Days</label>
                    <input
                      type="number"
                      value={newCompDays}
                      onChange={(e) => setNewCompDays(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Max User Seats</label>
                    <input
                      type="number"
                      value={newCompMaxUsers}
                      onChange={(e) => setNewCompMaxUsers(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 pt-2">
                  3. Primary CEO / Admin Account Credentials
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">CEO Full Name</label>
                    <input
                      type="text"
                      value={newCeoName}
                      onChange={(e) => setNewCeoName(e.target.value)}
                      placeholder="e.g. Vikram Singhania"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Corporate Login Email</label>
                    <input
                      type="email"
                      value={newCeoEmail}
                      onChange={(e) => setNewCeoEmail(e.target.value)}
                      placeholder="vikram@acme.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Initial Password</label>
                    <input
                      type="password"
                      value={newCeoPassword}
                      onChange={(e) => setNewCeoPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/25"
                  >
                    {isSubmitting ? 'Registering...' : 'Provision Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT LICENSE & SEATS */}
        {showEditLicenseModal && selectedCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Edit License & Quota: {selectedCompany.name}
                  </h3>
                  <p className="text-xs text-slate-500">Configure plan tier, seat quota, and expiry date</p>
                </div>
                <button onClick={() => setShowEditLicenseModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLicenseChanges} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Plan Tier</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as Company['licenseTier'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Trial">Trial</option>
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Max User Seat Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={editMaxUsers}
                    onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Account Operational Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Company['status'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {selectedCompany.id !== 1 ? (
                    <button
                      type="button"
                      onClick={() => handleCancelCompanyLicense(selectedCompany.id, selectedCompany.name)}
                      disabled={isSubmitting}
                      className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                      title="Cancel and Revoke License"
                    >
                      <ShieldOff className="w-3.5 h-3.5" />
                      <span>Revoke License</span>
                    </button>
                  ) : <div />}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditLicenseModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PROVISION SUB-ACCOUNT */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white">Provision User Login Account</h3>
                </div>
                <button onClick={() => setShowAddUserModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="mt-4 space-y-3.5 text-xs">
                {isSuperAdmin && (
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Target Organization</label>
                    <select
                      value={newUserTargetCompanyId}
                      onChange={(e) => setNewUserTargetCompanyId(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({users.filter((u) => u.companyId === c.id).length}/{c.maxUsers} seats)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Rohini Deshmukh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Corporate Login Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="rohini@company.com"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Role *</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Admin">Administrator</option>
                      <option value="Finance">Finance & Ledger</option>
                      <option value="Inventory">Inventory Lead</option>
                      <option value="Sales">Sales Executive</option>
                      <option value="HR">People & HR</option>
                      <option value="Operations">Operations Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      placeholder="e.g. Sales & CRM"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Initial Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 pr-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                  >
                    {isSubmitting ? 'Provisioning...' : 'Provision Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT USER & RESET PASSWORD */}
        {showEditUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Edit Account: {selectedUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
                <button onClick={() => setShowEditUserModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="mt-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Role</label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Admin">Administrator</option>
                      <option value="Finance">Finance & Ledger</option>
                      <option value="Inventory">Inventory Lead</option>
                      <option value="Sales">Sales Executive</option>
                      <option value="HR">People & HR</option>
                      <option value="Operations">Operations Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Status</label>
                    <select
                      value={editUserStatus}
                      onChange={(e) => setEditUserStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={editUserDept}
                    onChange={(e) => setEditUserDept(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Reset Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={resetUserPassword}
                    onChange={(e) => setResetUserPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditUserModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
