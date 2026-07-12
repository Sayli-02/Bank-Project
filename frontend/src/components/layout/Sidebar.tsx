import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Lightbulb, Package, TrendingDown, DollarSign, Users, Database } from 'lucide-react';

const navItems = [
  { name: 'Executive', path: '/executive', icon: LayoutDashboard },
  { name: 'Insights', path: '/insights', icon: Lightbulb },
  { name: 'Product', path: '/product', icon: Package },
  { name: 'Churn', path: '/churn', icon: TrendingDown },
  { name: 'Profitability', path: '/profitability', icon: DollarSign },
  { name: 'Segmentation', path: '/segmentation', icon: Users },
  { name: 'SQL Explorer', path: '/sql', icon: Database },
  { name: 'Design System', path: '/design-system', icon: LayoutDashboard }, // Dev route
];

export function Sidebar() {
  return (
    <div className="w-64 bg-base-navy border-r border-[rgba(255,255,255,0.06)] h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-xl font-serif text-neutral-100 font-bold tracking-wide">
          Antigravity<span className="text-accent-gold">.</span>
        </h1>
        <p className="text-xs font-sans text-neutral-400 mt-1 uppercase tracking-widest">Retention Intel</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-colors",
              isActive 
                ? "bg-[#1a2436] text-accent-gold" 
                : "text-neutral-300 hover:text-white hover:bg-surface-dark"
            )}
          >
            <item.icon size={18} className="mr-3 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="text-xs font-sans text-neutral-400">
          Last data refresh: <br/>
          <span className="text-neutral-200">Today, 08:00 AM</span>
        </div>
      </div>
    </div>
  );
}
