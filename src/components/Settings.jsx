import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, CheckCircle } from 'lucide-react';

export default function Settings({ settings, onSettingsUpdate }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const statesList = [
    "Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Telangana",
    "Bihar", "Haryana", "Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"
  ];

  const soilTypes = ["Black Soil", "Clayey", "Loamy", "Sandy", "Alluvial"];
  const waterLevels = ["High", "Moderate", "Low"];

  useEffect(() => {
    if (settings) {
      setState(settings.state || 'Maharashtra');
      setDistrict(settings.district || 'Pune');
      setSoilType(settings.soil_type || 'Black Soil');
      setWaterAvailability(settings.water_availability || 'Moderate');
      setGeminiApiKey(settings.gemini_api_key || '');
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          district,
          soil_type: soilType,
          water_availability: waterAvailability,
          gemini_api_key: geminiApiKey,
        }),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Settings saved successfully!' });
        if (onSettingsUpdate) {
          onSettingsUpdate({
            state,
            district,
            soil_type: soilType,
            water_availability: waterAvailability,
            gemini_api_key: geminiApiKey,
          });
        }
      } else {
        setStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error connecting to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your default farm location, soil profile, and AI credentials.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl border mb-6 flex items-center gap-3 ${
          status.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          {status.type === 'success' ? <CheckCircle size={20} className="text-emerald-400" /> : <ShieldAlert size={20} className="text-rose-400" />}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-3">Farm Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            >
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">District / Region</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Pune"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            >
              {soilTypes.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Water Availability</label>
            <select
              value={waterAvailability}
              onChange={(e) => setWaterAvailability(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            >
              {waterLevels.map(wl => (
                <option key={wl} value={wl}>{wl}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-xl font-semibold text-slate-200 border-b border-slate-800 pb-3 mb-4">AI Credentials</h2>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">Google Gemini API Key <span className="text-slate-500 text-xs font-normal">(Optional)</span></label>
            </div>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
            />
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              If provided, the AI Assistant chatbot will automatically use the Google Gemini 1.5 Flash API to deliver personalized advice. Otherwise, it will operate on built-in offline agricultural knowledge safely.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
