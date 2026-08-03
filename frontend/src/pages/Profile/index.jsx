import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Calendar,
  Heart, Ruler, Weight, Dumbbell, Leaf,
  Edit3, Save, X
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import profileService from '../../services/profileService';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function InfoRow({ icon: Icon, label, value, color = 'text-cyan-400' }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <Icon size={16} className={color} />
      <span className="text-sm text-white/40 min-w-[120px]">{label}</span>
      <span className="text-sm text-white font-medium">{value || '—'}</span>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, healthRes] = await Promise.allSettled([
        profileService.getProfile(),
        profileService.getHealthProfile(),
      ]);
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value);
        setForm({ full_name: profileRes.value.full_name || '', phone: profileRes.value.phone || '' });
      }
      if (healthRes.status === 'fulfilled') {
        setHealthProfile(healthRes.value);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileService.updateProfile(form);
      setAlert({ show: true, type: 'success', message: t('profile_update_success') });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: t('profile_update_error') });
    } finally {
      setSaving(false);
    }
  };

  const hp = healthProfile;

  return (
    <DashboardLayout title={t('profile_page_title')} subtitle={t('profile_page_subtitle')}>
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <motion.div variants={item} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> {t('profile_account_info')}
            </h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">
                <Edit3 size={16} />
              </button>
            ) : (
              <button onClick={() => setEditing(false)} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input
                label={t('profile_name_label')}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label={t('profile_phone_label')}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Button onClick={handleSave} loading={saving} className="w-full flex items-center justify-center gap-2">
                <Save size={16} /> {t('profile_save_btn')}
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg text-white font-semibold">{profile?.full_name || t('profile_default_name')}</h4>
                  <p className="text-sm text-white/40">{profile?.email || user?.email}</p>
                </div>
              </div>
              <InfoRow icon={Mail} label={t('profile_email_label')} value={profile?.email || user?.email} />
              <InfoRow icon={Phone} label={t('profile_phone_label')} value={profile?.phone} />
              <InfoRow icon={Shield} label={t('profile_role_label')} value={profile?.role || t('profile_role_user')} color="text-emerald-400" />
              <InfoRow icon={Calendar} label={t('profile_joined_label')} value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'} />
            </div>
          )}
        </motion.div>

        {/* Health Profile Summary */}
        <motion.div variants={item} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Heart size={18} className="text-rose-400" /> {t('profile_health_summary')}
          </h3>

          {hp ? (
            <div>
              <InfoRow icon={Calendar} label={t('profile_age_label')} value={hp.age ? `${hp.age} ${t('profile_years')}` : null} />
              <InfoRow icon={User} label={t('profile_gender_label')} value={hp.gender} />
              <InfoRow icon={Ruler} label={t('profile_height_label')} value={hp.height_cm ? `${hp.height_cm} cm` : null} color="text-purple-400" />
              <InfoRow icon={Weight} label={t('profile_weight_label')} value={hp.weight_kg ? `${hp.weight_kg} kg` : null} color="text-amber-400" />
              <InfoRow icon={Dumbbell} label={t('profile_bmi_label')} value={hp.bmi ? hp.bmi.toFixed(1) : null} color="text-emerald-400" />
              <InfoRow icon={Dumbbell} label={t('profile_activity_label')} value={hp.activity_level} color="text-orange-400" />
              <InfoRow icon={Leaf} label={t('profile_diet_label')} value={hp.dietary_preference} color="text-green-400" />
              <InfoRow icon={Heart} label={t('profile_health_goal_label')} value={hp.health_goal} color="text-rose-400" />
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">{t('profile_no_health_profile')}</p>
              <p className="text-xs text-white/20 mt-1">{t('profile_complete_hint')}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
