import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Heart, Utensils, FileText,
  TestTube2, TrendingUp, User,
  ChevronLeft, ChevronRight, Stethoscope, ScanBarcode, Bot
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const menuSections = [
    {
      title: t('overview') || 'Overview',
      items: [
        { path: '/dashboard', label: t('dashboard') || 'Dashboard', icon: LayoutDashboard },
        { path: '/ai-coach', label: t('ai_coach') || 'AI Nutrition Coach', icon: Bot },
        { path: '/reports', label: t('reports') || 'Reports', icon: TrendingUp },
      ],
    },
    {
      title: t('health') || 'Health',
      items: [
        { path: '/health-profile', label: t('health_profile') || 'Health Profile', icon: Heart },
        { path: '/symptoms', label: t('symptoms') || 'Symptoms', icon: Stethoscope },
        { path: '/blood-report', label: t('blood_reports') || 'Blood Reports', icon: TestTube2 },
        { path: '/prediction', label: t('assessment') || 'Assessment', icon: Activity },
      ],
    },
    {
      title: t('nutrition') || 'Nutrition',
      items: [
        { path: '/meal-plan', label: t('meal_plan') || 'Meal Plan', icon: Utensils },
        { path: '/food-diary', label: t('food_diary') || 'Food Diary', icon: FileText },
        { path: '/food-scanner', label: t('scanner') || 'Food Scanner', icon: ScanBarcode },
      ],
    },
    {
      title: t('account') || 'Account',
      items: [
        { path: '/profile', label: t('profile') || 'Profile', icon: User },
      ],
    },
  ];

  return (
    <aside
      className={`
        relative hidden lg:flex flex-col glass-strong border-r border-white/5
        transition-all duration-300 z-30 shrink-0
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg hover:bg-cyan-400 transition-colors z-40"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pt-6">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group relative
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10 shadow-lg shadow-cyan-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
