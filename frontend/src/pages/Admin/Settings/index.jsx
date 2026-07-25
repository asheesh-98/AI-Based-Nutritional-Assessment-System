import React, { useState, useEffect } from 'react';
import { adminSettingsService } from '../../../services/adminSettingsService';
import { Settings, Key, CheckCircle, AlertCircle, Bot, Utensils } from 'lucide-react';
import { PageLoader } from '../../../components/common/Loader';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSpoon, setSavingSpoon] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [spoonacularKey, setSpoonacularKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpoonacularKey = async (e) => {
    e.preventDefault();
    if (!spoonacularKey.trim()) return;

    try {
      setSavingSpoon(true);
      setError(null);
      setSuccess(false);

      const data = await adminSettingsService.updateSettings({
        spoonacular_api_key: spoonacularKey
      });

      setSettings(data);
      setSpoonacularKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update Spoonacular API key.');
    } finally {
      setSavingSpoon(false);
    }
  };

  const handleSaveGeminiKey = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;

    try {
      setSavingGemini(true);
      setError(null);
      setSuccess(false);

      const data = await adminSettingsService.updateSettings({
        gemini_api_key: geminiKey
      });

      setSettings(data);
      setGeminiKey('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update Gemini API key.');
    } finally {
      setSavingGemini(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-cyan-500" size={32} />
          System Settings
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-400 font-medium">Error</h3>
            <p className="text-red-400/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
          <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-emerald-400 font-medium">Success</h3>
            <p className="text-emerald-400/80 text-sm mt-1">API Key has been updated and applied to the server immediately.</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key className="text-purple-400" size={24} />
            Third-Party API Keys
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Manage your external service integrations. Changes to API keys take effect immediately without requiring a server restart.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Gemini AI Setting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-700/60 pb-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-2">
                <Bot className="text-cyan-400" size={20} />
                Google Gemini API
              </h3>
              <p className="text-slate-400 text-sm">
                Powers the AI Nutritionist Chatbot, Visual Meal Photo Scanner, and Medical Report Summarizer.
              </p>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSaveGeminiKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Gemini Key
                  </label>
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 font-mono text-sm">
                    {settings?.gemini_api_key_masked || 'Not configured'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Set New Gemini Key
                  </label>
                  <input
                    type="text"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter new Google Gemini API Key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Get an API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingGemini || !geminiKey.trim()}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {savingGemini ? 'Saving...' : 'Update Gemini Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Spoonacular Setting */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-2">
                <Utensils className="text-amber-400" size={20} />
                Spoonacular API
              </h3>
              <p className="text-slate-400 text-sm">
                Used for fetching recipe suggestions and ingredient search for the Meal Planner.
              </p>
            </div>
            
            <div className="md:col-span-2">
              <form onSubmit={handleSaveSpoonacularKey} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Spoonacular Key
                  </label>
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 font-mono text-sm">
                    {settings?.spoonacular_api_key_masked || 'Not configured'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Set New Spoonacular Key
                  </label>
                  <input
                    type="text"
                    value={spoonacularKey}
                    onChange={(e) => setSpoonacularKey(e.target.value)}
                    placeholder="Enter new Spoonacular API Key"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Get an API key from <a href="https://spoonacular.com/food-api" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">spoonacular.com</a>.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSpoon || !spoonacularKey.trim()}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {savingSpoon ? 'Saving...' : 'Update Spoonacular Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
