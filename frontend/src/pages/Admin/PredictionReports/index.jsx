import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Activity, Target } from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export default function AdminPredictionReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await adminService.getPredictionReports();
        setData(response);
      } catch (err) {
        setError('Failed to fetch prediction reports.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  if (loading) return <PageLoader />;

  // Transform data for PieChart
  const pieData = data ? Object.entries(data.deficiencies_distribution).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: value
  })) : [];

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2">Prediction Reports</h1>
        <p className="text-xs sm:text-sm text-slate-400">Insights into machine learning model outputs and user deficiency distributions.</p>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 sm:p-6 rounded-2xl flex items-center gap-4 border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Total Predictions Run</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{data.total_predictions}</h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5 sm:p-6 rounded-2xl flex items-center gap-4 border border-white/10"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-xs sm:text-sm font-medium">Avg Model Confidence</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {(data.average_confidence * 100).toFixed(1)}%
                </h3>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/10 w-full overflow-hidden"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Identified Deficiencies Distribution</h3>
            
            {pieData.length > 0 ? (
              <div className="h-[320px] sm:h-[400px] w-full min-w-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius="45%"
                      outerRadius="75%"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 14, 26, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={40}
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] sm:h-[400px] flex items-center justify-center text-slate-500 text-xs sm:text-sm">
                <p>No deficiency data available yet.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
