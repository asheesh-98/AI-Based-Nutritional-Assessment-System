import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  Stethoscope, TestTube2, Utensils, Info, Clock, Bot, FileText,
  ShieldCheck, Cpu, Zap, CheckCircle2, AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

function CircularProgressRiskLabel({ t }) {
  return <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('prediction_risk_label')}</span>;
}

function CircularProgress({ percentage, size = 110, strokeWidth = 7, getRiskInfo, t }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const risk = getRiskInfo(percentage);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={risk.color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{Math.round(percentage)}%</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('prediction_risk_label')}</span>
      </div>
    </div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

export default function Prediction() {
  const { t } = useLanguage();

  const deficiencyNames = {
    'Iron_Anemia_Deficiency': t('prediction_def_iron'),
    'Vitamin_D_Deficiency': t('prediction_def_vitamin_d'),
    'Vitamin_B12_Deficiency': t('prediction_def_vitamin_b12'),
    'Calcium_Deficiency': t('prediction_def_calcium'),
    'Magnesium_Deficiency': t('prediction_def_magnesium'),
    'Zinc_Deficiency': t('prediction_def_zinc'),
    'Potassium_Deficiency': t('prediction_def_potassium'),
  };

  function formatDeficiency(key) {
    if (deficiencyNames[key]) return deficiencyNames[key];
    return key.replace(/_/g, ' ').replace(/Deficiency/gi, '').trim();
  }

  function getRiskInfo(pct) {
    if (pct > 60) return { label: t('prediction_high_risk'), color: '#f43f5e', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', bar: 'bg-rose-500' };
    if (pct > 30) return { label: t('prediction_moderate_risk'), color: '#f59e0b', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-400' };
    return { label: t('prediction_low_risk'), color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-400' };
  }

  const [results, setResults] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const preds = await assessmentService.getPredictions();
        if (preds && preds.length > 0) {
          setPredictions(preds);
          setResults(preds[0]);
        }
      } catch (err) {
        // No predictions yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const runAssessment = async () => {
    setPredicting(true);
    setScanStep(1);
    setAiSummary(null);
    setAlert({ show: false, type: 'info', message: '' });

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const data = await assessmentService.predict();
      clearInterval(stepInterval);
      setResults(data);
      setPredictions((prev) => [data, ...prev]);
      setAlert({ show: true, type: 'success', message: t('prediction_alert_success') });
    } catch (err) {
      clearInterval(stepInterval);
      setAlert({
        show: true,
        type: 'error',
        message: err.response?.data?.detail || t('prediction_alert_error'),
      });
    } finally {
      setPredicting(false);
      setScanStep(0);
    }
  };

  const generateAiClinicalSummary = async () => {
    if (!results?.id) return;
    setSummaryLoading(true);
    try {
      const { data } = await api.post('/ai/clinical-summary', {
        prediction_id: results.id,
      });
      setAiSummary(data.summary);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('prediction_alert_summary_error') });
    } finally {
      setSummaryLoading(false);
    }
  };

  let deficiencies = {};
  if (results) {
    if (results.results) {
      deficiencies = results.results;
    } else if (results.predictions) {
      deficiencies = results.predictions;
    } else {
      deficiencies = {
        Iron_Anemia_Deficiency: results.iron_risk,
        Vitamin_D_Deficiency: results.vitamin_d_risk,
        Calcium_Deficiency: results.calcium_risk,
        Magnesium_Deficiency: results.magnesium_risk,
        Potassium_Deficiency: results.potassium_risk,
        Vitamin_B12_Deficiency: results.vitamin_b12_risk,
      };
      Object.keys(deficiencies).forEach((key) => {
        if (deficiencies[key] === undefined || deficiencies[key] === null) {
          delete deficiencies[key];
        }
      });
    }
  }

  const confidence = results?.confidence || results?.confidence_score || 0.88;
  const hasHighRisk = Object.values(deficiencies).some(
    (v) => (typeof v === 'number' ? v : v?.risk || 0) > 0.6
  );

  if (loading)
    return (
      <DashboardLayout title={t('prediction_title')}>
        <Loader size="lg" text={t('prediction_loader')} />
      </DashboardLayout>
    );

  return (
    <DashboardLayout title={t('prediction_title')} subtitle={t('prediction_subtitle')}>
      {alert.show && <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />}

      <div className="flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-12">

        {/* 🌟 Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-6 sm:p-8 lg:p-10 relative overflow-hidden gradient-border shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-3xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 via-rose-500/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                {t('prediction_hero_badge')}
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                {t('prediction_hero_title1')} <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">{t('prediction_hero_title2')}</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-base font-medium leading-relaxed">
                {t('prediction_hero_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <Button onClick={runAssessment} loading={predicting} icon={Sparkles} size="lg" className="w-full sm:w-auto shadow-lg shadow-cyan-500/25">
                {predicting ? t('prediction_btn_running') : t('prediction_btn_run')}
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Link to="/symptoms" className="flex-1 sm:flex-none">
                  <Button variant="secondary" icon={Stethoscope} size="sm" className="w-full">
                    {t('prediction_btn_symptoms')}
                  </Button>
                </Link>
                <Link to="/blood-report" className="flex-1 sm:flex-none">
                  <Button variant="secondary" icon={TestTube2} size="sm" className="w-full">
                    {t('prediction_btn_blood')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ℹ️ Data Status Guidance Banner */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl flex items-start gap-3.5 border border-cyan-500/20 bg-cyan-500/5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white">{t('prediction_tip_title')}</span> {t('prediction_tip_part1')}<Link to="/symptoms" className="text-cyan-400 underline font-semibold">{t('prediction_tip_link_symptoms')}</Link>{t('prediction_tip_and')}<Link to="/blood-report" className="text-cyan-400 underline font-semibold">{t('prediction_tip_link_blood')}</Link>{t('prediction_tip_part2')}
          </div>
        </div>

        {/* ⚡ Animated Neural Scan Sequence */}
        {predicting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-10 sm:p-14 text-center rounded-3xl relative overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 border-r-purple-400"
                />
                <Cpu className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">{t('prediction_scan_title')}</h3>
              
              <div className="space-y-2 mt-4 text-xs sm:text-sm text-slate-300 font-medium">
                <p className={`transition-all ${scanStep >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                  {scanStep >= 1 ? '✓' : '○'} {t('prediction_scan_step1')}
                </p>
                <p className={`transition-all ${scanStep >= 2 ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
                  {scanStep >= 2 ? '✓' : '○'} {t('prediction_scan_step2')}
                </p>
                <p className={`transition-all ${scanStep >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {scanStep >= 3 ? '✓' : '○'} {t('prediction_scan_step3')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 📊 Assessment Results & Deficiency Breakdown */}
        {!predicting && Object.keys(deficiencies).length > 0 && (
          <div className="flex flex-col gap-6 sm:gap-8">

            {/* Confidence Score Bar & AI Clinical Report Action */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/10"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    {t('prediction_confidence_label')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-white">{Math.round(confidence * (confidence <= 1 ? 100 : 1))}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * (confidence <= 1 ? 100 : 1)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full gradient-bg"
                  />
                </div>
              </div>

              <Button
                onClick={generateAiClinicalSummary}
                loading={summaryLoading}
                icon={Bot}
                size="md"
                variant="secondary"
                className="w-full sm:w-auto whitespace-nowrap shadow-lg"
              >
                {t('prediction_generate_summary')}
              </Button>
            </motion.div>

            {/* 🤖 Gemini AI Clinical Summary Output */}
            {aiSummary && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-purple-500/5 shadow-xl"
              >
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="p-3 rounded-2xl gradient-bg text-white shadow-md shadow-purple-500/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">{t('prediction_ai_summary_title')}</h3>
                    <p className="text-xs text-purple-300 font-medium">{t('prediction_ai_summary_subtitle')}</p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap glass p-5 rounded-2xl border border-white/10 font-mono">
                  {aiSummary}
                </div>
              </motion.div>
            )}

            {/* 🎯 Micronutrient Deficiency Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {Object.entries(deficiencies).map(([key, value]) => {
                const pct = typeof value === 'number' ? value * (value <= 1 ? 100 : 1) : value?.risk || 0;
                const risk = getRiskInfo(pct);
                return (
                  <motion.div
                    key={key}
                    variants={item}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`glass-card p-6 rounded-3xl text-center border ${risk.border} transition-all shadow-lg flex flex-col items-center justify-between`}
                  >
                    <div className="my-2">
                      <CircularProgress percentage={pct} getRiskInfo={getRiskInfo} t={t} />
                    </div>
                    <div className="mt-2 w-full">
                      <h4 className="text-base font-extrabold text-white mb-2 leading-tight">{formatDeficiency(key)}</h4>
                      <span className={`inline-block text-xs px-3 py-1 rounded-full font-bold ${risk.bg} ${risk.text} border ${risk.border}`}>
                        {risk.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* 🥗 High-Risk Meal Plan CTA */}
            {hasHighRisk && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 sm:p-8 rounded-3xl gradient-border relative overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t('prediction_cta_badge')}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t('prediction_cta_title')}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium leading-relaxed">
                      {t('prediction_cta_desc')}
                    </p>
                  </div>
                  <Link to="/meal-plan" className="w-full md:w-auto">
                    <Button icon={Utensils} size="lg" className="w-full md:w-auto shadow-lg shadow-cyan-500/25">
                      {t('prediction_cta_btn')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* 📜 Assessment History Drawer */}
        {predictions.length > 1 && (
          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">{t('prediction_history_title')} ({predictions.length})</h4>
                  <p className="text-xs text-slate-400 font-medium">{t('prediction_history_subtitle')}</p>
                </div>
              </div>
              {showHistory ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                    {predictions.map((pred, idx) => (
                      <div
                        key={idx}
                        onClick={() => setResults(pred)}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                          results === pred ? 'bg-white/15 border border-cyan-500/30 shadow-md' : 'glass hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white">{t('prediction_history_session')}#{predictions.length - idx}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          {pred.prediction_date ? new Date(pred.prediction_date).toLocaleString() : `${t('prediction_history_result')}#${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
