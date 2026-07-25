import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, BarChart3, Activity, Flame, Target,
  CalendarDays, TestTube2, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import dashboardService from '../../services/dashboardService';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const RISK_LABELS = {
  iron_risk: 'Iron',
  vitamin_d_risk: 'Vitamin D',
  calcium_risk: 'Calcium',
  magnesium_risk: 'Magnesium',
  potassium_risk: 'Potassium',
  vitamin_b12_risk: 'B12 / Riboflavin',
};

const RISK_COLORS = [
  'from-emerald-500 to-emerald-400',
  'from-amber-500 to-amber-400',
  'from-rose-500 to-rose-400',
];

function getRiskLevel(score) {
  if (score > 0.6) return { label: 'High', color: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-400' };
  if (score > 0.3) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-400' };
  return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-400' };
}

function RiskBar({ label, score }) {
  const risk = getRiskLevel(score);
  const pct = Math.round(score * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className={`text-xs font-semibold ${risk.color}`}>{pct}% · {risk.label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${risk.bar}`}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div variants={item} className="glass-card p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const [predictions, setPredictions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [preds, dash] = await Promise.allSettled([
          assessmentService.getPredictions(),
          dashboardService.getDashboard(),
        ]);
        if (preds.status === 'fulfilled') setPredictions(preds.value || []);
        if (dash.status === 'fulfilled') setDashboard(dash.value);
      } catch (err) {
        setError('Could not load report data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardLayout title="Reports"><PageLoader /></DashboardLayout>;

  const latest = predictions[0];

  // Average risk across all predictions per nutrient
  const avgRisks = Object.keys(RISK_LABELS).reduce((acc, key) => {
    if (predictions.length === 0) { acc[key] = 0; return acc; }
    const sum = predictions.reduce((s, p) => s + (p[key] || 0), 0);
    acc[key] = sum / predictions.length;
    return acc;
  }, {});

  const highRiskCount = latest
    ? Object.entries(RISK_LABELS).filter(([k]) => (latest[k] || 0) > 0.6).length
    : 0;
  const latestConfidence = latest ? Math.round((latest.confidence_score || 0) * 100) : 0;

  return (
    <DashboardLayout title="Reports" subtitle="Your health assessment history and nutritional risk overview">

      {/* Summary Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          icon={Activity}
          label="Total Assessments"
          value={predictions.length}
          sub="All time"
          color="bg-cyan-500/20"
        />
        <StatCard
          icon={AlertCircle}
          label="High-Risk Nutrients"
          value={highRiskCount}
          sub={latest ? 'In latest assessment' : 'No data yet'}
          color="bg-rose-500/20"
        />
        <StatCard
          icon={Target}
          label="Confidence Score"
          value={latest ? `${latestConfidence}%` : '—'}
          sub="Latest assessment"
          color="bg-purple-500/20"
        />
        <StatCard
          icon={Clock}
          label="Last Assessment"
          value={latest ? new Date(latest.prediction_date).toLocaleDateString() : '—'}
          sub={latest ? new Date(latest.prediction_date).toLocaleTimeString() : 'Run your first assessment'}
          color="bg-amber-500/20"
        />
      </motion.div>

      {predictions.length === 0 ? (
        // Empty state
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Reports Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Submit your symptoms or blood report, then run an AI assessment to generate your first nutritional report.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Latest Risk Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <TestTube2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Latest Deficiency Risk</h3>
                <p className="text-xs text-gray-500">
                  {new Date(latest.prediction_date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(RISK_LABELS).map(([key, label]) => (
                <RiskBar key={key} label={label} score={latest[key] || 0} />
              ))}
            </div>
          </motion.div>

          {/* Average Risk Trends (across all assessments) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Average Risk Across All Assessments</h3>
                <p className="text-xs text-gray-500">{predictions.length} assessment(s) total</p>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(RISK_LABELS).map(([key, label]) => (
                <RiskBar key={key} label={label} score={avgRisks[key] || 0} />
              ))}
            </div>
          </motion.div>

          {/* Assessment History Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CalendarDays className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-white">Assessment History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-white/5">
                    <th className="pb-3 text-gray-500 font-medium">#</th>
                    <th className="pb-3 text-gray-500 font-medium">Date</th>
                    <th className="pb-3 text-gray-500 font-medium">Iron</th>
                    <th className="pb-3 text-gray-500 font-medium">Vit D</th>
                    <th className="pb-3 text-gray-500 font-medium">Calcium</th>
                    <th className="pb-3 text-gray-500 font-medium">Magnesium</th>
                    <th className="pb-3 text-gray-500 font-medium">Potassium</th>
                    <th className="pb-3 text-gray-500 font-medium">B12/Ribo</th>
                    <th className="pb-3 text-gray-500 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {predictions.map((pred, idx) => {
                    const conf = Math.round((pred.confidence_score || 0) * 100);
                    return (
                      <tr key={pred.id} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 text-gray-500">{predictions.length - idx}</td>
                        <td className="py-3 text-gray-300">
                          {new Date(pred.prediction_date).toLocaleDateString()}
                        </td>
                        {['iron_risk', 'vitamin_d_risk', 'calcium_risk', 'magnesium_risk', 'potassium_risk', 'vitamin_b12_risk'].map(key => {
                          const risk = getRiskLevel(pred[key] || 0);
                          return (
                            <td key={key} className={`py-3 font-medium ${risk.color}`}>
                              {Math.round((pred[key] || 0) * 100)}%
                            </td>
                          );
                        })}
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            conf > 60 ? 'bg-rose-500/15 text-rose-400' :
                            conf > 30 ? 'bg-amber-500/15 text-amber-400' :
                            'bg-emerald-500/15 text-emerald-400'
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
    </DashboardLayout>
  );
}
