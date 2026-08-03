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
import { useLanguage } from '../../context/LanguageContext';



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
  const { t } = useLanguage();

  const healthGoals = [
    t('hp_goal_weight_loss'), t('hp_goal_weight_gain'), t('hp_goal_muscle'), t('hp_goal_energy'),
    t('hp_goal_sleep'), t('hp_goal_immunity'), t('hp_goal_heart'), t('hp_goal_diabetes')
  ];
  const medicalConditions = [
    t('hp_condition_diabetes'), t('hp_condition_hypertension'), t('hp_condition_thyroid'), t('hp_condition_pcos'), t('hp_condition_anemia'),
    t('hp_condition_heart'), t('hp_condition_kidney'), t('hp_condition_none')
  ];
  const allergies = [t('hp_allergy_dairy'), t('hp_allergy_gluten'), t('hp_allergy_nuts'), t('hp_allergy_soy'), t('hp_allergy_eggs'), t('hp_allergy_seafood'), t('hp_allergy_none')];

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
    if (v < 18.5) return { label: t('hp_bmi_underweight'), color: 'text-amber-400 bg-amber-500/15' };
    if (v < 25) return { label: t('hp_bmi_normal'), color: 'text-emerald-400 bg-emerald-500/15' };
    if (v < 30) return { label: t('hp_bmi_overweight'), color: 'text-amber-400 bg-amber-500/15' };
    return { label: t('hp_bmi_obese'), color: 'text-rose-400 bg-rose-500/15' };
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
      setAlert({ show: true, type: 'success', message: t('hp_save_success') });
    } catch (err) {
      setAlert({ show: true, type: 'error', message: err.response?.data?.detail || t('hp_save_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout title={t('hp_page_title')}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout title={t('hp_page_title')} subtitle={t('hp_page_subtitle')}>
      <Alert type={alert.type} message={alert.message} show={alert.show} onClose={() => setAlert({ ...alert, show: false })} />

      <div className="space-y-6 mt-4 max-w-4xl">
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/10"><User className="w-5 h-5 text-cyan-400" /></div>
            <h3 className="text-lg font-semibold text-white">{t('hp_personal_info')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={t('hp_age_label')} name="age" type="number" placeholder="25" min="1" max="120" value={form.age} onChange={handleChange} />
            <Select label={t('hp_gender_label')} name="gender" value={form.gender} onChange={handleChange}>
              <option value="">{t('hp_select_gender')}</option>
              <option value="male">{t('hp_gender_male')}</option>
              <option value="female">{t('hp_gender_female')}</option>
              <option value="other">{t('hp_gender_other')}</option>
            </Select>
            <Input label={t('hp_height_label')} name="height_cm" type="number" placeholder="170" min="50" max="300" value={form.height_cm} onChange={handleChange} />
            <Input label={t('hp_weight_label')} name="weight_kg" type="number" placeholder="70" min="10" max="500" value={form.weight_kg} onChange={handleChange} />
          </div>
          {bmi && bmiCategory && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-400">{t('hp_bmi_prefix')}</span>
              <span className="text-lg font-bold text-white">{bmi}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${bmiCategory.color}`}>{bmiCategory.label}</span>
            </div>
          )}
        </motion.div>

        {/* Lifestyle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10"><Dumbbell className="w-5 h-5 text-purple-400" /></div>
            <h3 className="text-lg font-semibold text-white">{t('hp_lifestyle')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label={t('hp_activity_label')} name="activity_level" value={form.activity_level} onChange={handleChange}>
              <option value="">{t('hp_select_activity')}</option>
              <option value="sedentary">{t('hp_activity_sedentary')}</option>
              <option value="lightly_active">{t('hp_activity_lightly')}</option>
              <option value="moderately_active">{t('hp_activity_moderately')}</option>
              <option value="very_active">{t('hp_activity_very')}</option>
              <option value="extremely_active">{t('hp_activity_extremely')}</option>
            </Select>
            <Select label={t('hp_diet_label')} name="dietary_preference" value={form.dietary_preference} onChange={handleChange}>
              <option value="">{t('hp_select_diet')}</option>
              <option value="vegetarian">{t('hp_diet_vegetarian')}</option>
              <option value="non_vegetarian">{t('hp_diet_non_veg')}</option>
              <option value="vegan">{t('hp_diet_vegan')}</option>
              <option value="eggetarian">{t('hp_diet_eggetarian')}</option>
              <option value="keto">{t('hp_diet_keto')}</option>
            </Select>
            <Input label={t('hp_sleep_label')} name="sleep_hours" type="number" placeholder="7" min="1" max="24" step="0.5" value={form.sleep_hours} onChange={handleChange} />
            <Select label={t('hp_smoking_label')} name="smoking" value={form.smoking} onChange={handleChange}>
              <option value="No">{t('hp_freq_no')}</option>
              <option value="Occasionally">{t('hp_freq_occasionally')}</option>
              <option value="Regularly">{t('hp_freq_regularly')}</option>
            </Select>
            <Select label={t('hp_alcohol_label')} name="alcohol" value={form.alcohol} onChange={handleChange}>
              <option value="No">{t('hp_freq_no')}</option>
              <option value="Occasionally">{t('hp_freq_occasionally')}</option>
              <option value="Regularly">{t('hp_freq_regularly')}</option>
            </Select>
          </div>
        </motion.div>

        {/* Health Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Heart className="w-5 h-5 text-emerald-400" /></div>
            <h3 className="text-lg font-semibold text-white">{t('hp_health_goals')}</h3>
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
            <h3 className="text-lg font-semibold text-white">{t('hp_medical_conditions')}</h3>
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
            <h3 className="text-lg font-semibold text-white">{t('hp_allergies_title')}</h3>
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
            {t('hp_save_btn')}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
