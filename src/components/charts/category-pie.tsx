'use client';

import React from 'react';

interface CategoryData {
  name: string;
  count: number;
}

interface CategoryPieProps {
  data: CategoryData[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export function CategoryPie({ data }: CategoryPieProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;

  let accumulatedPercent = 0;

  // Calculate SVG arc segments for a donut chart
  const segments = data.map((item, index) => {
    const percent = (item.count / total) * 100;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -accumulatedPercent;
    accumulatedPercent += percent;
    return {
      ...item,
      color: COLORS[index % COLORS.length],
      percent: Math.round(percent),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Inventory by Category
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stock distribution across warehouses
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {total} Units Total
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut SVG */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
            />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke={seg.color}
                strokeWidth="4"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:opacity-85"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {total}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Units
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5 min-w-0">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                  {seg.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {seg.count}
                </span>
                <span className="text-slate-400 w-8 text-right font-mono text-[11px]">
                  {seg.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

