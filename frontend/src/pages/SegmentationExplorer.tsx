import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChartCard } from '../components/ui/ChartCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { FilterBar } from '../components/ui/FilterBar';
import type { FilterState } from '../components/ui/FilterBar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { SegmentBadge } from '../components/ui/SegmentBadge';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ScatterPoint {
  customer_id: string;
  clv: number;
  customer_loyalty_score: number;
  segment: string;
}

interface CustomerRow {
  customer_id: string;
  segment: 'Premium' | 'Growth' | 'At-Risk' | 'Dormant';
  clv: number;
  customer_loyalty_score: number;
  financial_health_score: number;
  product_engagement_score: number;
  recommendation: string;
}

interface SegmentationData {
  scatter_data: ScatterPoint[];
  customers: CustomerRow[];
  total_customers: number;
  page: number;
  limit: number;
  total_pages: number;
}

const SEGMENT_COLORS = {
  'Premium': '#C9A24B',
  'Growth': '#2FBF71',
  'At-Risk': '#D64545',
  'Dormant': '#94A3B8'
};

export function SegmentationExplorer() {
  const [data, setData] = useState<SegmentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    geography: '',
    gender: '',
    card_type: '',
    age_band: ''
  });
  
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.geography) queryParams.append('geography', filters.geography);
      if (filters.gender) queryParams.append('gender', filters.gender);
      if (filters.card_type) queryParams.append('card_type', filters.card_type);
      if (filters.age_band) queryParams.append('age_band', filters.age_band);
      
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const res = await fetch(`/api/dashboard/segmentation?${queryParams.toString()}`);
      const segmentData = await res.json();
      setData(segmentData);
    } catch (err) {
      console.error("Failed to fetch segmentation data:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset page on filter change
  };

  const handleNextPage = () => {
    if (data && page < data.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const columns: Column<CustomerRow>[] = [
    { header: 'Customer ID', accessor: 'customer_id', sortable: false },
    { 
      header: 'Segment', 
      accessor: 'segment', 
      sortable: false,
      render: (val: any) => <SegmentBadge segment={val} />
    },
    { 
      header: 'CLV (0-100)', 
      accessor: 'clv', 
      sortable: false,
      render: (val: any) => typeof val === 'number' ? val.toFixed(1) : val
    },
    { 
      header: 'Loyalty (0-100)', 
      accessor: 'customer_loyalty_score', 
      sortable: false,
      render: (val: any) => typeof val === 'number' ? val.toFixed(1) : val
    },
    { 
      header: 'Health (0-100)', 
      accessor: 'financial_health_score', 
      sortable: false,
      render: (val: any) => typeof val === 'number' ? val.toFixed(1) : val
    },
    { 
      header: 'Engagement (0-100)', 
      accessor: 'product_engagement_score', 
      sortable: false,
      render: (val: any) => typeof val === 'number' ? val.toFixed(1) : val
    },
    { header: 'Recommended Action', accessor: 'recommendation', sortable: false },
  ];

  return (
    <Layout title="Segmentation & At-Risk Explorer">
      <div className="space-y-6 pb-20">
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <ChartCard title="Customer Segments (CLV vs Loyalty)" subtitle="K-Means clustering on engineered scores">
          {loading || !data ? (
            <SkeletonLoader className="h-full w-full min-h-[400px]" />
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="customer_loyalty_score" 
                  name="Loyalty Score" 
                  stroke="#94A3B8" 
                  tick={{ fill: '#94A3B8' }} 
                  domain={[0, 100]}
                  label={{ value: 'Customer Loyalty Score', position: 'insideBottomRight', fill: '#94A3B8', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="clv" 
                  name="CLV" 
                  stroke="#94A3B8" 
                  tick={{ fill: '#94A3B8' }} 
                  domain={[0, 100]}
                  label={{ value: 'Customer Lifetime Value', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
                />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  formatter={(val: any, name: any) => [typeof val === 'number' ? val.toFixed(1) : val, name]}
                />
                <Scatter name="Customers" data={data.scatter_data}>
                  {data.scatter_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEGMENT_COLORS[entry.segment as keyof typeof SEGMENT_COLORS] || '#ffffff'} opacity={0.6} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="flex flex-col gap-6 mt-8">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-serif text-neutral-100">Customer List</h3>
            {data && (
              <div className="text-sm text-neutral-400">
                Page {data.page} of {data.total_pages} ({data.total_customers.toLocaleString()} total)
              </div>
            )}
          </div>
          
          <div className="bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg p-6 shadow-sm">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <>
                <DataTable 
                  data={data.customers} 
                  columns={columns} 
                />
                <div className="flex justify-between mt-4">
                  <button 
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-4 py-2 border border-[rgba(255,255,255,0.1)] rounded text-sm text-neutral-300 hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={!data || page >= data.total_pages}
                    className="px-4 py-2 border border-[rgba(255,255,255,0.1)] rounded text-sm text-neutral-300 hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
