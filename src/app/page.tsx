import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatCard } from '@/components/ui/stat-card';
import { FinanceChart } from '@/components/charts/finance-chart';
import { CategoryPie } from '@/components/charts/category-pie';
import { getDashboardMetrics } from '@/lib/data-service';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Users,
  CreditCard,
  ArrowRight,
  Package,
  Clock,
  Sparkles,
} from 'lucide-react';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>ATB Software Enterprise ERP Suite • Neon Postgres Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Aarav
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Company operations are performing with robust margins. Cash reserves are healthy,
            and all manufacturing pipelines are on schedule.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/sales"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-blue-50 transition-colors"
            >
              <span>Manage Sales Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
            >
              <span>Neon DB Settings</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-16 w-60 h-60 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          change="+14.2%"
          trend="up"
          subtitle="vs last month"
          icon={DollarSign}
          iconColor="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900"
        />

        <StatCard
          title="Net Cash Flow"
          value={`$${metrics.netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 0 })}`}
          change="+18.4%"
          trend="up"
          subtitle="operating margin"
          icon={TrendingUp}
          iconColor="text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900"
        />

        <StatCard
          title="Sales Orders"
          value={metrics.ordersCount}
          subtitle="active in pipeline"
          icon={ShoppingCart}
          iconColor="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900"
        />

        <StatCard
          title="Low Stock SKUs"
          value={metrics.lowStockCount}
          badge={metrics.lowStockCount > 0 ? 'Action Req' : undefined}
          subtitle="below threshold"
          icon={AlertTriangle}
          iconColor="text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900"
        />

        <StatCard
          title="Receivables"
          value={`$${metrics.unpaidInvoicesAmount.toLocaleString()}`}
          change="Net 30"
          trend="neutral"
          subtitle="pending invoices"
          icon={CreditCard}
          iconColor="text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900"
        />

        <StatCard
          title="Headcount"
          value={metrics.activeEmployeesCount}
          subtitle="across 5 depts"
          icon={Users}
          iconColor="text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <FinanceChart data={metrics.monthlyTrends} />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <CategoryPie data={metrics.categoryBreakdown} />
        </div>
      </div>

      {/* Operational Grids: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Sales Orders
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest client purchases and delivery status
              </p>
            </div>
            <Link
              href="/sales"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Order</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                      {order.customerName}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Immediate Reorder */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Inventory Alerts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Products currently below minimum safety thresholds
                </p>
              </div>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Warehouse Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {metrics.lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {prod.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {prod.sku}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-slate-600 dark:text-slate-400 text-[11px]">
                    <span>
                      Stock Level: <strong className="text-rose-600 dark:text-rose-400">{prod.currentStock} {prod.unit}</strong>
                    </span>
                    <span>•</span>
                    <span>Min Safety Threshold: {prod.minStock} {prod.unit}</span>
                  </div>
                </div>

                <Link
                  href="/purchasing"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Create PO
                </Link>
              </div>
            ))}

            {metrics.lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                All inventory items are currently above safety thresholds.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time System Audit Trail */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System Audit Trail & Live Activity
            </h3>
          </div>
          <Link
            href="/settings"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            All Logs
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {metrics.recentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {log.actor}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {log.module}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {log.details}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
