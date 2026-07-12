import React from 'react';
import { cn } from '../../lib/utils';
import { Lightbulb } from 'lucide-react';

interface InsightBannerProps {
  text: string;
  className?: string;
}

export function InsightBanner({ text, className }: InsightBannerProps) {
  return (
    <div className={cn("bg-[#1a2436] border border-accent-gold/20 rounded-lg p-4 flex items-center text-accent-gold/90", className)}>
      <Lightbulb size={20} className="mr-3 shrink-0" />
      <span className="font-sans text-sm font-medium leading-relaxed">{text}</span>
    </div>
  );
}
