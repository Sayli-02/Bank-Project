import React from 'react';
import { cn } from '../../lib/utils';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T = any> {
  header: string;
  accessor: keyof T;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  render?: (val: any, item: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  className?: string;
}

export function DataTable({ columns, data, title, className }: DataTableProps) {
  return (
    <div className={cn("bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden flex flex-col", className)}>
      <div className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)]">
        <h3 className="text-lg font-serif text-neutral-100">{title || 'Data Table'}</h3>
        <button 
          className="flex items-center text-sm font-sans text-neutral-300 hover:text-white transition-colors"
          title="Export to CSV (Stub)"
        >
          <Download size={16} className="mr-2" /> Export CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a2436] border-b border-[rgba(255,255,255,0.06)]">
              {columns.map((col) => (
                <th key={String(col.accessor)} className={cn("px-4 py-3 text-xs font-sans text-neutral-300 uppercase tracking-wider font-medium cursor-pointer hover:text-white group", col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}>
                  <div className={cn("flex items-center", col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                    {col.header}
                    {col.sortable && <ArrowUpDown size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-neutral-400 font-sans text-sm">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1a2436]/50 transition-colors">
                  {columns.map((col) => (
                    <td key={String(col.accessor)} className={cn("px-4 py-3 text-sm font-sans text-neutral-200", col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}>
                      {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] as any)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-sm font-sans text-neutral-300">
        <span>Showing 1 to 10 of 100 entries</span>
        <div className="flex space-x-2">
          <button className="p-1 rounded hover:bg-neutral-500/50 transition-colors disabled:opacity-50"><ChevronLeft size={16} /></button>
          <button className="p-1 rounded hover:bg-neutral-500/50 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
