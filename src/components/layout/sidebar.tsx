'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Users,
  Settings,
  Cog,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sales & CRM', href: '/sales', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package, badge: '2 Low' },
  { name: 'Purchasing', href: '/purchasing', icon: Truck },
  { name: 'Finance & Ledger', href: '/finance', icon: DollarSign },
  { name: 'Operations', href: '/operations', icon: Cog },
  { name: 'Human Resources', href: '/hr', icon: Users },
  { name: 'Settings & Neon DB', href: '/settings', icon: Settings },
];

const ROLES = [
  { name: 'Alexander Wright', title: 'System Administrator (CEO)', role: 'Admin' },
  { name: 'Sophia Martinez', title: 'Chief Financial Officer', role: 'Finance' },
  { name: 'Jessica Taylor', title: 'Director of Supply Chain', role: 'Inventory' },
  { name: 'Maya Lin', title: 'People Operations Lead', role: 'HR' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const currentRole = ROLES[activeRoleIndex];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  ATB ERP
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px]">
                ATB Software
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="mx-auto">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            collapsed ? 'hidden' : 'block'
          }`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className={`px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 ${collapsed ? 'text-center' : ''}`}>
          {collapsed ? '•••' : 'Modules'}
        </div>

        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider px-1">
              <span>Current Session</span>
              <button
                onClick={() =>
                  setActiveRoleIndex((prev) => (prev + 1) % ROLES.length)
                }
                className="text-blue-600 dark:text-blue-400 hover:underline capitalize"
                title="Simulate other company roles"
              >
                Switch Role
              </button>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentRole.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentRole.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentRole.title}
                </div>
              </div>
              <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            title="Expand"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

