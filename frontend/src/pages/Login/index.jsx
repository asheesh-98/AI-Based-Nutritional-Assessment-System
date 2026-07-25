import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Utensils, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(form);
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0e1a] overflow-hidden text-slate-100">
      
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 relative z-10">
        
        {/* Back Link */}
        <div className="absolute top-8 left-4 sm:left-12 lg:left-24">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NutriAI
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to continue your personalized health journey.</p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                icon={LogIn}
                className="w-full text-base rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side: Branding Graphic */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-cyan-900/40 to-purple-900/40 border-l border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[20%] w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-12 max-w-lg text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl gradient-bg flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/30">
            <Utensils className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Precision Nutrition</h3>
          <p className="text-slate-300 leading-relaxed">
            NutriAI leverages advanced machine learning to analyze your blood markers, symptoms, and dietary habits to deliver hyper-personalized meal plans.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
