import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Flame, Droplets, Utensils,
  Stethoscope, Plus, ArrowRight, Sparkles, ChevronRight,
  Zap, ScanBarcode, Bot, TestTube2
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { SkeletonCard } from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import { saveOfflineDashboard, getOfflineDashboard } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waterAmount, setWaterAmount] = useState(2.1);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res);
        if (res?.water_intake) setWaterAmount(res.water_intake);
        saveOfflineDashboard(res);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        const cached = getOfflineDashboard();
        if (cached) {
          setData(cached);
          if (cached.water_intake) setWaterAmount(cached.water_intake);
        } else {
          setData({
            nutrition_score: 82,
            deficiency_count: 3,
            daily_calories: 1850,
            water_intake: 2.1,
            recent_predictions: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAddWater = () => {
    setWaterAmount((prev) => parseFloat((prev + 0.25).toFixed(2)));
  };

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  const quickActions = [
    { label: t('dashboard_qa_run_ai_label'), desc: t('dashboard_qa_run_ai_desc'), icon: Activity, path: '/prediction', primary: true },
    { label: t('dashboard_qa_blood_label'), desc: t('dashboard_qa_blood_desc'), icon: TestTube2, path: '/blood-report' },
    { label: t('dashboard_qa_symptoms_label'), desc: t('dashboard_qa_symptoms_desc'), icon: Stethoscope, path: '/symptoms' },
    { label: t('dashboard_qa_meal_label'), desc: t('dashboard_qa_meal_desc'), icon: Utensils, path: '/meal-plan' },
    { label: t('dashboard_qa_scan_label'), desc: t('dashboard_qa_scan_desc'), icon: ScanBarcode, path: '/food-scanner' },
    { label: t('dashboard_qa_coach_label'), desc: t('dashboard_qa_coach_desc'), icon: Bot, path: '/ai-coach' },
  ];

  return (
    <DashboardLayout title={t('dashboard_title')} subtitle={t('dashboard_subtitle')}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-10 text-[#0a192f]">
        
        {/* 🌟 Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-md rounded-3xl bg-white/95 border border-slate-200/90"
        >
          {/* Ambient Soft Sky Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-black text-[#0284c7]">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
                  {t('dashboard_good') + ' '}{new Date().getHours() < 12 ? t('dashboard_morning') : new Date().getHours() < 18 ? t('dashboard_afternoon') : t('dashboard_evening')}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-600">
                  {t('dashboard_health_streak')}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3 break-words">
                {t('dashboard_welcome_back') + ' '}<span className="bg-gradient-to-r from-[#0284c7] via-indigo-600 to-emerald-600 bg-clip-text text-transparent break-all sm:break-normal">{userName}</span>!
              </h2>

              <p className="text-slate-600 text-xs sm:text-base max-w-xl font-semibold leading-relaxed">
                {t('dashboard_metabolic_prefix') + ' '}<span className="text-[#0284c7] font-black">{t('dashboard_metabolic_highlight')}</span>{' ' + t('dashboard_metabolic_suffix')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                to="/prediction"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#0a192f] hover:bg-[#0284c7] shadow-md transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-sky-400" />
                {t('dashboard_btn_run_ai')}
              </Link>
              <Link
                to="/meal-plan"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-emerald-600" />
                {t('dashboard_btn_meal_plan')}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 📊 Interactive Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {/* Card 1: Nutrition Score */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-sky-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  {t('dashboard_nutrition_score_badge')}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_nutrition_score_label')}</p>
                  <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{data?.nutrition_score || 82}<span className="text-sm font-bold text-slate-400">/100</span></p>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#0284c7]" strokeDasharray={`${data?.nutrition_score || 82}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Deficiency Risks */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-amber-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  {t('dashboard_deficiency_risks_badge')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_deficiency_risks_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{data?.deficiency_count ?? 3} <span className="text-xs font-bold text-slate-400">{t('dashboard_nutrients_tracked')}</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="text-[10px] font-black text-amber-600">{t('dashboard_mild_risk')}</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Daily Calories Meter */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-emerald-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {t('dashboard_daily_calories_target')}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_daily_calories_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{(data?.daily_calories || 1850).toLocaleString()} <span className="text-xs font-bold text-slate-400">kcal</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((data?.daily_calories || 1850) / 2000) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600">{Math.round(((data?.daily_calories || 1850) / 2000) * 100)}%</span>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Interactive Hydration Tracker */}
            <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-slate-200/90 bg-white/95 hover:border-purple-300 transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <button
                  onClick={handleAddWater}
                  className="text-xs font-black text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  title={t('dashboard_add_water')}
                >
                  <Plus className="w-3 h-3" /> 250ml
                </button>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_water_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{waterAmount}L <span className="text-xs font-bold text-slate-400">{t('dashboard_water_target')}</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (waterAmount / 3.0) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-purple-600">{Math.round((waterAmount / 3.0) * 100)}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🚀 Main Grid: Recent Assessments & AI Assistant Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column (2 cols): Recent Assessment Timeline */}
          <div className="lg:col-span-2 flex flex-col h-full space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card p-5 sm:p-8 rounded-3xl flex-1 flex flex-col bg-white/95 border border-slate-200/90 shadow-md"
            >
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('dashboard_diagnostic_title')}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('dashboard_diagnostic_subtitle')}</p>
                </div>
                <Link to="/reports" className="text-xs sm:text-sm font-extrabold text-[#0284c7] hover:text-sky-800 transition-colors flex items-center gap-1">
                  {t('common_view_all')} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {data?.recent_predictions?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 flex-1">
                  {data.recent_predictions.slice(0, 4).map((pred, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer gap-3 sm:gap-0 shadow-xs"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                           (pred.risk || 0) > 60 ? 'bg-rose-50 border-rose-200 text-rose-600' :
                           (pred.risk || 0) > 30 ? 'bg-amber-50 border-amber-200 text-amber-600' :
                           'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-black text-[#0a192f] leading-tight">{pred.deficiency || t('dashboard_default_assessment')}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">{pred.date || 'Today, 10:45 AM'}</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider ${
                        (pred.risk || 0) > 60 ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        (pred.risk || 0) > 30 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {(pred.risk || 0) > 60 ? t('common_high_risk') : (pred.risk || 0) > 30 ? t('common_moderate_risk') : t('common_low_risk')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-14 flex-1 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 text-[#0284c7] shadow-xs">
                    <Activity className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#0a192f] mb-2">{t('dashboard_empty_title')}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mb-6 max-w-sm mx-auto leading-relaxed">
                    {t('dashboard_empty_desc')}
                  </p>
                  <Link
                    to="/prediction"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    {t('dashboard_empty_btn')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column (1 col): Interactive Quick Actions Hub */}
          <div className="flex flex-col h-full space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-card p-5 sm:p-8 rounded-3xl flex-1 flex flex-col bg-white/95 border border-slate-200/90 shadow-md"
            >
              <div className="flex items-center gap-2.5 mb-5 sm:mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 rounded-xl bg-sky-50 text-[#0284c7] border border-sky-100">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('dashboard_quick_actions_title')}</h3>
              </div>

              <div className="space-y-3 flex-1">
                {quickActions.map((action, idx) => (
                  <motion.div key={action.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.08 }}>
                    <Link
                      to={action.path}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 group border cursor-pointer ${
                        action.primary
                          ? 'bg-sky-50/80 border-sky-200 hover:border-[#0284c7] shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${action.primary ? 'bg-[#0a192f] text-white shadow-xs' : 'bg-white text-slate-700 group-hover:text-[#0284c7] border border-slate-200 transition-colors'}`}>
                        <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs sm:text-sm font-black truncate ${action.primary ? 'text-[#0a192f]' : 'text-slate-800 group-hover:text-[#0a192f] transition-colors'}`}>
                          {action.label}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5">{action.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${action.primary ? 'text-[#0284c7]' : 'text-slate-400 group-hover:text-[#0284c7]'}`} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
