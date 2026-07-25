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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Prediction Reports</h1>
        <p className="text-slate-400">Insights into machine learning model outputs and user deficiencies.</p>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Predictions Run</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">{data.total_predictions}</h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Model Confidence</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                  {(data.average_confidence * 100).toFixed(1)}%
                </h3>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Identified Deficiencies Distribution</h3>
            
            {pieData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(10, 14, 26, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-slate-500">
                <p>No deficiency data available yet.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
