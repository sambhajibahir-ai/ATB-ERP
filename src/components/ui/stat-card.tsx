import React from 'react';
import Link from 'next/link';
import { LucideIcon, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
  badge,
  href,
}: StatCardProps) {
  const content = (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all duration-200 h-full flex flex-col justify-between ${
        href
          ? 'group cursor-pointer hover:border-blue-500/60 dark:hover:border-blue-500/60 hover:shadow-md hover:-translate-y-0.5'
          : 'hover:shadow-md'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 min-w-0">
            {title}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {href && (
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
            )}
            <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${iconColor}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        <div className="my-2.5 flex items-baseline gap-2 flex-wrap min-w-0">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
            {value}
          </span>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
              {badge}
            </span>
          )}
        </div>
      </div>

      {(change || subtitle || href) && (
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 gap-1">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 text-[11px] sm:text-xs">
            {trend === 'up' && (
              <span className="inline-flex items-center font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                {change}
              </span>
            )}
            {trend === 'down' && (
              <span className="inline-flex items-center font-semibold text-rose-600 dark:text-rose-400 shrink-0">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                {change}
              </span>
            )}
            {trend === 'neutral' && change && (
              <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                {change}
              </span>
            )}
            {subtitle && <span className="truncate text-slate-400 dark:text-slate-500">{subtitle}</span>}
          </div>

          {href && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto pl-1">
              View &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}


