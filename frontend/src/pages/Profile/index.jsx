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
      setAlert({ show: true, type: 'success', message: 'Profile updated!' });
      setEditing(false);
      loadProfile();
    } catch (err) {
      setAlert({ show: true, type: 'error', message: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const hp = healthProfile;

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account and health information">
      {alert.show && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <motion.div variants={item} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> Account Information
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
                label="Full Name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Button onClick={handleSave} loading={saving} className="w-full flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-lg text-white font-semibold">{profile?.full_name || 'User'}</h4>
                  <p className="text-sm text-white/40">{profile?.email || user?.email}</p>
                </div>
              </div>
              <InfoRow icon={Mail} label="Email" value={profile?.email || user?.email} />
              <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
              <InfoRow icon={Shield} label="Role" value={profile?.role || 'User'} color="text-emerald-400" />
              <InfoRow icon={Calendar} label="Joined" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'} />
            </div>
          )}
        </motion.div>

        {/* Health Profile Summary */}
        <motion.div variants={item} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Heart size={18} className="text-rose-400" /> Health Profile
          </h3>

          {hp ? (
            <div>
              <InfoRow icon={Calendar} label="Age" value={hp.age ? `${hp.age} years` : null} />
              <InfoRow icon={User} label="Gender" value={hp.gender} />
              <InfoRow icon={Ruler} label="Height" value={hp.height_cm ? `${hp.height_cm} cm` : null} color="text-purple-400" />
              <InfoRow icon={Weight} label="Weight" value={hp.weight_kg ? `${hp.weight_kg} kg` : null} color="text-amber-400" />
              <InfoRow icon={Dumbbell} label="BMI" value={hp.bmi ? hp.bmi.toFixed(1) : null} color="text-emerald-400" />
              <InfoRow icon={Dumbbell} label="Activity" value={hp.activity_level} color="text-orange-400" />
              <InfoRow icon={Leaf} label="Diet" value={hp.dietary_preference} color="text-green-400" />
              <InfoRow icon={Heart} label="Health Goal" value={hp.health_goal} color="text-rose-400" />
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart size={32} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No health profile yet.</p>
              <p className="text-xs text-white/20 mt-1">Complete your health profile to see a summary here.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
