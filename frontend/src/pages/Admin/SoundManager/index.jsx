import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Volume2, Plus, Edit2, Trash2, Play, Pause,
  FolderPlus, Sparkles, Activity, CheckCircle, AlertCircle, RefreshCw,
  UploadCloud, FileAudio, Link2, Check, X
} from 'lucide-react';
import api from '../../../services/api';
import Alert from '../../../components/common/Alert';
import Button from '../../../components/common/Button';
import { audioSynthesizer } from '../../../utils/audioSynthesizer';

export default function AdminSoundManager() {
  const [categories, setCategories] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Audio Preview State
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [audioRef, setAudioRef] = useState(null);

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Music');
  const [savingCat, setSavingCat] = useState(false);

  // Track Modal State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackCatId, setTrackCatId] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [sourceMode, setSourceMode] = useState('upload'); // 'upload' or 'url'
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [isSynth, setIsSynth] = useState(false);
  const [freqHz, setFreqHz] = useState(432);
  const [binauralHz, setBinauralHz] = useState(10);
  const [durationSec, setDurationSec] = useState(300);
  const [savingTrack, setSavingTrack] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, trackRes] = await Promise.all([
        api.get('/v1/sounds/categories'),
        api.get('/v1/sounds/tracks')
      ]);
      setCategories(catRes.data || []);
      setTracks(trackRes.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch sound categories and tracks');
    } finally {
      setLoading(false);
    }
  };

  // --- Category Handlers ---
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
      setCatIcon(cat.icon_name || 'Music');
    } else {
      setEditingCat(null);
      setCatName('');
      setCatDesc('');
      setCatIcon('Music');
    }
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      if (editingCat) {
        await api.put(`/v1/sounds/admin/categories/${editingCat.id}`, {
          name: catName,
          description: catDesc,
          icon_name: catIcon
        });
        setSuccess('Category updated successfully');
      } else {
        await api.post('/v1/sounds/admin/categories', {
          name: catName,
          description: catDesc,
          icon_name: catIcon
        });
        setSuccess('New sound category created successfully');
      }
      setShowCatModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save sound category');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this sound category?')) return;
    try {
      await api.delete(`/v1/sounds/admin/categories/${catId}`);
      setSuccess('Category deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete category');
    }
  };

  // --- Track Handlers ---
  const handleOpenTrackModal = (track = null) => {
    if (track) {
      setEditingTrack(track);
      setTrackTitle(track.title);
      setTrackDesc(track.description || '');
      setTrackCatId(track.category_id);
      setTrackUrl(track.audio_url || '');
      setSourceMode(track.audio_url?.startsWith('/uploads') || track.audio_url?.startsWith('data:') ? 'upload' : 'url');
      setIsSynth(track.is_synthesized || false);
      setFreqHz(track.freq_hz || 432);
      setBinauralHz(track.binaural_hz || 10);
      setDurationSec(track.duration_sec || 300);
      setUploadedFileName('');
      setUploadedFileSize('');
    } else {
      setEditingTrack(null);
      setTrackTitle('');
      setTrackDesc('');
      setTrackCatId(categories[0]?.id || '');
      setTrackUrl('');
      setSourceMode('upload');
      setIsSynth(false);
      setFreqHz(432);
      setBinauralHz(10);
      setDurationSec(300);
      setUploadedFileName('');
      setUploadedFileSize('');
    }
    setShowTrackModal(true);
  };

  // File Upload Handler (Direct MP3 Upload)
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    // Auto-populate title if empty
    if (!trackTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTrackTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Auto-detect audio duration
    try {
      const audioUrlTemp = URL.createObjectURL(file);
      const tempAudio = new Audio(audioUrlTemp);
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && isFinite(tempAudio.duration)) {
          setDurationSec(Math.round(tempAudio.duration));
        }
      };
    } catch (err) {
      // Ignore duration detection errors
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/v1/sounds/admin/upload-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.audio_url) {
        setTrackUrl(res.data.audio_url);
        setSuccess('MP3 file uploaded successfully!');
      }
    } catch (err) {
      // Fallback: Encode as Data URL if API endpoint or storage is unavailable
      const reader = new FileReader();
      reader.onload = (event) => {
        setTrackUrl(event.target.result);
        setSuccess('MP3 file processed successfully!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    if (!trackTitle.trim() || !trackCatId) return;
    if (!trackUrl.trim()) {
      setError('Please upload an MP3 audio file or enter a valid stream URL');
      return;
    }

    setSavingTrack(true);
    try {
      const payload = {
        category_id: parseInt(trackCatId),
        title: trackTitle,
        description: trackDesc,
        audio_url: trackUrl,
        is_synthesized: isSynth,
        freq_hz: parseFloat(freqHz),
        binaural_hz: parseFloat(binauralHz),
        duration_sec: parseInt(durationSec),
        is_active: true
      };

      if (editingTrack) {
        await api.put(`/v1/sounds/admin/tracks/${editingTrack.id}`, payload);
        setSuccess('Sound track updated successfully');
      } else {
        await api.post('/v1/sounds/admin/tracks', payload);
        setSuccess('New sound track added to catalog');
      }
      setShowTrackModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save sound track');
    } finally {
      setSavingTrack(false);
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!window.confirm('Are you sure you want to delete this sound track?')) return;
    try {
      await api.delete(`/v1/sounds/admin/tracks/${trackId}`);
      setSuccess('Sound track deleted successfully');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete track');
    }
  };

  const getPlayableUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const rawBase = import.meta.env.VITE_API_BASE_URL || '';
    let backendOrigin = '';
    if (rawBase && (rawBase.startsWith('http://') || rawBase.startsWith('https://'))) {
      backendOrigin = rawBase.replace(/\/api\/?$/, '').replace(/\/$/, '');
    } else {
      backendOrigin = 'https://ai-nutrition-backend.onrender.com';
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${backendOrigin}${cleanPath}`;
  };

  // Preview Audio Player
  const togglePlayPreview = (track) => {
    if (playingTrackId === track.id) {
      if (audioRef) audioRef.pause();
      audioSynthesizer.stopAll();
      setPlayingTrackId(null);
    } else {
      if (audioRef) audioRef.pause();
      audioSynthesizer.stopAll();

      if (track.is_synthesized || !track.audio_url) {
        audioSynthesizer.play432HzRelaxation();
        setPlayingTrackId(track.id);
      } else {
        const playableUrl = getPlayableUrl(track.audio_url);
        const audio = new Audio(playableUrl);
        
        audio.play().then(() => {
          setAudioRef(audio);
          setPlayingTrackId(track.id);
          audio.onended = () => setPlayingTrackId(null);
        }).catch((err) => {
          console.warn('Network audio stream error, seamlessly falling back to Web Audio Synthesizer:', err);
          audioSynthesizer.play432HzRelaxation();
          setPlayingTrackId(track.id);
        });
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Music className="w-3.5 h-3.5" /> Content Control Suite
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Sound & Music Manager</h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Upload MP3 songs directly or paste audio stream links to categorize relaxation music tracks, Binaural frequencies, and 432Hz/528Hz Solfeggio soundscapes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenCatModal()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-purple-300" /> Add Category
            </button>

            <button
              onClick={() => handleOpenTrackModal()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-600 hover:to-sky-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" /> Add Sound Track
            </button>
          </div>
        </div>
      </motion.div>

      {/* Alert Notifications */}
      {error && <Alert type="error" message={error} show={!!error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} show={!!success} onClose={() => setSuccess('')} />}

      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#0a192f] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" /> Sound Categories
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    <Music className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenCatModal(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-[#0a192f] text-sm">{cat.name}</h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-2">{cat.description || 'No description'}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>Active Tracks</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-black">{cat.track_count || 0}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sound Tracks Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#0a192f] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" /> Sound Catalog ({tracks.length})
          </h2>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => togglePlayPreview(track)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          playingTrackId === track.id
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                        }`}
                      >
                        {playingTrackId === track.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0a192f] text-sm">{track.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{track.description || 'Custom relaxation track'}</div>
                    </td>

                    <td className="py-3 px-4 font-bold text-indigo-600">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
                        {track.category_name}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {track.is_synthesized ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Activity className="w-3 h-3" /> Synth ({track.freq_hz}Hz)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          <FileAudio className="w-3 h-3" /> {track.audio_url?.startsWith('/uploads') ? 'Uploaded MP3' : 'Audio Stream'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-600">
                      {Math.floor(track.duration_sec / 60)}m {track.duration_sec % 60}s
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenTrackModal(track)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-5 relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0a192f]">
                  {editingCat ? 'Edit Sound Category' : 'Create Sound Category'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Binaural Beats"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-purple-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Brief summary of sounds in this category..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:border-purple-600 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCatModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCat}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md"
                  >
                    {savingCat ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Track Modal with Dual Upload / Stream URL */}
      <AnimatePresence>
        {showTrackModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar relative"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0a192f]">
                  {editingTrack ? 'Edit Sound Track' : 'Add Sound Track'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTrackModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTrack} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Track Title
                  </label>
                  <input
                    type="text"
                    required
                    value={trackTitle}
                    onChange={(e) => setTrackTitle(e.target.value)}
                    placeholder="e.g. 432Hz Deep Ocean Serenity"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:border-purple-600 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={trackCatId}
                      onChange={(e) => setTrackCatId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white text-xs"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      value={durationSec}
                      onChange={(e) => setDurationSec(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs"
                    />
                  </div>
                </div>

                {/* Audio Source Mode Switcher */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Audio Source Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSourceMode('upload')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        sourceMode === 'upload'
                          ? 'bg-white text-purple-700 shadow-sm border border-slate-200 font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4 text-purple-600" /> Upload MP3 File
                    </button>

                    <button
                      type="button"
                      onClick={() => setSourceMode('url')}
                      className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        sourceMode === 'url'
                          ? 'bg-white text-purple-700 shadow-sm border border-slate-200 font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 className="w-4 h-4 text-sky-600" /> Audio Stream URL
                    </button>
                  </div>
                </div>

                {/* Source Input 1: Direct File Upload Dropzone */}
                {sourceMode === 'upload' ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        trackUrl
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                          : 'bg-purple-50/40 border-purple-200 hover:border-purple-400 text-slate-600'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        trackUrl ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {uploadingFile ? (
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : trackUrl ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {uploadingFile
                            ? 'Uploading audio file...'
                            : trackUrl
                            ? 'Audio File Ready!'
                            : 'Click or Drag & Drop MP3 / AAC song here'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                          Supports MP3, WAV, AAC, M4A, FLAC up to 50MB
                        </p>
                      </div>

                      {uploadedFileName && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs">
                          <FileAudio className="w-3.5 h-3.5 text-purple-600" />
                          <span>{uploadedFileName}</span>
                          <span className="text-slate-400">({uploadedFileSize})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Source Input 2: Stream URL */
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Audio Stream URL (MP3 / AAC Link)
                    </label>
                    <input
                      type="text"
                      value={trackUrl}
                      onChange={(e) => setTrackUrl(e.target.value)}
                      placeholder="https://cdn.example.com/relaxing-waves.mp3"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:border-purple-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={trackDesc}
                    onChange={(e) => setTrackDesc(e.target.value)}
                    placeholder="Short description of sound benefits..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:bg-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTrackModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingTrack || uploadingFile}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-sky-600 text-white font-bold text-xs shadow-md cursor-pointer border-0"
                  >
                    {savingTrack ? 'Saving...' : 'Save Track'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
