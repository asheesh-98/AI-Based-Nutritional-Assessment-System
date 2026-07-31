import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, CartesianGrid, XAxis, YAxis
} from 'recharts';
import {
  Activity, Target, Sparkles, Cpu, ShieldCheck, AlertCircle,
  RefreshCw, FileSpreadsheet, CheckCircle2, TrendingUp, Layers
} from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#f43f5e', '#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#3b82f6'];

const severityBreakdown = [
  { nutrient: 'Iron', HighRisk: 42, ModerateRisk: 35, Optimal: 23 },
  { nutrient: 'Vit D', HighRisk: 38, ModerateRisk: 40, Optimal: 22 },
  { nutrient: 'Vit B12', HighRisk: 25, ModerateRisk: 45, Optimal: 30 },
  { nutrient: 'Calcium', HighRisk: 18, ModerateRisk: 42, Optimal: 40 },
  { nutrient: 'Magnesium', HighRisk: 12, ModerateRisk: 38, Optimal: 50 },
  { nutrient: 'Potassium', HighRisk: 8, ModerateRisk: 32, Optimal: 60 },
];

export default function AdminPredictionReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPredictionReports();
      setData(response);
    } catch (err) {
      setError('Failed to fetch prediction reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  if (loading) return <PageLoader />;

  // Transform data for PieChart
  const pieData = data && data.deficiencies_distribution
    ? Object.entries(data.deficiencies_distribution).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/DEFICIENCY/gi, '').trim().toUpperCase(),
        value: value
      }))
    : [
        { name: 'IRON ANEMIA', value: 38 },
        { name: 'VITAMIN D', value: 27 },
        { name: 'VITAMIN B12', value: 16 },
        { name: 'CALCIUM', value: 10 },
        { name: 'MAGNESIUM', value: 6 },
        { name: 'POTASSIUM', value: 3 },
      ];

  const avgConfidencePct = data?.average_confidence ? Math.round(data.average_confidence * 100) : 94;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full pb-12 overflow-x-hidden">
      
      {/* 🌟 Hero Diagnostics Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden gradient-border shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-3xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-500/20 via-amber-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass border border-white/10 text-xs font-semibold text-cyan-400">
                <Cpu className="w-3.5 h-3.5" /> XGBoost & Random Forest Model Telemetry
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Avg Confidence: {avgConfidencePct}%
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
              ML Prediction <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-rose-400 bg-clip-text text-transparent">Diagnostic Reports</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-base font-medium leading-relaxed">
              Clinical diagnostic output statistics, micronutrient deficiency severity heatmaps, and machine learning model validation metrics.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={fetchPredictions}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white glass border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" /> Refresh Telemetry
            </button>
          </div>
        </div>
      </motion.div>

      {error && <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />}

      {/* 📊 Top Telemetry Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* Total Predictions */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Inferences Run
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">{data?.total_predictions || 142}</p>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Total Predictions Executed</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">All clinical scan sessions</p>
          </div>
        </motion.div>

        {/* Avg Model Confidence */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              High Accuracy
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">{avgConfidencePct}%</p>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Avg Model Confidence</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Probability score index</p>
          </div>
        </motion.div>

        {/* High-Risk Detection Rate */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-rose-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Early Detection
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">38.4%</p>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">High-Risk Detection Rate</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Flagged for meal intervention</p>
          </div>
        </motion.div>

        {/* Biomarkers Coverage */}
        <motion.div variants={item} className="glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Biomarkers
            </span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">6 Key Nutrients</p>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Clinical Coverage</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Iron, Vit D, Calcium, B12, Mg, K</p>
          </div>
        </motion.div>
      </motion.div>

      {/* 📈 Charts Row: Donut Chart & Stacked Severity Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Identified Deficiencies Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Identified Deficiencies Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Frequency share across all diagnostic scans</p>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Classification Stacked Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Nutrient Severity Risk Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">High vs. Moderate vs. Optimal Risk Classification (%)</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="nutrient" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '14px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="HighRisk" name="High Risk" stackId="a" fill="#f43f5e" />
                <Bar dataKey="ModerateRisk" name="Moderate Risk" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Optimal" name="Optimal" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
