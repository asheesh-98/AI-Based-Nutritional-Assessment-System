import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Utensils, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/common/LanguageSelector';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0e1a] overflow-x-hidden text-slate-100 relative">
      
      {/* Top Language Bar for Login */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector compact={true} />
      </div>

      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 py-8 sm:py-12 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Header: Logo + Back to Home */}
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10 w-full">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                NutriAI
              </span>
            </Link>

            <Link to="/" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('home') || "Back to Home"}</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            {t('sign_in_title') || "Welcome Back"}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8">
            {t('sign_in_sub') || "Sign in to continue your personalized health journey."}
          </p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            <Input
              label={t('email_address') || "Email Address"}
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label={t('password') || "Password"}
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
                className="w-full text-sm sm:text-base rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] py-3"
                size="lg"
              >
                {t('login') || "Sign In"}
              </Button>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8">
            {t('dont_have_account') || "Don't have an account?"}{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              {t('get_started') || "Create an account"}
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
