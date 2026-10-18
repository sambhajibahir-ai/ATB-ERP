'use client';

import React, { useState } from 'react';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface FinanceChartProps {
  data: MonthlyData[];
}

export function FinanceChart({ data }: FinanceChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses)), 60000);
  const chartHeight = 220;
  const chartWidth = 580;
  const barWidth = 24;
  const gap = chartWidth / data.length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Revenue vs Operational Expenses
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly financial performance (Last 6 Months)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-500" />
            <span className="text-slate-600 dark:text-slate-300">Expenses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 rounded-full" />
            <span className="text-slate-600 dark:text-slate-300">Net Profit</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full min-w-[420px] sm:min-w-full h-56 sm:h-64 overflow-visible"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = chartHeight - pct * chartHeight + 10;
            return (
              <g key={i}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x="0"
                  y={y - 4}
                  fill="currentColor"
                  className="text-[10px] text-slate-400 select-none"
                >
                  ${Math.round((pct * maxVal) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const xCenter = i * gap + gap / 2;
            const revHeight = (d.revenue / maxVal) * chartHeight;
            const expHeight = (d.expenses / maxVal) * chartHeight;
            const isHovered = hoveredIdx === i;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={xCenter - gap / 2 + 6}
                    y={10}
                    width={gap - 12}
                    height={chartHeight}
                    fill="currentColor"
                    className="text-slate-100 dark:text-slate-800/50 rounded-lg"
                    rx="6"
                  />
                )}

                {/* Revenue Bar */}
                <rect
                  x={xCenter - barWidth - 2}
                  y={chartHeight - revHeight + 10}
                  width={barWidth}
                  height={revHeight}
                  rx="4"
                  className="fill-emerald-500 hover:fill-emerald-400 transition-all duration-300"
                />

                {/* Expense Bar */}
                <rect
                  x={xCenter + 2}
                  y={chartHeight - expHeight + 10}
                  width={barWidth}
                  height={expHeight}
                  rx="4"
                  className="fill-indigo-500 hover:fill-indigo-400 transition-all duration-300"
                />

                {/* Month Label */}
                <text
                  x={xCenter}
                  y={chartHeight + 30}
                  textAnchor="middle"
                  fill="currentColor"
                  className={`text-xs font-medium transition-colors ${
                    isHovered
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}

          {/* Profit Trend Line */}
          <path
            d={data
              .map((d, i) => {
                const x = i * gap + gap / 2;
                const y = chartHeight - (d.profit / maxVal) * chartHeight + 10;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Trend dots */}
          {data.map((d, i) => {
            const x = i * gap + gap / 2;
            const y = chartHeight - (d.profit / maxVal) * chartHeight + 10;
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={hoveredIdx === i ? 5 : 3.5}
                className="fill-amber-500 stroke-white dark:stroke-slate-900"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Hover Tooltip card */}
        {hoveredIdx !== null && (
          <div className="absolute top-2 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-3 text-xs z-20 pointer-events-none transition-all">
            <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {data[hoveredIdx].month} Financials
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-slate-500">Revenue:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                ${data[hoveredIdx].revenue.toLocaleString()}
              </span>
              <span className="text-slate-500">Expenses:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-right">
                ${data[hoveredIdx].expenses.toLocaleString()}
              </span>
              <span className="text-slate-500">Net Profit:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-right">
                ${data[hoveredIdx].profit.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

