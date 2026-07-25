import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Barcode, Camera, Sparkles, Plus, CheckCircle, Info, Image as ImageIcon, Flame, Utensils, Droplets } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';
import foodService from '../../services/foodService';

export default function FoodScanner() {
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' or 'barcode'
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [aiMeal, setAiMeal] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Barcode search
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const { data } = await api.get(`/external/scan/${barcode.trim()}`);
      setProduct(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Product not found. Please try another barcode.');
    } finally {
      setLoading(false);
    }
  };

  // Gemini Photo Scanner
  const handlePhotoScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setAiMeal(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/ai/analyze-food-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiMeal(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not analyze meal image with Gemini Vision. Please try a clearer photo.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Log AI meal to Food Diary
  const handleLogAiMeal = async () => {
    if (!aiMeal) return;
    try {
      setLoading(true);
      await foodService.logFood({
        food_name: aiMeal.food_name || 'Scanned Meal',
        meal_type: aiMeal.suggested_meal_type || 'lunch',
        quantity: 1,
        calories: aiMeal.calories || 0,
        protein: aiMeal.protein_g || 0,
        carbs: aiMeal.carbs_g || 0,
        fat: aiMeal.fat_g || 0,
      });
      setSuccessMsg(`Successfully logged ${aiMeal.food_name} to your Food Diary!`);
    } catch (err) {
      setError('Failed to log meal to diary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Food & Meal Scanner" subtitle="AI Visual Meal Photo Recognition & Barcode Scanner">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'photo'
                ? 'gradient-bg text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={16} /> Gemini Photo Scanner
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'barcode'
                ? 'gradient-bg text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Barcode size={16} /> Barcode Scanner
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Tab 1: Gemini Visual Photo Scanner */}
        {activeTab === 'photo' && (
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl text-center border-dashed border-2 border-cyan-500/30 hover:border-cyan-400 transition-colors relative">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                <Camera size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Snap or Upload a Photo of Your Food</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Gemini Vision AI will automatically detect the food items, estimate portion sizes, and calculate calories & macros.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoScan}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <Button loading={loading} size="lg" icon={Sparkles} className="pointer-events-none">
                {loading ? 'Analyzing with Gemini Vision...' : 'Select Meal Photo to Scan'}
              </Button>
            </div>

            {/* AI Meal Result */}
            {aiMeal && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 uppercase tracking-wider">
                      {aiMeal.category || 'Meal'}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">{aiMeal.food_name}</h3>
                    {aiMeal.confidence_notes && (
                      <p className="text-xs text-gray-400 mt-1">{aiMeal.confidence_notes}</p>
                    )}
                  </div>
                  <Button onClick={handleLogAiMeal} loading={loading} icon={Plus} size="md">
                    Log to Food Diary
                  </Button>
                </div>

                {/* Macro Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-2xl text-center bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-bold text-amber-400">{Math.round(aiMeal.calories || 0)}</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Calories (kcal)</div>
                  </div>
                  <div className="glass-card p-4 rounded-2xl text-center bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-2xl font-bold text-cyan-400">{Math.round(aiMeal.protein_g || 0)}g</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Protein</div>
                  </div>
                  <div className="glass-card p-4 rounded-2xl text-center bg-purple-500/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-400">{Math.round(aiMeal.carbs_g || 0)}g</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Carbs</div>
                  </div>
                  <div className="glass-card p-4 rounded-2xl text-center bg-rose-500/10 border border-rose-500/20">
                    <div className="text-2xl font-bold text-rose-400">{Math.round(aiMeal.fat_g || 0)}g</div>
                    <div className="text-xs text-gray-400 uppercase mt-1">Fat</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab 2: Barcode Scanner */}
        {activeTab === 'barcode' && (
          <div className="space-y-6">
            <div id="reader" className="hidden"></div>
            <div className="glass-card p-6 rounded-3xl">
              <form onSubmit={handleBarcodeSearch} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Product Barcode (EAN/UPC)"
                    placeholder="e.g. 5449000000996"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    icon={Barcode}
                  />
                </div>
                <Button type="submit" loading={loading} className="px-8 h-[42px] rounded-xl flex items-center gap-2">
                  <Search size={18} />
                  Search
                </Button>
              </form>
            </div>

            {/* Product Details */}
            {product && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl overflow-hidden">
                <div className="flex flex-col md:flex-row border-b border-white/10">
                  {product.image_url && (
                    <div className="md:w-1/3 bg-white/5 flex items-center justify-center p-6 border-r border-white/10">
                      <img src={product.image_url} alt={product.product_name} className="max-h-64 object-contain rounded-xl" />
                    </div>
                  )}
                  <div className="p-6 md:w-2/3">
                    <h2 className="text-2xl font-bold text-white">{product.product_name}</h2>
                    <p className="text-cyan-400 text-sm font-semibold">{product.brands || 'Unknown Brand'}</p>
                    {product.ingredients_text && (
                      <p className="text-xs text-gray-300 mt-3 p-3 bg-white/5 rounded-xl">{product.ingredients_text}</p>
                    )}
                  </div>
                </div>
                <div className="p-6 grid grid-cols-4 gap-3 bg-black/20">
                  <div className="text-center"><span className="text-lg font-bold text-amber-400">{Math.round(product.nutriments?.energy_kcal || 0)}</span><p className="text-[10px] text-gray-400 uppercase">Kcal</p></div>
                  <div className="text-center"><span className="text-lg font-bold text-emerald-400">{Math.round(product.nutriments?.proteins_100g || 0)}g</span><p className="text-[10px] text-gray-400 uppercase">Protein</p></div>
                  <div className="text-center"><span className="text-lg font-bold text-blue-400">{Math.round(product.nutriments?.carbohydrates_100g || 0)}g</span><p className="text-[10px] text-gray-400 uppercase">Carbs</p></div>
                  <div className="text-center"><span className="text-lg font-bold text-rose-400">{Math.round(product.nutriments?.fat_100g || 0)}g</span><p className="text-[10px] text-gray-400 uppercase">Fat</p></div>
                </div>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
