import React from 'react';
import { Layout } from '../components/layout/Layout';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { InsightBanner } from '../components/ui/InsightBanner';
import { SegmentBadge } from '../components/ui/SegmentBadge';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { FilterBar } from '../components/ui/FilterBar';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

export function DesignSystem() {
  const dummyTableData = [
    { id: 1, name: 'Alice Smith', segment: <SegmentBadge segment="Premium" />, balance: '$142,000' },
    { id: 2, name: 'Bob Jones', segment: <SegmentBadge segment="Growth" />, balance: '$45,000' },
    { id: 3, name: 'Charlie Brown', segment: <SegmentBadge segment="At-Risk" />, balance: '$12,500' },
    { id: 4, name: 'Diana Prince', segment: <SegmentBadge segment="Dormant" />, balance: '$1,200' },
  ];

  const columns: Column[] = [
    { accessor: 'id', header: 'ID' },
    { accessor: 'name', header: 'Name' },
    { accessor: 'value', header: 'Value', align: 'right' as const }
  ];

  return (
    <Layout title="Design System">
      <div className="space-y-12 pb-20">
        
        <section>
          <h3 className="text-xl font-serif text-accent-gold mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2">1. Filter Bar</h3>
          <FilterBar 
            filters={{ geography: '', gender: '', card_type: '', age_band: '' }} 
            onFilterChange={() => {}} 
          />
        </section>

        <section>
          <h3 className="text-xl font-serif text-accent-gold mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2">2. Insight Banner</h3>
          <InsightBanner text="Customers with 3+ products churn 62% less than single-product customers. Consider cross-selling to the At-Risk segment." />
        </section>

        <section>
          <h3 className="text-xl font-serif text-accent-gold mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2">3. KPI Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KpiCard label="Total Customers" value="10,000" />
            <KpiCard label="Churn Rate" value="21.4%" trend={-2.1} />
            <KpiCard label="Avg Balance" value="$145K" trend={4.5} />
            <KpiCard label="Revenue at Risk" value="$2.4M" trend={12.0} />
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif text-accent-gold mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2">4. Chart Cards & Badges</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Revenue by Segment" 
              subtitle="Distribution of total balance across customer segments"
              action={<div className="flex space-x-2"><SegmentBadge segment="Premium" /><SegmentBadge segment="Growth" /><SegmentBadge segment="At-Risk" /><SegmentBadge segment="Dormant" /></div>}
            >
              <div className="w-full h-full flex items-center justify-center text-neutral-400 font-sans border-2 border-dashed border-[rgba(255,255,255,0.06)] rounded">
                [Recharts Component Placeholder]
              </div>
            </ChartCard>

            <ChartCard 
              title="Async State Example" 
            >
              <div className="space-y-4 pt-4">
                <SkeletonLoader className="h-8 w-1/3" />
                <SkeletonLoader className="h-64 w-full" />
              </div>
            </ChartCard>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-serif text-accent-gold mb-4 border-b border-[rgba(255,255,255,0.06)] pb-2">5. Data Table</h3>
          <DataTable columns={columns} data={dummyTableData} title="High-Value Customers" />
        </section>

      </div>
    </Layout>
  );
}
