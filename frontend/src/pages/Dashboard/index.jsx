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
import dashboardService from '../../services/dashboardService';

const quickActions = [
  { label: 'Run Assessment', icon: Activity, path: '/prediction', gradient: true },
  { label: 'Update Symptoms', icon: Stethoscope, path: '/symptoms' },
  { label: 'View Meal Plan', icon: Utensils, path: '/meal-plan' },
  { label: 'Log Food', icon: Plus, path: '/food-diary' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Use fallback data
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

  return (
    <DashboardLayout title="Overview" subtitle="Your personalized health dashboard">
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
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3 break-words max-w-full">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent break-all sm:break-normal">{userName}</span>!
            </h2>
            <p className="text-slate-400 text-xs sm:text-base lg:text-lg max-w-2xl font-medium leading-relaxed">
              Your metabolic optimization is on track. Check your latest insights below.
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
                label="Nutrition Score"
                value={`${data?.nutrition_score || 82}/100`}
                change="+5 from last week"
                changeType="up"
                color="cyan"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={AlertTriangle}
                label="Deficiency Risks"
                value={data?.deficiency_count ?? 3}
                change="2 improved"
                changeType="up"
                color="amber"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={Flame}
                label="Daily Calories"
                value={`${(data?.daily_calories || 1850).toLocaleString()}`}
                change="On target"
                changeType="up"
                color="emerald"
              />
            </motion.div>
            <motion.div variants={item}>
              <StatCard
                icon={Droplets}
                label="Water Intake"
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
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Recent Assessments</h3>
                <Link to="/reports" className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {data?.recent_predictions?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 flex-1">
                  {data.recent_predictions.slice(0, 4).map((pred, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl glass border border-white/5 transition-all cursor-pointer gap-3 sm:gap-0"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                           (pred.risk || 0) > 60 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                           (pred.risk || 0) > 30 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                           'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-bold text-white leading-tight">{pred.deficiency || 'Routine Assessment'}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">{pred.date || 'Today, 10:45 AM'}</p>
                        </div>
                      </div>
                      <span className={`self-start sm:self-auto text-[10px] sm:text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                        (pred.risk || 0) > 60 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                        (pred.risk || 0) > 30 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {(pred.risk || 0) > 60 ? 'High Risk' : (pred.risk || 0) > 30 ? 'Moderate Risk' : 'Low Risk'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mb-2">No assessments yet</h4>
                  <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">Complete your symptom tracker or upload blood reports to get a diagnostic reading.</p>
                  <Link
                    to="/prediction"
                    className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 gradient-bg text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow"
                  >
                    Run First Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col h-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="glass-card p-5 sm:p-8 flex-1"
            >
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-4 sm:mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, idx) => (
                  <motion.div key={action.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}>
                    <Link
                      to={action.path}
                      className={`flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 group ${
                        action.gradient
                          ? 'gradient-bg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40'
                          : 'glass border border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`p-2.5 sm:p-3 rounded-xl ${action.gradient ? 'bg-white/20' : 'bg-white/5 group-hover:bg-cyan-500/20 transition-colors'}`}>
                        <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.gradient ? 'text-white' : 'text-slate-300 group-hover:text-cyan-400 transition-colors'}`} />
                      </div>
                      <span className={`text-sm sm:text-base font-bold ${action.gradient ? 'text-white' : 'text-slate-300 group-hover:text-white transition-colors'}`}>
                        {action.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 ml-auto ${action.gradient ? 'text-white/60' : 'text-slate-500 group-hover:text-cyan-400 transition-colors'}`} />
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
