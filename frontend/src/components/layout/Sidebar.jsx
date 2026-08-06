import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Heart, Utensils, FileText,
  Droplets, TestTube2, TrendingUp, User, Settings,
  ChevronLeft, ChevronRight, Stethoscope, ScanBarcode, Bot
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const menuSections = [
    {
      title: t('sidebar_section_overview'),
      items: [
        { path: '/dashboard', label: t('sidebar_dashboard'), icon: LayoutDashboard },
        { path: '/ai-coach', label: t('sidebar_ai_coach'), icon: Bot },
        { path: '/reports', label: t('sidebar_reports'), icon: TrendingUp },
      ],
    },
    {
      title: t('sidebar_section_health'),
      items: [
        { path: '/health-profile', label: t('sidebar_health_profile'), icon: Heart },
        { path: '/symptoms', label: t('sidebar_symptoms'), icon: Stethoscope },
        { path: '/blood-report', label: t('sidebar_blood_reports'), icon: TestTube2 },
        { path: '/prediction', label: t('sidebar_assessment'), icon: Activity },
      ],
    },
    {
      title: t('sidebar_section_nutrition'),
      items: [
        { path: '/meal-plan', label: t('sidebar_meal_plan'), icon: Utensils },
        { path: '/food-diary', label: t('sidebar_food_diary'), icon: FileText },
        { path: '/food-scanner', label: t('sidebar_food_scanner'), icon: ScanBarcode },
      ],
    },
    {
      title: t('sidebar_section_account'),
      items: [
        { path: '/profile', label: t('sidebar_profile'), icon: User },
      ],
    },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-full flex-shrink-0 bg-[#0c1427]/95 border-r border-slate-800/80 shadow-2xl relative z-10 backdrop-blur-xl"
    >
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#0077ff] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 z-20 cursor-pointer hover:bg-cyan-400 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : ''}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                      transition-all duration-200 group relative overflow-hidden
                      ${isActive
                        ? 'bg-gradient-to-r from-[#0077ff] to-cyan-500 text-white shadow-lg shadow-blue-500/25 font-bold border border-blue-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-slate-800/80 space-y-1 bg-[#090e1c]/60">
        <Link
          to="/profile"
          title={collapsed ? t('sidebar_settings') : ''}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>{t('sidebar_settings')}</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
