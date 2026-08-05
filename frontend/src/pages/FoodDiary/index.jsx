import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Coffee, Sun, Moon, Cookie,
  Flame, Droplets, Trash2, Utensils, Sparkles,
  CheckCircle2, RefreshCw, Scale, ChevronRight, Sliders, Zap,
  TrendingUp, Award, Clock, ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import foodService from '../../services/foodService';
import { useLanguage } from '../../context/LanguageContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
};

// Quick 1-tap presets for popular food items
const POPULAR_PRESETS = [
  { name: 'Boiled Egg', qty: 1, unit: 'pcs', icon: '🥚' },
  { name: 'Apple', qty: 1, unit: 'pcs', icon: '🍎' },
  { name: 'Whole Milk', qty: 250, unit: 'ml', icon: '🥛' },
  { name: 'Brown Rice', qty: 150, unit: 'g', icon: '🍚' },
  { name: 'Chicken Breast', qty: 150, unit: 'g', icon: '🍗' },
  { name: 'Avocado', qty: 1, unit: 'pcs', icon: '🥑' },
  { name: 'Almonds', qty: 30, unit: 'g', icon: '🥜' },
  { name: 'Oatmeal Porridge', qty: 1, unit: 'cups', icon: '🥣' },
];

export default function FoodDiary() {
  const { t } = useLanguage();

  const mealTypes = [
    { value: 'breakfast', label: t('food_diary_breakfast'), icon: Coffee, color: 'text-amber-400', accentBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300', gradient: 'from-amber-500/15 via-amber-500/5 to-transparent', border: 'border-amber-500/20' },
    { value: 'lunch', label: t('food_diary_lunch'), icon: Sun, color: 'text-cyan-400', accentBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300', gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent', border: 'border-cyan-500/20' },
    { value: 'dinner', label: t('food_diary_dinner'), icon: Moon, color: 'text-purple-400', accentBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300', gradient: 'from-purple-500/15 via-purple-500/5 to-transparent', border: 'border-purple-500/20' },
    { value: 'snack', label: t('food_diary_snack'), icon: Cookie, color: 'text-pink-400', accentBg: 'bg-pink-500/10 border-pink-500/30 text-pink-300', gradient: 'from-pink-500/15 via-pink-500/5 to-transparent', border: 'border-pink-500/20' },
  ];

  const unitOptions = [
    { code: 'servings', label: t('food_diary_unit_serving') },
    { code: 'pcs', label: t('food_diary_unit_pcs') },
    { code: 'g', label: t('food_diary_unit_g') },
    { code: 'ml', label: t('food_diary_unit_ml') },
    { code: 'cups', label: t('food_diary_unit_cups') },
    { code: 'oz', label: t('food_diary_unit_oz') },
    { code: 'tbsp', label: t('food_diary_unit_tbsp') },
  ];

  // Core Page State
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [foodInput, setFoodInput] = useState('');
  const [inputQuantity, setInputQuantity] = useState('1');
  const [inputUnit, setInputUnit] = useState('servings');
  const [loggingAI, setLoggingAI] = useState(false);

  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  // Optional Fine-Tuning Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailForm, setDetailForm] = useState({
    food_name: '',
    quantity: '1',
    unit: 'servings',
    calories: '',
    protein: '0',
    carbs: '0',
    fat: '0',
  });
  const [estimatingDetails, setEstimatingDetails] = useState(false);

  useEffect(() => {
    loadDiary();
  }, []);

  const loadDiary = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await foodService.getFoodDiary(today);
      setDiary(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Diary load error:', err);
      setDiary([]);
    } finally {
      setLoading(false);
    }
  };

  // 🤖 Direct AI Log Handler: Calculates macros using Gemini and logs to diary instantly
  const handleDirectAILog = async (overrideName = null, overrideQty = null, overrideUnit = null) => {
    const targetName = (overrideName !== null ? overrideName : foodInput).trim();
    if (!targetName) {
      setAlert({ show: true, type: 'error', message: 'Please enter a food item or dish name.' });
      return;
    }

    const qty = Number(overrideQty !== null ? overrideQty : inputQuantity) || 1;
    const unit = overrideUnit !== null ? overrideUnit : inputUnit;

    setLoggingAI(true);
    setAlert({ show: false, type: 'info', message: '' });

    try {
      // Step 1: Query Gemini AI for exact nutrition breakdown
      const aiData = await foodService.estimateNutrition({
        food_name: targetName,
        quantity: qty,
        unit: unit,
      });

      const kcal = aiData?.calories !== undefined ? Math.round(Number(aiData.calories)) : 150;
      const protein = aiData?.protein !== undefined ? parseFloat(Number(aiData.protein).toFixed(1)) : 0;
      const carbs = aiData?.carbs !== undefined ? parseFloat(Number(aiData.carbs).toFixed(1)) : 0;
      const fat = aiData?.fat !== undefined ? parseFloat(Number(aiData.fat).toFixed(1)) : 0;

      // Step 2: Log food item directly to backend food diary
      await foodService.logFood({
        food_name: targetName,
        meal_type: selectedMeal,
        quantity: qty,
        unit: unit,
        calories: kcal,
        protein: protein,
        carbs: carbs,
        fat: fat,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `✨ ${targetName} (${qty} ${unit}) — ${kcal} kcal ${t('food_diary_added_food')}`,
      });

      setFoodInput('');
      loadDiary();
    } catch (err) {
      console.error('AI food log error:', err);
      const msg = err?.response?.data?.detail || t('food_diary_log_error') || 'Failed to log food.';
      setAlert({ show: true, type: 'error', message: msg });
    } finally {
      setLoggingAI(false);
    }
  };

  // Opens the Fine-Tuning / Review Modal with pre-estimated Gemini values
  const handleOpenDetailModal = async () => {
    if (!foodInput.trim()) {
      setAlert({ show: true, type: 'error', message: 'Please enter a food name first.' });
      return;
    }

    const targetName = foodInput.trim();
    const qty = Number(inputQuantity) || 1;
    const unit = inputUnit;

    setDetailForm({
      food_name: targetName,
      quantity: String(qty),
      unit: unit,
      calories: '...',
      protein: '...',
      carbs: '...',
      fat: '...',
    });
    setShowDetailModal(true);
    setEstimatingDetails(true);

    try {
      const aiData = await foodService.estimateNutrition({
        food_name: targetName,
        quantity: qty,
        unit: unit,
      });

      if (aiData) {
        setDetailForm({
          food_name: targetName,
          quantity: String(qty),
          unit: unit,
          calories: String(aiData.calories || 150),
          protein: String(aiData.protein || 0),
          carbs: String(aiData.carbs || 0),
          fat: String(aiData.fat || 0),
        });
      }
    } catch (err) {
      console.error('AI detail estimation error:', err);
    } finally {
      setEstimatingDetails(false);
    }
  };

  const handleSaveDetailModal = async (e) => {
    if (e) e.preventDefault();
    if (!detailForm.food_name.trim()) return;

    setLoggingAI(true);
    try {
      await foodService.logFood({
        food_name: detailForm.food_name.trim(),
        meal_type: selectedMeal,
        quantity: Number(detailForm.quantity) || 1,
        unit: detailForm.unit || 'servings',
        calories: Math.round(Number(detailForm.calories) || 0),
        protein: parseFloat(detailForm.protein) || 0,
        carbs: parseFloat(detailForm.carbs) || 0,
        fat: parseFloat(detailForm.fat) || 0,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `${detailForm.food_name} ${t('food_diary_added_food')}`,
      });
      setShowDetailModal(false);
      setFoodInput('');
      loadDiary();
    } catch (err) {
      console.error('Save detail food error:', err);
      setAlert({ show: true, type: 'error', message: t('food_diary_log_error') });
    } finally {
      setLoggingAI(false);
    }
  };

  const handleDeleteFood = async (entryId, foodName) => {
    try {
      await foodService.deleteFoodEntry(entryId);
      setAlert({ show: true, type: 'success', message: `${foodName} ${t('food_diary_removed_food')}` });
      loadDiary();
    } catch (err) {
      console.error('Delete food error:', err);
      setAlert({ show: true, type: 'error', message: t('food_diary_remove_error') });
    }
  };

  // Calculate Daily Totals
  const totalKcal = useMemo(() => diary.reduce((sum, e) => sum + (e.calories || 0), 0), [diary]);
  const totalProtein = useMemo(() => diary.reduce((sum, e) => sum + (e.protein || 0), 0), [diary]);
  const totalCarbs = useMemo(() => diary.reduce((sum, e) => sum + (e.carbs || 0), 0), [diary]);
  const totalFat = useMemo(() => diary.reduce((sum, e) => sum + (e.fat || 0), 0), [diary]);

  const targetKcal = 2000;
  const kcalPct = Math.min(100, Math.round((totalKcal / targetKcal) * 100));

  const targetProtein = 120;
  const targetCarbs = 250;
  const targetFat = 65;

  const groupedDiary = useMemo(() => {
    return mealTypes.reduce((acc, mt) => {
      acc[mt.value] = diary.filter((d) => d.meal_type === mt.value);
      return acc;
    }, {});
  }, [diary, mealTypes]);

  if (loading) {
    return (
      <DashboardLayout title={t('sidebar_food_diary')}>
        <div className="flex flex-col items-center justify-center min-h-[450px]">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-bold text-gray-300">Loading your AI Food Diary...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar_food_diary')} subtitle="Direct AI-powered caloric and macronutrient food logging">
      {alert.show && (
        <Alert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}

      {/* 🌟 Hero Calorie & Macro Intelligence Hub Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8 mt-2"
      >
        {/* Radial Calorie Progress Gauge Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-3xl border border-white/10 flex items-center gap-5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden lg:col-span-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10 stroke-current"
                strokeWidth="3.5"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 stroke-current transition-all duration-1000 ease-out"
                strokeDasharray={`${kcalPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Flame className="w-4 h-4 text-amber-400 mb-0.5 animate-bounce" />
              <span className="text-base font-black text-white leading-none">{totalKcal}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">/ {targetKcal}</span>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-white leading-tight">Daily Calorie Goal</h4>
            <p className="text-xs text-gray-400 mt-1">
              Remaining: <strong className="text-cyan-300 font-bold">{Math.max(0, targetKcal - totalKcal)} kcal</strong>
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-extrabold text-cyan-300 shadow-inner">
              <Zap className="w-3 h-3 text-cyan-400" /> {kcalPct}% Target Met
            </div>
          </div>
        </motion.div>

        {/* Protein Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Protein</span>
            </div>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalProtein)} / {targetProtein}g</span>
          </div>
          <p className="text-3xl font-black text-white my-2.5">
            {Math.round(totalProtein)} <span className="text-xs font-medium text-gray-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Carbs Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Carbs</span>
            </div>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalCarbs)} / {targetCarbs}g</span>
          </div>
          <p className="text-3xl font-black text-white my-2.5">
            {Math.round(totalCarbs)} <span className="text-xs font-medium text-gray-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Fat Progress Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Fat</span>
            </div>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalFat)} / {targetFat}g</span>
          </div>
          <p className="text-3xl font-black text-white my-2.5">
            {Math.round(totalFat)} <span className="text-xs font-medium text-gray-400">g</span>
          </p>
          <div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-rose-500 to-rose-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* 🤖 Ultra-Sleek Glassmorphic Direct AI Food Logger Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 mb-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                Direct Gemini AI Food Logger
              </h3>
              <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                Type any dish or meal — AI automatically calculates Calories & Macros
              </p>
            </div>
          </div>

          {/* Animated Meal Category Selector Tabs */}
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
            {mealTypes.map((mt) => {
              const Icon = mt.icon;
              const active = selectedMeal === mt.value;
              return (
                <button
                  key={mt.value}
                  type="button"
                  onClick={() => setSelectedMeal(mt.value)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    active ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeMealTab"
                      className="absolute inset-0 gradient-bg rounded-xl shadow-md shadow-cyan-500/30"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 ${active ? 'text-white' : mt.color}`} />
                  <span className="relative z-10">{mt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Food Input Bar & Quantity Stepper */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          
          {/* Food Input Box */}
          <div className="flex-1">
            <Input
              placeholder="What did you eat? (e.g., 2 Boiled Eggs, Masala Dosa, 1 Apple, Chicken Curry & 2 Roti)"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectAILog()}
            />
          </div>

          {/* Quantity Stepper & Unit Options Row */}
          <div className="flex gap-2">
            
            {/* Quantity Stepper */}
            <div className="flex items-center bg-white/5 border border-white/15 rounded-2xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const curr = Number(inputQuantity) || 1;
                  setInputQuantity(String(Math.max(1, curr - 1)));
                }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors active:scale-95 select-none"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={inputQuantity}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputQuantity(val === '' ? '' : val);
                }}
                onBlur={() => {
                  if (!inputQuantity || Number(inputQuantity) <= 0) setInputQuantity('1');
                }}
                className="w-12 h-9 text-center bg-transparent text-sm font-black text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const curr = Number(inputQuantity) || 0;
                  setInputQuantity(String(curr + 1));
                }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center cursor-pointer transition-colors active:scale-95 select-none"
              >
                +
              </button>
            </div>

            {/* Unit Dropdown */}
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="h-12 bg-[#0d1322] border border-white/15 rounded-2xl px-3.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner shrink-0"
            >
              {unitOptions.map((u) => (
                <option key={u.code} value={u.code} className="bg-[#0f172a] text-white">
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleDirectAILog()}
              loading={loggingAI}
              size="md"
              className="gradient-bg text-white font-black shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 whitespace-nowrap px-6 h-12 rounded-2xl flex-1 lg:flex-none cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 mr-2 animate-pulse" />
              <span>Calculate & Log</span>
            </Button>

            {/* Fine-Tuning Adjust Button */}
            <button
              type="button"
              onClick={handleOpenDetailModal}
              title="Fine-tune macros manually before saving"
              className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Sliders className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

        </div>

        {/* Quick 1-Tap Preset Food Chips */}
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick 1-Tap AI Logging Presets</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PRESETS.map((preset) => (
              <motion.button
                key={preset.name}
                type="button"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDirectAILog(preset.name, preset.qty, preset.unit)}
                disabled={loggingAI}
                className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
                <span className="text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg font-extrabold">
                  {preset.qty} {preset.unit}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 🍽️ Logged Meal Category Section Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {mealTypes.map((mt) => {
          const Icon = mt.icon;
          const entries = groupedDiary[mt.value] || [];

          const mealKcal = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
          const mealProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
          const mealCarbs = entries.reduce((sum, e) => sum + (e.carbs || 0), 0);
          const mealFat = entries.reduce((sum, e) => sum + (e.fat || 0), 0);

          return (
            <motion.div
              key={mt.value}
              variants={cardVariants}
              className={`glass-card rounded-3xl p-6 sm:p-7 border ${mt.border} bg-gradient-to-r ${mt.gradient} shadow-2xl relative overflow-hidden`}
            >
              {/* Meal Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                    <Icon className={`w-6 h-6 ${mt.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 leading-tight">
                      <span>{mt.label}</span>
                      <span className="text-xs text-gray-400 font-bold bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                        {entries.length} items
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      P: <strong className="text-cyan-300 font-bold">{Math.round(mealProtein)}g</strong> • C:{' '}
                      <strong className="text-purple-300 font-bold">{Math.round(mealCarbs)}g</strong> • F:{' '}
                      <strong className="text-rose-300 font-bold">{Math.round(mealFat)}g</strong>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-amber-400 tracking-tight">{Math.round(mealKcal)}</span>
                  <span className="text-xs text-gray-400 font-bold ml-1">kcal</span>
                </div>
              </div>

              {/* Logged Food Entries List */}
              {entries.length === 0 ? (
                <div className="py-7 text-center text-gray-500 text-xs italic bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                  {t('food_diary_no_foods')}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group shadow-md"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                            <Utensils className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-white truncate">{entry.food_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Portion: <strong className="text-cyan-300 font-bold">{entry.quantity} {entry.unit || 'servings'}</strong> • P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 shrink-0">
                          <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 shadow-inner">
                            {entry.calories} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteFood(entry.id, entry.food_name)}
                            className="text-gray-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer active:scale-95"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ✨ Optional Fine-Tuning Review Modal Overlay */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-strong border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,212,255,0.25)] my-auto"
            >
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      Review & Fine-Tune AI Food Entry
                    </h3>
                    <p className="text-xs text-cyan-400 font-semibold">Gemini AI Calculated Breakdown</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDetailModal} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Food / Dish Name *
                  </label>
                  <Input
                    placeholder="e.g. Masala Dosa, Chicken Curry"
                    value={detailForm.food_name}
                    onChange={(e) => setDetailForm({ ...detailForm, food_name: e.target.value })}
                    required
                  />
                </div>

                {/* Calories & Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Calories (kcal) *
                    </label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={detailForm.calories}
                      onChange={(e) => setDetailForm({ ...detailForm, calories: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={detailForm.quantity}
                      onChange={(e) => setDetailForm({ ...detailForm, quantity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Measurement Unit Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Measurement Unit
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {unitOptions.map((unit) => {
                      const selected = detailForm.unit === unit.code;
                      return (
                        <button
                          key={unit.code}
                          type="button"
                          onClick={() => setDetailForm({ ...detailForm, unit: unit.code })}
                          className={`p-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                            selected
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10'
                          }`}
                        >
                          {unit.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Macros (Protein, Carbs, Fat) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 uppercase mb-1">
                      Protein (g)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={detailForm.protein}
                      onChange={(e) => setDetailForm({ ...detailForm, protein: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                      Carbs (g)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={detailForm.carbs}
                      onChange={(e) => setDetailForm({ ...detailForm, carbs: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                      Fat (g)
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={detailForm.fat}
                      onChange={(e) => setDetailForm({ ...detailForm, fat: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    loading={loggingAI}
                    size="md"
                    className="w-2/3 py-3 gradient-bg text-white font-black rounded-2xl shadow-lg shadow-cyan-500/30"
                  >
                    Log Food to Diary
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
