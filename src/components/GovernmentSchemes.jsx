import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, Calendar, FileText, CheckCircle, Award } from 'lucide-react';

export default function GovernmentSchemes({ settings }) {
  const [schemes, setSchemes] = useState([]);
  const [selectedState, setSelectedState] = useState('National');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const statesList = [
    "National", "Andhra Pradesh", "Gujarat", "Karnataka", "Maharashtra", "Punjab", "Telangana"
  ];

  // Set default state filter from settings
  useEffect(() => {
    if (settings && settings.state) {
      setSelectedState(settings.state);
    }
  }, [settings]);

  // Fetch schemes based on state filter
  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/schemes?state=${selectedState}`);
        if (response.ok) {
          const data = await response.json();
          setSchemes(data);
        }
      } catch (err) {
        console.error("Schemes fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [selectedState]);

  // Filter schemes based on search query
  const filteredSchemes = schemes.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Government Schemes</h1>
          <p className="text-slate-400 mt-1">Explore and filter state and national welfare schemes designed to support farming operations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search schemes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm w-full sm:w-64 transition-all"
            />
          </div>

          {/* State filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm w-full transition-all"
            >
              {statesList.map(st => (
                <option key={st} value={st}>{st === "National" ? "National Schemes" : st}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Querying schemes database...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center shadow-xl border border-slate-800/80">
          <BookOpen className="text-slate-600 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-300">No Schemes Found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">We couldn't find any schemes matching your search or selected state. Try expanding the state filter or modifying search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSchemes.map((sc) => {
            const isExpanded = expandedId === sc.id;
            return (
              <div 
                key={sc.id} 
                className={`glass-panel rounded-2xl p-6 border transition-all duration-300 shadow-xl ${
                  isExpanded ? 'border-emerald-500/30 ring-1 ring-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-2 inline-block">
                      {sc.state}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-snug">{sc.name}</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={sc.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold bg-slate-900 border border-slate-750 hover:bg-slate-800 hover:border-slate-650 text-slate-300 hover:text-emerald-400 px-4.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
                    >
                      Official Portal <ExternalLink size={12} />
                    </a>
                    
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                      className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 px-4.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10"
                    >
                      {isExpanded ? 'Show Less' : 'View Details'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-400 text-sm leading-relaxed">{sc.description}</p>
                  
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Award size={14} className="text-emerald-400" /> Key Benefits
                      </div>
                      <div className="text-slate-300 font-semibold leading-relaxed">{sc.benefits}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle size={14} className="text-sky-400" /> Eligibility Criteria
                      </div>
                      <div className="text-slate-300 leading-relaxed font-semibold">{sc.eligibility}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t border-slate-850 animate-fade-in text-xs md:text-sm">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                          <FileText size={14} className="text-purple-400" /> Required Documents
                        </h4>
                        <p className="text-slate-300 leading-relaxed bg-slate-900/20 p-3 rounded-lg border border-slate-850">
                          {sc.required_documents}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-850 flex items-center gap-2">
                          <Calendar className="text-emerald-400" size={16} />
                          <div>
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">Start Date</div>
                            <div className="text-xs font-bold text-slate-300 mt-0.5">{sc.start_date}</div>
                          </div>
                        </div>
                        <div className="bg-slate-900/20 p-3 rounded-lg border border-slate-850 flex items-center gap-2">
                          <Calendar className="text-rose-400" size={16} />
                          <div>
                            <div className="text-[10px] text-slate-500 font-semibold uppercase">End Date</div>
                            <div className="text-xs font-bold text-slate-300 mt-0.5">{sc.end_date}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
