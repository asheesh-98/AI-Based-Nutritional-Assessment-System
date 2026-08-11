import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Flame, Droplets, Utensils,
  Stethoscope, Plus, ArrowRight, Sparkles, ChevronRight,
  Zap, ScanBarcode, Bot, TestTube2, Headphones
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

  const handleAddWater = async () => {
    try {
      const res = await dashboardService.logWaterIntake(250);
      if (res?.water_intake !== undefined) {
        setWaterAmount(res.water_intake);
      } else {
        setWaterAmount((prev) => parseFloat((prev + 0.25).toFixed(2)));
      }
    } catch (err) {
      setWaterAmount((prev) => parseFloat((prev + 0.25).toFixed(2)));
    }
  };

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  const quickActions = [
    { label: t('sidebar_mental_wellness'), desc: t('mental_wellness_subtitle'), icon: Headphones, path: '/mental-wellness', primary: true },
    { label: t('dashboard_qa_blood_label'), desc: t('dashboard_qa_blood_desc'), icon: TestTube2, path: '/blood-report' },
    { label: t('dashboard_qa_symptoms_label'), desc: t('dashboard_qa_symptoms_desc'), icon: Stethoscope, path: '/symptoms' },
    { label: t('dashboard_qa_meal_label'), desc: t('dashboard_qa_meal_desc'), icon: Utensils, path: '/meal-plan' },
    { label: t('dashboard_qa_scan_label'), desc: t('dashboard_qa_scan_desc'), icon: ScanBarcode, path: '/food-scanner' },
    { label: t('dashboard_qa_coach_label'), desc: t('dashboard_qa_coach_desc'), icon: Bot, path: '/ai-coach' },
  ];

  const currentCalories = Math.round(data?.daily_calories || data?.nutrient_summary?.calories_today || 0);
  const targetCalories = Math.round(data?.daily_calorie_target || 2000);
  const caloriePercent = Math.min(100, Math.round((currentCalories / targetCalories) * 100));

  const waterTarget = data?.water_target || 3.0;
  const waterPercent = Math.min(100, Math.round((waterAmount / waterTarget) * 100));

  const deficiencyCount = data?.deficiency_count ?? 0;
  const riskLevelText = data?.risk_level || (deficiencyCount > 0 ? t('dashboard_mild_risk') : 'Optimal');

  const nutritionScoreVal = Math.round(data?.nutrition_score || 85);

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
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 shadow-md shadow-purple-500/25 transition-all cursor-pointer border-0"
              >
                <Activity className="w-4 h-4 text-white" />
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
                  {nutritionScoreVal >= 80 ? '+5% Optimal' : nutritionScoreVal >= 60 ? 'Moderate' : 'Needs Focus'}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_nutrition_score_label')}</p>
                  <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{nutritionScoreVal}<span className="text-sm font-bold text-slate-400">/100</span></p>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#0284c7]" strokeDasharray={`${nutritionScoreVal}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
                  {riskLevelText}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_deficiency_risks_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{deficiencyCount} <span className="text-xs font-bold text-slate-400">{t('dashboard_nutrients_tracked')}</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, deficiencyCount * 25))}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-amber-600">{riskLevelText}</span>
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
                  Target: {targetCalories.toLocaleString()}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('dashboard_daily_calories_label')}</p>
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{currentCalories.toLocaleString()} <span className="text-xs font-bold text-slate-400">kcal</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${caloriePercent}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600">{caloriePercent}%</span>
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
                <p className="text-3xl sm:text-4xl font-black text-[#0a192f]">{waterAmount}L <span className="text-xs font-bold text-slate-400">/ {waterTarget}L Target</span></p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-purple-600">{waterPercent}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 🚀 Main Timeline: Recent Diagnostic & Assessment Records */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card p-5 sm:p-8 rounded-3xl bg-white/95 border border-slate-200/90 shadow-md w-full"
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
            <div className="space-y-3 sm:space-y-4">
              {data.recent_predictions.slice(0, 5).map((pred, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.005 }}
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
            <div className="text-center py-10 sm:py-14 flex flex-col items-center justify-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
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
    </DashboardLayout>
  );
}
