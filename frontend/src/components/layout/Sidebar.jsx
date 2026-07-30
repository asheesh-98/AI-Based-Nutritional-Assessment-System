import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Activity, Heart, Utensils, FileText,
  Droplets, TestTube2, TrendingUp, User, Settings,
  ChevronLeft, ChevronRight, Stethoscope, ScanBarcode, Bot
} from 'lucide-react';

const menuSections = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/ai-coach', label: 'AI Nutrition Coach', icon: Bot },
      { path: '/reports', label: 'Reports', icon: TrendingUp },
    ],
  },
  {
    title: 'Health',
    items: [
      { path: '/health-profile', label: 'Health Profile', icon: Heart },
      { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
      { path: '/blood-report', label: 'Blood Reports', icon: TestTube2 },
      { path: '/prediction', label: 'Assessment', icon: Activity },
    ],
  },
  {
    title: 'Nutrition',
    items: [
      { path: '/meal-plan', label: 'Meal Plan', icon: Utensils },
      { path: '/food-diary', label: 'Food Diary', icon: FileText },
      { path: '/food-scanner', label: 'Food Scanner', icon: ScanBarcode },
    ],
  },
  {
    title: 'Account',
    items: [
      { path: '/profile', label: 'Profile', icon: User },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-full flex-shrink-0 glass border-r border-white/5 relative z-10"
    >
      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg z-20 cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : ''}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group relative overflow-hidden
                      ${isActive
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-0 bottom-0 w-1 gradient-bg"
                      />
                    )}
                    <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
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
      <div className="p-3 border-t border-white/5">
        <Link
          to="/profile"
          title={collapsed ? 'Settings' : ''}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </motion.aside>
  );
}
