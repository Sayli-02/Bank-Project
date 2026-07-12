import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number; // positive or negative percentage
  className?: string;
}

export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  return (
    <div className={cn("bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg p-6 shadow-sm flex flex-col", className)}>
      <span className="text-sm font-sans text-neutral-300 uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-end justify-between">
        <span className="text-4xl font-serif text-accent-gold tabular-nums">{value}</span>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center text-sm font-sans font-medium",
            trend >= 0 ? "text-accent-emerald" : "text-accent-crimson"
          )}>
            {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
