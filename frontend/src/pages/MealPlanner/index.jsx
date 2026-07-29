import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, RefreshCw, Sun, Coffee, Moon, Cookie,
  Flame, Leaf, Beef, Vegan, Sparkles, CalendarDays, X, ChevronRight, CheckCircle2, Bot, Clock, ExternalLink
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import mealService from '../../services/mealService';
import api from '../../services/api';

const dietOptions = [
  { value: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'text-emerald-400' },
  { value: 'non_vegetarian', label: 'Non-Veg', icon: Beef, color: 'text-rose-400' },
  { value: 'vegan', label: 'Vegan', icon: Vegan, color: 'text-green-400' },
];

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const mealGradients = {
  breakfast: 'from-amber-600/80 to-orange-900/90',
  lunch: 'from-cyan-600/80 to-blue-900/90',
  dinner: 'from-purple-600/80 to-indigo-900/90',
  snack: 'from-pink-600/80 to-rose-900/90',
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

function MealCard({ slot, meal, onMealClick }) {
  const Icon = mealIcons[slot] || Utensils;
  const gradient = mealGradients[slot];

  if (!meal) {
    return (
      <div className={`p-6 rounded-3xl bg-gradient-to-br ${gradient} border border-white/5 opacity-40 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[280px]`}>
        <Icon size={32} className="opacity-40 mb-3 text-white" />
        <span className="text-base sm:text-lg font-bold text-white capitalize opacity-60">{slot}</span>
        <p className="text-xs sm:text-sm text-white/50 italic mt-2">No meal scheduled</p>
      </div>
    );
  }

  const bgImage = meal.recipe_image ? `url(${meal.recipe_image})` : 'none';

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onMealClick(meal, slot)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl min-h-[300px] sm:min-h-[380px] flex flex-col border border-white/10"
    >
      {/* Edge-to-Edge Imagery */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: bgImage }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${bgImage !== 'none' ? 'from-[#0B0F19]/90 via-[#0B0F19]/60 to-[#0B0F19]/95' : gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40 opacity-90" />
      
      {/* Card Content */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col h-full justify-between">
        {/* Top Header Pills */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/15 shadow-lg">
            <Icon size={14} className="text-cyan-400 shrink-0" />
            <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider">{slot}</span>
          </div>
          {meal.recipe_ready_in && (
            <div className="bg-black/50 backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/15 shadow-lg flex items-center gap-1.5 shrink-0">
              <Clock size={12} className="text-amber-400 shrink-0" />
              <span className="text-[10px] sm:text-xs font-bold text-white">{meal.recipe_ready_in} min</span>
            </div>
          )}
        </div>

        {/* Dish Title & Frosted-Glass Macros at a Glance */}
        <div className="mt-auto pt-6 sm:pt-8 space-y-3 sm:space-y-4">
          <h4 className="text-lg sm:text-2xl font-black text-white leading-snug drop-shadow-md group-hover:text-cyan-300 transition-colors line-clamp-2">
            {meal.recipe_title || meal.food_name}
          </h4>

          {/* Frosted Glass Macros Badge Strip */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-white/10 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-black text-amber-400">{Math.round(meal.calories || 0)}</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Kcal</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs sm:text-sm font-black text-emerald-400">{Math.round(meal.protein || 0)}g</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Protein</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs sm:text-sm font-black text-blue-400">{Math.round(meal.carbohydrates || 0)}g</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Carbs</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs sm:text-sm font-black text-rose-400">{Math.round(meal.fat || 0)}g</span>
              <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Fat</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MealPlanner() {
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

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
    } catch (err) {
      console.error('Failed to load meal plan', err);
      setAlert({ show: true, type: 'error', message: 'Could not load meal plan.' });
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
      setAlert({ show: true, type: 'success', message: 'Generated a new personalized weekly meal plan!' });
    } catch (err) {
      console.error('Regenerate failed', err);
      setAlert({ show: true, type: 'error', message: 'Failed to generate new plan.' });
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
      setAlert({ show: true, type: 'error', message: 'Failed to generate AI recipes.' });
    } finally {
      setRecipesLoading(false);
    }
  };

  const currentDayData = weeklyPlan?.days?.[selectedDayIndex];
  const currentMeals = currentDayData?.meals || {};

  return (
    <DashboardLayout title="Smart Meal Planner" subtitle="Personalized meal plans targeting your deficiency profile">
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 mb-6 sm:mb-8 w-full max-w-full overflow-x-hidden">
        {/* Diet Selector Pills */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl w-full xl:w-auto">
          {dietOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedDiet === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleDietChange(opt.value)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                  isSelected
                    ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
          <Button onClick={handleGenerateAiRecipes} loading={recipesLoading} icon={Bot} variant="secondary" size="md" className="w-full justify-center text-xs sm:text-sm py-2.5">
            ✨ Generate AI Custom Recipes
          </Button>
          <Button onClick={handleRegenerate} loading={regenerating} icon={RefreshCw} size="md" className="w-full justify-center text-xs sm:text-sm py-2.5">
            Regenerate Plan
          </Button>
        </div>
      </div>

      {/* Gemini Generative Recipes Section */}
      {aiRecipes && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-500/30 bg-purple-500/5 rounded-3xl relative">
          <button onClick={() => setAiRecipes(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4 pr-6">
            <div className="p-2 rounded-xl gradient-bg text-white shrink-0"><Bot size={20} /></div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Gemini AI Customized Deficiency-Targeting Recipes</h3>
              <p className="text-xs text-purple-300">Custom cooking instructions generated dynamically for your nutrient profile</p>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 font-sans break-words">
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
                  ? 'gradient-bg border-cyan-400/50 text-white shadow-lg shadow-cyan-500/25 scale-105'
                  : 'glass border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-[320px] animate-pulse flex flex-col justify-between">
              <div className="h-6 w-24 bg-white/10 rounded-full" />
              <div className="space-y-3">
                <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                <div className="h-12 w-full bg-white/10 rounded-2xl" />
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
            <MealCard
              key={slot}
              slot={slot}
              meal={currentMeals[slot]}
              onMealClick={(meal) => {
                setSelectedMeal(meal);
                setSelectedSlot(slot);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Full Recipe Modal */}
      <AnimatePresence>
        {selectedMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl glass-strong border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto max-h-[90vh] flex flex-col overflow-hidden"
            >
              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-20 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto pr-1 space-y-6 custom-scrollbar">
                {/* Modal Hero Banner */}
                <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 bg-slate-800">
                  {selectedMeal.recipe_image ? (
                    <img src={selectedMeal.recipe_image} alt={selectedMeal.recipe_title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-bg flex items-center justify-center">
                      <Utensils size={48} className="text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30">
                      {selectedSlot}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight drop-shadow-md">
                      {selectedMeal.recipe_title || selectedMeal.food_name}
                    </h3>
                  </div>
                </div>

                {/* Macro Nutrients Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-center">
                    <span className="text-xs text-gray-400 block">Calories</span>
                    <span className="text-xl font-black text-amber-400">{Math.round(selectedMeal.calories || 0)} kcal</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400 block">Protein</span>
                    <span className="text-xl font-black text-emerald-400">{Math.round(selectedMeal.protein || 0)}g</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400 block">Carbs</span>
                    <span className="text-xl font-black text-blue-400">{Math.round(selectedMeal.carbohydrates || 0)}g</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400 block">Fat</span>
                    <span className="text-xl font-black text-rose-400">{Math.round(selectedMeal.fat || 0)}g</span>
                  </div>
                </div>

                {/* Ingredients */}
                {selectedMeal.recipe_ingredients && selectedMeal.recipe_ingredients.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Ingredients</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-300">
                      {selectedMeal.recipe_ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                          <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Instructions */}
                {selectedMeal.recipe_instructions && selectedMeal.recipe_instructions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Cooking Instructions</h4>
                    <ol className="space-y-3 text-sm text-gray-300">
                      {selectedMeal.recipe_instructions.map((step, i) => (
                        <li key={i} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                          <span className="w-6 h-6 rounded-lg gradient-bg text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
