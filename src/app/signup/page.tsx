'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Building2,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Mail,
  Phone,
  FileText,
  MapPin,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // Company Details
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  // Primary CEO / Admin Credentials
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // License Option
  const [licenseMode, setLicenseMode] = useState<'trial' | 'pending'>('trial');

  // Submission State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    companyName: string;
    isPending: boolean;
    message: string;
  } | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your passwords.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          companyEmail,
          phone,
          taxId,
          gstin,
          address,
          adminName,
          adminEmail,
          password,
          licenseMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please check your entries.');
      }

      setSuccessInfo({
        companyName: data.company.name,
        isPending: data.isPendingApproval,
        message: data.message,
      });

      if (!data.isPendingApproval) {
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/25">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">ATB ERP</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MULTI-TENANT SAAS
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Cloud Platform</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Register Your Enterprise Workspace
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Provision a private corporate tenant with isolated databases, licensing governance, and a primary CEO administration account.
          </p>
        </div>

        {/* Success Card */}
        {successInfo ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {successInfo.isPending ? 'Registration Submitted for Review' : 'Enterprise Workspace Provisioned!'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">{successInfo.message}</p>

            {successInfo.isPending ? (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2 justify-center">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>The Platform Admin can approve this workspace under Settings &gt; Company Accounts.</span>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 text-xs text-blue-400 font-semibold animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Launching your isolated enterprise dashboard...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Signup Form */
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-6">
              {/* SECTION 1: Company Legal Identity */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>1. Company Legal Identity (Tenant Entity)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Company Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tata Advanced Robotics & Automation Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Corporate Business Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="contact@company.com"
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Business Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="+91 22 6665 8282"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      CIN / Corporate Registration ID
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. U72200KA2026PTC..."
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      GSTIN (18% Tax Compliant)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 29AABCU9603R1Z7"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Registered Corporate Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <textarea
                        rows={2}
                        placeholder="Corporate headquarters or factory address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Primary CEO / Admin Account */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>2. Primary CEO / Administrator Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      CEO / Managing Director Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kabir Singhania"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Admin Sign-In Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. ceo@company.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Secure Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 focus:border-blue-500 focus:outline-none text-xs text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: License & Activation Mode */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>3. License Activation Governance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLicenseMode('trial')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      licenseMode === 'trial'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">30-Day Active Trial</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        INSTANT ACCESS
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                      Instant access with 10 team seats, full module coverage, and immediate login.
                    </p>
                  </div>

                  <div
                    onClick={() => setLicenseMode('pending')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      licenseMode === 'pending'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm shadow-blue-500/10'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Custom Enterprise Request</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        REQUIRES APPROVAL
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
                      Enterprise tier with up to 50 team seats. Subject to Platform Admin approval before sign-in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Provisioning Workspace...' : 'Register Company & Launch Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Already registered your company?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline">
                  Sign in to your workspace
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

