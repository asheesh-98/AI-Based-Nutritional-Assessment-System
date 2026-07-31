import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, Activity, Target, CalendarDays, TestTube2, AlertCircle,
  Clock, Sparkles, ArrowRight, ShieldCheck, Download, Filter, Eye, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import dashboardService from '../../services/dashboardService';
import { saveOfflinePredictions, getOfflinePredictions } from '../../utils/offlineStorage';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const RISK_LABELS = {
  iron_risk: { label: 'Iron Deficiency', color: '#f43f5e', border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  vitamin_d_risk: { label: 'Vitamin D Deficiency', color: '#06b6d4', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  calcium_risk: { label: 'Calcium Deficiency', color: '#a855f7', border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  magnesium_risk: { label: 'Magnesium Deficiency', color: '#f59e0b', border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  potassium_risk: { label: 'Potassium Deficiency', color: '#10b981', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  vitamin_b12_risk: { label: 'B12 / Riboflavin Deficiency', color: '#3b82f6', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
};

function getRiskStatus(score) {
  if (score > 0.6) return { label: 'High Risk', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', bar: 'bg-rose-500' };
  if (score > 0.3) return { label: 'Moderate Risk', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bar: 'bg-amber-400' };
  return { label: 'Optimal / Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'bg-emerald-400' };
}

function StatCard({ icon: Icon, label, value, sub, color, border }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden group border ${border} shadow-lg`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          AI Verified
        </span>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">{value}</p>
        <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">{label}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('chart'); // 'chart' or 'cards'

  useEffect(() => {
    const load = async () => {
      try {
        const preds = await assessmentService.getPredictions();
        setPredictions(preds || []);
        saveOfflinePredictions(preds);
      } catch (err) {
        console.error('Failed to load predictions:', err);
        const cached = getOfflinePredictions();
        if (cached) {
          setPredictions(cached);
        } else {
          setError('Could not load report data.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardLayout title="Reports"><PageLoader /></DashboardLayout>;

  const latest = predictions[0];

  // Prepare chart timeline data (oldest to newest)
  const chartData = [...predictions].reverse().map((p, idx) => ({
    name: `Test #${idx + 1}`,
    date: new Date(p.prediction_date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    Iron: Math.round((p.iron_risk || 0) * 100),
    'Vitamin D': Math.round((p.vitamin_d_risk || 0) * 100),
    Calcium: Math.round((p.calcium_risk || 0) * 100),
    Magnesium: Math.round((p.magnesium_risk || 0) * 100),
    Potassium: Math.round((p.potassium_risk || 0) * 100),
    B12: Math.round((p.vitamin_b12_risk || 0) * 100),
  }));

  const highRiskCount = latest
    ? Object.keys(RISK_LABELS).filter((k) => (latest[k] || 0) > 0.6).length
    : 0;
  const latestConfidence = latest ? Math.round((latest.confidence_score || 0) * 100) : 0;

  return (
    <DashboardLayout title="Reports" subtitle="Clinical nutritional deficiency history, diagnostic trend analytics & risk profiles">
      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12">

        {/* 🌟 Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden gradient-border shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-3xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-cyan-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-500/20 via-amber-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3.5 h-3.5" />
                AI Diagnostic Report Suite
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                Nutritional <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-rose-400 bg-clip-text text-transparent">Risk Analytics</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-base font-medium leading-relaxed">
                Track your biomarker evolution over time. Our multi-layer machine learning engine detects early micronutrient deficiency patterns.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                to="/prediction"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white gradient-bg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Activity className="w-4 h-4" />
                Run New Assessment
              </Link>
              <Link
                to="/blood-report"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white glass border border-white/10 hover:bg-white/10 transition-all"
              >
                <TestTube2 className="w-4 h-4 text-rose-400" />
                Upload Lab PDF
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 📊 Summary Metric Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          <StatCard
            icon={Activity}
            label="Total Assessments"
            value={predictions.length}
            sub="All-time diagnostic logs"
            color="bg-cyan-500/20 text-cyan-400"
            border="border-cyan-500/20"
          />
          <StatCard
            icon={AlertCircle}
            label="High-Risk Nutrients"
            value={highRiskCount}
            sub={latest ? 'In latest assessment' : 'No risk data yet'}
            color="bg-rose-500/20 text-rose-400"
            border="border-rose-500/20"
          />
          <StatCard
            icon={Target}
            label="Model Confidence"
            value={latest ? `${latestConfidence}%` : '—'}
            sub="Latest prediction accuracy"
            color="bg-purple-500/20 text-purple-400"
            border="border-purple-500/20"
          />
          <StatCard
            icon={Clock}
            label="Last Assessment Date"
            value={latest ? new Date(latest.prediction_date).toLocaleDateString() : '—'}
            sub={latest ? new Date(latest.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Run first test'}
            color="bg-amber-500/20 text-amber-400"
            border="border-amber-500/20"
          />
        </motion.div>

        {predictions.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 sm:p-16 text-center rounded-3xl border border-dashed border-white/10"
          >
            <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mb-2">No Reports Generated Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Complete your clinical symptom questionnaire or upload blood lab reports to generate your first nutritional risk profile.
            </p>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-2 px-6 py-3.5 gradient-bg text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-purple-500/25 hover:scale-105 transition-all"
            >
              Start First Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* 📈 Interactive Deficiency Risk Trend Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Biomarker Deficiency Trend Analytics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Historical risk progression across all assessment tests</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedView('chart')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedView === 'chart' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Area Chart
                  </button>
                  <button
                    onClick={() => setSelectedView('cards')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedView === 'cards' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Risk Cards
                  </button>
                </div>
              </div>

              {selectedView === 'chart' ? (
                <div className="h-[320px] sm:h-[380px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIron" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVitD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorB12" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '16px',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                      <Area type="monotone" dataKey="Iron" stroke="#f43f5e" fillOpacity={1} fill="url(#colorIron)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Vitamin D" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVitD)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="B12" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB12)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {Object.entries(RISK_LABELS).map(([key, info]) => {
                    const score = latest ? latest[key] || 0 : 0;
                    const status = getRiskStatus(score);
                    const pct = Math.round(score * 100);
                    return (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-2xl glass border ${info.border} space-y-3`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${info.text}`}>{info.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-white">{pct}%</span>
                          <span className="text-xs text-slate-400 font-medium">Risk Score</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* 📋 Comprehensive Assessment History Timeline Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Diagnostic History Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{predictions.length} recorded diagnostic sessions</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[700px] text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left border-b border-white/10 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="pb-3 pl-2">Session #</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-rose-400">Iron</th>
                      <th className="pb-3 text-cyan-400">Vit D</th>
                      <th className="pb-3 text-purple-400">Calcium</th>
                      <th className="pb-3 text-amber-400">Magnesium</th>
                      <th className="pb-3 text-emerald-400">Potassium</th>
                      <th className="pb-3 text-blue-400">B12 / Ribo</th>
                      <th className="pb-3 pr-2 text-right">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {predictions.map((pred, idx) => {
                      const conf = Math.round((pred.confidence_score || 0) * 100);
                      return (
                        <tr key={pred.id || idx} className="hover:bg-white/5 transition-all group">
                          <td className="py-3.5 pl-2 font-bold text-slate-400 group-hover:text-white">
                            #{predictions.length - idx}
                          </td>
                          <td className="py-3.5 font-bold text-slate-200 whitespace-nowrap">
                            {new Date(pred.prediction_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          {['iron_risk', 'vitamin_d_risk', 'calcium_risk', 'magnesium_risk', 'potassium_risk', 'vitamin_b12_risk'].map((key) => {
                            const val = Math.round((pred[key] || 0) * 100);
                            const status = getRiskStatus(pred[key] || 0);
                            return (
                              <td key={key} className={`py-3.5 font-extrabold ${status.color}`}>
                                {val}%
                              </td>
                            );
                          })}
                          <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              conf > 60 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              conf > 30 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {conf}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
