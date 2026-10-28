// src/pages/OverviewPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { KPIGrid } from '../components/overview/KPIGrid';
import { CoreCharts } from '../components/overview/CoreCharts';
import { OrdersTable } from '../components/overview/OrdersTable';

export const OverviewPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-[1600px] mx-auto"
    >
      {/* KPI Cards Grid */}
      <KPIGrid />

      {/* Core Interactive Charts & Geospatial Breakdown Panels */}
      <CoreCharts />

      {/* Bottom Orders Explorer Table */}
      <div id="orders-table">
        <OrdersTable />
      </div>
    </motion.div>
  );
};

export default OverviewPage;
