import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Utensils, FileText, TrendingUp,
  TestTube2, Stethoscope, User, Heart, Cpu,
  ArrowRight, Sparkles, Shield, ChevronRight, Download, Smartphone,
  Zap, Bot, CheckCircle2, ScanBarcode, Flame, Globe, Lock, ChevronDown, ChevronUp,
  AlertCircle, HelpCircle
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useLanguage } from '../../context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('scanner');
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Fatigue', 'Dizziness']);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        "To install NutriAI as an App on your device:\n\n" +
        "📱 Android / Chrome: Tap menu (⋮) -> 'Install App' or 'Add to Home Screen'\n" +
        "📱 iOS Safari: Tap Share (⎋) -> 'Add to Home Screen'\n" +
        "💻 Desktop Chrome / Edge: Click Install Icon (⤓) in the URL address bar."
      );
    }
  };

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

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

  const demoTabs = [
    { id: 'scanner', label: t('home_demo_tab_scanner'), icon: ScanBarcode, color: 'text-cyan-400' },
    { id: 'blood', label: t('home_demo_tab_blood'), icon: TestTube2, color: 'text-rose-400' },
    { id: 'recommender', label: t('home_demo_tab_recommender'), icon: Utensils, color: 'text-emerald-400' },
    { id: 'coach', label: t('home_demo_tab_coach'), icon: Bot, color: 'text-purple-400' },
  ];

  const faqs = [
    {
      q: t('home_faq_q1'),
      a: t('home_faq_a1'),
    },
    {
      q: t('home_faq_q2'),
      a: t('home_faq_a2'),
    },
    {
      q: t('home_faq_q3'),
      a: t('home_faq_a3'),
    },
    {
      q: t('home_faq_q4'),
      a: t('home_faq_a4'),
    },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 selection:bg-cyan-500/30 selection:text-white flex flex-col overflow-x-hidden w-full relative">
      <Navbar />

      {/* 🌟 Hero Section with Vibrant Background Texture */}
      <section className="relative pt-24 sm:pt-36 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col items-center justify-center min-h-[85vh] w-full overflow-hidden">
        {/* Background Image Texture & Ambient Glow Orbs */}
        <div className="absolute inset-0 bg-[url('/assets/nutrition_bg.jpg')] bg-cover bg-center opacity-[0.14] mix-blend-overlay pointer-events-none z-0" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse-glow" />
          <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-emerald-500/18 rounded-full blur-[130px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          {/* Left Hero Text Column */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-xs font-bold text-cyan-400 mb-6 tracking-wider uppercase shadow-lg shadow-cyan-500/10"
            >
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{t('hero_badge')}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight text-white"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                {t('hero_title_1')}
              </span>
              <br />
              <span className="mt-1 block text-white">{t('hero_title_2')}</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-lg text-slate-300 mb-8 sm:mb-10 leading-relaxed font-medium"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-7 py-4 text-sm sm:text-base font-bold text-white gradient-bg rounded-2xl shadow-[0_0_25px_rgba(0,212,255,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{t('start_assessment')}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInstallPWA}
                className="w-full sm:w-auto px-7 py-4 text-sm sm:text-base font-bold text-cyan-300 glass border border-cyan-500/30 hover:border-cyan-400 rounded-2xl shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2.5 transition-all cursor-pointer bg-cyan-500/10"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-bounce" />
                <span>{isInstalled ? t('home_pwa_app_installed') : t('home_pwa_download')}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right Floating 3D Product Mockup Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 w-full relative"
          >
            <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white leading-tight">{t('home_mockup_title')}</h4>
                    <p className="text-xs text-cyan-400 font-semibold">{t('home_mockup_subtitle')}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {t('home_mockup_badge')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl glass border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase">{t('home_mockup_nutrition_score')}</p>
                  <p className="text-3xl font-black text-white">88<span className="text-sm font-medium text-slate-400">/100</span></p>
                  <span className="text-[11px] font-bold text-emerald-400">{t('home_mockup_optimization')}</span>
                </div>
                <div className="p-4 rounded-2xl glass border border-white/5 space-y-1">
                  <p className="text-xs text-slate-400 font-semibold uppercase">{t('home_mockup_deficiency_risk')}</p>
                  <p className="text-3xl font-black text-amber-400">{t('home_mockup_mild')}</p>
                  <span className="text-[11px] font-bold text-amber-300">{t('home_mockup_tracked')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl glass border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <TestTube2 className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-slate-200">{t('home_mockup_item1_label')}</span>
                  </div>
                  <span className="font-extrabold text-rose-400">{t('home_mockup_item1_status')}</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl glass border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">{t('home_mockup_item2_label')}</span>
                  </div>
                  <span className="font-extrabold text-emerald-400">{t('home_mockup_item2_status')}</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Floating Stats Bar Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-6xl mt-12 sm:mt-16 glass-strong rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 shadow-2xl relative overflow-hidden border border-white/10"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-2">
              <span className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white mb-0.5">{stat.label}</span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:block">{stat.desc}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ⚡ Interactive Instant Risk Assessment Micro-Calculator */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 sm:p-10 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-3 inline-block">
                {t('home_calc_badge')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{t('home_calc_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t('home_calc_subtitle')}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 mb-8">
              {[
                { id: 'Fatigue', label: t('home_calc_symptom_fatigue') },
                { id: 'Dizziness', label: t('home_calc_symptom_dizziness') },
                { id: 'Muscle Weakness', label: t('home_calc_symptom_muscle') },
                { id: 'Brittle Nails', label: t('home_calc_symptom_nails') },
                { id: 'Cold Hands', label: t('home_calc_symptom_cold') },
                { id: 'Hair Thinning', label: t('home_calc_symptom_hair') },
                { id: 'Frequent Cramps', label: t('home_calc_symptom_cramps') },
              ].map((symObj) => {
                const selected = selectedSymptoms.includes(symObj.id);
                return (
                  <button
                    key={symObj.id}
                    onClick={() => toggleSymptom(symObj.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'gradient-bg text-white shadow-md shadow-cyan-500/20'
                        : 'glass border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {symObj.label}
                  </button>
                );
              })}
            </div>

            <div className="glass p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('home_calc_result_header')}</span>
                <p className="text-lg sm:text-xl font-black text-white mt-0.5">
                  {selectedSymptoms.length > 2 ? t('home_calc_risk_high') : t('home_calc_risk_low')}
                </p>
              </div>
              <Link to="/register">
                <button className="px-6 py-3 rounded-xl gradient-bg text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all">
                  {t('home_calc_btn')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ Features Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-24"
          >
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4 inline-block">
              {t('home_features_badge')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
              {t('features_title')}
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {t('features_subtitle')}
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {features.map((feature, idx) => {
              const colors = colorMap[feature.color];
              return (
                <motion.div
                  key={idx}
                  variants={item}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="glass-card p-7 sm:p-9 rounded-3xl relative overflow-hidden group border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-7 h-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-white mb-3">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-white/[0.01]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20 mb-4 inline-block">
              {t('home_faq_badge')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">{t('home_faq_title')}</h2>
            <p className="text-slate-400 text-xs sm:text-base">{t('home_faq_subtitle')}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-white pr-4">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium border-t border-white/5 pt-4"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📲 PWA App Download Banner */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 relative mb-12">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 sm:p-16 text-center relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 sm:mb-8 text-cyan-400 shadow-xl">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
                {t('home_pwa_banner_title')}
              </h2>
              <p className="text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-10 text-xs sm:text-base leading-relaxed font-medium">
                {t('home_pwa_banner_subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleInstallPWA}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white gradient-bg rounded-2xl flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                >
                  <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <span>{isInstalled ? t('home_pwa_app_installed') : t('home_pwa_download')}</span>
                </motion.button>

                <Link to="/register" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-bold text-slate-200 glass border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('start_assessment')}</span>
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
