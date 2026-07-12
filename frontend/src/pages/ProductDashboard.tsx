import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChartCard } from '../components/ui/ChartCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { FilterBar } from '../components/ui/FilterBar';
import type { FilterState } from '../components/ui/FilterBar';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { InsightBanner } from '../components/ui/InsightBanner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

interface ProductBreakdown {
  num_products: number;
  count: number;
  churn_rate: number;
}

interface ProductCombination {
  num_products: number;
  card_type: string;
  count: number;
  churn_rate: number;
}

interface ProductData {
  product_breakdown: ProductBreakdown[];
  product_combinations: ProductCombination[];
}

export function ProductDashboard() {
  const [data, setData] = useState<ProductData | null>(null);
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

        const res = await fetch(`/api/dashboard/product?${queryParams.toString()}`);
        const productData = await res.json();
        setData(productData);
      } catch (err) {
        console.error("Failed to fetch product data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const columns: Column<ProductCombination>[] = [
    { header: 'Number of Products', accessor: 'num_products', sortable: true },
    { header: 'Card Type', accessor: 'card_type', sortable: true },
    { header: 'Customers', accessor: 'count', sortable: true },
    { 
      header: 'Churn Rate', 
      accessor: 'churn_rate', 
      sortable: true,
      render: (val: number) => (
        <span className={val > 20 ? 'text-[#D64545]' : 'text-[#2FBF71]'}>
          {val.toFixed(1)}%
        </span>
      )
    },
  ];

  // Derive an insight for the banner
  let insightText = '';
  if (data && data.product_breakdown.length > 0) {
    const singleProduct = data.product_breakdown.find(p => p.num_products === 1);
    const multiProduct = data.product_breakdown.find(p => p.num_products > 1);
    
    if (singleProduct && multiProduct) {
      if (singleProduct.churn_rate > multiProduct.churn_rate) {
        insightText = `Customers with 1 product have a higher churn rate (${singleProduct.churn_rate.toFixed(1)}%) compared to multi-product customers. Cross-selling is highly recommended.`;
      } else {
        insightText = `Product ownership trends indicate a stable retention profile across product combinations.`;
      }
    }
  }

  return (
    <Layout title="Product Performance">
      <div className="space-y-6 pb-20">
        
        <FilterBar 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {insightText && !loading && (
          <InsightBanner text={insightText} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Product Ownership Breakdown" subtitle="Distribution of product counts and churn">
            {loading || !data ? (
              <SkeletonLoader className="h-full w-full min-h-[300px]" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.product_breakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="num_products" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} tickFormatter={(val) => `${val} Product(s)`} />
                  <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fill: '#94A3B8' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#D64545" tick={{ fill: '#D64545' }} tickFormatter={(val) => `${val}%`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#161F2E', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                    formatter={(val: any, name: any) => [
                      name === 'churn_rate' ? `${val}%` : val, 
                      name === 'churn_rate' ? 'Churn Rate' : 'Customers'
                    ]}
                    labelFormatter={(label) => `${label} Product(s)`}
                  />
                  <Bar yAxisId="left" dataKey="count" name="count" fill="#C9A24B" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
            <h3 className="text-xl font-serif text-neutral-100">Product Combinations</h3>
            <div className="bg-surface-dark border border-[rgba(255,255,255,0.06)] rounded-lg p-6 flex-1 shadow-sm">
              {loading || !data ? (
                <SkeletonLoader className="h-full w-full min-h-[200px]" />
              ) : (
                <DataTable 
                  data={data.product_combinations} 
                  columns={columns}
                />
              )}
            </div>
          </div>

        </div>

      </div>
    </Layout>
  );
}
