import React, { useState, useEffect } from 'react';
import { DollarSign, Landmark, PiggyBank, Receipt, Settings as ConfigIcon, TrendingUp, Info } from 'lucide-react';

export default function FinancePlanner({ settings }) {
  const [landSize, setLandSize] = useState(1);
  const [seedCost, setSeedCost] = useState(2500);
  const [fertilizerCost, setFertilizerCost] = useState(3000);
  const [labourCost, setLabourCost] = useState(4000);
  const [waterCost, setWaterCost] = useState(1500);
  const [expectedYield, setExpectedYield] = useState(2.0); // tons per acre
  const [expectedSellingPrice, setExpectedSellingPrice] = useState(22000); // per ton

  // Calculated values
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [expectedRevenue, setExpectedRevenue] = useState(0);
  const [estimatedProfit, setEstimatedProfit] = useState(0);

  useEffect(() => {
    const costPerAcre = Number(seedCost) + Number(fertilizerCost) + Number(labourCost) + Number(waterCost);
    const investment = costPerAcre * Number(landSize);
    const revenue = Number(landSize) * Number(expectedYield) * Number(expectedSellingPrice);
    const profit = revenue - investment;

    setTotalInvestment(investment);
    setExpectedRevenue(revenue);
    setEstimatedProfit(profit);
  }, [landSize, seedCost, fertilizerCost, labourCost, waterCost, expectedYield, expectedSellingPrice]);

  // Percentages for visual progress bars
  const totalCostPerAcre = Number(seedCost) + Number(fertilizerCost) + Number(labourCost) + Number(waterCost);
  const getPercentage = (cost) => {
    if (totalCostPerAcre === 0) return 0;
    return ((cost / totalCostPerAcre) * 100).toFixed(0);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-emerald-400">Finance Planner</h1>
        <p className="text-slate-400 mt-1">Estimate your input costs, calculate project revenue, and check your net profit margins.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cost Input Form */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5 h-fit">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Receipt size={18} className="text-emerald-400" /> Input Costs & Parameters
          </h2>

          <div className="space-y-4 text-xs md:text-sm">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Land Size (Acres)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Seed Cost (₹ / Acre)</label>
              <input
                type="number"
                min="0"
                value={seedCost}
                onChange={(e) => setSeedCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Fertilizer & Pesticide Cost (₹ / Acre)</label>
              <input
                type="number"
                min="0"
                value={fertilizerCost}
                onChange={(e) => setFertilizerCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Labour Cost (₹ / Acre)</label>
              <input
                type="number"
                min="0"
                value={labourCost}
                onChange={(e) => setLabourCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Water & Irrigation Cost (₹ / Acre)</label>
              <input
                type="number"
                min="0"
                value={waterCost}
                onChange={(e) => setWaterCost(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Expected Yield (Tons / Acre)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={expectedYield}
                onChange={(e) => setExpectedYield(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Expected Selling Price (₹ / Ton)</label>
              <input
                type="number"
                min="0"
                value={expectedSellingPrice}
                onChange={(e) => setExpectedSellingPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Calculation Outputs & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Total Investment */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500">
                <Receipt size={64} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Investment</span>
                <div className="text-2xl font-extrabold text-white mt-1">₹{totalInvestment.toLocaleString()}</div>
                <div className="text-xs text-slate-450 mt-1">₹{(totalCostPerAcre).toLocaleString()} / acre</div>
              </div>
            </div>

            {/* Expected Revenue */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-sky-500">
                <Landmark size={64} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Revenue</span>
                <div className="text-2xl font-extrabold text-sky-400 mt-1">₹{expectedRevenue.toLocaleString()}</div>
                <div className="text-xs text-slate-450 mt-1">{(expectedYield * landSize).toFixed(1)} tons yield</div>
              </div>
            </div>

            {/* Estimated Net Profit */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 flex flex-col justify-between shadow-lg relative overflow-hidden bg-emerald-950/10">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400">
                <PiggyBank size={64} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimated Profit</span>
                <div className={`text-2xl font-extrabold mt-1 ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                  ₹{estimatedProfit.toLocaleString()}
                </div>
                <div className="text-xs text-slate-450 mt-1">
                  {estimatedProfit >= 0 ? (
                    <span className="text-emerald-500 font-semibold">
                      +{((estimatedProfit / (totalInvestment || 1)) * 100).toFixed(0)}% ROI
                    </span>
                  ) : (
                    <span className="text-rose-500">Loss Margin</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Cost Allocation Visual Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 flex items-center gap-2">
              <ConfigIcon size={16} className="text-emerald-400" /> Cost Allocation Breakdown
            </h3>
            
            <div className="space-y-4">
              {/* Seeds */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-350">Seeds cost ({getPercentage(seedCost)}%)</span>
                  <span className="text-slate-200">₹{(seedCost * landSize).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(seedCost)}%` }}></div>
                </div>
              </div>

              {/* Fertilizers */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-355">Fertilizers & Pesticides ({getPercentage(fertilizerCost)}%)</span>
                  <span className="text-slate-200">₹{(fertilizerCost * landSize).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(fertilizerCost)}%` }}></div>
                </div>
              </div>

              {/* Labor */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-355">Labour wages ({getPercentage(labourCost)}%)</span>
                  <span className="text-slate-200">₹{(labourCost * landSize).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(labourCost)}%` }}></div>
                </div>
              </div>

              {/* Water */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-355">Water & Irrigation ({getPercentage(waterCost)}%)</span>
                  <span className="text-slate-200">₹{(waterCost * landSize).toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(waterCost)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Advice card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex gap-4 text-sm text-slate-350">
            <Info className="text-emerald-400 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-slate-200">Financial Planning Tip</h4>
              <p className="leading-relaxed mt-1 text-xs">
                To maximize your net profit margins: (1) Consider investing in micro-irrigation systems (drip/sprinkler) which typically reduce water and fertilizer costs by 30-40% via precise fertigation. (2) Leverage collective bargaining by purchasing seeds and inputs through local farmer producer organizations (FPOs). (3) Check out the <span className="text-emerald-400 font-semibold">Government Schemes</span> section to apply for input subsidies.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
