import React from 'react';
import { cn } from '../../lib/utils';

type SegmentType = 'Premium' | 'Growth' | 'At-Risk' | 'Dormant' | 'Default';

interface SegmentBadgeProps {
  segment: SegmentType | string;
  className?: string;
}

export function SegmentBadge({ segment, className }: SegmentBadgeProps) {
  let colorClass = "bg-neutral-500/50 text-neutral-200 border-neutral-400/30";
  
  switch (segment) {
    case 'Premium':
      colorClass = "bg-accent-gold/10 text-accent-gold border-accent-gold/30";
      break;
    case 'Growth':
      colorClass = "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30";
      break;
    case 'At-Risk':
      colorClass = "bg-accent-crimson/10 text-accent-crimson border-accent-crimson/30";
      break;
    case 'Dormant':
      colorClass = "bg-neutral-400/10 text-neutral-400 border-neutral-400/30";
      break;
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium border", colorClass, className)}>
      {segment}
    </span>
  );
}
