import React, { useState, useEffect } from 'react';
import { Sprout, HelpCircle, Leaf, Droplets, Calendar, Award, TrendingUp, DollarSign } from 'lucide-react';

export default function CropRecommendation({ settings }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [soilType, setSoilType] = useState('');
  const [waterAvailability, setWaterAvailability] = useState('');
  const [farmSize, setFarmSize] = useState(1.0);
  const [month, setMonth] = useState('');
  const [season, setSeason] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statesList = [
    "Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Telangana",
    "Bihar", "Haryana", "Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"
  ];
  const soilTypes = ["Black Soil", "Clayey", "Loamy", "Sandy", "Alluvial"];
  const waterLevels = ["High", "Moderate", "Low"];

  // Auto-detect month and season, load default setting values
  useEffect(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date();
    const currentMonth = months[date.getMonth()];
    setMonth(currentMonth);

    const m = date.getMonth();
    if (m >= 5 && m <= 8) {
      setSeason("Kharif");
    } else if (m >= 9 || m <= 1) {
      setSeason("Rabi");
    } else {
      setSeason("Zaid (Summer)");
    }

    if (settings) {
      setState(settings.state || 'Maharashtra');
      setDistrict(settings.district || 'Pune');
      setSoilType(settings.soil_type || 'Black Soil');
      setWaterAvailability(settings.water_availability || 'Moderate');
    }
  }, [settings]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
          district,
          soil_type: soilType,
          water_availability: waterAvailability,
          farm_size: Number(farmSize),
          month,
          season,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError('Failed to fetch recommendation. Please verify inputs.');
      }
    } catch (error) {
      setError('Connection failed. Verify the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Crop Recommendation Engine</h1>
        <p className="text-slate-400 mt-1">Get tailor-made crop and seed recommendations based on seasonal patterns and soil parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <form onSubmit={handleRecommend} className="glass-panel rounded-2xl p-6 space-y-5 h-fit shadow-xl border border-slate-800">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sprout size={18} className="text-emerald-400" /> Enter Farm Conditions
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Soil Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {soilTypes.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Water Availability</label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {waterLevels.map(wl => (
                  <option key={wl} value={wl}>{wl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Farm Size (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Detected Month</label>
                <div className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-300 font-semibold">{month}</div>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Detected Season</label>
                <div className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-xl text-slate-300 font-semibold">{season}</div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Analyzing...' : 'Get Recommendations'}
          </button>
        </form>

        {/* Results Pane */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 p-4 rounded-xl">
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl border border-slate-800/60">
              <Leaf size={48} className="text-slate-600 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-300">Ready to Analyze</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">Configure your farm details in the form and click "Get Recommendations" to see optimal crops and metrics.</p>
            </div>
          )}

          {loading && (
            <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-xl border border-slate-800/60">
              <div className="relative w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-slate-300">Consulting Agricultural Experts</h3>
              <p className="text-slate-500 text-sm max-w-sm mt-1">Analyzing weather variables, rainfall trends, soil quality indices, and seasonal databases...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-fade-in">
              {/* Primary Crop Card */}
              <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400">
                  <Sprout size={180} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Best Recommended Crop</div>
                  <h2 className="text-3xl font-extrabold text-white">{result.crop}</h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full font-medium">Seed Variety: <strong className="text-emerald-400">{result.seed_variety}</strong></span>
                    <span className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full font-medium">Sowing: <strong className="text-emerald-400">{result.sowing_month}</strong></span>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl flex flex-col items-end shrink-0 shadow-inner">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Harvest Duration</div>
                  <div className="text-lg font-extrabold text-emerald-300">{result.harvest_duration}</div>
                </div>
              </div>

              {/* Economic Projections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimated Yield</div>
                    <div className="text-xl font-bold text-white mt-0.5">{result.estimated_yield}</div>
                  </div>
                </div>
                
                <div className="glass-panel rounded-xl p-5 border border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimated Net Profit</div>
                    <div className="text-xl font-bold text-amber-300 mt-0.5">{result.estimated_profit}</div>
                  </div>
                </div>
              </div>

              {/* Agri guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Droplets size={16} className="text-sky-400" /> Irrigation Guidelines
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.irrigation_recommendation}</p>
                </div>
                
                <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-3">
                  <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                    <Award size={16} className="text-purple-400" /> Fertilizer Plan
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.fertilizer_recommendation}</p>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <HelpCircle size={16} className="text-emerald-400" /> Why this crop?
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
