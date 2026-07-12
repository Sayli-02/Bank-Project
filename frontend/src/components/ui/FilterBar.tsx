import React from 'react';
import { cn } from '../../lib/utils';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  className?: string;
}

export function FilterBar({ className }: FilterBarProps) {
  return (
    <div className={cn("flex items-center space-x-4 mb-6 text-sm font-sans", className)}>
      <div className="flex items-center text-neutral-300 mr-2">
        <Filter size={16} className="mr-2" /> Filters:
      </div>
      <select className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors">
        <option value="">All Geographies</option>
        <option value="France">France</option>
        <option value="Germany">Germany</option>
        <option value="Spain">Spain</option>
      </select>
      <select className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors">
        <option value="">All Segments</option>
        <option value="Premium">Premium</option>
        <option value="Growth">Growth</option>
        <option value="At-Risk">At-Risk</option>
      </select>
      <select className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors">
        <option value="">Any Age</option>
        <option value="18-30">18-30</option>
        <option value="31-50">31-50</option>
        <option value="50+">50+</option>
      </select>
    </div>
  );
}
