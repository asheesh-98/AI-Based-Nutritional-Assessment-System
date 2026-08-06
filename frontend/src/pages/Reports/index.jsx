import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  TrendingUp, Activity, Target, CalendarDays, TestTube2, AlertCircle,
  Clock, Sparkles, ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import { saveOfflinePredictions, getOfflinePredictions } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, sub, color, border, aiVerifiedLabel }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-card p-5 sm:p-6 rounded-3xl relative overflow-hidden group border ${border} bg-white shadow-xs`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-2xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          {aiVerifiedLabel}
        </span>
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-black text-[#0a192f] tracking-tight leading-tight">{value}</p>
        <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">{label}</p>
        {sub && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-semibold">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Reports() {
  const { t } = useLanguage();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState('chart');

  const RISK_LABELS = {
    iron_risk: { label: t('reports_risk_iron'), color: '#f43f5e', border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-600' },
    vitamin_d_risk: { label: t('reports_risk_vitamin_d'), color: '#0284c7', border: 'border-sky-200', bg: 'bg-sky-50', text: 'text-[#0284c7]' },
    calcium_risk: { label: t('reports_risk_calcium'), color: '#8b5cf6', border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600' },
    magnesium_risk: { label: t('reports_risk_magnesium'), color: '#f59e0b', border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600' },
    potassium_risk: { label: t('reports_risk_potassium'), color: '#10b981', border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    vitamin_b12_risk: { label: t('reports_risk_b12'), color: '#6366f1', border: 'border-indigo-200', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  };

  function getRiskStatus(score) {
    if (score > 0.6) return { label: t('common_high_risk'), color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (score > 0.3) return { label: t('common_moderate_risk'), color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-400' };
    return { label: t('common_low_risk'), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  }

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
          setError(t('reports_load_error'));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <DashboardLayout title={t('reports_title')}><PageLoader /></DashboardLayout>;

  const latest = predictions[0];

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
    <DashboardLayout title={t('reports_title')} subtitle={t('reports_subtitle')}>
      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12 text-[#0a192f]">

        {/* 🌟 Hero Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden rounded-3xl bg-white/95 border border-sky-200/90 shadow-md"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/40 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-purple-600">
                <Sparkles className="w-3.5 h-3.5" />
                {t('reports_hero_badge')}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a192f] tracking-tight mb-3">
                {t('reports_hero_title1')} <span className="bg-gradient-to-r from-purple-600 via-[#0284c7] to-rose-600 bg-clip-text text-transparent">{t('reports_hero_title2')}</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-base font-semibold leading-relaxed">
                {t('reports_hero_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Link
                to="/prediction"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-[#0a192f] hover:bg-[#0284c7] shadow-md transition-all"
              >
                <Activity className="w-4 h-4" />
                {t('reports_hero_btn_run')}
              </Link>
              <Link
                to="/blood-report"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
              >
                <TestTube2 className="w-4 h-4 text-rose-600" />
                {t('reports_hero_btn_upload')}
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
            label={t('reports_stat_total_label')}
            value={predictions.length}
            sub={t('reports_stat_total_sub')}
            color="bg-sky-50 text-[#0284c7]"
            border="border-sky-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={AlertCircle}
            label={t('reports_stat_high_label')}
            value={highRiskCount}
            sub={latest ? t('reports_stat_high_in_latest') : t('reports_stat_high_no_data')}
            color="bg-rose-50 text-rose-600"
            border="border-rose-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={Target}
            label={t('reports_stat_confidence_label')}
            value={latest ? `${latestConfidence}%` : '—'}
            sub={t('reports_stat_confidence_sub')}
            color="bg-purple-50 text-purple-600"
            border="border-purple-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
          <StatCard
            icon={Clock}
            label={t('reports_stat_date_label')}
            value={latest ? new Date(latest.prediction_date).toLocaleDateString() : '—'}
            sub={latest ? new Date(latest.prediction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('reports_stat_date_run')}
            color="bg-amber-50 text-amber-600"
            border="border-amber-200"
            aiVerifiedLabel={t('reports_ai_verified')}
          />
        </motion.div>

        {predictions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 sm:p-16 text-center rounded-3xl border border-dashed border-slate-300 bg-white"
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mx-auto mb-4 text-purple-600">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0a192f] mb-2">{t('reports_empty_title')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-md mx-auto mb-6 leading-relaxed">
              {t('reports_empty_desc')}
            </p>
            <Link
              to="/prediction"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0a192f] hover:bg-[#0284c7] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all"
            >
              {t('reports_empty_btn')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* 📈 Interactive Deficiency Risk Trend Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0284c7]" />
                    {t('reports_chart_title')}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{t('reports_chart_subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedView('chart')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedView === 'chart' ? 'bg-[#0a192f] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t('reports_chart_btn_area')}
                  </button>
                  <button
                    onClick={() => setSelectedView('cards')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedView === 'cards' ? 'bg-[#0a192f] text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t('reports_chart_btn_cards')}
                  </button>
                </div>
              </div>

              {selectedView === 'chart' ? (
                <div className="h-[320px] sm:h-[380px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIron" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorVitD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorB12" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#cbd5e1',
                          borderRadius: '16px',
                          color: '#0a192f',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="Iron" stroke="#f43f5e" fillOpacity={1} fill="url(#colorIron)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="Vitamin D" stroke="#0284c7" fillOpacity={1} fill="url(#colorVitD)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="B12" stroke="#6366f1" fillOpacity={1} fill="url(#colorB12)" strokeWidth={2.5} />
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
                        className={`p-4 rounded-2xl bg-white border ${info.border} space-y-3 shadow-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${info.text}`}>{info.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-[#0a192f]">{pct}%</span>
                          <span className="text-xs text-slate-500 font-bold">{t('reports_chart_risk_score')}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
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
              className="glass-card p-5 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#0a192f] tracking-tight">{t('reports_history_title')}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{predictions.length} {t('reports_history_subtitle')}</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[700px] text-xs sm:text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-black uppercase text-[11px] tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 rounded-l-xl">{t('reports_table_session')}</th>
                      <th className="py-3 px-4">{t('reports_table_date')}</th>
                      <th className="py-3 px-4 text-rose-600">{t('reports_table_iron')}</th>
                      <th className="py-3 px-4 text-[#0284c7]">{t('reports_table_vitd')}</th>
                      <th className="py-3 px-4 text-purple-600">{t('reports_table_calcium')}</th>
                      <th className="py-3 px-4 text-amber-600">{t('reports_table_magnesium')}</th>
                      <th className="py-3 px-4 text-emerald-600">{t('reports_table_potassium')}</th>
                      <th className="py-3 px-4 text-indigo-600">{t('reports_table_b12')}</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">{t('reports_table_confidence')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {predictions.map((pred, idx) => {
                      const conf = Math.round((pred.confidence_score || 0) * 100);
                      const getRiskStatus = (val) => {
                          if (val > 0.7) return { color: 'text-rose-600' };
                          if (val > 0.4) return { color: 'text-amber-600' };
                          return { color: 'text-emerald-600' };
                      };
                      return (
                        <tr key={pred.id || idx} className="hover:bg-sky-50/50 transition-all group">
                          <td className="py-4 px-4 font-black text-slate-500 group-hover:text-[#0a192f]">
                            #{predictions.length - idx}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-700 whitespace-nowrap">
                            {new Date(pred.prediction_date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          {['iron_risk', 'vitamin_d_risk', 'calcium_risk', 'magnesium_risk', 'potassium_risk', 'vitamin_b12_risk'].map((key) => {
                            const val = Math.round((pred[key] || 0) * 100);
                            const status = getRiskStatus(pred[key] || 0);
                            return (
                              <td key={key} className={`py-4 px-4 font-black ${status.color}`}>
                                {val}%
                              </td>
                            );
                          })}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              conf > 60 ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              conf > 30 ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                              'bg-emerald-50 text-emerald-600 border border-emerald-200'
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
