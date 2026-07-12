import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExecutiveDashboard } from './pages/ExecutiveDashboard';
import { InsightsDashboard } from './pages/InsightsDashboard';
import { ProductDashboard } from './pages/ProductDashboard';
import { ChurnDashboard } from './pages/ChurnDashboard';
import { ProfitabilityDashboard } from './pages/ProfitabilityDashboard';
import { SegmentationExplorer } from './pages/SegmentationExplorer';
import { 
  SqlExplorer 
} from './pages/Stubs';
import { DesignSystem } from './pages/DesignSystem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/executive" replace />} />
        <Route path="/executive" element={<ExecutiveDashboard />} />
        <Route path="/insights" element={<InsightsDashboard />} />
        <Route path="/product" element={<ProductDashboard />} />
        <Route path="/churn" element={<ChurnDashboard />} />
        <Route path="/profitability" element={<ProfitabilityDashboard />} />
        <Route path="/segmentation" element={<SegmentationExplorer />} />
        <Route path="/sql" element={<SqlExplorer />} />
        
        {/* Dev Route */}
        <Route path="/design-system" element={<DesignSystem />} />
      </Routes>
    </Router>
  );
}

export default App;
