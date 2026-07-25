import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Coffee, Sun, Moon, Cookie,
  Flame, Droplets, Trash2, Utensils
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import foodService from '../../services/foodService';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-amber-400' },
  { value: 'lunch', label: 'Lunch', icon: Sun, color: 'text-cyan-400' },
  { value: 'dinner', label: 'Dinner', icon: Moon, color: 'text-purple-400' },
  { value: 'snack', label: 'Snack', icon: Cookie, color: 'text-pink-400' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function FoodDiary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

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

  const handleLogFood = async (food) => {
    try {
      await foodService.logFood({
        food_id: food.id,
        food_name: food.food_name,
        meal_type: selectedMeal,
        quantity: 1,
        calories: food.energy_kcal || 0,
        protein: food.protein_g || 0,
        carbs: food.carbohydrate_g || 0,
        fat: food.fat_g || 0,
      });
      setAlert({ show: true, type: 'success', message: `Added ${food.food_name} to ${selectedMeal}!` });
      setSearchResults([]);
      setSearchQuery('');
      loadDiary();
    } catch (err) {
      console.error('Log food error:', err);
      setAlert({ show: true, type: 'error', message: 'Failed to log food.' });
    }
  };

  const handleDeleteFood = async (entryId, foodName) => {
    try {
      await foodService.deleteFoodEntry(entryId);
      setAlert({ show: true, type: 'success', message: `Removed ${foodName} from diary.` });
      loadDiary();
    } catch (err) {
      console.error('Delete food error:', err);
      setAlert({ show: true, type: 'error', message: 'Failed to remove food item.' });
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const groupedDiary = mealTypes.reduce((acc, mt) => {
    acc[mt.value] = diary.filter(d => d.meal_type === mt.value);
    return acc;
  }, {});

  const totalCalories = diary.reduce((sum, d) => sum + (d.calories || 0), 0);
  const totalProtein = diary.reduce((sum, d) => sum + (d.protein || 0), 0);
  const totalCarbs = diary.reduce((sum, d) => sum + (d.carbs || 0), 0);
  const totalFat = diary.reduce((sum, d) => sum + (d.fat || 0), 0);

  return (
    <DashboardLayout title="Food Diary" subtitle={today}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Calories', value: Math.round(totalCalories), unit: 'kcal', icon: Flame, color: 'text-amber-400' },
          { label: 'Protein', value: Math.round(totalProtein), unit: 'g', icon: Utensils, color: 'text-cyan-400' },
          { label: 'Carbs', value: Math.round(totalCarbs), unit: 'g', icon: Utensils, color: 'text-purple-400' },
          { label: 'Fat', value: Math.round(totalFat), unit: 'g', icon: Droplets, color: 'text-rose-400' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-white/40">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-white">
              {s.value} <span className="text-xs text-white/30 font-normal">{s.unit}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search + Add Food */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 mb-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Plus size={16} className="text-cyan-400" /> Log Food
        </h3>

        {/* Meal Type Selector */}
        <div className="flex flex-wrap gap-2 mb-3">
          {mealTypes.map(mt => {
            const Icon = mt.icon;
            const active = selectedMeal === mt.value;
            return (
              <button
                key={mt.value}
                onClick={() => setSelectedMeal(mt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Icon size={12} /> {mt.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search foods (e.g., quinoa, chicken breast)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              icon={Search}
            />
          </div>
          <Button onClick={handleSearch} loading={searching} size="sm">
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
            {searchResults.map((food, i) => (
              <motion.div
                key={food.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                onClick={() => handleLogFood(food)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{food.food_name}</p>
                  <p className="text-xs text-white/30">{food.category} • {Math.round(food.energy_kcal || 0)} kcal</p>
                </div>
                <Plus size={16} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Meals */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {mealTypes.map(mt => {
          const Icon = mt.icon;
          const entries = groupedDiary[mt.value] || [];
          return (
            <motion.div key={mt.value} variants={item} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className={mt.color} />
                <h3 className="text-white font-semibold text-sm">{mt.label}</h3>
                <span className="text-xs text-white/30">({entries.length} items)</span>
              </div>
              {entries.length === 0 ? (
                <p className="text-xs text-white/20 italic">No foods logged yet</p>
              ) : (
                <div className="space-y-1.5">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDeleteFood(entry.id, entry.food_name)}
                          className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-sm text-white/80 font-medium">{entry.food_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-amber-400 font-semibold">{Math.round(entry.calories || 0)} kcal</span>
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
