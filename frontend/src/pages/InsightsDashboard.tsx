import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChartCard } from '../components/ui/ChartCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { FilterBar } from '../components/ui/FilterBar';
import type { FilterState } from '../components/ui/FilterBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

interface DistData {
  name: string;
  count: number;
  churn_rate: number;
}

interface InsightsData {
  age_distribution: DistData[];
  gender_split: DistData[];
  geographic_churn: DistData[];
  segment_distribution: DistData[];
}

export function InsightsDashboard() {
  const [data, setData] = useState<InsightsData | null>(null);
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

        const res = await fetch(`http://localhost:8000/api/dashboard/insights?${queryParams.toString()}`);
        const dashData = await res.json();
        setData(dashData);
      } catch (err) {
        console.error("Failed to fetch insights data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderBarChart = (data: DistData[]) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
        <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#D64545" tick={{ fill: '#D64545' }} tickFormatter={(val) => `${val}%`} />
        <RechartsTooltip 
          contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          formatter={(val: any, name: any) => [
            name === 'churn_rate' ? `${val}%` : val, 
            name === 'churn_rate' ? 'Churn Rate' : 'Customers'
          ]}
        />
        <Bar yAxisId="left" dataKey="count" name="count" fill="#C9A24B" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Layout title="Customer Insights">
      <div className="space-y-6 pb-20">
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Age Distribution" subtitle="Customer count and churn rate by age band">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              renderBarChart(data.age_distribution)
            )}
          </ChartCard>

          <ChartCard title="Gender Split" subtitle="Customer count and churn rate by gender">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              renderBarChart(data.gender_split)
            )}
          </ChartCard>

          <ChartCard title="Geographic Churn" subtitle="Customer count and churn rate by geography">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              renderBarChart(data.geographic_churn)
            )}
          </ChartCard>

          <ChartCard title="Segment Distribution" subtitle="Customer count and churn rate by card type">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              renderBarChart(data.segment_distribution)
            )}
          </ChartCard>
        </div>

      </div>
    </Layout>
  );
}
