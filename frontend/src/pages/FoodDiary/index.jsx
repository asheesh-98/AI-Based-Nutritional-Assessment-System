import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Coffee, Sun, Moon, Cookie,
  Flame, Droplets, Trash2, Utensils, Scale, Sparkles,
  ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import foodService from '../../services/foodService';
import { useLanguage } from '../../context/LanguageContext';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

// Preset popular food items for quick 1-tap logging
const POPULAR_PRESETS = [
  { id: 'p1', name: 'Boiled Egg', baseKcal: 78, baseProtein: 6.3, baseCarbs: 0.6, baseFat: 5.3, defaultQty: 1, defaultUnit: 'pcs', category: 'Protein' },
  { id: 'p2', name: 'Apple', baseKcal: 95, baseProtein: 0.5, baseCarbs: 25, baseFat: 0.3, defaultQty: 1, defaultUnit: 'pcs', category: 'Fruits' },
  { id: 'p3', name: 'Whole Milk', baseKcal: 150, baseProtein: 8, baseCarbs: 12, baseFat: 8, defaultQty: 250, defaultUnit: 'ml', category: 'Dairy' },
  { id: 'p4', name: 'Brown Rice', baseKcal: 215, baseProtein: 5, baseCarbs: 45, baseFat: 1.8, defaultQty: 150, defaultUnit: 'g', category: 'Grains' },
  { id: 'p5', name: 'Chicken Breast', baseKcal: 248, baseProtein: 47, baseCarbs: 0, baseFat: 5, defaultQty: 150, defaultUnit: 'g', category: 'Poultry' },
  { id: 'p6', name: 'Avocado', baseKcal: 240, baseProtein: 3, baseCarbs: 12, baseFat: 22, defaultQty: 1, defaultUnit: 'pcs', category: 'Healthy Fats' },
  { id: 'p7', name: 'Almonds', baseKcal: 170, baseProtein: 6, baseCarbs: 6, baseFat: 15, defaultQty: 30, defaultUnit: 'g', category: 'Nuts' },
  { id: 'p8', name: 'Oatmeal Porridge', baseKcal: 160, baseProtein: 6, baseCarbs: 28, baseFat: 3, defaultQty: 1, defaultUnit: 'cups', category: 'Breakfast' },
];

export default function FoodDiary() {
  const { t } = useLanguage();

  const mealTypes = [
    { value: 'breakfast', label: t('food_diary_breakfast'), icon: Coffee, color: 'text-amber-400', bg: 'from-amber-500/10 to-transparent', border: 'border-amber-500/20' },
    { value: 'lunch', label: t('food_diary_lunch'), icon: Sun, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-transparent', border: 'border-cyan-500/20' },
    { value: 'dinner', label: t('food_diary_dinner'), icon: Moon, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/20' },
    { value: 'snack', label: t('food_diary_snack'), icon: Cookie, color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent', border: 'border-pink-500/20' },
  ];

  // Available measurement units with scaling multipliers relative to base (1 serving or 100g)
  const unitOptions = [
    { code: 'g', label: t('food_diary_unit_g'), scale: (qty) => qty / 100 },
    { code: 'servings', label: t('food_diary_unit_serving'), scale: (qty) => qty },
    { code: 'pcs', label: t('food_diary_unit_pcs'), scale: (qty) => qty },
    { code: 'ml', label: t('food_diary_unit_ml'), scale: (qty) => qty / 100 },
    { code: 'cups', label: t('food_diary_unit_cups'), scale: (qty) => qty * 2.4 },
    { code: 'oz', label: t('food_diary_unit_oz'), scale: (qty) => qty * 0.28 },
    { code: 'tbsp', label: t('food_diary_unit_tbsp'), scale: (qty) => qty * 0.15 },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  // Portion & Unit Configurator State
  const [activeConfigFood, setActiveConfigFood] = useState(null);
  const [configQuantity, setConfigQuantity] = useState(1);
  const [configUnit, setConfigUnit] = useState('servings');
  const [loggingProgress, setLoggingProgress] = useState(false);

  // Custom Product Creation State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    food_name: '',
    calories: '',
    protein: '0',
    carbs: '0',
    fat: '0',
    quantity: '1',
    unit: 'servings',
  });
  const [savingCustom, setSavingCustom] = useState(false);

  const openCustomModal = (defaultName = '') => {
    setCustomForm({
      food_name: defaultName || searchQuery || '',
      calories: '',
      protein: '0',
      carbs: '0',
      fat: '0',
      quantity: '1',
      unit: 'servings',
    });
    setShowCustomModal(true);
  };

  const handleSaveCustomFood = async (e) => {
    if (e) e.preventDefault();
    if (!customForm.food_name.trim()) {
      setAlert({ show: true, type: 'error', message: 'Please enter a product name.' });
      return;
    }
    const kcal = parseFloat(customForm.calories);
    if (isNaN(kcal) || kcal < 0) {
      setAlert({ show: true, type: 'error', message: 'Please enter valid calories.' });
      return;
    }

    setSavingCustom(true);
    try {
      await foodService.logFood({
        food_name: customForm.food_name.trim(),
        meal_type: selectedMeal,
        quantity: Number(customForm.quantity) || 1,
        unit: customForm.unit || 'servings',
        calories: Math.round(kcal),
        protein: parseFloat(customForm.protein) || 0,
        carbs: parseFloat(customForm.carbs) || 0,
        fat: parseFloat(customForm.fat) || 0,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `${customForm.food_name} ${t('food_diary_added_food')}`,
      });
      setShowCustomModal(false);
      setSearchResults([]);
      setSearchQuery('');
      loadDiary();
    } catch (err) {
      console.error('Custom log food error:', err);
      setAlert({ show: true, type: 'error', message: t('food_diary_log_error') });
    } finally {
      setSavingCustom(false);
    }
  };

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await foodService.searchFoods(searchQuery);
      setSearchResults(Array.isArray(res) ? res.slice(0, 10) : []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Opens the Portion & Unit Configurator for a food item
  const openPortionConfigurator = (food) => {
    const defaultUnit = food.defaultUnit || 'g';
    const defaultQty = food.defaultQty || (defaultUnit === 'g' ? 100 : 1);
    setActiveConfigFood(food);
    setConfigQuantity(defaultQty);
    setConfigUnit(defaultUnit);
  };

  // Calculates scaled macros based on current quantity & unit selection
  const calculateScaledMacros = () => {
    if (!activeConfigFood) return { kcal: 0, protein: 0, carbs: 0, fat: 0 };

    const baseKcal = activeConfigFood.energy_kcal || activeConfigFood.baseKcal || 0;
    const baseProtein = activeConfigFood.protein_g || activeConfigFood.baseProtein || 0;
    const baseCarbs = activeConfigFood.carbohydrate_g || activeConfigFood.baseCarbs || 0;
    const baseFat = activeConfigFood.fat_g || activeConfigFood.baseFat || 0;

    const unitObj = unitOptions.find((u) => u.code === configUnit) || unitOptions[1];
    const qtyNum = Number(configQuantity) || 0;
    const multiplier = unitObj.scale(qtyNum);

    return {
      kcal: Math.round(baseKcal * multiplier),
      protein: parseFloat((baseProtein * multiplier).toFixed(1)),
      carbs: parseFloat((baseCarbs * multiplier).toFixed(1)),
      fat: parseFloat((baseFat * multiplier).toFixed(1)),
    };
  };

  const handleConfirmLogFood = async () => {
    if (!activeConfigFood) return;
    setLoggingProgress(true);

    const scaled = calculateScaledMacros();
    const foodName = activeConfigFood.food_name || activeConfigFood.name;

    try {
      await foodService.logFood({
        food_id: activeConfigFood.id,
        food_name: foodName,
        meal_type: selectedMeal,
        quantity: Number(configQuantity),
        unit: configUnit,
        calories: scaled.kcal,
        protein: scaled.protein,
        carbs: scaled.carbs,
        fat: scaled.fat,
      });

      setAlert({
        show: true,
        type: 'success',
        message: `${foodName} (${configQuantity} ${configUnit}) ${t('food_diary_added_food')}`,
      });
      setActiveConfigFood(null);
      setSearchResults([]);
      setSearchQuery('');
      loadDiary();
    } catch (err) {
      console.error('Log food error:', err);
      setAlert({ show: true, type: 'error', message: t('food_diary_log_error') });
    } finally {
      setLoggingProgress(false);
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

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const groupedDiary = mealTypes.reduce((acc, mt) => {
    acc[mt.value] = diary.filter((d) => d.meal_type === mt.value);
    return acc;
  }, {});

  const totalCalories = diary.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalProtein = diary.reduce((sum, d) => sum + (d.protein || 0), 0);
  const totalCarbs = diary.reduce((sum, d) => sum + (d.carbs || 0), 0);
  const totalFat = diary.reduce((sum, d) => sum + (d.fat || 0), 0);

  // Calorie & Macro Target References (Default daily goal: 2000 kcal)
  const targetCalories = 2000;
  const remainingCalories = Math.max(0, targetCalories - Math.round(totalCalories));
  const caloriePercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const targetProtein = 120; // 120g
  const targetCarbs = 250;   // 250g
  const targetFat = 65;      // 65g

  const currentScaled = calculateScaledMacros();

  return (
    <DashboardLayout title={t('food_diary_page_title')} subtitle={todayDateString}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* 🌟 Top Hero Macro Targets Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        
        {/* Calorie Gauge Ring Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">{t('common_calories')}</h4>
                <p className="text-[11px] text-gray-400">{t('food_diary_target_kcal')}</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {caloriePercent}% Goal
            </span>
          </div>

          <div className="flex items-center justify-around my-2">
            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t('food_diary_consumed')}</span>
              <p className="text-3xl font-black text-white">{Math.round(totalCalories)}</p>
              <span className="text-[11px] text-gray-500">{t('common_kcal')}</span>
            </div>

            {/* Circular Progress Indicator */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 transition-all duration-700 ease-out"
                  strokeDasharray={`${caloriePercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-amber-300">{caloriePercent}%</span>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t('food_diary_remaining')}</span>
              <p className="text-3xl font-black text-cyan-400">{remainingCalories}</p>
              <span className="text-[11px] text-gray-500">{t('common_kcal')}</span>
            </div>
          </div>

          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-amber-500 via-orange-400 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </motion.div>

        {/* Macro Progress Bars Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">{t('food_diary_daily_targets')}</h4>
            </div>
            <span className="text-xs text-gray-400 font-medium">Daily Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Protein Card */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-cyan-300">{t('common_protein')}</span>
                <span className="text-gray-400">{Math.round(totalProtein)} / {targetProtein}g</span>
              </div>
              <p className="text-2xl font-black text-white mb-2">{Math.round(totalProtein)}g</p>
              <div className="w-full bg-cyan-950/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalProtein / targetProtein) * 100))}%` }}
                />
              </div>
            </div>

            {/* Carbs Card */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-purple-300">{t('common_carbs')}</span>
                <span className="text-gray-400">{Math.round(totalCarbs)} / {targetCarbs}g</span>
              </div>
              <p className="text-2xl font-black text-white mb-2">{Math.round(totalCarbs)}g</p>
              <div className="w-full bg-purple-950/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalCarbs / targetCarbs) * 100))}%` }}
                />
              </div>
            </div>

            {/* Fat Card */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-rose-300">{t('common_fat')}</span>
                <span className="text-gray-400">{Math.round(totalFat)} / {targetFat}g</span>
              </div>
              <p className="text-2xl font-black text-white mb-2">{Math.round(totalFat)}g</p>
              <div className="w-full bg-rose-950/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalFat / targetFat) * 100))}%` }}
                />
              </div>
            </div>

          </div>
        </motion.div>

      </div>

      {/* 🔍 Search & Log Food Section */}
      <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 mb-8 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2.5">
            <Plus className="w-5 h-5 text-cyan-400" />
            <span>{t('food_diary_log_food_title')}</span>
          </h3>
          <button
            type="button"
            onClick={() => openCustomModal()}
            className="px-3.5 py-1.5 rounded-xl gradient-bg text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('food_diary_add_custom_btn')}</span>
          </button>
        </div>

        {/* Meal Type Selector Chips */}
        <div className="flex flex-wrap gap-2.5 mb-5">
          {mealTypes.map((mt) => {
            const Icon = mt.icon;
            const active = selectedMeal === mt.value;
            return (
              <button
                key={mt.value}
                onClick={() => setSelectedMeal(mt.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  active
                    ? 'gradient-bg text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : mt.color}`} />
                <span>{mt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder={t('food_diary_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={Search}
            />
          </div>
          <Button onClick={handleSearch} loading={searching} size="sm">
            {t('common_search')}
          </Button>
        </div>

        {/* Popular Presets Chips for 1-Tap Logging */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('food_diary_preset_quick')}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => openPortionConfigurator(preset)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{preset.name}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-bold">
                  {preset.defaultQty} {preset.defaultUnit}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto custom-scrollbar p-2.5 bg-[#0d1322] border border-white/15 rounded-2xl shadow-2xl">
            {searchResults.map((food, i) => (
              <motion.div
                key={food.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer"
                onClick={() => openPortionConfigurator(food)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{food.food_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {food.category || 'General Food'} • <strong className="text-amber-300">{Math.round(food.energy_kcal || 0)} kcal</strong> per 100g
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg font-bold">
                    Select Portion &rarr;
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Custom Product Prompt Footer */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-between mt-3">
              <div>
                <p className="text-xs font-bold text-cyan-300">{t('food_diary_cant_find')}</p>
                <p className="text-[11px] text-gray-400">Log your own custom food item or meal</p>
              </div>
              <button
                type="button"
                onClick={() => openCustomModal(searchQuery)}
                className="px-3 py-1.5 rounded-lg gradient-bg text-white text-xs font-black hover:brightness-110 transition-all cursor-pointer shadow-md"
              >
                {t('food_diary_add_custom_btn')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ⚖️ Interactive Quantity & Unit Portion Configurator Modal Overlay */}
      <AnimatePresence>
        {activeConfigFood && (
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
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {activeConfigFood.food_name || activeConfigFood.name}
                    </h3>
                    <p className="text-xs text-cyan-400 font-semibold">{t('food_diary_portion_builder')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveConfigFood(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              {/* Quantity Stepper & Direct Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t('food_diary_quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const current = Number(configQuantity) || 1;
                      setConfigQuantity(Math.max(1, current - 1));
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={configQuantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setConfigQuantity('');
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) {
                          setConfigQuantity(val);
                        }
                      }
                    }}
                    onBlur={() => {
                      if (!configQuantity || Number(configQuantity) <= 0) {
                        setConfigQuantity(1);
                      }
                    }}
                    className="flex-1 h-12 bg-white/5 border border-cyan-500/30 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const current = Number(configQuantity) || 0;
                      setConfigQuantity(current + 1);
                    }}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Measurement Unit Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  {t('food_diary_unit')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {unitOptions.map((unit) => {
                    const selected = configUnit === unit.code;
                    return (
                      <button
                        key={unit.code}
                        onClick={() => setConfigUnit(unit.code)}
                        className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
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

              {/* Dynamic Live Scaled Macro Calculation Card */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Calculated Nutritional Intake</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] text-amber-300 font-bold uppercase">{t('common_calories')}</span>
                    <p className="text-lg font-black text-amber-400">{currentScaled.kcal}</p>
                    <span className="text-[10px] text-gray-400">kcal</span>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] text-cyan-300 font-bold uppercase">{t('common_protein')}</span>
                    <p className="text-lg font-black text-cyan-400">{currentScaled.protein}</p>
                    <span className="text-[10px] text-gray-400">g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 font-bold uppercase">{t('common_carbs')}</span>
                    <p className="text-lg font-black text-purple-400">{currentScaled.carbs}</p>
                    <span className="text-[10px] text-gray-400">g</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-[10px] text-rose-300 font-bold uppercase">{t('common_fat')}</span>
                    <p className="text-lg font-black text-rose-400">{currentScaled.fat}</p>
                    <span className="text-[10px] text-gray-400">g</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveConfigFood(null)}
                  className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300"
                >
                  {t('common_cancel')}
                </button>
                <button
                  onClick={handleConfirmLogFood}
                  disabled={loggingProgress}
                  className="w-2/3 py-3 rounded-2xl gradient-bg text-white text-xs font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loggingProgress ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>{t('food_diary_log_btn')}</span>
                      <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ✨ Custom Product / Food Creation Modal Overlay */}
        {showCustomModal && (
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
                      {t('food_diary_create_custom_title')}
                    </h3>
                    <p className="text-xs text-cyan-400 font-semibold">Custom Nutritional Entry</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-gray-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCustomFood} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    {t('food_diary_custom_name_label')} *
                  </label>
                  <Input
                    placeholder={t('food_diary_custom_name_placeholder')}
                    value={customForm.food_name}
                    onChange={(e) => setCustomForm({ ...customForm, food_name: e.target.value })}
                    required
                  />
                </div>

                {/* Calories & Quantity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      {t('food_diary_custom_kcal_label')} *
                    </label>
                    <Input
                      type="number"
                      placeholder="150"
                      min="0"
                      value={customForm.calories}
                      onChange={(e) => setCustomForm({ ...customForm, calories: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      {t('food_diary_quantity')}
                    </label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={customForm.quantity}
                      onChange={(e) => setCustomForm({ ...customForm, quantity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Measurement Unit Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    {t('food_diary_unit')}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {unitOptions.map((unit) => {
                      const selected = customForm.unit === unit.code;
                      return (
                        <button
                          key={unit.code}
                          type="button"
                          onClick={() => setCustomForm({ ...customForm, unit: unit.code })}
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

                {/* Optional Macros (Protein, Carbs, Fat) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-[11px] font-bold text-cyan-300 uppercase mb-1">
                      {t('food_diary_custom_protein_label')}
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={customForm.protein}
                      onChange={(e) => setCustomForm({ ...customForm, protein: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-purple-300 uppercase mb-1">
                      {t('food_diary_custom_carbs_label')}
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={customForm.carbs}
                      onChange={(e) => setCustomForm({ ...customForm, carbs: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-300 uppercase mb-1">
                      {t('food_diary_custom_fat_label')}
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      value={customForm.fat}
                      onChange={(e) => setCustomForm({ ...customForm, fat: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="w-1/3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 cursor-pointer"
                  >
                    {t('common_cancel')}
                  </button>
                  <Button
                    type="submit"
                    loading={savingCustom}
                    size="md"
                    className="w-2/3 py-3 gradient-bg text-white font-black rounded-2xl shadow-lg shadow-cyan-500/30"
                  >
                    {t('food_diary_save_custom_btn')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🍽️ Today's Logged Meal Sections */}
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
              {/* Meal Header */}
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

              {/* Logged Food Entries */}
              {entries.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-xs italic bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                  {t('food_diary_no_foods')}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDeleteFood(entry.id, entry.food_name)}
                          className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title={t('food_diary_remove_tooltip')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div>
                          <p className="text-sm font-bold text-white">{entry.food_name}</p>
                          <p className="text-xs text-gray-400">
                            {entry.quantity ? `${entry.quantity} ${entry.unit || 'g'}` : '1 serving'} • P:{' '}
                            {Math.round(entry.protein || 0)}g, C: {Math.round(entry.carbs || 0)}g, F:{' '}
                            {Math.round(entry.fat || 0)}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                          {Math.round(entry.calories || 0)} kcal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </DashboardLayout>
  );
}
