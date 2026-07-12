import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { KpiCard } from '../components/ui/KpiCard';
import { ChartCard } from '../components/ui/ChartCard';
import { InsightBanner } from '../components/ui/InsightBanner';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardData {
  kpis: {
    total_customers: number;
    churn_rate: number;
    avg_clv: number;
    revenue_at_risk: number;
  };
  revenue_by_geography: { name: string; value: number }[];
  churn_trend: { month: string; rate: number }[];
}

export function ExecutiveDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, insightRes] = await Promise.all([
          fetch('http://localhost:8000/api/dashboard/executive'),
          fetch('http://localhost:8000/api/analytics/logistic-regression')
        ]);
        
        const dashData = await dashRes.json();
        const insightData = await insightRes.json();
        
        setData(dashData);
        // Find top driver from logistic regression (first key since it's sorted by absolute coefficient)
        const topDriverKey = Object.keys(insightData)[0];
        if (topDriverKey) {
          setInsight(insightData[topDriverKey].interpretation);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const formatCurrency = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  return (
    <Layout title="Executive Dashboard">
      <div className="space-y-6 pb-20">
        
        {loading || !data ? (
          <SkeletonLoader className="h-14 w-full" />
        ) : (
          insight && <InsightBanner text={`Key Driver: ${insight}`} />
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading || !data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ChartCard key={i} title="">
                <SkeletonLoader className="h-24 w-full" />
              </ChartCard>
            ))
          ) : (
            <>
              <KpiCard 
                label="Total Customers" 
                value={data.kpis.total_customers.toLocaleString()} 
              />
              <KpiCard 
                label="Churn Rate" 
                value={`${data.kpis.churn_rate}%`} 
                trend={-1.2} // Static mock for now
              />
              <KpiCard 
                label="Avg CLV" 
                value={`$${Math.round(data.kpis.avg_clv).toLocaleString()}`} 
              />
              <KpiCard 
                label="Revenue at Risk" 
                value={formatCurrency(data.kpis.revenue_at_risk)} 
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Revenue at Risk" 
            subtitle="By Geography"
          >
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenue_by_geography} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickFormatter={(val) => `$${val/1000000}M`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: number) => [formatCurrency(val), 'Revenue at Risk']}
                  />
                  <Bar dataKey="value" fill="#C9A24B" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard 
            title="Churn Trend (Illustrative)" 
            subtitle="Illustrative trend — historical data pending"
          >
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.churn_trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8' }} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: number) => [`${val}%`, 'Churn Rate']}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#D64545" strokeWidth={3} dot={{ fill: '#D64545', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

      </div>
    </Layout>
  );
}
