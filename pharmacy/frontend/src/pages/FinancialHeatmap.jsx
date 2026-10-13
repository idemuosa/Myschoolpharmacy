import React, { useState } from 'react';
import {
  FaChartLine, FaChartPie, FaChartBar, FaShieldAlt,
  FaArrowUp, FaLayerGroup, FaUserCheck
} from 'react-icons/fa';

export default function FinancialHeatmap() {
  const [timeframe, setTimeframe] = useState('month');

  const categories = [
    { name: 'Cardiovascular', grossSales: 48200, cost: 26100, netMargin: 45.8, velocity: 'High', markup: '1.85x' },
    { name: 'Antibiotics & Anti-Infectives', grossSales: 39100, cost: 20500, netMargin: 47.5, velocity: 'High', markup: '1.90x' },
    { name: 'Endocrine / Diabetes', grossSales: 52400, cost: 34200, netMargin: 34.7, velocity: 'Very High', markup: '1.53x' },
    { name: 'OTC & Wellness', grossSales: 28900, cost: 11200, netMargin: 61.2, velocity: 'Medium', markup: '2.58x' },
    { name: 'Controlled Substances (Schedule II-IV)', grossSales: 18400, cost: 10100, netMargin: 45.1, velocity: 'Low', markup: '1.82x' }
  ];

  const shiftAudits = [
    { shift: 'Morning Shift (08:00 - 16:00)', cashier: 'Sarah Jenkins', totalRevenue: 14820.50, transactions: 142, cashVariance: '+$2.50', status: 'Balanced' },
    { shift: 'Evening Shift (16:00 - 00:00)', cashier: 'David Miller', totalRevenue: 18940.00, transactions: 188, cashVariance: '$0.00', status: 'Balanced' },
    { shift: 'Night Shift (00:00 - 08:00)', cashier: 'Alex Rivera', totalRevenue: 6210.25, transactions: 45, cashVariance: '-$1.20', status: 'Minor Variance' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-emerald-500/30 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            Pharmacy Business Intelligence & Profit Engine
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Heatmap & Margin Analytics</h1>
          <p className="text-teal-100 mt-1">Category profitability margins, fast/slow SKU velocity & shift cashier audit logs</p>
        </div>
        <div className="flex items-center gap-2">
          {['week', 'month', 'quarter'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition ${
                timeframe === tf ? 'bg-white text-teal-900 shadow-md' : 'bg-teal-800/60 text-white hover:bg-teal-800'
              }`}
            >
              This {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Gross Revenue</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-slate-800">$187,000.75</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <FaArrowUp /> +14.2%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">vs. previous period</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Average Gross Profit Margin</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-teal-700">46.8%</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <FaArrowUp /> +2.1%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Above healthcare benchmark (38%)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Top Gross Profit SKU</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-lg font-extrabold text-slate-800 truncate">Empagliflozin 10mg</h3>
            <span className="text-xs font-bold text-teal-600">$12.4k Profit</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Endocrine Category Leader</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Cashier Audit Balance Rate</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl font-extrabold text-emerald-600">99.8%</h3>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <FaShieldAlt /> Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">3 Shifts Audited Daily</p>
        </div>
      </div>

      {/* Category Profitability Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaChartPie className="text-teal-600" /> Drug Category Profitability Heatmap
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <th className="p-4">Drug Category</th>
                <th className="p-4">Gross Revenue</th>
                <th className="p-4">Cost of Goods Sold (COGS)</th>
                <th className="p-4">Net Profit Margin</th>
                <th className="p-4">SKU Inventory Velocity</th>
                <th className="p-4 text-right">Avg Markup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm font-medium">
              {categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-bold text-slate-800">{cat.name}</td>
                  <td className="p-4 text-slate-800">${cat.grossSales.toLocaleString()}</td>
                  <td className="p-4 text-slate-500">${cat.cost.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2.5 rounded-full"
                          style={{ width: `${cat.netMargin}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-emerald-700">{cat.netMargin}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-teal-50 text-teal-800 text-xs px-2.5 py-1 rounded-full font-bold border border-teal-200">
                      {cat.velocity}
                    </span>
                  </td>
                  <td className="p-4 text-right font-extrabold text-slate-800">{cat.markup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashier Shift Audit Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FaUserCheck className="text-indigo-600" /> Shift Revenue Breakdown & Cashier Audit Trail
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftAudits.map((shift, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase block">{shift.shift}</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-800">{shift.cashier}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {shift.status}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-600">
                <p>Shift Sales Total: <strong className="text-slate-800">${shift.totalRevenue.toLocaleString()}</strong></p>
                <p>Transactions Completed: <strong className="text-slate-800">{shift.transactions}</strong></p>
                <p>Drawer Till Variance: <strong className="text-slate-800">{shift.cashVariance}</strong></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
