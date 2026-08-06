import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, RefreshCw, Sun, Coffee, Moon, Cookie,
  Leaf, Beef, Vegan, X, CheckCircle2, Bot, Clock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import mealService from '../../services/mealService';
import api from '../../services/api';
import { saveOfflineMealPlan, getOfflineMealPlan } from '../../utils/offlineStorage';
import { useLanguage } from '../../context/LanguageContext';

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const mealGradients = {
  breakfast: 'from-amber-500/20 to-orange-500/10',
  lunch: 'from-sky-500/20 to-blue-500/10',
  dinner: 'from-purple-500/20 to-indigo-500/10',
  snack: 'from-pink-500/20 to-rose-500/10',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

function MealCard({ slot, meal, onMealClick, t }) {
  const [imgFailed, setImgFailed] = useState(false);
  const Icon = mealIcons[slot] || Utensils;
  const gradient = mealGradients[slot];

  if (!meal) {
    return (
      <div className={`p-6 rounded-3xl bg-slate-50 border border-slate-200 opacity-60 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[280px]`}>
        <Icon size={32} className="opacity-40 mb-3 text-slate-400" />
        <span className="text-base sm:text-lg font-black text-slate-600 capitalize">{slot}</span>
        <p className="text-xs sm:text-sm text-slate-500 italic mt-2">{t('meal_no_meal_scheduled')}</p>
      </div>
    );
  }

  const hasValidImage = meal.recipe_image && !imgFailed;
  const titleText = meal.recipe_title || meal.food_name || t('meal_default_title');

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onMealClick(meal, slot)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xs min-h-[320px] sm:min-h-[360px] flex flex-col border border-slate-200 bg-white"
    >
      {/* Background Imagery or Gradient Fallback */}
      {hasValidImage ? (
        <img
          src={meal.recipe_image}
          alt=""
          onError={() => setImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Utensils className="w-24 h-24 text-slate-300/40" />
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t ${hasValidImage ? 'from-[#0a192f] via-[#0a192f]/40 to-black/30' : 'from-[#0a192f] via-[#0a192f]/20 to-transparent'}`} />
      
      {/* Card Content */}
      <div className="relative z-10 p-4 sm:p-6 flex flex-col h-full justify-between">
        {/* Top Header Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-xs">
            <Icon size={14} className="text-[#0284c7] shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-[#0a192f] uppercase tracking-wider">{slot}</span>
          </div>
          {meal.recipe_ready_in && (
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-amber-600 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-[#0a192f]">{meal.recipe_ready_in} {t('common_min')}</span>
            </div>
          )}
        </div>

        {/* Dish Title & Frosted-Glass Macros at a Glance */}
        <div className="mt-auto pt-6 sm:pt-8 space-y-3">
          <h4
            title={titleText}
            className="text-lg sm:text-xl xl:text-2xl font-black text-white leading-snug drop-shadow-md group-hover:text-sky-300 transition-colors line-clamp-2"
          >
            {titleText}
          </h4>

          {/* Responsive Macros Badge Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0a192f]/90 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-center text-white">
            <div className="flex flex-col items-center justify-center p-1">
              <span className="text-xs font-black text-amber-300 leading-none">{Math.round(meal.calories || 0)}</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_kcal')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 sm:border-l border-white/15">
              <span className="text-xs font-black text-emerald-300 leading-none">{Math.round(meal.protein || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_protein')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 border-l sm:border-l border-white/15">
              <span className="text-xs font-black text-sky-300 leading-none">{Math.round(meal.carbohydrates || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_carbs')}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 border-l border-white/15">
              <span className="text-xs font-black text-rose-300 leading-none">{Math.round(meal.fat || 0)}g</span>
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tight mt-1">{t('common_fat')}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MealPlanner() {
  const { t } = useLanguage();

  const dietOptions = [
    { value: 'vegetarian', label: t('meal_diet_vegetarian'), icon: Leaf, color: 'text-emerald-600' },
    { value: 'non_vegetarian', label: t('meal_diet_non_veg'), icon: Beef, color: 'text-rose-600' },
    { value: 'vegan', label: t('meal_diet_vegan'), icon: Vegan, color: 'text-green-600' },
  ];

  const dayNames = [
    t('common_days_mon'), t('common_days_tue'), t('common_days_wed'), t('common_days_thu'),
    t('common_days_fri'), t('common_days_sat'), t('common_days_sun'),
  ];

  const fullDayNames = [
    t('common_days_monday'), t('common_days_tuesday'), t('common_days_wednesday'), t('common_days_thursday'),
    t('common_days_friday'), t('common_days_saturday'), t('common_days_sunday'),
  ];

  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalImgFailed, setModalImgFailed] = useState(false);

  const [aiRecipes, setAiRecipes] = useState(null);
  const [recipesLoading, setRecipesLoading] = useState(false);

  useEffect(() => {
    loadWeeklyPlan(selectedDiet);
  }, []);

  const loadWeeklyPlan = async (diet) => {
    setLoading(true);
    try {
      const data = await mealService.getWeeklyMealPlan(diet);
      setWeeklyPlan(data);
      saveOfflineMealPlan(data);
    } catch (err) {
      console.error('Failed to load meal plan', err);
      const cached = getOfflineMealPlan();
      if (cached) {
        setWeeklyPlan(cached);
        setAlert({ show: true, type: 'info', message: t('meal_loaded_cached') });
      } else {
        setAlert({ show: true, type: 'error', message: t('meal_load_error') });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDietChange = (diet) => {
    setSelectedDiet(diet);
    loadWeeklyPlan(diet);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const data = await mealService.regeneratePlan(selectedDiet);
      setWeeklyPlan(data);
      setAlert({ show: true, type: 'success', message: t('meal_regenerate_success') });
    } catch (err) {
      console.error('Regenerate failed', err);
      setAlert({ show: true, type: 'error', message: t('meal_regenerate_error') });
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateAiRecipes = async () => {
    setRecipesLoading(true);
    try {
      const { data } = await api.post('/ai/recipes', {
        dietary_preference: selectedDiet,
        target_calories: 2000
      });
      setAiRecipes(data.recipes);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('meal_ai_recipes_error') });
    } finally {
      setRecipesLoading(false);
    }
  };

  const currentDayData = weeklyPlan?.days?.[selectedDayIndex];
  const currentMeals = currentDayData?.meals || {};

  return (
    <DashboardLayout title={t('meal_page_title')} subtitle={t('meal_page_subtitle')}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden text-[#0a192f]">
        {/* Diet Selector Pills */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#0a192f] rounded-2xl w-full xl:w-auto shadow-md">
          {dietOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedDiet === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleDietChange(opt.value)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                  isSelected
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} className={`shrink-0 ${isSelected ? 'text-white' : opt.color}`} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto">
          <Button onClick={handleGenerateAiRecipes} loading={recipesLoading} icon={Bot} variant="secondary" size="md" className="w-full justify-center text-xs sm:text-sm py-2.5 bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50">
            {t('meal_generate_ai_btn')}
          </Button>
          <Button onClick={handleRegenerate} loading={regenerating} icon={RefreshCw} size="md" className="w-full justify-center text-xs sm:text-sm py-2.5 bg-[#0a192f] hover:bg-[#0284c7] text-white font-bold shadow-md">
            {t('meal_regenerate_btn')}
          </Button>
        </div>
      </div>

      {/* Gemini Generative Recipes Section */}
      {aiRecipes && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-200 bg-purple-50/50 rounded-3xl relative text-[#0a192f]">
          <button onClick={() => setAiRecipes(null)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4 pr-6">
            <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0"><Bot size={20} /></div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#0a192f]">{t('meal_ai_recipes_title')}</h3>
              <p className="text-xs text-purple-700 font-bold">{t('meal_ai_recipes_subtitle')}</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-white p-4 sm:p-6 rounded-2xl border border-purple-100 font-sans font-medium break-words shadow-xs">
            {aiRecipes}
          </div>
        </motion.div>
      )}

      {/* Days Tabs (Scrollable Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 custom-scrollbar max-w-full">
        {fullDayNames.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border transition-all cursor-pointer shrink-0 min-w-[70px] sm:min-w-[90px] ${
                isSelected
                  ? 'bg-[#0a192f] border-[#0a192f] text-white shadow-md scale-105'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{dayNames[idx]}</span>
              <span className="text-xs sm:text-sm font-bold mt-0.5">{day}</span>
            </button>
          );
        })}
      </div>

      {/* Meal Slot Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-[320px] animate-pulse bg-white border border-slate-200 flex flex-col justify-between">
              <div className="h-6 w-24 bg-slate-100 rounded-full" />
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                <div className="h-12 w-full bg-slate-100 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          key={selectedDayIndex}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
            <MealCard
              key={slot}
              slot={slot}
              meal={currentMeals[slot]}
              t={t}
              onMealClick={(meal) => {
                setSelectedMeal(meal);
                setSelectedSlot(slot);
                setModalImgFailed(false);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Full Recipe Modal */}
      {selectedMeal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-[#0a192f]/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-2xl my-auto max-h-[85vh] sm:max-h-[88vh] flex flex-col overflow-hidden text-[#0a192f]"
          >
            {/* Sticky Top Header Bar with Close Button */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                  {selectedSlot}
                </span>
                {selectedMeal.recipe_ready_in && (
                  <span className="text-xs font-bold text-slate-500">
                    {selectedMeal.recipe_ready_in} {t('common_min')}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-5 custom-scrollbar">
              {/* Modal Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden h-40 sm:h-52 bg-slate-100 border border-slate-200 shrink-0">
                {selectedMeal.recipe_image && !modalImgFailed ? (
                  <img
                    src={selectedMeal.recipe_image}
                    alt=""
                    onError={() => setModalImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    <Utensils size={48} className="text-slate-300" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                    {selectedMeal.recipe_title || selectedMeal.food_name}
                  </h3>
                </div>
              </div>

              {/* Macro Nutrients Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_calories')}</span>
                  <span className="text-base sm:text-lg font-black text-amber-600">{Math.round(selectedMeal.calories || 0)} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_protein')}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-600">{Math.round(selectedMeal.protein || 0)}g</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_carbs')}</span>
                  <span className="text-base sm:text-lg font-black text-[#0284c7]">{Math.round(selectedMeal.carbohydrates || 0)}g</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-slate-500 font-bold block">{t('common_fat')}</span>
                  <span className="text-base sm:text-lg font-black text-rose-600">{Math.round(selectedMeal.fat || 0)}g</span>
                </div>
              </div>

              {/* Ingredients */}
              {selectedMeal.recipe_ingredients && selectedMeal.recipe_ingredients.length > 0 && (
                <div>
                  <h4 className="text-base font-black text-[#0a192f] mb-2.5">{t('meal_ingredients')}</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    {selectedMeal.recipe_ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-semibold">
                        <CheckCircle2 size={15} className="text-[#0284c7] shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instructions */}
              {selectedMeal.recipe_instructions && selectedMeal.recipe_instructions.length > 0 && (
                <div>
                  <h4 className="text-base font-black text-[#0a192f] mb-2.5">{t('meal_cooking_instructions')}</h4>
                  <ol className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    {selectedMeal.recipe_instructions.map((step, i) => (
                      <li key={i} className="flex gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="w-5 h-5 rounded-lg bg-[#0a192f] text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-semibold">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </DashboardLayout>
  );
}
