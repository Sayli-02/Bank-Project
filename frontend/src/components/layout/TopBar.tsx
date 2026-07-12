import React from 'react';
import { Calendar, Globe, Moon, Sun, Download } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const [isLight, setIsLight] = React.useState(false);

  const toggleTheme = () => {
    setIsLight(!isLight);
    document.documentElement.classList.toggle('light-theme');
  };

  return (
    <div className="h-20 px-8 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-base-navy sticky top-0 z-10">
      <h2 className="text-2xl font-serif text-neutral-100">{title}</h2>
      
      <div className="flex items-center space-x-4 text-sm font-sans">
        <div className="flex items-center text-neutral-300 bg-surface-dark px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.06)]">
          <Calendar size={16} className="mr-2 text-neutral-400" />
          Last 30 Days
        </div>
        
        <div className="flex items-center text-neutral-300 bg-surface-dark px-3 py-1.5 rounded-md border border-[rgba(255,255,255,0.06)]">
          <Globe size={16} className="mr-2 text-neutral-400" />
          Global
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-neutral-300 hover:text-white hover:bg-surface-dark rounded-md transition-colors"
          title="Toggle Theme"
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button 
          disabled
          className="flex items-center px-4 py-2 bg-neutral-500/50 text-neutral-400 rounded-md cursor-not-allowed border border-[rgba(255,255,255,0.06)]"
          title="Export to PDF (Available soon in Phase 12)"
        >
          <Download size={16} className="mr-2" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
