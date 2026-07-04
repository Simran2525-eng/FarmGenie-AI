import React, { useState, useEffect } from 'react';
import { 
  Calendar, Sun, Sprout, ShieldAlert, BookOpen, 
  DollarSign, MessageSquare, MapPin, Wind, Droplets, Thermometer 
} from 'lucide-react';

export default function Dashboard({ settings, setPage }) {
  const [currentDateInfo, setCurrentDateInfo] = useState({ month: '', season: '' });
  const [weather, setWeather] = useState({ temp: '--', humidity: '--', wind: '--', main: 'Loading...', alert: 'No active alerts' });
  const [recommendation, setRecommendation] = useState(null);
  const [schemeHighlight, setSchemeHighlight] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  // 1. Detect Month and Season
  useEffect(() => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date();
    const currentMonth = months[date.getMonth()];
    let season = "";
    
    const m = date.getMonth(); // 0 to 11
    if (m >= 5 && m <= 8) { // June - Sept
      season = "Kharif";
    } else if (m >= 9 || m <= 1) { // Oct - Feb
      season = "Rabi";
    } else { // March - May
      season = "Zaid (Summer)";
    }
    
    setCurrentDateInfo({ month: currentMonth, season });
  }, []);

  // 2. Fetch Weather via Browser Location & Open-Meteo
  useEffect(() => {
    const fetchWeather = async (latitude, longitude) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const current = data.current;
          const daily = data.daily;
          
          let alert = 'No active alerts';
          const maxTemp = daily.temperature_2m_max[0];
          const windSpeed = current.wind_speed_10m;
          const probRain = daily.precipitation_probability_max[0];

          if (maxTemp > 40) {
            alert = 'Heat Wave Warning: Irrigate crops early morning or evening.';
          } else if (probRain > 80 && current.precipitation > 5) {
            alert = 'Heavy Rain Alert: Clear field drainage channels immediately.';
          } else if (windSpeed > 30) {
            alert = 'Strong Wind Alert: Avoid chemical spraying and secure support structures.';
          }

          let weatherDesc = 'Clear';
          if (probRain > 60) weatherDesc = 'Rainy';
          else if (probRain > 30) weatherDesc = 'Partly Cloudy';
          else if (current.relative_humidity_2m > 80) weatherDesc = 'Humid';

          setWeather({
            temp: `${current.temperature_2m.toFixed(1)}°C`,
            humidity: `${current.relative_humidity_2m.toFixed(0)}%`,
            wind: `${current.wind_speed_10m.toFixed(1)} km/h`,
            main: weatherDesc,
            alert: alert
          });
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setLoadingWeather(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback to Pune coordinates if blocked
          fetchWeather(18.52, 73.85);
        }
      );
    } else {
      fetchWeather(18.52, 73.85);
    }
  }, []);

  // 3. Fetch Crop Recommendation & Scheme Highlight when settings are loaded
  useEffect(() => {
    if (!settings || !currentDateInfo.month) return;

    const fetchRecommendation = async () => {
      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: settings.state,
            district: settings.district,
            soil_type: settings.soil_type,
            water_availability: settings.water_availability,
            farm_size: 1.0,
            month: currentDateInfo.month,
            season: currentDateInfo.season
          })
        });
        if (response.ok) {
          const data = await response.json();
          setRecommendation(data);
        }
      } catch (err) {
        console.error("Rec fetch failed:", err);
      }
    };

    const fetchSchemes = async () => {
      try {
        const response = await fetch(`/api/schemes?state=${settings.state}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Find a scheme that matches the state specifically, or just pick the first
            const stateScheme = data.find(s => s.state.toLowerCase() === settings.state.toLowerCase());
            setSchemeHighlight(stateScheme || data[0]);
          }
        }
      } catch (err) {
        console.error("Schemes fetch failed:", err);
      }
    };

    fetchRecommendation();
    fetchSchemes();
  }, [settings, currentDateInfo]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Welcome to <span className="text-emerald-400">FarmGenie AI</span>
          </h1>
          <p className="text-slate-400 mt-1">Smart agricultural assistant for {settings?.district || 'Pune'}, {settings?.state || 'Maharashtra'}.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-inner">
          <Calendar className="text-emerald-400" size={20} />
          <div>
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Current Schedule</div>
            <div className="text-sm font-bold text-slate-200">{currentDateInfo.month} • {currentDateInfo.season} Season</div>
          </div>
        </div>
      </div>

      {/* Grid of Weather Alert & Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Weather Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400">
            <Sun size={120} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Sun size={16} className="text-amber-400" /> Weather Summary
            </h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">{weather.temp}</span>
              <span className="text-sm text-slate-400 font-medium">{weather.main}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-sky-400" />
                <div>
                  <div className="text-xs text-slate-500">Humidity</div>
                  <div className="font-semibold">{weather.humidity}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={16} className="text-teal-400" />
                <div>
                  <div className="text-xs text-slate-500">Wind</div>
                  <div className="font-semibold">{weather.wind}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Card */}
        <div className={`glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg border-l-4 ${weather.alert.includes('Warning') || weather.alert.includes('Alert') ? 'border-l-amber-500 bg-amber-950/20' : 'border-l-emerald-500'}`}>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <ShieldAlert size={16} className={weather.alert.includes('Warning') || weather.alert.includes('Alert') ? 'text-amber-400 animate-pulse' : 'text-emerald-400'} /> Weather Alerts
            </h3>
            <p className="text-slate-200 font-medium leading-relaxed">
              {weather.alert}
            </p>
          </div>
          <button 
            onClick={() => setPage('weather')} 
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-4 group self-start"
          >
            Check Precautions & Forecast <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Crop Recommendation Summary Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400">
            <Sprout size={120} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Sprout size={16} className="text-emerald-400" /> Recommended Crop
            </h3>
            {recommendation ? (
              <>
                <div className="text-2xl font-bold text-white mb-1">{recommendation.crop}</div>
                <div className="text-sm text-slate-400">Variety: <span className="text-emerald-300 font-medium">{recommendation.seed_variety}</span></div>
                <div className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{recommendation.reason}</div>
              </>
            ) : (
              <div className="text-slate-500 text-sm">Loading recommendation based on settings...</div>
            )}
          </div>
          <button 
            onClick={() => setPage('crop-rec')} 
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-4 group self-start"
          >
            Full Crop Recommendation Details <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>

      {/* Scheme Highlight & Quick Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Government Scheme Highlight */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg border border-slate-800">
          <div>
            <div className="flex justify-between items-start gap-4 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" /> Government Scheme Highlight
              </h3>
              {schemeHighlight && (
                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {schemeHighlight.state}
                </span>
              )}
            </div>
            {schemeHighlight ? (
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-200">{schemeHighlight.name}</h4>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{schemeHighlight.description}</p>
                <div className="text-xs text-slate-500 pt-2"><span className="font-semibold text-slate-400">Benefits: </span>{schemeHighlight.benefits}</div>
              </div>
            ) : (
              <div className="text-slate-500 text-sm">No schemes found. Let's configure settings.</div>
            )}
          </div>
          <button 
            onClick={() => setPage('schemes')} 
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-6 group self-start"
          >
            Explore Schemes <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Settings Info Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative border border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-rose-400" /> Active Farm Profile
            </h3>
            <div className="space-y-3 mt-2 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Location</span>
                <span className="font-medium text-slate-300">{settings?.district}, {settings?.state}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Soil Type</span>
                <span className="font-medium text-slate-300">{settings?.soil_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Water Source</span>
                <span className="font-medium text-slate-300">{settings?.water_availability}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setPage('settings')} 
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mt-6 group self-start"
          >
            Edit Settings <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h3 className="text-lg font-bold text-slate-300 mb-4 uppercase tracking-wider text-sm">Quick Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <button 
            onClick={() => setPage('crop-rec')}
            className="glass-card glass-card-hover rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <Sprout size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-300">Crop Recommendations</div>
          </button>

          <button 
            onClick={() => setPage('weather')}
            className="glass-card glass-card-hover rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all duration-300">
              <Sun size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-300">Weather & Location</div>
          </button>

          <button 
            onClick={() => setPage('schemes')}
            className="glass-card glass-card-hover rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all duration-300">
              <BookOpen size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-300">Govt Schemes</div>
          </button>

          <button 
            onClick={() => setPage('finance')}
            className="glass-card glass-card-hover rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3 group"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-300">
              <DollarSign size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-300">Finance Planner</div>
          </button>

          <button 
            onClick={() => setPage('chat')}
            className="glass-card glass-card-hover rounded-xl p-4 text-center flex flex-col items-center justify-center gap-3 group col-span-2 md:col-span-1"
          >
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-slate-950 transition-all duration-300">
              <MessageSquare size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-300">AI Assistant</div>
          </button>

        </div>
      </div>
    </div>
  );
}
