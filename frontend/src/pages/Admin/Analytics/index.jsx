import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Alert from '../../../components/common/Alert';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminService.getAnalytics();
        setData(response);
      } catch (err) {
        setError('Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1 sm:mb-2">Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-400">Monitor platform growth and usage statistics over time.</p>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/10 w-full overflow-hidden"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">User Growth (Last 7 Days)</h3>
          
          {data.user_growth.length > 0 ? (
            <div className="h-[280px] sm:h-[380px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={data.user_growth} 
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 14, 26, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 5 }}
                    activeDot={{ r: 7, fill: '#fff', stroke: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] sm:h-[380px] flex items-center justify-center text-slate-500 text-xs sm:text-sm">
              <p>No user growth data available for the selected period.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
