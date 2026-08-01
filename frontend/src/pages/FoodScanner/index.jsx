import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Barcode, Camera, Sparkles, Plus, CheckCircle, Info,
  Image as ImageIcon, Flame, Utensils, Droplets, Zap, Upload, Check, ChevronRight, Activity, ShieldCheck
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import api from '../../services/api';
import foodService from '../../services/foodService';

const sampleBarcodes = [
  { code: '5449000000996', label: 'Coca-Cola 330ml' },
  { code: '3017620422003', label: 'Nutella Hazelnut Spread' },
  { code: '7350041860011', label: 'Oat Milk Original' }
];

export default function FoodScanner() {
  const [activeTab, setActiveTab] = useState('photo'); // 'photo' or 'barcode'
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0 = idle, 1 = analyzing, 2 = complete
  const [product, setProduct] = useState(null);
  const [aiMeal, setAiMeal] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Barcode search
  const handleBarcodeSearch = async (e, codeOverride) => {
    if (e) e.preventDefault();
    const queryCode = codeOverride || barcode.trim();
    if (!queryCode) return;
    setLoading(true);
    setError('');
    setProduct(null);

    try {
      const { data } = await api.get(`/external/scan/${queryCode}`);
      setProduct(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Product not found. Please try another barcode.');
    } finally {
      setLoading(false);
    }
  };

  // Gemini Photo Scanner
  const handlePhotoScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setLoading(true);
    setScanStep(1);
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
      setScanStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Could not analyze meal image with Gemini Vision. Please try a clearer photo.');
      setScanStep(0);
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
      setSuccessMsg(`Successfully logged "${aiMeal.food_name}" to your Food Diary!`);
    } catch (err) {
      setError('Failed to log meal to diary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="AI Food & Meal Scanner" subtitle="Multi-modal Gemini 2.0 Vision recognition & EAN barcode lookup">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 🌟 Tab Switcher */}
        <div className="flex gap-2 p-1.5 glass-card border border-white/10 rounded-2xl max-w-lg mx-auto shadow-xl">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'photo'
                ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Gemini Vision AI</span>
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'barcode'
                ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Barcode className="w-4 h-4 text-cyan-300" />
            <span>Barcode Scanner</span>
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* 📸 Tab 1: Gemini Visual Photo Scanner */}
        {activeTab === 'photo' && (
          <div className="space-y-6">
            
            {/* Upload Zone */}
            <div className="glass-card p-8 sm:p-12 rounded-3xl text-center border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 transition-all relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl gradient-bg flex items-center justify-center text-white mb-6 shadow-xl shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Snap or Upload Food Photo</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Our Gemini 2.0 Multi-Modal Vision model detects food items, estimates portion weights, and computes macro ratios automatically.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoScan}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />

                <Button loading={loading} size="lg" icon={Sparkles} className="pointer-events-none shadow-lg shadow-cyan-500/20">
                  {loading ? 'Analyzing with Gemini Vision...' : 'Select Meal Photo to Scan'}
                </Button>
              </div>
            </div>

            {/* Loading Neural Beam Scan Sequence */}
            {loading && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 rounded-3xl text-center space-y-4 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Scanning Image Geometry with Gemini 2.0</h4>
                <div className="w-full max-w-md mx-auto h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full gradient-bg rounded-full"
                    initial={{ width: '10%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                  />
                </div>
              </motion.div>
            )}

            {/* AI Meal Result Card */}
            {aiMeal && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
                  
                  {/* Left: Image preview & titles */}
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Meal preview" className="w-20 h-20 rounded-2xl object-cover border border-cyan-500/30 shadow-md" />
                    )}
                    <div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
                        {aiMeal.category || 'Recognized Meal'}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-1.5">{aiMeal.food_name}</h3>
                      {aiMeal.confidence_notes && (
                        <p className="text-xs text-slate-400 mt-1">{aiMeal.confidence_notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Log Action Button */}
                  <Button onClick={handleLogAiMeal} loading={loading} icon={Plus} size="lg" className="w-full lg:w-auto shadow-lg shadow-cyan-500/20">
                    Log to Food Diary
                  </Button>
                </div>

                {/* Macro Grid Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass-card p-5 rounded-2xl text-center bg-amber-500/10 border border-amber-500/20 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Energy</span>
                    </div>
                    <div className="text-3xl font-black text-white">{Math.round(aiMeal.calories || 0)}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">kcal</div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl text-center bg-cyan-500/10 border border-cyan-500/20 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Protein</span>
                    </div>
                    <div className="text-3xl font-black text-white">{Math.round(aiMeal.protein_g || 0)}g</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">muscle synthesis</div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl text-center bg-purple-500/10 border border-purple-500/20 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Carbs</span>
                    </div>
                    <div className="text-3xl font-black text-white">{Math.round(aiMeal.carbs_g || 0)}g</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">glycogen fuel</div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl text-center bg-rose-500/10 border border-rose-500/20 shadow-lg">
                    <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
                      <Droplets className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Fats</span>
                    </div>
                    <div className="text-3xl font-black text-white">{Math.round(aiMeal.fat_g || 0)}g</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">essential lipids</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 🏷️ Tab 2: Barcode Scanner */}
        {activeTab === 'barcode' && (
          <div className="space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
              <form onSubmit={(e) => handleBarcodeSearch(e)} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <Input
                    label="Product Barcode (EAN / UPC)"
                    placeholder="e.g. 5449000000996"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    icon={Barcode}
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full sm:w-auto px-8 h-[46px] rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-cyan-500/20">
                  <Search className="w-4 h-4" />
                  <span>Search EAN</span>
                </Button>
              </form>

              {/* Sample Barcode Chips */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2.5">Try Quick Sample Barcodes:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleBarcodes.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => { setBarcode(item.code); handleBarcodeSearch(null, item.code); }}
                      className="text-xs glass hover:bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-xl text-cyan-300 font-medium transition-all cursor-pointer"
                    >
                      {item.label} ({item.code})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Result Card */}
            {product && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="flex flex-col md:flex-row border-b border-white/10">
                  {product.image_url && (
                    <div className="md:w-1/3 bg-white/5 flex items-center justify-center p-6 border-r border-white/10">
                      <img src={product.image_url} alt={product.product_name} className="max-h-64 object-contain rounded-2xl shadow-lg" />
                    </div>
                  )}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-white">{product.product_name}</h2>
                      <p className="text-cyan-400 text-sm font-bold mt-1">{product.brands || 'Verified Product'}</p>
                      {product.ingredients_text && (
                        <div className="mt-4 p-4 glass rounded-2xl border border-white/5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ingredients:</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{product.ingredients_text}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Macro breakdown bar */}
                <div className="p-6 grid grid-cols-4 gap-4 bg-black/20 text-center">
                  <div>
                    <span className="text-xl font-black text-amber-400">{Math.round(product.nutriments?.energy_kcal || 0)}</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">Kcal</p>
                  </div>
                  <div>
                    <span className="text-xl font-black text-cyan-400">{Math.round(product.nutriments?.proteins_100g || 0)}g</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">Protein</p>
                  </div>
                  <div>
                    <span className="text-xl font-black text-purple-400">{Math.round(product.nutriments?.carbohydrates_100g || 0)}g</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">Carbs</p>
                  </div>
                  <div>
                    <span className="text-xl font-black text-rose-400">{Math.round(product.nutriments?.fat_100g || 0)}g</span>
                    <p className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">Fat</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
