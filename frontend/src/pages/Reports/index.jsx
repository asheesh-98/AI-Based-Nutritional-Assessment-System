import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Activity, Target,
  CalendarDays, TestTube2, AlertCircle, Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/common/Loader';
import { useLanguage } from '../../context/LanguageContext';
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
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={`font-semibold ${risk.color}`}>{pct}% · {risk.label}</span>
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
    <motion.div variants={item} className="glass-card p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 min-w-0">
      <div className={`p-3 rounded-xl shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1 break-words">
        <p className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{value}</p>
        <p className="text-xs sm:text-sm text-gray-300 font-medium mt-0.5 leading-snug">{label}</p>
        {sub && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const { t } = useLanguage();
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

  if (loading) return <DashboardLayout title={t('reports') || "Reports"}><PageLoader /></DashboardLayout>;

  const latest = predictions[0];

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
    <DashboardLayout title={t('reports') || "Reports"} subtitle="Your health assessment history and nutritional risk overview">

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-5 mb-6 sm:mb-8"
      >
        <StatCard
          icon={Activity}
          label={t('total_assessments') || "Total Assessments"}
          value={predictions.length}
          sub="All time"
          color="bg-cyan-500/20 text-cyan-400"
        />
        <StatCard
          icon={AlertCircle}
          label={t('high_risk_nutrients') || "High-Risk Nutrients"}
          value={highRiskCount}
          sub={latest ? 'In latest assessment' : 'No data yet'}
          color="bg-rose-500/20 text-rose-400"
        />
        <StatCard
          icon={Target}
          label={t('confidence_score') || "Confidence Score"}
          value={latest ? `${latestConfidence}%` : '—'}
          sub="Latest assessment"
          color="bg-purple-500/20 text-purple-400"
        />
        <StatCard
          icon={Clock}
          label={t('last_assessment') || "Last Assessment"}
          value={latest ? new Date(latest.prediction_date).toLocaleDateString() : '—'}
          sub={latest ? new Date(latest.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Run your first assessment'}
          color="bg-amber-500/20 text-amber-400"
        />
      </motion.div>

      {predictions.length === 0 ? (
        // Empty state
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 sm:p-12 text-center"
        >
          <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Reports Yet</h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Submit your symptoms or blood report, then run an AI assessment to generate your first nutritional report.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

          {/* Latest Risk Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 shrink-0">
                <TestTube2 className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-white truncate">Latest Deficiency Risk</h3>
                <p className="text-xs text-gray-400 truncate">
                  {new Date(latest.prediction_date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-3.5 sm:space-y-4">
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
            className="glass-card p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-white truncate">Average Risk Across All Assessments</h3>
                <p className="text-xs text-gray-400 truncate">{predictions.length} assessment(s) total</p>
              </div>
            </div>
            <div className="space-y-3.5 sm:space-y-4">
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
            className="glass-card p-4 sm:p-6 lg:col-span-2 overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 shrink-0">
                <CalendarDays className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white">Assessment History</h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[640px] text-xs sm:text-sm">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 text-gray-400 font-medium">#</th>
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                    <th className="pb-3 text-gray-400 font-medium">Iron</th>
                    <th className="pb-3 text-gray-400 font-medium">Vit D</th>
                    <th className="pb-3 text-gray-400 font-medium">Calcium</th>
                    <th className="pb-3 text-gray-400 font-medium">Magnesium</th>
                    <th className="pb-3 text-gray-400 font-medium">Potassium</th>
                    <th className="pb-3 text-gray-400 font-medium">B12/Ribo</th>
                    <th className="pb-3 text-gray-400 font-medium">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {predictions.map((pred, idx) => {
                    const conf = Math.round((pred.confidence_score || 0) * 100);
                    return (
                      <tr key={pred.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 text-gray-500">{predictions.length - idx}</td>
                        <td className="py-3 text-gray-300 font-medium whitespace-nowrap">
                          {new Date(pred.prediction_date).toLocaleDateString()}
                        </td>
                        {['iron_risk', 'vitamin_d_risk', 'calcium_risk', 'magnesium_risk', 'potassium_risk', 'vitamin_b12_risk'].map(key => {
                          const risk = getRiskLevel(pred[key] || 0);
                          return (
                            <td key={key} className={`py-3 font-semibold ${risk.color}`}>
                              {Math.round((pred[key] || 0) * 100)}%
                            </td>
                          );
                        })}
                        <td className="py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            conf > 60 ? 'bg-rose-500/20 text-rose-400' :
                            conf > 30 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
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
