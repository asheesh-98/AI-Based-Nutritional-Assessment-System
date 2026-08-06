import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown, LogOut, User, Settings, Globe,
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
  const { t, openLanguageModal, currentLanguageObj } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Navigation links for mobile drawer menu
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md w-full border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Brand Logo */}
          <Link to={isAdminRoute ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0077ff] flex items-center justify-center shadow-md shadow-blue-500/20">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">NutriAI</span>
              {isAdminRoute && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[#0077ff] text-[10px] font-black uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
          </Link>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Selector Dropdown */}
            {!isAdminRoute && <LanguageSelector compact={true} />}

            {/* Desktop Auth Controls */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0077ff] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user.full_name?.[0] || user.name?.[0] || user.email?.[0] || 'U'}
                  </div>
                  <span className="hidden xl:block text-xs sm:text-sm text-slate-700 max-w-[110px] truncate font-semibold">
                    {user.full_name || user.name || user.email}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 shadow-xl border border-slate-200 z-50 text-slate-800"
                    >
                      {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                        isAdminRoute ? (
                          <Link
                            to="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#0077ff] hover:bg-blue-50 transition-colors font-bold"
                          >
                            <User className="w-4 h-4" />
                            {t('common_exit_admin')}
                          </Link>
                        ) : (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#0077ff] hover:bg-blue-50 transition-colors font-bold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {t('common_admin_console')}
                          </Link>
                        )
                      ) : null}

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#0077ff]" />
                        {t('profile')}
                      </Link>
                      <Link
                        to="/health-profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-600" />
                        {t('health_profile')}
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          openLanguageModal();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors w-full text-left cursor-pointer"
                      >
                        <Globe className="w-4 h-4 text-[#0077ff]" />
                        {t('change_language')} ({currentLanguageObj.native})
                      </button>
                      <hr className="border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full cursor-pointer"
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
                  className="px-3.5 py-2 text-xs sm:text-sm text-slate-700 hover:text-slate-900 transition-colors font-bold whitespace-nowrap"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0077ff] hover:bg-[#0066ff] rounded-xl shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
                >
                  {t('get_started')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
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
            className="lg:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="p-4 space-y-2 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {isAdminRoute ? (
                <div className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#0077ff] bg-blue-50 rounded-lg border border-blue-100 mb-2">
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
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                      transition-all duration-200
                      ${isActive
                        ? 'bg-[#0077ff] text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {link.label}
                  </Link>
                );
              })}

              <hr className="border-slate-200 my-2" />

              {/* Mobile Auth & Admin Actions */}
              {user ? (
                <div className="space-y-1 pt-1">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-500 truncate">
                    {t('common_signed_in_as')} <span className="text-slate-900 font-bold">{user.full_name || user.name || user.email}</span>
                  </div>
                  {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                    isAdminRoute ? (
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#0077ff] hover:bg-blue-50 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        {t('common_exit_admin')}
                      </Link>
                    ) : (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-[#0077ff] hover:bg-blue-50 transition-colors"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        {t('common_admin_console')}
                      </Link>
                    )
                  ) : null}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-5 h-5 text-[#0077ff]" />
                    {t('profile')}
                  </Link>
                  <Link
                    to="/health-profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-purple-600" />
                    {t('health_profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors w-full cursor-pointer"
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
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0077ff] shadow-md shadow-blue-500/20"
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
