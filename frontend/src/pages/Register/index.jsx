import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Utensils, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.password2) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const rawErr = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please check details and try again.';
      setError(typeof rawErr === 'string' ? rawErr : JSON.stringify(rawErr));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-[#0a0e1a] overflow-x-hidden text-slate-100">
      
      {/* Right side: Form (Reversed layout for distinction) */}
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
              <span>Back to Home</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 sm:mb-8">Start your personalized nutrition journey today.</p>

          <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 mt-2">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              icon={User}
              value={form.name}
              onChange={handleChange}
            />
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
            <Input
              label="Confirm Password"
              name="password2"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.password2}
              onChange={handleChange}
            />
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                icon={UserPlus}
                className="w-full text-sm sm:text-base rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] py-3"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left side: Branding Graphic */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-bl from-purple-900/40 to-cyan-900/40 border-r border-white/5 items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[20%] left-[20%] w-[30rem] h-[30rem] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 glass-card p-12 max-w-lg text-center"
        >
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center border-cyan-500/30">
              <span className="text-3xl font-black text-cyan-400">95%</span>
              <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Accuracy</span>
            </div>
            <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center border-purple-500/30">
              <span className="text-3xl font-black text-purple-400">50+</span>
              <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Nutrients</span>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4">Empower Your Health</h3>
          <p className="text-slate-300 leading-relaxed">
            Join thousands of users who have transformed their lives through AI-driven nutritional guidance.
          </p>
        </motion.div>
      </div>

    </div>
  );
}
