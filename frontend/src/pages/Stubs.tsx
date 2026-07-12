import React from 'react';
import { Layout } from '../components/layout/Layout';

export function InsightsDashboard() {
  return (
    <Layout title="Customer Insights">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>Customer Insights Content (Stubbed for Phase 6)</p>
      </div>
    </Layout>
  );
}

export function ProductDashboard() {
  return (
    <Layout title="Product Performance">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>Product Performance Content (Stubbed for Phase 7)</p>
      </div>
    </Layout>
  );
}

export function ChurnDashboard() {
  return (
    <Layout title="Churn Drivers">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>Churn Drivers Content (Stubbed for Phase 8)</p>
      </div>
    </Layout>
  );
}

export function ProfitabilityDashboard() {
  return (
    <Layout title="Profitability & CLV">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>Profitability Content (Stubbed for Phase 9)</p>
      </div>
    </Layout>
  );
}

export function SegmentationExplorer() {
  return (
    <Layout title="Segmentation & At-Risk Explorer">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>Segmentation Explorer Content (Stubbed for Phase 10)</p>
      </div>
    </Layout>
  );
}

export function SqlExplorer() {
  return (
    <Layout title="SQL / KPI Explorer">
      <div className="flex items-center justify-center h-[60vh] text-neutral-400 font-sans">
        <p>SQL Explorer Content (Stubbed for Phase 11)</p>
      </div>
    </Layout>
  );
}
