'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    name: 'Aarav Mehta',
    role: 'CEO & Admin',
    email: 'aarav.mehta@atbsoftware.com',
    password: 'admin@123',
    badge: 'Executive',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    name: 'Ananya Iyer',
    role: 'Chief Financial Officer',
    email: 'ananya.iyer@atbsoftware.com',
    password: 'finance@123',
    badge: 'Finance',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Supply Chain Director',
    email: 'sneha.kulkarni@atbsoftware.com',
    password: 'supply@123',
    badge: 'Operations',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    name: 'Pooja Reddy',
    role: 'People Operations Lead',
    email: 'pooja.reddy@atbsoftware.com',
    password: 'hr@123',
    badge: 'HR & Payroll',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    name: 'Vikram Sharma',
    role: 'Commercial Sales Lead',
    email: 'vikram.sharma@atbsoftware.com',
    password: 'sales@123',
    badge: 'Sales CRM',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('aarav.mehta@atbsoftware.com');
  const [password, setPassword] = useState('admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Successful login, navigate to destination
      router.push(redirectTarget);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message);
      setLoading(false);
    }
  }

  function fillDemoAccount(acc: (typeof DEMO_ACCOUNTS)[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMsg(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="p-6 sm:px-12 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight">ATB Software Solutions</div>
            <div className="text-[10px] text-blue-300 font-mono">Enterprise ERP Suite • v2.6</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Neon Cloud Postgres Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand & Security Guarantee */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Zero-Trust Enterprise Authentication</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Unified Corporate <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                Resource Planning
              </span>
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              Securely access sales workflows, financial general ledgers, 18% GST billing, procurement pipelines, and staff operations.
            </p>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2.5 max-w-md mx-auto lg:mx-0 text-left">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Authorized Indian Corporate Entity</span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div>Entity: ATB Software Solutions Private Limited</div>
                <div>CIN: U72200KA2026PTC098765 | GSTIN: 29AABCU9603R1Z7</div>
                <div>Bangalore CyberPark, Karnataka, India</div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Sign In to Workspace</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your corporate credentials</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
                  <KeyRound className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@atbsoftware.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password Credentials
                    </label>
                    <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-white placeholder-slate-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Keep signed in for 24 hours</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to ATB ERP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts Switcher */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Demo Sign-In (Click to Auto-fill)</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemoAccount(acc)}
                      className={`text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                        email === acc.email
                          ? 'bg-blue-600/20 border-blue-500/50 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-200 truncate">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.role}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${acc.badgeColor} shrink-0`}>
                        {acc.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-white/5 relative z-10">
        &copy; {new Date().getFullYear()} ATB Software Solutions Private Limited. All enterprise data encrypted & stored in Neon PostgreSQL.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
