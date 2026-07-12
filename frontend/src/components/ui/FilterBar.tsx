import React from 'react';
import { cn } from '../../lib/utils';
import { Filter } from 'lucide-react';

export interface FilterState {
  geography: string;
  gender: string;
  card_type: string;
  age_band: string;
}

interface FilterBarProps {
  className?: string;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
}

export function FilterBar({ className, filters, onFilterChange }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 mb-6 text-sm font-sans", className)}>
      <div className="flex items-center text-neutral-300 mr-2">
        <Filter size={16} className="mr-2" /> Filters:
      </div>
      <select 
        value={filters.geography}
        onChange={(e) => onFilterChange('geography', e.target.value)}
        className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors"
      >
        <option value="">All Geographies</option>
        <option value="France">France</option>
        <option value="Germany">Germany</option>
        <option value="Spain">Spain</option>
      </select>
      
      <select 
        value={filters.gender}
        onChange={(e) => onFilterChange('gender', e.target.value)}
        className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors"
      >
        <option value="">All Genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>

      <select 
        value={filters.card_type}
        onChange={(e) => onFilterChange('card_type', e.target.value)}
        className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors"
      >
        <option value="">All Card Types</option>
        <option value="DIAMOND">Diamond</option>
        <option value="GOLD">Gold</option>
        <option value="SILVER">Silver</option>
        <option value="PLATINUM">Platinum</option>
      </select>

      <select 
        value={filters.age_band}
        onChange={(e) => onFilterChange('age_band', e.target.value)}
        className="bg-surface-dark border border-[rgba(255,255,255,0.1)] rounded px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-accent-gold transition-colors"
      >
        <option value="">All Ages</option>
        <option value="18-30">18-30</option>
        <option value="31-45">31-45</option>
        <option value="46-60">46-60</option>
        <option value="60+">60+</option>
      </select>
    </div>
  );
}
