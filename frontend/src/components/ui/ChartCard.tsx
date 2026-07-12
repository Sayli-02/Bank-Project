import React from 'react';
import { cn } from '../../lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, action, children, className }: ChartCardProps) {
  return (
    <div className={cn("bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg p-6 flex flex-col transition-opacity duration-200", className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-serif text-neutral-100">{title}</h3>
          {subtitle && <p className="text-sm font-sans text-neutral-300 mt-1">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
