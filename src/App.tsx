// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDataStore } from './store/useDataStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalFilterBar } from './components/layout/GlobalFilterBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { DrilldownDrawer } from './components/drawers/DrilldownDrawer';
import { OverviewPage } from './pages/OverviewPage';
import { GeographyPage } from './pages/GeographyPage';
import { TimeAnalysisPage } from './pages/TimeAnalysisPage';
import { DeliveryPerformancePage } from './pages/DeliveryPerformancePage';
import { CategoriesRoutesPage } from './pages/CategoriesRoutesPage';
import { PredictiveLabPage } from './pages/PredictiveLabPage';
import { StatisticsLabPage } from './pages/StatisticsLabPage';
import { SqlConsolePage } from './pages/SqlConsolePage';
import { StoryModePage } from './pages/StoryModePage';
import { ReportsPage } from './pages/ReportsPage';
import { AboutPage } from './pages/AboutPage';
import { WopeCosmicBackground } from './components/background/WopeCosmicBackground';

export const App: React.FC = () => {
  const { init, theme, toggleTheme } = useDataStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <BrowserRouter>
      <div
        className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
          theme === 'light' ? 'bg-[#fafafa] text-zinc-900' : 'bg-[#000000] text-zinc-100'
        }`}
      >
        {/* Wope 3D Starfield & Blue Light Rays Animation */}
        <WopeCosmicBackground />

        {/* Top Header */}
        <div className="relative z-50">
          <Header />
        </div>

        {/* Global Filter Bar */}
        <div className="relative z-30">
          <GlobalFilterBar />
        </div>

        {/* Main Body with Sidebar + Content */}
        <div className="flex flex-1 relative z-10">
          <Sidebar />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/geography" element={<GeographyPage />} />
              <Route path="/time-analysis" element={<TimeAnalysisPage />} />
              <Route path="/delivery-performance" element={<DeliveryPerformancePage />} />
              <Route path="/categories-routes" element={<CategoriesRoutesPage />} />
              <Route path="/predictive-lab" element={<PredictiveLabPage />} />
              <Route path="/statistics-lab" element={<StatisticsLabPage />} />
              <Route path="/sql-console" element={<SqlConsolePage />} />
              <Route path="/story-mode" element={<StoryModePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Sliding Drilldown Drawer */}
        <DrilldownDrawer />

        {/* Command Palette Modal */}
        <CommandPalette />
      </div>
    </BrowserRouter>
  );
};

export default App;
