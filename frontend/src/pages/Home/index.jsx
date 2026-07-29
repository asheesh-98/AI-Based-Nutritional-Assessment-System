import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, Utensils, FileText, TrendingUp,
  TestTube2, Stethoscope, User, Heart, Cpu,
  ArrowRight, Sparkles, Shield, ChevronRight
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LanguageModal from '../../components/common/LanguageModal';
import { useLanguage } from '../../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { icon: Activity, title: t('feature_ml_title'), desc: t('feature_ml_desc'), color: 'cyan' },
    { icon: Utensils, title: t('feature_meal_title'), desc: t('feature_meal_desc'), color: 'purple' },
    { icon: FileText, title: t('feature_scanner_title'), desc: t('feature_scanner_desc'), color: 'emerald' },
    { icon: Stethoscope, title: t('feature_ai_title'), desc: t('feature_ai_desc'), color: 'amber' },
    { icon: TestTube2, title: t('stat_nutrients_desc'), desc: t('stat_nutrients_desc'), color: 'rose' },
    { icon: TrendingUp, title: t('stat_accuracy_desc'), desc: t('stat_accuracy_desc'), color: 'blue' },
  ];

  const colorMap = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  };

  const steps = [
    { icon: User, title: t('profile'), desc: t('hero_subtitle') },
    { icon: Heart, title: t('assessment'), desc: t('feature_ml_desc') },
    { icon: Cpu, title: t('stat_accuracy'), desc: t('stat_accuracy_desc') },
    { icon: Utensils, title: t('meal_plan'), desc: t('stat_plans_desc') },
  ];

  const stats = [
    { value: '95%', label: t('stat_accuracy'), desc: t('stat_accuracy_desc') },
    { value: '50+', label: t('stat_nutrients'), desc: t('stat_nutrients_desc') },
    { value: '58,000+', label: t('stat_foods'), desc: t('stat_foods_desc') },
    { value: '7-Day', label: t('stat_plans'), desc: t('stat_plans_desc') },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 selection:bg-cyan-500/30 selection:text-white flex flex-col overflow-x-hidden w-full">
      {/* 16-Language Initial Welcome Modal Popup */}
      <LanguageModal />

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center min-h-[85vh] w-full">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-purple-500/10 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-8 sm:gap-12">
          
          {/* Main Content Block */}
          <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
            {/* Top Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass border border-white/10 text-[10px] sm:text-xs font-bold text-cyan-400 mb-6 tracking-wider uppercase max-w-full text-center truncate"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{t('hero_badge')}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6 leading-tight text-white px-2"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {t('hero_title_1')}
              </span>
              <br className="hidden sm:block" />
              <span className="sm:mt-2 block">{t('hero_title_2')}</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-4"
            >
              {t('hero_subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white gradient-bg rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t('start_assessment')}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-slate-300 glass border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t('explore_features')}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </a>
            </motion.div>
          </div>

          {/* Stats Bar Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-5xl glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 divide-y-0 sm:divide-y-0 lg:divide-x divide-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 pointer-events-none" />
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center px-1 sm:px-2 py-2 sm:py-0 relative z-10 flex flex-col justify-center">
                <p className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-cyan-400 font-semibold uppercase mt-1 sm:mt-2 tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 relative bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
              {t('features_title')}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              {t('features_subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {features.map((feature, idx) => {
              const c = colorMap[feature.color];
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="glass-card p-6 sm:p-8 group flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${c.bg} ${c.border} border border-opacity-50 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 duration-300`}>
                      <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${c.text}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
              {t('hero_title_1')} <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{t('hero_title_2')}</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              {t('features_subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {steps.map((step, idx) => (
              <motion.div key={idx} variants={item} className="relative group">
                <div className="glass-card p-6 sm:p-8 text-center h-full flex flex-col items-center">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-black text-xs sm:text-sm mb-5 shadow-lg shadow-cyan-500/20">
                    0{idx + 1}
                  </div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all duration-300">
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 relative mb-8 sm:mb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
            <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 sm:mb-8">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">
                {t('hero_title_1')} {t('hero_title_2')}
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 text-xs sm:text-base leading-relaxed">
                {t('hero_subtitle')}
              </p>
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white gradient-bg rounded-xl sm:rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                >
                  <span>{t('start_assessment')}</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
