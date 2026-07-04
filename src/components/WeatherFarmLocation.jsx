import React, { useState, useEffect } from 'react';
import { 
  Sun, CloudRain, ShieldAlert, Cloud, MapPin, Compass,
  Droplets, Wind, Thermometer, Info, AlertTriangle, Calendar
} from 'lucide-react';

export default function WeatherFarmLocation({ settings }) {
  const [lat, setLat] = useState(18.52);
  const [lon, setLon] = useState(73.85);
  const [locSource, setLocSource] = useState('Default (Pune)');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [precautions, setPrecautions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Detect browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
          setLocSource('Browser Geolocation');
        },
        (error) => {
          console.warn("Geolocation blocked/failed, using settings or default Pune:", error.message);
          setLocSource('Default Coordinates');
        }
      );
    } else {
      setLocSource('Unsupported by Browser');
    }
  }, []);

  // 2. Fetch weather details once lat/lon are set
  useEffect(() => {
    const fetchWeatherAndForecast = async () => {
      setLoading(true);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          // Current weather
          setCurrentWeather({
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            wind: data.current.wind_speed_10m,
            precipitation: data.current.precipitation,
            code: data.daily.weather_code[0]
          });

          // 7-day forecast formatting
          const daily = data.daily;
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const list = [];
          for (let i = 0; i < 7; i++) {
            const dateStr = daily.time[i];
            const dateObj = new Date(dateStr);
            const dayName = i === 0 ? "Today" : daysOfWeek[dateObj.getDay()];
            list.push({
              day: dayName,
              date: dateStr.split('-').slice(1).reverse().join('/'), // DD/MM
              maxTemp: daily.temperature_2m_max[i],
              minTemp: daily.temperature_2m_min[i],
              rainProb: daily.precipitation_probability_max[i],
              code: daily.weather_code[i]
            });
          }
          setForecast(list);

          // Generate Alerts & Precautions
          const generatedAlerts = [];
          const generatedPrecautions = [];

          const currentTemp = data.current.temperature_2m;
          const currentWind = data.current.wind_speed_10m;
          const currentHumidity = data.current.relative_humidity_2m;
          const rainProbToday = daily.precipitation_probability_max[0];

          // Heat wave alert
          if (daily.temperature_2m_max[0] > 40 || currentTemp > 38) {
            generatedAlerts.push({
              type: 'Heat Wave',
              msg: 'Extremely high temperatures detected. Risk of crop desiccation and soil moisture loss.',
              level: 'danger'
            });
            generatedPrecautions.push('Irrigate early in the morning (5:00 AM - 8:00 AM) or late evening to minimize evaporation.');
            generatedPrecautions.push('Apply organic mulch to retain soil moisture.');
          }

          // Heavy rain alert
          if (rainProbToday > 75 || data.current.precipitation > 8) {
            generatedAlerts.push({
              type: 'Heavy Rain / Flood Risk',
              msg: 'High precipitation or rain probability detected. Potential waterlogging in low-lying fields.',
              level: 'warning'
            });
            generatedPrecautions.push('Ensure farm drainage channels are clear of debris to let excess water escape.');
            generatedPrecautions.push('Postpone fertilizer and pesticide sprays to prevent chemical runoff.');
          }

          // Storm alert
          if (data.daily.weather_code[0] >= 95) {
            generatedAlerts.push({
              type: 'Thunderstorm Warning',
              msg: 'Lightning and thunderstorms forecast. Safety risk for field operations.',
              level: 'danger'
            });
            generatedPrecautions.push('Instruct field workers to seek shelter indoors immediately. Do not stand near tall trees or metal machinery.');
            generatedPrecautions.push('Ensure greenhouse structures and shade nets are securely anchored.');
          }

          // Strong Wind Alert
          if (currentWind > 28) {
            generatedAlerts.push({
              type: 'Strong Winds',
              msg: 'High wind speeds could cause crop lodging (bending) and damage to weak structures.',
              level: 'warning'
            });
            generatedPrecautions.push('Delay transplanting young seedlings until wind speeds normalize.');
            generatedPrecautions.push('Establish windbreaks or stake taller crops like maize or sugarcane.');
          }

          if (generatedAlerts.length === 0) {
            generatedAlerts.push({
              type: 'Normal Weather Conditions',
              msg: 'No severe alerts active. Perfect weather for normal weeding, fertilization, and harvesting operations.',
              level: 'normal'
            });
            generatedPrecautions.push('Maintain regular watering schedules.');
            generatedPrecautions.push('Monitor crops for any signs of early pest attacks.');
          }

          setAlerts(generatedAlerts);
          setPrecautions(generatedPrecautions);
        }
      } catch (err) {
        console.error("Error fetching weather details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherAndForecast();
  }, [lat, lon]);

  // 3. Render Leaflet Map dynamically
  useEffect(() => {
    if (loading || !lat || !lon) return;

    let mapInstance = null;
    const mapElement = document.getElementById('farm-map');

    if (mapElement && window.L) {
      try {
        // Reset container to avoid 'Map already initialized' Leaflet error
        mapElement.innerHTML = "";
        
        mapInstance = window.L.map('farm-map', {
          zoomControl: true,
          scrollWheelZoom: false
        }).setView([lat, lon], 14);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        window.L.marker([lat, lon]).addTo(mapInstance)
          .bindPopup(`<b>Your Farm</b><br/>Lat: ${lat.toFixed(4)}<br/>Lon: ${lon.toFixed(4)}`)
          .openPopup();

      } catch (e) {
        console.error("Leaflet initialization failed:", e);
      }
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [loading, lat, lon]);

  // Weather code mapper
  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="text-amber-400" size={32} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-slate-400" size={32} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-sky-400" size={32} />;
    if (code >= 80 && code <= 82) return <CloudRain className="text-sky-400" size={32} />;
    return <CloudRain className="text-teal-400 animate-pulse" size={32} />;
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return 'Sunny / Clear';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Weather & Farm Map</h1>
          <p className="text-slate-400 mt-1">Real-time localized climate monitoring and GIS farm mapping.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded-full text-slate-400 font-semibold shrink-0">
          Source: {locSource}
        </div>
      </div>

      {/* Grid: Coordinates & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coordinate Panel */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Compass size={16} className="text-emerald-400" /> Geographic Info
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latitude</div>
              <div className="text-sm font-mono font-bold text-slate-200 mt-1">{lat.toFixed(5)}</div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Longitude</div>
              <div className="text-sm font-mono font-bold text-slate-200 mt-1">{lon.toFixed(5)}</div>
            </div>
          </div>
          <div className="space-y-2 pt-2 text-sm text-slate-300">
            <div className="flex justify-between pb-2 border-b border-slate-800/50">
              <span className="text-slate-500">Configured State</span>
              <span className="font-semibold text-emerald-400">{settings?.state || 'Maharashtra'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Configured District</span>
              <span className="font-semibold text-emerald-400">{settings?.district || 'Pune'}</span>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" /> Active Weather Warnings
          </h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-slate-500 text-sm py-4">Checking meteorology data...</div>
            ) : (
              alerts.map((al, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex gap-3 ${
                  al.level === 'danger' 
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
                    : al.level === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                }`}>
                  <AlertTriangle className={al.level === 'normal' ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'} size={20} />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wider">{al.type}</div>
                    <p className="text-xs leading-relaxed mt-1 text-slate-300">{al.msg}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Main content grid: Weather Overview & Precautions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weather Current details */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sun size={16} className="text-amber-400" /> Current Conditions
          </h3>
          
          {loading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div></div>
          ) : currentWeather ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 justify-center py-4 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                {getWeatherIcon(currentWeather.code)}
                <div>
                  <div className="text-3xl font-extrabold text-white">{currentWeather.temp.toFixed(1)}°C</div>
                  <div className="text-xs text-slate-400 mt-0.5">{getWeatherDesc(currentWeather.code)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
                  <Droplets className="text-sky-400" size={18} />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Humidity</div>
                    <div className="font-bold">{currentWeather.humidity}%</div>
                  </div>
                </div>
                
                <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
                  <Wind className="text-teal-400" size={18} />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Wind Speed</div>
                    <div className="font-bold">{currentWeather.wind} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 py-12 text-center text-sm">Failed to load weather.</div>
          )}
        </div>

        {/* Precautions Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Info size={16} className="text-emerald-400" /> Farming Precautions
          </h3>
          <ul className="space-y-3.5 text-sm text-slate-300">
            {precautions.map((pr, idx) => (
              <li key={idx} className="flex gap-3 items-start leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                <span>{pr}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Map & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Interactive Map */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <MapPin size={16} className="text-rose-400" /> Farm Location Map
          </h3>
          
          <div id="farm-map" style={{ height: '350px' }} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-950 text-sm">
              Loading Map Components...
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-400" /> 7-Day Forecast
          </h3>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-slate-500 py-12 text-center text-sm">Calculating forecast metrics...</div>
            ) : (
              forecast.map((f, idx) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs md:text-sm transition-all duration-300">
                  <div className="w-24">
                    <div className="font-bold text-slate-200">{f.day}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{f.date}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-28">
                    {getWeatherIcon(f.code)}
                    <span className="text-[11px] text-slate-400 leading-tight">{getWeatherDesc(f.code)}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-200">{f.maxTemp.toFixed(0)}° / <span className="text-slate-400 font-normal">{f.minTemp.toFixed(0)}°</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Rain: <span className="font-semibold text-slate-400">{f.rainProb}%</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
