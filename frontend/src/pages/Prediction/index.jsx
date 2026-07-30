import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Sparkles, ArrowRight, ChevronDown, ChevronUp,
  Stethoscope, TestTube2, Utensils, Info, Clock, Bot, FileText
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import assessmentService from '../../services/assessmentService';
import api from '../../services/api';

const deficiencyNames = {
  'Iron_Anemia_Deficiency': 'Iron Deficiency',
  'Vitamin_D_Deficiency': 'Vitamin D',
  'Vitamin_B12_Deficiency': 'Vitamin B12',
  'Calcium_Deficiency': 'Calcium',
  'Magnesium_Deficiency': 'Magnesium',
  'Zinc_Deficiency': 'Zinc',
};

function formatDeficiency(key) {
  if (deficiencyNames[key]) return deficiencyNames[key];
  return key.replace(/_/g, ' ').replace(/Deficiency/gi, '').trim();
}

function getRiskInfo(pct) {
  if (pct > 60) return { label: 'High Risk', color: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
  if (pct > 30) return { label: 'Moderate Risk', color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
  return { label: 'Low Risk', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
}

function CircularProgress({ percentage, size = 100, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const risk = getRiskInfo(percentage);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } };

export default function Prediction() {
  const [results, setResults] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
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
    setAiSummary(null);
    setAlert({ show: false, type: 'info', message: '' });
    try {
      const data = await assessmentService.predict();
      setResults(data);
      setPredictions(prev => [data, ...prev]);
      setAlert({ show: true, type: 'success', message: 'Assessment completed successfully!' });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || 'Assessment failed. Make sure you have submitted symptoms or blood reports.' });
    } finally {
      setPredicting(false);
    }
  };

  const generateAiClinicalSummary = async () => {
    if (!results?.id) return;
    setSummaryLoading(true);
    try {
      const { data } = await api.post('/ai/clinical-summary', {
        prediction_id: results.id
      });
      setAiSummary(data.summary);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Failed to generate AI summary.' });
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
      Object.keys(deficiencies).forEach(key => {
        if (deficiencies[key] === undefined || deficiencies[key] === null) {
          delete deficiencies[key];
        }
      });
    }
  }

  const confidence = results?.confidence || results?.confidence_score;
  const hasHighRisk = Object.values(deficiencies).some(v => (typeof v === 'number' ? v : v?.risk || 0) > 0.6);

  if (loading) return <DashboardLayout title="AI Assessment"><Loader size="lg" text="Loading assessments..." /></DashboardLayout>;

  return (
    <DashboardLayout title="AI Assessment" subtitle="Get AI-powered nutritional deficiency predictions & clinical insights">
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 mt-2">
        <Button onClick={runAssessment} loading={predicting} icon={Sparkles} size="lg">
          {predicting ? 'Analyzing...' : 'Run New Assessment'}
        </Button>
        <div className="flex gap-2">
          <Link to="/symptoms">
            <Button variant="secondary" icon={Stethoscope} size="sm">Update Symptoms</Button>
          </Link>
          <Link to="/blood-report">
            <Button variant="secondary" icon={TestTube2} size="sm">Update Blood Report</Button>
          </Link>
        </div>
      </div>

      <div className="glass-card p-4 mb-8 flex items-start gap-3 border border-cyan-500/20 bg-cyan-500/5">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          For best results, submit both your symptoms and blood report before running the assessment. The AI analyzes your data to predict potential nutritional deficiencies.
        </p>
      </div>

      {/* Predicting Animation */}
      {predicting && (
        <div className="flex flex-col items-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 mb-6"
          />
          <p className="text-lg font-medium text-white">Analyzing your health data...</p>
          <p className="text-sm text-gray-400 mt-2">Our AI is processing your symptoms and blood reports</p>
        </div>
      )}

      {/* Results Section */}
      {!predicting && Object.keys(deficiencies).length > 0 && (
        <>
          {/* Confidence Score & AI Clinical Report Trigger */}
          <div className="glass-card p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Assessment Confidence</span>
                <span className="text-sm font-bold text-white">{Math.round(confidence * (confidence <= 1 ? 100 : 1))}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence * (confidence <= 1 ? 100 : 1)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full gradient-bg"
                />
              </div>
            </div>
            <Button onClick={generateAiClinicalSummary} loading={summaryLoading} icon={Bot} size="md" variant="secondary" className="whitespace-nowrap">
              Generate AI Clinical Summary
            </Button>
          </div>

          {/* AI Clinical Summary Report Modal/Card */}
          {aiSummary && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8 border border-purple-500/30 bg-purple-500/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl gradient-bg text-white"><Bot size={20} /></div>
                <div>
                  <h3 className="text-lg font-bold text-white">Gemini AI Clinical Summary Report</h3>
                  <p className="text-xs text-purple-300">Generated based on your symptoms, lab values, and ML models</p>
                </div>
              </div>
              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/10">
                {aiSummary}
              </div>
            </motion.div>
          )}

          {/* Deficiency Cards */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
          >
            {Object.entries(deficiencies).map(([key, value]) => {
              const pct = typeof value === 'number' ? value * (value <= 1 ? 100 : 1) : (value?.risk || 0);
              const risk = getRiskInfo(pct);
              return (
                <motion.div key={key} variants={item} className="glass-card p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <CircularProgress percentage={pct} />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">{formatDeficiency(key)}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${risk.bg} ${risk.text} ${risk.border} border`}>
                    {risk.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recommendations */}
          {hasHighRisk && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 gradient-border relative overflow-hidden mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-2">⚡ High-Risk Deficiencies Detected</h3>
                <p className="text-sm text-gray-400 mb-4">
                  We recommend getting a personalized meal plan to address your nutritional deficiencies.
                </p>
                <Link to="/meal-plan">
                  <Button icon={Utensils} size="lg">
                    Get Your Personalized Meal Plan
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Empty State */}
      {!predicting && Object.keys(deficiencies).length === 0 && (
        <div className="text-center py-16">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Assessment Results Yet</h3>
          <p className="text-gray-400 mb-6">
            Submit your symptoms or blood report, then run an assessment to see your results.
          </p>
        </div>
      )}

      {/* History Section */}
      {predictions.length > 1 && (
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-white">Assessment History ({predictions.length})</span>
            </div>
            {showHistory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/5"
              >
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {predictions.map((pred, idx) => (
                    <div
                      key={idx}
                      onClick={() => setResults(pred)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        results === pred ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm text-white">Assessment #{predictions.length - idx}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {pred.prediction_date ? new Date(pred.prediction_date).toLocaleString() : `Result ${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}
