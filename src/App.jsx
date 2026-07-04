import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Sprout, CloudSun, BookOpen, 
  DollarSign, MessageSquare, Settings as SettingsIcon, 
  Menu, X, Sparkles, MapPin 
} from 'lucide-react';
import './App.css';

import Dashboard from './components/Dashboard';
import CropRecommendation from './components/CropRecommendation';
import WeatherFarmLocation from './components/WeatherFarmLocation';
import GovernmentSchemes from './components/GovernmentSchemes';
import FinancePlanner from './components/FinancePlanner';
import AiAssistant from './components/AiAssistant';
import Settings from './components/Settings';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    state: 'Maharashtra',
    district: 'Pune',
    soil_type: 'Black Soil',
    water_availability: 'Moderate',
    gemini_api_key: ''
  });

  // Fetch Settings on Mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (err) {
        console.warn("Could not load settings from server, using local defaults.", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'crop-rec', label: 'Crop Recommendation', icon: <Sprout size={20} /> },
    { id: 'weather', label: 'Weather & Map', icon: <CloudSun size={20} /> },
    { id: 'schemes', label: 'Government Schemes', icon: <BookOpen size={20} /> },
    { id: 'finance', label: 'Finance Planner', icon: <DollarSign size={20} /> },
    { id: 'chat', label: 'AI Assistant', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const renderActivePage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard settings={settings} setPage={setPage} />;
      case 'crop-rec':
        return <CropRecommendation settings={settings} />;
      case 'weather':
        return <WeatherFarmLocation settings={settings} />;
      case 'schemes':
        return <GovernmentSchemes settings={settings} />;
      case 'finance':
        return <FinancePlanner settings={settings} />;
      case 'chat':
        return <AiAssistant />;
      case 'settings':
        return <Settings settings={settings} onSettingsUpdate={handleSettingsUpdate} />;
      default:
        return <Dashboard settings={settings} setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 antialiased selection:bg-emerald-500/20">
      
      {/* Mobile Top Navigation Header */}
      <header className="md:hidden glass-panel shrink-0 flex items-center justify-between px-6 py-4 sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles size={20} />
          </div>
          <span className="font-extrabold text-lg text-white">FarmGenie AI</span>
        </div>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-300 hover:text-emerald-400 p-2 rounded-lg transition-colors focus:outline-none"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 md:bg-slate-950/60 border-r border-slate-800/80 p-6 flex flex-col justify-between 
        transform md:translate-x-0 transition-transform duration-300 ease-in-out md:static shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="font-extrabold text-xl text-white">FarmGenie AI</span>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Smart Farm Advisor</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                    ${isActive 
                      ? 'bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 shadow-inner' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                    }
                  `}
                >
                  <span className={`transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-350'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile Box */}
        <div className="pt-6 border-t border-slate-850/80">
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-450 shrink-0">
              <MapPin size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Location</div>
              <div className="text-xs font-bold text-slate-300 truncate">{settings.district}, {settings.state}</div>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 px-6 py-8 md:p-10 max-w-7xl mx-auto w-full">
        {renderActivePage()}
      </main>

    </div>
  );
}
