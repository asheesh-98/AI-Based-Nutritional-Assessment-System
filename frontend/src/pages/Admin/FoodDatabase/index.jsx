import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import adminService from '../../../services/adminService';
import { PageLoader } from '../../../components/common/Loader';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Alert from '../../../components/common/Alert';

export default function AdminFoodDatabase() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFoods(0, 100);
      setFoods(data);
    } catch (err) {
      setError('Failed to fetch food database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await adminService.deleteFood(id);
      setSuccess('Food item deleted.');
      setFoods(foods.filter(f => f.id !== id));
    } catch (err) {
      setError('Failed to delete food.');
    }
  };

  const filteredFoods = foods.filter(f => 
    f.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Food Database</h1>
          <p className="text-slate-400">Manage nutritional datasets and food items.</p>
        </div>
        <Button icon={Plus} size="lg">Add Food Item</Button>
      </div>

      <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />
      <Alert type="success" message={success} show={!!success} onClose={() => setSuccess('')} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl space-y-6"
      >
        <div className="max-w-md">
          <Input 
            icon={Search} 
            placeholder="Search by name or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3 px-4 font-medium">Food Name</th>
                <th className="pb-3 px-4 font-medium">Category</th>
                <th className="pb-3 px-4 font-medium">Diet Type</th>
                <th className="pb-3 px-4 font-medium text-right">Calories</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFoods.slice(0, 50).map((food) => (
                <tr key={food.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 text-white font-medium">{food.food_name}</td>
                  <td className="py-4 px-4 text-slate-400 text-sm">{food.category || 'N/A'}</td>
                  <td className="py-4 px-4 text-slate-400 text-sm">{food.diet_type || 'N/A'}</td>
                  <td className="py-4 px-4 text-slate-300 text-right">{food.energy_kcal?.toFixed(1)} kcal</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="!px-3"
                      onClick={() => alert('Edit feature coming soon!')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(food.id)}
                      className="!px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredFoods.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No foods found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="text-center text-xs text-slate-500 mt-4">Showing top 50 results.</p>
        </div>
      </motion.div>
    </div>
  );
}
