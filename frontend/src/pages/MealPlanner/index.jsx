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
      <div className={`p-6 rounded-3xl bg-gradient-to-br ${gradient} border border-white/5 opacity-40 flex flex-col items-center justify-center min-h-[280px]`}>
        <Icon size={36} className="opacity-40 mb-3 text-white" />
        <span className="text-lg font-bold text-white capitalize opacity-60">{slot}</span>
        <p className="text-sm text-white/50 italic mt-2">No meal scheduled</p>
      </div>
    );
  }

  const bgImage = meal.recipe_image ? `url(${meal.recipe_image})` : 'none';

  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -6, scale: 1.015 }}
      onClick={() => onMealClick(meal, slot)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-2xl min-h-[320px] sm:min-h-[380px] flex flex-col border border-white/10"
    >
      {/* Edge-to-Edge Imagery */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: bgImage }}
      />
      <div className={`absolute inset-0 bg-gradient-to-br ${bgImage !== 'none' ? 'from-[#0B0F19]/90 via-[#0B0F19]/60 to-[#0B0F19]/95' : gradient}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40 opacity-90" />
      
      {/* Card Content */}
      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        {/* Top Header Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg">
            <Icon size={14} className="text-cyan-400" />
            <span className="text-xs font-black text-white uppercase tracking-wider">{slot}</span>
          </div>
          {meal.recipe_ready_in && (
            <div className="bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-lg flex items-center gap-1.5">
              <Clock size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-white">{meal.recipe_ready_in} min</span>
            </div>
          )}
        </div>

        {/* Dish Title & Frosted-Glass Macros at a Glance */}
        <div className="mt-auto pt-8 space-y-4">
          <h4 className="text-xl sm:text-2xl font-black text-white leading-snug drop-shadow-md group-hover:text-cyan-300 transition-colors">
            {meal.recipe_title || meal.food_name}
          </h4>

          {/* Frosted Glass Macros Badge Strip */}
          <div className="grid grid-cols-4 gap-2 bg-black/60 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 text-center">
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-amber-400">{Math.round(meal.calories || 0)}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Kcal</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs font-black text-emerald-400">{Math.round(meal.protein || 0)}g</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Protein</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs font-black text-blue-400">{Math.round(meal.carbohydrates || 0)}g</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Carbs</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10">
              <span className="text-xs font-black text-rose-400">{Math.round(meal.fat || 0)}g</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Fat</span>
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl">
          {dietOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedDiet === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleDietChange(opt.value)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} className={isSelected ? 'text-white' : opt.color} />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleGenerateAiRecipes} loading={recipesLoading} icon={Bot} variant="secondary" size="md">
            ✨ Generate AI Custom Recipes (Gemini)
          </Button>
          <Button onClick={handleRegenerate} loading={regenerating} icon={RefreshCw} size="md">
            Regenerate Plan
          </Button>
        </div>
      </div>

      {/* Gemini Generative Recipes Section */}
      {aiRecipes && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8 border border-purple-500/30 bg-purple-500/5 rounded-3xl relative">
          <button onClick={() => setAiRecipes(null)} className="absolute right-4 top-4 text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl gradient-bg text-white"><Bot size={20} /></div>
            <div>
              <h3 className="text-lg font-bold text-white">Gemini AI Customized Deficiency-Targeting Recipes</h3>
              <p className="text-xs text-purple-300">Custom cooking instructions generated dynamically for your nutrient profile</p>
            </div>
          </div>
          <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-white/5 p-6 rounded-2xl border border-white/10 font-sans">
            {aiRecipes}
          </div>
        </motion.div>
      )}

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {fullDayNames.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[100px] py-4 px-3 rounded-2xl text-center transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/20 border-cyan-500/50 text-white shadow-xl shadow-cyan-500/10'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-widest font-black opacity-60 mb-1">
                {dayNames[idx]}
              </span>
              <span className="text-sm font-bold block">{day}</span>
            </button>
          );
        })}
      </div>

      {/* Meal Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Sparkles size={40} className="text-cyan-400 animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium">Crafting your nutritional meal plan...</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((slot) => (
            <MealCard
              key={slot}
              slot={slot}
              meal={currentMeals[slot]}
              onMealClick={(m, s) => {
                setSelectedMeal(m);
                setSelectedSlot(s);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Immersive 2-Column Split Screen Modal */}
      <AnimatePresence>
        {selectedMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D121F] border border-white/15 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl my-6 relative grid grid-cols-1 md:grid-cols-2 min-h-[500px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute right-4 top-4 z-30 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Left Column: Image Banner, Title, Macros */}
              <div 
                className="relative bg-cover bg-center min-h-[300px] md:min-h-full p-8 flex flex-col justify-between"
                style={{ backgroundImage: selectedMeal.recipe_image ? `url(${selectedMeal.recipe_image})` : 'none' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D121F] via-[#0D121F]/60 to-black/40" />
                
                {/* Top Slot Pill */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                    {selectedSlot || 'Meal'}
                  </span>
                  {selectedMeal.recipe_ready_in && (
                    <span className="text-xs font-bold text-amber-400 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1">
                      <Clock size={12} /> {selectedMeal.recipe_ready_in} mins prep
                    </span>
                  )}
                </div>

                {/* Left Bottom: Dish Title & Macro Grid */}
                <div className="relative z-10 mt-auto pt-12 space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">
                    {selectedMeal.recipe_title || selectedMeal.food_name}
                  </h3>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-lg font-black text-amber-400">{Math.round(selectedMeal.calories || 0)}</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Kcal</p>
                    </div>
                    <div className="border-l border-white/10">
                      <span className="text-lg font-black text-emerald-400">{Math.round(selectedMeal.protein || 0)}g</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Protein</p>
                    </div>
                    <div className="border-l border-white/10">
                      <span className="text-lg font-black text-blue-400">{Math.round(selectedMeal.carbohydrates || 0)}g</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Carbs</p>
                    </div>
                    <div className="border-l border-white/10">
                      <span className="text-lg font-black text-rose-400">{Math.round(selectedMeal.fat || 0)}g</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Fat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scrollable Instructions & Targeted Micronutrients */}
              <div className="p-6 md:p-8 flex flex-col h-full max-h-[550px] overflow-y-auto space-y-6">
                
                {/* Cooking Instructions */}
                <div>
                  <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Utensils size={18} className="text-cyan-400" /> Recipe Instructions
                  </h4>

                  {selectedMeal.recipe_instructions && selectedMeal.recipe_instructions.length > 0 ? (
                    <div className="space-y-3">
                      {selectedMeal.recipe_instructions.map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start bg-white/5 p-3.5 rounded-2xl border border-white/5 text-xs text-gray-300 leading-relaxed">
                          <span className="w-6 h-6 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0 border border-cyan-500/30">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </div>
                      ))}
                    </div>
                  ) : selectedMeal.recipe_url ? (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4">
                      <p className="text-xs text-gray-400">
                        This recipe is hosted externally on Spoonacular partner networks.
                      </p>
                      <a
                        href={selectedMeal.recipe_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 transition-colors shadow-lg"
                      >
                        Read Full Original Recipe <ExternalLink size={14} />
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400 italic">
                      Fresh whole food ingredient. Enjoy in natural form or prepare as desired.
                    </div>
                  )}
                </div>

                {/* External Recipe Button if instructions exist alongside link */}
                {selectedMeal.recipe_instructions && selectedMeal.recipe_instructions.length > 0 && selectedMeal.recipe_url && (
                  <div>
                    <a
                      href={selectedMeal.recipe_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition-colors"
                    >
                      Read Full Original Recipe <ExternalLink size={14} />
                    </a>
                  </div>
                )}

                {/* Targeted Key Micronutrients */}
                {selectedMeal.key_nutrients && Object.keys(selectedMeal.key_nutrients).length > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-auto">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Targeted Deficiency Nutrients</span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedMeal.key_nutrients).map(([k, v]) => (
                        <span key={k} className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-300 flex items-center gap-1.5 font-medium">
                          <CheckCircle2 size={13} className="text-emerald-400" />
                          {k.replace('_mg', '').replace('_mcg', '').replace('Vitamin', 'Vit')}: <strong className="text-white font-bold">{v}</strong>
                        </span>
                      ))}
                    </div>
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
