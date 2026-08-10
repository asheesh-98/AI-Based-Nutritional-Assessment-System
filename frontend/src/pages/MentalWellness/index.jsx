import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones, Play, Pause, Volume2, VolumeX, Sparkles,
  Wind, Clock, HeartHandshake, RefreshCw, Activity, Layers, Sun, Moon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { audioSynthesizer } from '../../utils/audioSynthesizer';
import api from '../../services/api';

export default function MentalWellness() {
  const { t } = useLanguage();

  // Categories & Tracks State
  const [categories, setCategories] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [audioStream, setAudioStream] = useState(null);

  // Session Timer State (Auto-off)
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(null);
  const [completedSessions, setCompletedSessions] = useState(2);

  // Guided Breathing State
  const [breathingMode, setBreathingMode] = useState('478'); // '478' or 'box'
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale'); // inhale, hold, exhale, rest
  const [breathCount, setBreathCount] = useState(4);

  // Mood Check-in State
  const [selectedMood, setSelectedMood] = useState('calm');

  // Synthesized Presets
  const SYNTH_PRESETS = [
    {
      id: 'deep_relaxation',
      title: t('mental_preset_deep_relaxation'),
      category: 'Solfeggio Frequencies',
      description: '432Hz Calm Waves + Soft Binaural Alpha 10Hz tone for deep mental tranquility.',
      type: 'synth',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'rain_forest',
      title: t('mental_preset_rain_forest'),
      category: 'Nature Sounds',
      description: 'Ambient Raindrops + Gentle Breeze for mindfulness and stress reduction.',
      type: 'synth',
      icon: Wind,
      color: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'ocean_solfeggio',
      title: t('mental_preset_ocean_solfeggio'),
      category: 'Solfeggio Frequencies',
      description: '528Hz Healing Tone + Rhythmic Ocean Swells for cell restoration.',
      type: 'synth',
      icon: Activity,
      color: 'from-sky-600 to-cyan-600'
    },
    {
      id: 'sleep_restoration',
      title: t('mental_preset_sleep'),
      category: 'Binaural Beats',
      description: '3Hz Delta Waves + Deep Pink Noise for restorative sleep and rejuvenation.',
      type: 'synth',
      icon: Moon,
      color: 'from-indigo-900 to-purple-900'
    },
    {
      id: 'focus_relief',
      title: t('mental_preset_focus'),
      category: 'Binaural Beats',
      description: '6Hz Theta Focus Waves for anxiety relief and mental clarity.',
      type: 'synth',
      icon: Sun,
      color: 'from-amber-600 to-orange-600'
    }
  ];

  useEffect(() => {
    fetchSoundCatalog();

    return () => {
      audioSynthesizer.stopAll();
      if (audioStream) audioStream.pause();
    };
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isPlaying && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      stopPlayback();
      setCompletedSessions((prev) => prev + 1);
      setTimerSecondsLeft(null);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timerSecondsLeft]);

  // Breathing Loop Effect
  useEffect(() => {
    let timer = null;
    if (breathingActive) {
      if (breathingMode === '478') {
        // 4-7-8 Pranayama: Inhale 4s, Hold 7s, Exhale 8s
        if (breathPhase === 'inhale') {
          timer = setTimeout(() => {
            setBreathPhase('hold');
            setBreathCount(7);
          }, 4000);
        } else if (breathPhase === 'hold') {
          timer = setTimeout(() => {
            setBreathPhase('exhale');
            setBreathCount(8);
          }, 7000);
        } else if (breathPhase === 'exhale') {
          timer = setTimeout(() => {
            setBreathPhase('inhale');
            setBreathCount(4);
          }, 8000);
        }
      } else {
        // Box Breathing: 4-4-4-4
        if (breathPhase === 'inhale') {
          timer = setTimeout(() => {
            setBreathPhase('hold');
            setBreathCount(4);
          }, 4000);
        } else if (breathPhase === 'hold') {
          timer = setTimeout(() => {
            setBreathPhase('exhale');
            setBreathCount(4);
          }, 4000);
        } else if (breathPhase === 'exhale') {
          timer = setTimeout(() => {
            setBreathPhase('rest');
            setBreathCount(4);
          }, 4000);
        } else if (breathPhase === 'rest') {
          timer = setTimeout(() => {
            setBreathPhase('inhale');
            setBreathCount(4);
          }, 4000);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [breathingActive, breathPhase, breathingMode]);

  const fetchSoundCatalog = async () => {
    try {
      const [catRes, trackRes] = await Promise.all([
        api.get('/v1/sounds/categories'),
        api.get('/v1/sounds/tracks')
      ]);
      setCategories(catRes.data || []);
      setTracks(trackRes.data || []);
    } catch (e) {
      // Fall back to built-in presets
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setCurrentTrack(track);

    if (track.type === 'synth') {
      if (track.id === 'deep_relaxation') audioSynthesizer.play432HzRelaxation();
      else if (track.id === 'rain_forest') audioSynthesizer.playRainForest();
      else if (track.id === 'ocean_solfeggio') audioSynthesizer.playOceanSolfeggio();
      else if (track.id === 'sleep_restoration') audioSynthesizer.playSleepRestoration();
      else if (track.id === 'focus_relief') audioSynthesizer.playFocusAnxietyRelief();
      audioSynthesizer.setVolume(volume);
    } else if (track.audio_url) {
      const audio = new Audio(track.audio_url);
      audio.volume = volume;
      audio.play().catch(() => {});
      setAudioStream(audio);
    }

    setIsPlaying(true);
    setTimerSecondsLeft(timerMinutes * 60);
  };

  const stopPlayback = () => {
    audioSynthesizer.stopAll();
    if (audioStream) {
      audioStream.pause();
      setAudioStream(null);
    }
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    audioSynthesizer.setVolume(newVol);
    if (audioStream) audioStream.volume = newVol;
  };

  const toggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
    } else {
      setBreathingActive(true);
      setBreathPhase('inhale');
      setBreathCount(4);
    }
  };

  // Filtered tracks
  const allAvailableTracks = [
    ...SYNTH_PRESETS,
    ...tracks.map(t => ({
      id: `db_${t.id}`,
      title: t.title,
      category: t.category_name,
      description: t.description || 'Admin curated relaxation audio stream',
      type: 'stream',
      audio_url: t.audio_url,
      icon: Headphones,
      color: 'from-indigo-600 to-sky-600'
    }))
  ];

  const filteredTracks = selectedCatId === 'all'
    ? allAvailableTracks
    : allAvailableTracks.filter(t => t.category.toLowerCase().includes(selectedCatId.toLowerCase()));

  return (
    <DashboardLayout
      title={t('mental_wellness_title')}
      subtitle={t('mental_wellness_subtitle')}
    >
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* 🌟 Player & Guided Breathing Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Sound Player Card */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-800">
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  <Headphones className="w-3.5 h-3.5" /> Sound Therapy Studio
                </div>
                {timerSecondsLeft !== null && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-sky-400">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(timerSecondsLeft / 60)}:{String(timerSecondsLeft % 60).padStart(2, '0')}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentTrack ? currentTrack.title : 'Select a Calm Sound Preset'}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
                  {currentTrack ? currentTrack.description : 'Choose from 432Hz Solfeggio tones, binaural beats, or ambient nature soundscapes below.'}
                </p>
              </div>

              {/* Sound Wave Frequency Visualizer Animation */}
              <div className="h-16 flex items-center justify-center gap-1.5 px-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                {[40, 75, 55, 90, 60, 30, 85, 95, 50, 70, 45, 80, 65, 35, 90, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isPlaying ? [12, h, 12] : 8 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + (i % 5) * 0.2,
                      ease: 'easeInOut'
                    }}
                    className={`w-1.5 rounded-full ${
                      isPlaying ? 'bg-gradient-to-t from-purple-500 to-sky-400' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Player Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => currentTrack && handlePlayTrack(currentTrack)}
                    disabled={!currentTrack}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:scale-105 active:scale-95 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-all cursor-pointer border-0"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>

                  <button
                    onClick={stopPlayback}
                    disabled={!isPlaying}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Stop
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/60">
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24 sm:w-32 accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Session Timer Selector */}
            <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" /> Auto-Off Timer
              </span>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setTimerMinutes(m);
                      if (isPlaying) setTimerSecondsLeft(m * 60);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      timerMinutes === m
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Guided Breathing Visualizer Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md flex flex-col justify-between text-center relative overflow-hidden">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mx-auto">
                <Wind className="w-3.5 h-3.5" /> Guided Breathing
              </div>
              <h3 className="text-xl font-black text-[#0a192f]">{t('breathing_title')}</h3>
              <p className="text-slate-500 text-xs font-medium">
                Deep breathing lowers heart rate, balances blood pressure, and reduces cortisol.
              </p>
            </div>

            {/* Breathing Aura Sphere */}
            <div className="my-6 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-36 h-36">
                <motion.div
                  animate={{
                    scale: breathingActive
                      ? (breathPhase === 'inhale' ? 1.4 : breathPhase === 'exhale' ? 0.8 : 1.2)
                      : 1,
                    opacity: breathingActive ? [0.6, 0.9, 0.6] : 0.4
                  }}
                  transition={{
                    duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 7 : 8,
                    ease: 'easeInOut'
                  }}
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                    breathPhase === 'inhale'
                      ? 'from-sky-400 to-indigo-500'
                      : breathPhase === 'hold'
                      ? 'from-purple-500 to-pink-500'
                      : 'from-emerald-400 to-teal-500'
                  } blur-xl`}
                />

                <div className="relative z-10 w-28 h-28 rounded-full bg-white shadow-xl border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {breathingActive ? breathPhase : 'Ready'}
                  </span>
                  <span className="text-2xl font-black text-[#0a192f]">
                    {breathingActive ? t(`breathing_${breathPhase}`) || breathPhase : 'Start'}
                  </span>
                </div>
              </div>
            </div>

            {/* Breathing Controls */}
            <div className="space-y-3">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setBreathingMode('478')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    breathingMode === '478' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  4-7-8 Pranayama
                </button>
                <button
                  onClick={() => setBreathingMode('box')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    breathingMode === 'box' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Box (4-4-4-4)
                </button>
              </div>

              <button
                onClick={toggleBreathing}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer border-0"
              >
                {breathingActive ? 'Pause Breathing Guide' : 'Start Guided Breathing'}
              </button>
            </div>
          </div>
        </div>

        {/* 🌿 Patient Mood Check-In Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-[#0a192f] flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500" /> {t('mood_title')}
              </h3>
              <p className="text-slate-500 text-xs font-medium">Select your current mental state to tailor your sound experience.</p>
            </div>
            <div className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 self-start sm:self-auto">
              Sessions Completed Today: {completedSessions}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { id: 'calm', label: t('mood_calm'), emoji: '😌', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900' },
              { id: 'anxious', label: t('mood_anxious'), emoji: '😰', color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
              { id: 'stressed', label: t('mood_stressed'), emoji: '😫', color: 'border-rose-200 bg-rose-50/50 text-rose-900' },
              { id: 'tired', label: t('mood_tired'), emoji: '😴', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900' },
              { id: 'energetic', label: t('mood_energetic'), emoji: '⚡', color: 'border-sky-200 bg-sky-50/50 text-sky-900' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                  selectedMood === m.id
                    ? `${m.color} ring-2 ring-purple-500 shadow-sm font-bold scale-105`
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🎶 Sound Presets Catalog */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-[#0a192f] flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Sound Catalog & Presets
            </h3>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
              <button
                onClick={() => setSelectedCatId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCatId === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Sounds
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCatId === cat.name
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTracks.map((track) => {
              const IconComp = track.icon || Headphones;
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  whileHover={{ y: -3 }}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isThisPlaying
                      ? 'bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white border-purple-300 shadow-md ring-2 ring-purple-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-r ${track.color || 'from-purple-600 to-indigo-600'} text-white flex items-center justify-center shadow-md`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        {track.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-[#0a192f] text-base">{track.title}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1">{track.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {track.type === 'synth' ? 'Web Audio API Synth' : 'Audio Stream'}
                    </span>

                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border-0 ${
                        isThisPlaying
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-sky-700 text-white shadow-md'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Play Sound
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
