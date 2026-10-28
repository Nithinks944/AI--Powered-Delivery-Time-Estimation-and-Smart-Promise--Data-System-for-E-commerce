// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe2,
  Clock,
  Truck,
  Network,
  Cpu,
  BarChart3,
  Terminal,
  BookOpen,
  FileText,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/geography', label: 'Geography', icon: Globe2 },
  { to: '/time-analysis', label: 'Time Analysis', icon: Clock },
  { to: '/delivery-performance', label: 'Delivery SLA', icon: Truck },
  { to: '/categories-routes', label: 'Categories & Routes', icon: Network },
  { to: '/predictive-lab', label: 'Predictive Lab', icon: Cpu, badge: 'ML' },
  { to: '/statistics-lab', label: 'Statistics Lab', icon: BarChart3 },
  { to: '/sql-console', label: 'SQL Console', icon: Terminal, badge: 'WASM' },
  { to: '/story-mode', label: 'Story Mode', icon: BookOpen },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/about', label: 'Methodology', icon: Info },
];

export const Sidebar: React.FC = () => {
  // Show names by default (not collapsed)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-[calc(100vh-4rem)] sticky top-16 bg-[#0a0118]/85 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 flex flex-col justify-between z-30 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#713dff]/25 to-[#887dff]/15 text-white font-semibold border border-[#713dff]/40 shadow-[0_0_15px_rgba(113,61,255,0.25)]'
                    : 'text-[#9b96b0] hover:bg-white/[0.05] hover:text-white'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-[#887dff]" />
              {!collapsed && (
                <span className="truncate flex-1 tracking-tight text-slate-200 font-medium">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#713dff]/20 text-[#c4b5fd] border border-[#713dff]/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle & Brand Pill */}
      <div className="p-2.5 border-t border-white/[0.08] flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#9b96b0]">
            <Sparkles className="w-3.5 h-3.5 text-[#887dff]" />
            <span className="truncate font-mono">Analytics Suite</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl text-[#9b96b0] hover:text-white hover:bg-white/[0.08] transition ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
