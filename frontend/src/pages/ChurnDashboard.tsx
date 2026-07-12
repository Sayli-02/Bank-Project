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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface ChurnDataPoint {
  name: string;
  count: number;
  churn_rate: number;
}

interface TrendPoint {
  month: string;
  rate: number;
}

interface ChurnData {
  churn_trend: TrendPoint[];
  churn_by_geography: ChurnDataPoint[];
  churn_by_age: ChurnDataPoint[];
  churn_by_income: ChurnDataPoint[];
  churn_by_product: ChurnDataPoint[];
  top_drivers: Record<string, { coef: number; odds_ratio: number; p_value: number; interpretation: string }>;
}

export function ChurnDashboard() {
  const [data, setData] = useState<ChurnData | null>(null);
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

        const res = await fetch(`/api/dashboard/churn?${queryParams.toString()}`);
        const churnData = await res.json();
        setData(churnData);
      } catch (err) {
        console.error("Failed to fetch churn data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderBarChart = (data: ChurnDataPoint[]) => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
        <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickFormatter={(val) => `${val}%`} />
        <RechartsTooltip 
          contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          formatter={(val: any) => [`${val}%`, 'Churn Rate']}
        />
        <Bar dataKey="churn_rate" fill="#D64545" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );

  const getTopDrivers = () => {
    if (!data?.top_drivers) return [];
    // Convert dict to array and take top 5
    const driversArray = Object.entries(data.top_drivers).map(([key, val]) => ({
      feature: key,
      ...val
    }));
    return driversArray.sort((a, b) => b.odds_ratio - a.odds_ratio).slice(0, 5);
  };

  return (
    <Layout title="Churn Drivers">
      <div className="space-y-6 pb-20">
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Monthly Churn Trend" subtitle="Historical churn rate progression">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.churn_trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: any) => [`${val}%`, 'Churn Rate']}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#D64545" strokeWidth={3} dot={{ fill: '#D64545', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Top Churn Drivers" subtitle="Derived from logistic regression (Odds Ratios)">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopDrivers()} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} domain={[0, 'dataMax + 0.5']} />
                  <YAxis type="category" dataKey="feature" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} width={100} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: any) => [val.toFixed(2), 'Odds Ratio']}
                  />
                  <Bar dataKey="odds_ratio" fill="#D64545" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartCard title="Churn by Geography">
            {loading || !data ? <SkeletonLoader className="h-full w-full min-h-[250px]" /> : renderBarChart(data.churn_by_geography)}
          </ChartCard>
          
          <ChartCard title="Churn by Age Band">
            {loading || !data ? <SkeletonLoader className="h-full w-full min-h-[250px]" /> : renderBarChart(data.churn_by_age)}
          </ChartCard>

          <ChartCard title="Churn by Income Band">
            {loading || !data ? <SkeletonLoader className="h-full w-full min-h-[250px]" /> : renderBarChart(data.churn_by_income)}
          </ChartCard>

          <ChartCard title="Churn by Product Count">
            {loading || !data ? <SkeletonLoader className="h-full w-full min-h-[250px]" /> : renderBarChart(data.churn_by_product)}
          </ChartCard>
        </div>

      </div>
    </Layout>
  );
}
