import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UtensilsCrossed, BarChart3, Activity,
  ChevronLeft, ChevronRight, Settings, LogOut
} from 'lucide-react';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const menuSections = [
  {
    title: 'Admin Console',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/foods', label: 'Food Database', icon: UtensilsCrossed },
    ],
  },
  {
    title: 'Insights',
    items: [
      { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/admin/prediction-reports', label: 'Predictions', icon: Activity },
    ],
  },
  {
    title: 'System',
    items: [
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden lg:flex flex-col h-full flex-shrink-0 glass border-r border-white/5 relative z-10"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white shadow-lg z-20"
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
                  className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : ''}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200 group relative overflow-hidden
                      ${isActive
                        ? 'bg-cyan-500/10 text-cyan-400 shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="admin-sidebar-active"
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

      <div className="p-3 border-t border-white/5 space-y-1">
        <Link
          to="/dashboard"
          title={collapsed ? 'User View' : ''}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Exit Admin</span>}
        </Link>
      </div>
    </motion.aside>
  );
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0a0e1a] text-slate-200 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-cyan-900/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none"></div>
        
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
