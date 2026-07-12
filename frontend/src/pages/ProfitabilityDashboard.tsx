import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChartCard } from '../components/ui/ChartCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { FilterBar } from '../components/ui/FilterBar';
import type { FilterState } from '../components/ui/FilterBar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { SegmentBadge } from '../components/ui/SegmentBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartPoint {
  name: string;
  count?: number;
  value?: number;
}

interface HighValueCustomer {
  customer_id: string;
  clv: number;
  balance: number;
  card_type: string;
  num_products: number;
}

interface RetentionOpportunity {
  customer_id: string;
  clv: number;
  risk_score: number;
  recommendation: string;
  rank?: number;
  segment?: string;
}

interface ProfitabilityData {
  clv_distribution: ChartPoint[];
  revenue_by_segment: ChartPoint[];
  high_value_customers: HighValueCustomer[];
  retention_opportunities: RetentionOpportunity[];
}

const PIE_COLORS = ['#C9A24B', '#2FBF71', '#94A3B8', '#64748B'];

export function ProfitabilityDashboard() {
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    geography: '',
    gender: '',
    card_type: '',
    age_band: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (filters.geography) queryParams.append('geography', filters.geography);
        if (filters.gender) queryParams.append('gender', filters.gender);
        if (filters.card_type) queryParams.append('card_type', filters.card_type);
        if (filters.age_band) queryParams.append('age_band', filters.age_band);

        const res = await fetch(`/api/dashboard/profitability?${queryParams.toString()}`);
        const profData = await res.json();
        setData(profData);
      } catch (err) {
        console.error("Failed to fetch profitability data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const formatMillions = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  const highValueCols: Column<HighValueCustomer>[] = [
    { header: 'Customer ID', accessor: 'customer_id', sortable: false },
    { header: 'Segment', accessor: 'card_type', sortable: true },
    { header: 'Products', accessor: 'num_products', sortable: true },
    { header: 'Balance', accessor: 'balance', sortable: true, render: (val) => formatCurrency(val) },
    { header: 'CLV', accessor: 'clv', sortable: true, render: (val) => <span className="font-semibold text-accent-gold">{formatCurrency(val)}</span> },
  ];

  const opportunitiesColumns: Column<RetentionOpportunity>[] = [
    { header: 'Rank', accessor: 'rank', sortable: false },
    { header: 'Customer ID', accessor: 'customer_id', sortable: false },
    { 
      header: 'CLV', 
      accessor: 'clv', 
      sortable: false,
      render: (val: any) => formatCurrency(val)
    },
    { 
      header: 'Segment', 
      accessor: 'segment', 
      sortable: false,
      render: (val: any) => <SegmentBadge segment={val} />
    },
    { header: 'Action', accessor: 'recommendation', sortable: false },
  ];

  return (
    <Layout title="Profitability & CLV">
      <div className="space-y-6 pb-20">
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="CLV Distribution" subtitle="Customer Lifetime Value bands">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.clv_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: any) => [val, 'Customers']}
                  />
                  <Bar dataKey="count" fill="#C9A24B" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Revenue by Segment" subtitle="Total balance held by card type">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.revenue_by_segment}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    label={({ name, percent }) => `${name} (${(percent ? percent * 100 : 0).toFixed(0)}%)`}
                  >
                    {data.revenue_by_segment.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-serif text-neutral-100 flex items-center">
            <span className="w-2 h-2 rounded-full bg-[#D64545] mr-2"></span>
            Retention Opportunities (High Value + High Risk)
          </h3>
          <div className="bg-surface-dark border border-[#D64545]/30 rounded-lg p-6 shadow-sm">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[200px]" />
            ) : (
              <DataTable 
                data={data.retention_opportunities} 
                columns={opportunitiesColumns} 
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-8">
          <h3 className="text-xl font-serif text-neutral-100">Top 100 High-Value Customers</h3>
          <div className="bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg p-6 shadow-sm">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[200px]" />
            ) : (
              <DataTable 
                data={data.high_value_customers} 
                columns={highValueCols} 
              />
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
