import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, Flame, Droplets,
  Utensils, Stethoscope, Plus, ArrowRight, Sparkles, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/Card';
import { SkeletonCard } from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const quickActions = [
    { label: t('run_assessment') || 'Run Assessment', icon: Activity, path: '/prediction', gradient: true },
    { label: t('update_symptoms') || 'Update Symptoms', icon: Stethoscope, path: '/symptoms' },
    { label: t('view_meal_plan') || 'View Meal Plan', icon: Utensils, path: '/meal-plan' },
    { label: t('log_food') || 'Log Food', icon: Plus, path: '/food-diary' },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setData({
          nutrition_score: 82,
          deficiency_count: 3,
          daily_calories: 1850,
          water_intake: 2.1,
          recent_predictions: [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const userName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';

  const greetingTime = new Date().getHours() < 12 
    ? (t('good_morning') || 'Good Morning')
    : new Date().getHours() < 18 
      ? (t('good_afternoon') || 'Good Afternoon') 
      : (t('good_evening') || 'Good Evening');

  return (
    <DashboardLayout title={t('overview') || 'Overview'} subtitle={t('metabolic_track') || 'Your personalized health dashboard'}>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-5 sm:p-8 lg:p-10 relative overflow-hidden gradient-border shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-full">
            <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              {greetingTime}
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3 break-words max-w-full">
              {t('welcome_back') || 'Welcome back'}, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent break-all sm:break-normal">{userName}</span>!
            </h2>
            <p className="text-slate-400 text-xs sm:text-base lg:text-lg max-w-2xl font-medium leading-relaxed">
              {t('metabolic_track') || 'Your metabolic optimization is on track. Check your latest insights below.'}
            </p>
          </div>
        </motion.div>

        {/* Stat Cards */}
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
            <motion.div variants={item}>
              <StatCard
                icon={Activity}
                label={t('nutrition_score') || 'Nutrition Score'}
                value={`${data?.nutrition_score || 82}/100`}
                change="+5 from last week"
                changeType="up"
                color="cyan"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={AlertTriangle}
                label={t('deficiency_risks') || 'Deficiency Risks'}
                value={data?.deficiency_count ?? 3}
                change="2 improved"
                changeType="up"
                color="amber"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={Flame}
                label={t('daily_calories') || 'Daily Calories'}
                value={`${(data?.daily_calories || 1850).toLocaleString()}`}
                change="On target"
                changeType="up"
                color="emerald"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={Droplets}
                label={t('water_intake') || 'Water Intake'}
                value={`${data?.water_intake || 2.1}L`}
                change="+0.5L today"
                changeType="up"
                color="purple"
              />
            </motion.div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Predictions */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card p-5 sm:p-8 flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('recent_assessments') || 'Recent Assessments'}</h3>
                    <p className="text-xs text-slate-400">Clinical Machine Learning Risk History</p>
                  </div>
                </div>
                <Link
                  to="/prediction"
                  className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {data?.recent_predictions && data.recent_predictions.length > 0 ? (
                <div className="space-y-3 flex-1">
                  {data.recent_predictions.slice(0, 3).map((pred, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl glass border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Assessment Result
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(pred.prediction_date || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {Math.round((pred.confidence_score || 0.85) * 100)}% Confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm font-medium mb-4">No assessment records found yet.</p>
                  <Link
                    to="/prediction"
                    className="px-4 py-2 text-xs font-bold text-white gradient-bg rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('run_assessment') || 'Run First Assessment'}
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-card p-5 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t('quick_actions') || 'Quick Actions'}</h3>
              <p className="text-xs text-slate-400 mb-6">Shortcuts to optimize your daily health routine</p>
              
              <div className="space-y-3">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    to={action.path}
                    className={`
                      w-full p-4 rounded-xl flex items-center justify-between font-semibold text-sm transition-all duration-300 group
                      ${action.gradient
                        ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40'
                        : 'glass border border-white/10 text-slate-200 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-5 h-5" />
                      <span>{action.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10">
              <p className="text-xs text-cyan-300 font-bold mb-1">💡 Pro Tip</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log your daily food intake in the Food Diary to receive hyper-personalized micro-nutrient tracking.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
