import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, LogOut, User, Settings,
  LayoutDashboard, Utensils, Activity, FileText, ScanBarcode, Bot, LogIn, UserPlus,
  Users, UtensilsCrossed, BarChart3, ShieldCheck, TrendingUp, Stethoscope, TestTube2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';

  // Sleek desktop top navbar links (fits perfectly on laptop/PC viewports)
  const desktopUserNavLinks = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/prediction', label: t('assessment'), icon: Activity },
    { path: '/meal-plan', label: t('meal_plan'), icon: Utensils },
    { path: '/food-diary', label: t('food_diary'), icon: FileText },
    { path: '/ai-coach', label: t('ai_coach'), icon: Bot },
  ];

  // Full comprehensive navigation links for mobile drawer menu
  const mobileUserNavLinks = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/prediction', label: t('assessment'), icon: Activity },
    { path: '/symptoms', label: t('common_symptoms'), icon: Stethoscope },
    { path: '/blood-report', label: t('common_blood_reports'), icon: TestTube2 },
    { path: '/reports', label: t('common_reports'), icon: TrendingUp },
    { path: '/meal-plan', label: t('meal_plan'), icon: Utensils },
    { path: '/food-diary', label: t('food_diary'), icon: FileText },
    { path: '/food-scanner', label: t('scanner'), icon: ScanBarcode },
    { path: '/ai-coach', label: t('ai_coach'), icon: Bot },
  ];

  // Links for admin view
  const adminNavLinks = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/foods', label: 'Food Database', icon: UtensilsCrossed },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/prediction-reports', label: 'Predictions', icon: Activity },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-strong w-full border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Brand Logo */}
          <Link to={isAdminRoute ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold gradient-text">NutriAI</span>
              {isAdminRoute && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
          </Link>

          {/* Center: Desktop Nav (Hidden when in Admin mode because AdminSidebar handles desktop nav) */}
          {!isAdminRoute && (
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {desktopUserNavLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-medium
                      transition-all duration-300 whitespace-nowrap
                      ${isActive
                        ? 'bg-white/10 text-white shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <link.icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Selector Dropdown (Only shown on Home Page '/') */}
            {isHomePage && <LanguageSelector compact={true} />}

            {/* Desktop Auth Controls */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-500/20">
                    {user.full_name?.[0] || user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="hidden xl:block text-xs sm:text-sm text-gray-300 max-w-[100px] truncate font-medium">
                    {user.full_name || user.name || user.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-[#111827] rounded-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-700/80 z-50"
                    >
                      {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                        isAdminRoute ? (
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors font-semibold"
                          >
                            <User className="w-4 h-4" />
                            {t('common_exit_admin')}
                          </Link>
                        ) : (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {t('common_admin_console')}
                          </Link>
                        )
                      ) : null}

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        {t('profile')}
                      </Link>
                      <Link
                        to="/health-profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        {t('health_profile')}
                      </Link>
                      <hr className="border-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm text-gray-300 hover:text-white transition-colors font-medium whitespace-nowrap"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white gradient-bg rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow whitespace-nowrap"
                >
                  {t('get_started')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-gray-300 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden glass-strong border-b border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {isAdminRoute ? (
                <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 rounded-lg border border-cyan-500/20 mb-2">
                  {t('common_admin_console_nav')}
                </div>
              ) : null}

              {(isAdminRoute ? adminNavLinks : mobileUserNavLinks).map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                    {link.label}
                  </Link>
                );
              })}

              <hr className="border-white/10 my-2" />

              {/* Mobile Auth & Admin Actions */}
              {user ? (
                <div className="space-y-1 pt-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 truncate">
                    {t('common_signed_in_as')} <span className="text-white font-bold">{user.full_name || user.name || user.email}</span>
                  </div>
                  {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                    isAdminRoute ? (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        {t('common_exit_admin')}
                      </Link>
                    ) : (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        {t('common_admin_console')}
                      </Link>
                    )
                  ) : null}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-5 h-5 text-cyan-400" />
                    {t('profile')}
                  </Link>
                  <Link
                    to="/health-profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-purple-400" />
                    {t('health_profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg shadow-lg shadow-cyan-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('get_started')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
