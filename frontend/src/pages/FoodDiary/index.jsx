import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Coffee, Sun, Moon, Cookie,
  Flame, Droplets, Trash2, Utensils, Sparkles,
  CheckCircle2, RefreshCw, Scale, ChevronRight, Sliders, Zap
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import foodService from '../../services/foodService';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

// Quick 1-tap presets for popular food items
const POPULAR_PRESETS = [
  { name: 'Boiled Egg', qty: 1, unit: 'pcs' },
  { name: 'Apple', qty: 1, unit: 'pcs' },
  { name: 'Whole Milk', qty: 250, unit: 'ml' },
  { name: 'Brown Rice', qty: 150, unit: 'g' },
  { name: 'Chicken Breast', qty: 150, unit: 'g' },
  { name: 'Avocado', qty: 1, unit: 'pcs' },
  { name: 'Almonds', qty: 30, unit: 'g' },
  { name: 'Oatmeal Porridge', qty: 1, unit: 'cups' },
];

export default function FoodDiary() {
  const { t } = useLanguage();

  const mealTypes = [
    { value: 'breakfast', label: t('food_diary_breakfast'), icon: Coffee, color: 'text-amber-400', bg: 'from-amber-500/10 to-transparent', border: 'border-amber-500/20' },
    { value: 'lunch', label: t('food_diary_lunch'), icon: Sun, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-transparent', border: 'border-cyan-500/20' },
    { value: 'dinner', label: t('food_diary_dinner'), icon: Moon, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/20' },
    { value: 'snack', label: t('food_diary_snack'), icon: Cookie, color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent', border: 'border-pink-500/20' },
  ];

  const unitOptions = [
    { code: 'g', label: t('food_diary_unit_g') },
    { code: 'servings', label: t('food_diary_unit_serving') },
    { code: 'pcs', label: t('food_diary_unit_pcs') },
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
      setAlert({ show: true, type: 'error', message: t('food_diary_log_error') });
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
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('sidebar_food_diary')} subtitle="Direct AI-powered caloric and macronutrient food logging">
      <Alert
        type={alert.type}
        message={alert.message}
        show={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
      />

      {/* 🌟 Hero Macro Target Gauges Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8 mt-2">
        
        {/* Calorie Progress Radial Ring Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl border border-white/10 flex items-center gap-5 shadow-2xl relative overflow-hidden lg:col-span-1"
        >
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
              <Flame className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-base font-black text-white">{totalKcal}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase">/ {targetKcal}</span>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-white leading-tight">Daily Calorie Goal</h4>
            <p className="text-xs text-gray-400 mt-1">
              Remaining: <strong className="text-cyan-300">{Math.max(0, targetKcal - totalKcal)} kcal</strong>
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-300">
              <Zap className="w-3 h-3" /> {kcalPct}% Target Reached
            </div>
          </div>
        </motion.div>

        {/* Protein Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Protein</span>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalProtein)} / {targetProtein}g</span>
          </div>
          <p className="text-2xl font-black text-white my-2">{Math.round(totalProtein)} <span className="text-xs font-medium text-gray-400">g</span></p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }} />
          </div>
        </motion.div>

        {/* Carbs Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Carbohydrates</span>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalCarbs)} / {targetCarbs}g</span>
          </div>
          <p className="text-2xl font-black text-white my-2">{Math.round(totalCarbs)} <span className="text-xs font-medium text-gray-400">g</span></p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }} />
          </div>
        </motion.div>

        {/* Fat Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">Fat</span>
            <span className="text-[11px] text-gray-400 font-bold">{Math.round(totalFat)} / {targetFat}g</span>
          </div>
          <p className="text-2xl font-black text-white my-2">{Math.round(totalFat)} <span className="text-xs font-medium text-gray-400">g</span></p>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }} />
          </div>
        </motion.div>

      </div>

      {/* 🤖 Direct Gemini AI Food Logger Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-cyan-500/30 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Log Food with Gemini AI
              </h3>
              <p className="text-xs text-cyan-400 font-medium">Type any food or dish — AI automatically calculates Calories & Macros</p>
            </div>
          </div>
        </div>

        {/* Meal Type Selector Chips */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          {mealTypes.map((mt) => {
            const Icon = mt.icon;
            const active = selectedMeal === mt.value;
            return (
              <button
                key={mt.value}
                type="button"
                onClick={() => setSelectedMeal(mt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'gradient-bg text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/50 scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : mt.color}`} />
                <span>{mt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Food Input Bar with Portion Stepper & Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Main Food Input */}
          <div className="flex-1">
            <Input
              placeholder="What did you eat? (e.g. 2 Boiled Eggs, Masala Dosa, 1 Apple, Chicken Curry & 2 Roti)"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDirectAILog()}
            />
          </div>

          {/* Portion Stepper Input */}
          <div className="w-full sm:w-28 flex items-center">
            <Input
              type="number"
              min="1"
              placeholder="Qty"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(e.target.value)}
            />
          </div>

          {/* Unit Selector */}
          <div className="w-full sm:w-36">
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/15 rounded-2xl px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {unitOptions.map((u) => (
                <option key={u.code} value={u.code} className="bg-[#0f172a] text-white">
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Direct AI Log Button */}
          <Button
            onClick={() => handleDirectAILog()}
            loading={loggingAI}
            size="md"
            className="gradient-bg text-white font-extrabold shadow-lg shadow-cyan-500/30 whitespace-nowrap px-6"
          >
            <Sparkles className="w-4 h-4 text-amber-300 mr-1.5" />
            <span>Calculate & Log</span>
          </Button>

          {/* Optional Details Adjust Button */}
          <button
            type="button"
            onClick={handleOpenDetailModal}
            title="Fine-tune macros manually before saving"
            className="px-3.5 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Quick 1-Tap Preset Food Chips */}
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick 1-Tap AI Logging Presets</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleDirectAILog(preset.name, preset.qty, preset.unit)}
                disabled={loggingAI}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <span>{preset.name}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md font-bold">
                  {preset.qty} {preset.unit}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🍽️ Logged Meals Section */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
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
              variants={item}
              className={`glass-card rounded-3xl p-6 border ${mt.border} bg-gradient-to-r ${mt.bg} shadow-xl`}
            >
              {/* Meal Section Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${mt.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{mt.label}</span>
                      <span className="text-xs text-gray-400 font-semibold bg-white/5 px-2 py-0.5 rounded-md">
                        ({entries.length})
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      P: <strong className="text-cyan-300">{Math.round(mealProtein)}g</strong> • C:{' '}
                      <strong className="text-purple-300">{Math.round(mealCarbs)}g</strong> • F:{' '}
                      <strong className="text-rose-300">{Math.round(mealFat)}g</strong>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-amber-400">{Math.round(mealKcal)}</span>
                  <span className="text-xs text-gray-400 font-medium ml-1">kcal</span>
                </div>
              </div>

              {/* Logged Food Entries List */}
              {entries.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-xs italic bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                  {t('food_diary_no_foods')}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {entries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <Utensils className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{entry.food_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Portion: <strong className="text-cyan-300">{entry.quantity} {entry.unit || 'servings'}</strong> • P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-sm font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                          {entry.calories} kcal
                        </span>
                        <button
                          onClick={() => handleDeleteFood(entry.id, entry.food_name)}
                          className="text-gray-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ✨ Optional Details & Review Modal Overlay */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-strong border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,212,255,0.2)] my-auto"
            >
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <Sparkles className="w-5 h-5 text-amber-300" />
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
