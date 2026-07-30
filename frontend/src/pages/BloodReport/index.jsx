import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube2, Send, Info } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Loader';
import { useLanguage } from '../../context/LanguageContext';
import assessmentService from '../../services/assessmentService';

const bloodMarkers = [
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', range: 'M: 13.5-17.5 | F: 12.0-16.0' },
  { key: 'iron', label: 'Iron', unit: 'µg/dL', range: '60 - 170' },
  { key: 'ferritin', label: 'Ferritin', unit: 'ng/mL', range: 'M: 20-500 | F: 20-200' },
  { key: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL', range: '30 - 100' },
  { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'pg/mL', range: '200 - 900' },
  { key: 'calcium', label: 'Calcium', unit: 'mg/dL', range: '8.5 - 10.5' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg/dL', range: '1.7 - 2.2' },
  { key: 'zinc', label: 'Zinc', unit: 'µg/dL', range: '66 - 110' },
  { key: 'blood_sugar', label: 'Blood Sugar (Fasting)', unit: 'mg/dL', range: '70 - 100' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL', range: '< 200' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function BloodReport() {
  const { t } = useLanguage();
  const [form, setForm] = useState(() =>
    bloodMarkers.reduce((acc, m) => ({ ...acc, [m.key]: '' }), {})
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await assessmentService.getLatestBloodReport();
        if (data) {
          const loaded = {};
          bloodMarkers.forEach(m => {
            loaded[m.key] = data[m.key] !== null && data[m.key] !== undefined ? String(data[m.key]) : '';
          });
          setForm(loaded);
        }
      } catch (err) {
        // No report yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const payload = {};
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null) payload[key] = parseFloat(val);
      });
      await assessmentService.submitBloodReport(payload);
      setAlert({ show: true, type: 'success', message: 'Blood report submitted successfully! You can now run an assessment.' });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || 'Failed to submit blood report.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title={t('blood_reports') || "Blood Reports"}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout title={t('blood_reports') || "Blood Reports"} subtitle={t('blood_report_ocr') || "Enter your blood test results for analysis"}>
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      <div className="glass-card p-4 mb-6 mt-2 flex items-start gap-3 border border-cyan-500/20 bg-cyan-500/5">
        <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Enter available blood test values. Fields left empty will be skipped during analysis. Values outside normal ranges will be flagged.
        </p>
      </div>

      <div className="glass-card p-6 mb-8 text-center border-dashed border-2 border-white/10 hover:border-cyan-500/50 transition-colors">
        <h3 className="text-lg font-semibold text-white mb-2">Auto-fill from Report</h3>
        <p className="text-sm text-gray-400 mb-4">Upload a PDF or Image of your blood report to automatically extract values.</p>
        
        <input 
          type="file" 
          id="report-upload" 
          className="hidden" 
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            setAlert({ show: true, type: 'info', message: 'Analyzing report... Please wait.' });
            try {
              const res = await assessmentService.parseBloodReport(file);
              if (res && res.extracted) {
                setForm(prev => ({ ...prev, ...res.extracted }));
                setAlert({ show: true, type: 'success', message: 'Report parsed successfully! Please review the auto-filled values.' });
              }
            } catch (err) {
              setAlert({ show: true, type: 'error', message: err.response?.data?.detail || 'Failed to parse the report.' });
            }
          }} 
        />
        <label htmlFor="report-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-colors">
          <TestTube2 className="w-5 h-5" />
          Select File to Auto-fill
        </label>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl"
      >
        {bloodMarkers.map((marker) => (
          <motion.div key={marker.key} variants={item} className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TestTube2 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">{marker.label}</span>
              <span className="text-xs text-gray-500 ml-auto">({marker.unit})</span>
            </div>
            <Input
              name={marker.key}
              type="number"
              placeholder={`Enter ${marker.label.toLowerCase()}`}
              value={form[marker.key] ?? ''}
              onChange={handleChange}
              step="0.1"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Normal range: {marker.range}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8">
        <Button onClick={handleSubmit} loading={submitting} icon={Send} size="lg" className="w-full sm:w-auto">
          Submit Blood Report
        </Button>
      </div>
    </DashboardLayout>
  );
}
