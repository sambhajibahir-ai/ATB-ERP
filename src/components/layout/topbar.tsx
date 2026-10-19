'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Plus,
  Database,
  Calendar,
  ChevronDown,
  Menu,
} from 'lucide-react';

interface DbStatus {
  connected: boolean;
  type: string;
  latencyMs?: number;
  message: string;
}

interface TopbarProps {
  onMobileOpen?: () => void;
}

export function Topbar({ onMobileOpen }: TopbarProps) {
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    connected: false,
    type: 'In-Memory Enterprise Store',
    message: 'Checking status...',
  });
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );

    fetch('/api/db/test')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => {
        setDbStatus({
          connected: false,
          type: 'In-Memory Enterprise Store',
          message: 'Local memory store active',
        });
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 gap-2">
      {/* Left Area: Mobile Hamburger Menu & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-md">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileOpen}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search orders, SKU... (Ctrl+K)"
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all text-slate-900 dark:text-white truncate"
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Neon Database Live Status Pill */}
        <Link
          href="/settings"
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium border transition-all ${
            dbStatus.connected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
          }`}
          title={dbStatus.message}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                dbStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                dbStatus.connected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <Database className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
          <span className="hidden sm:inline font-semibold">
            {dbStatus.connected
              ? `Neon (${dbStatus.latencyMs ?? 24}ms)`
              : 'Memory Mode'}
          </span>
          <span className="sm:hidden font-semibold text-[10px]">
            {dbStatus.connected ? 'Neon' : 'Demo'}
          </span>
        </Link>

        {/* Date Display */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentDate}</span>
        </div>

        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">New Entry</span>
            <ChevronDown className="w-3 h-3 hidden sm:inline" />
          </button>

          {showQuickMenu && (
            <div
              className="absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs"
              onClick={() => setShowQuickMenu(false)}
            >
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Create Records
              </div>
              <Link
                href="/sales"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>New Sales Order</span>
              </Link>
              <Link
                href="/inventory"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Add Product SKU</span>
              </Link>
              <Link
                href="/purchasing"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Issue Purchase Order</span>
              </Link>
              <Link
                href="/finance"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Record Ledger Entry</span>
              </Link>
              <Link
                href="/hr"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span>Onboard Employee</span>
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 text-xs max-w-[calc(100vw-1.5rem)]"
              onClick={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    Low Stock Alert
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    ATB Telemetry Sensor Suite is at 6 units (reorder threshold 15).
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Payment Received
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Sharma Infotech Solutions settled ₹36,580.00 for INV-2026-0045.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
