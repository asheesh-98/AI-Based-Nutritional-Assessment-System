import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Heart, Dumbbell, Shield, Leaf } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/common/Input';
import { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Loader';
import profileService from '../../services/profileService';

const healthGoals = [
  'Weight Loss', 'Weight Gain', 'Muscle Building', 'Improve Energy',
  'Better Sleep', 'Immunity Boost', 'Heart Health', 'Diabetes Management'
];
const medicalConditions = [
  'Diabetes', 'Hypertension', 'Thyroid', 'PCOS', 'Anemia',
  'Heart Disease', 'Kidney Disease', 'None'
];
const allergies = ['Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Seafood', 'None'];

const defaultForm = {
  age: '', gender: '', height_cm: '', weight_kg: '',
  activity_level: '', dietary_preference: '', sleep_hours: '',
  smoking: 'No', alcohol: 'No',
  health_goals: [], medical_conditions: [], allergies: [],
};

function TogglePill({ label, selected, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
        selected
          ? 'gradient-bg text-white shadow-lg shadow-cyan-500/20'
          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </motion.button>
  );
}

export default function HealthProfile() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await profileService.getHealthProfile();
        if (data) {
          setForm({
            age: data.age ?? '',
            gender: data.gender ?? '',
            height_cm: data.height_cm ?? '',
            weight_kg: data.weight_kg ?? '',
            activity_level: data.activity_level ?? '',
            dietary_preference: data.dietary_preference ?? '',
            sleep_hours: data.sleep_hours ?? '',
            smoking: data.smoking ? 'Yes' : 'No',
            alcohol: data.alcohol ? 'Yes' : 'No',
            health_goals: data.health_goal ? data.health_goal.split(', ').filter(Boolean) : [],
            medical_conditions: data.medical_conditions ? data.medical_conditions.split(', ').filter(Boolean) : [],
            allergies: data.allergies ? data.allergies.split(', ').filter(Boolean) : [],
          });
        }
      } catch (err) {
        // No existing profile — that's fine
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleItem = (field, item) => {
    const current = form[field];
    // Handle "None" as exclusive
    if (item === 'None') {
      setForm({ ...form, [field]: current.includes('None') ? [] : ['None'] });
      return;
    }
    const withoutNone = current.filter(i => i !== 'None');
    setForm({
      ...form,
      [field]: withoutNone.includes(item)
        ? withoutNone.filter(i => i !== item)
        : [...withoutNone, item],
    });
  };

  const bmi = useMemo(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h && w && h > 0) {
      return (w / ((h / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [form.height_cm, form.weight_kg]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const v = parseFloat(bmi);
    if (v < 18.5) return { label: 'Underweight', color: 'text-amber-400 bg-amber-500/15' };
    if (v < 25) return { label: 'Normal', color: 'text-emerald-400 bg-emerald-500/15' };
    if (v < 30) return { label: 'Overweight', color: 'text-amber-400 bg-amber-500/15' };
    return { label: 'Obese', color: 'text-rose-400 bg-rose-500/15' };
  }, [bmi]);

  const handleSave = async () => {
    setSaving(true);
    setAlert({ show: false, type: 'success', message: '' });
    try {
      const payload = {
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        activity_level: form.activity_level || null,
        dietary_preference: form.dietary_preference || null,
        sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : null,
        smoking: form.smoking === 'Yes' || form.smoking === 'Regularly' || form.smoking === 'Occasionally',
        alcohol: form.alcohol === 'Yes' || form.alcohol === 'Regularly' || form.alcohol === 'Occasionally',
        health_goal: form.health_goals.join(', ') || null,
        medical_conditions: form.medical_conditions.join(', ') || null,
        allergies: form.allergies.join(', ') || null,
      };
      await profileService.updateHealthProfile(payload);
      setAlert({ show: true, type: 'success', message: 'Health profile saved successfully!' });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout title="Health Profile"><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout title="Health Profile" subtitle="Tell us about yourself for personalized recommendations">
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      <div className="space-y-6 mt-4 max-w-4xl">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/10"><User className="w-5 h-5 text-cyan-400" /></div>
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Age" name="age" type="number" placeholder="25" min="1" max="120" value={form.age} onChange={handleChange} />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Height (cm)" name="height_cm" type="number" placeholder="170" min="50" max="300" value={form.height_cm} onChange={handleChange} />
            <Input label="Weight (kg)" name="weight_kg" type="number" placeholder="70" min="10" max="500" value={form.weight_kg} onChange={handleChange} />
          </div>
          {bmi && bmiCategory && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-400">BMI:</span>
              <span className="text-lg font-bold text-white">{bmi}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${bmiCategory.color}`}>{bmiCategory.label}</span>
            </div>
          )}
        </motion.div>

        {/* Lifestyle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10"><Dumbbell className="w-5 h-5 text-purple-400" /></div>
            <h3 className="text-lg font-semibold text-white">Lifestyle</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Activity Level" name="activity_level" value={form.activity_level} onChange={handleChange}>
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extremely_active">Extremely Active</option>
            </Select>
            <Select label="Dietary Preference" name="dietary_preference" value={form.dietary_preference} onChange={handleChange}>
              <option value="">Select preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="keto">Keto</option>
            </Select>
            <Input label="Sleep Hours" name="sleep_hours" type="number" placeholder="7" min="1" max="24" step="0.5" value={form.sleep_hours} onChange={handleChange} />
            <Select label="Smoking" name="smoking" value={form.smoking} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Regularly">Regularly</option>
            </Select>
            <Select label="Alcohol" name="alcohol" value={form.alcohol} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Regularly">Regularly</option>
            </Select>
          </div>
        </motion.div>

        {/* Health Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Heart className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="text-lg font-semibold text-white">Health Goals</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {healthGoals.map((goal) => (
              <TogglePill key={goal} label={goal} selected={form.health_goals.includes(goal)} onClick={() => toggleItem('health_goals', goal)} />
            ))}
          </div>
        </motion.div>

        {/* Medical Conditions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-rose-500/10"><Shield className="w-5 h-5 text-rose-400" /></div>
            <h3 className="text-lg font-semibold text-white">Medical Conditions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {medicalConditions.map((cond) => (
              <TogglePill key={cond} label={cond} selected={form.medical_conditions.includes(cond)} onClick={() => toggleItem('medical_conditions', cond)} />
            ))}
          </div>
        </motion.div>

        {/* Allergies */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10"><Leaf className="w-5 h-5 text-amber-400" /></div>
            <h3 className="text-lg font-semibold text-white">Allergies</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <TogglePill key={allergy} label={allergy} selected={form.allergies.includes(allergy)} onClick={() => toggleItem('allergies', allergy)} />
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button onClick={handleSave} loading={saving} icon={Save} size="lg" className="w-full sm:w-auto">
            Save Health Profile
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
