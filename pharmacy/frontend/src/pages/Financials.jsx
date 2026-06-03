import React, { useState, useEffect } from 'react';
import expenseService from '../services/expenseService';
import exportService from '../services/exportService';
import { FaMoneyBill, FaChartLine, FaArrowDown, FaCalendarAlt, FaArrowLeft, FaShoppingCart, FaPills, FaFileExport } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Financials = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        balance: 0,
        pharmacy_revenue: 0,
        supermarket_revenue: 0,
        chart_data: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await expenseService.getFinancialSummary();
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching financial stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const exportData = [
            { Metric: 'Gross Revenue', Value: stats.total_revenue },
            { Metric: 'Total Expenses', Value: stats.total_expenses },
            { Metric: 'Net Profit', Value: stats.net_profit },
            { Metric: 'Operating Balance', Value: stats.balance },
            { Metric: 'Pharmacy Revenue', Value: stats.pharmacy_revenue },
            { Metric: 'Supermarket Revenue', Value: stats.supermarket_revenue },
        ];

        // Add monthly data if available
        stats.chart_data.forEach(d => {
            exportData.push({ Metric: `Revenue (${d.month})`, Value: d.revenue });
        });

        exportService.exportToCSV(exportData, 'financial_ledger');
    };

    // Simple path generator for SVG Chart
    const generatePath = (data) => {
        if (!data || data.length < 2) return "";
        const maxVal = Math.max(...data.map(d => d.revenue), 100);
        const width = 1000;
        const height = 200;
        const step = width / (data.length - 1);

        return data.map((d, i) => {
            const x = i * step;
            const y = height - (d.revenue / maxVal * height * 0.8) - 20;
            return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
        }).join(' ');
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <FaArrowLeft className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Financial Ledger</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Revenue, Expenses & Growth</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FaFileExport /> Export CSV
                    </button>
                    <button
                        onClick={fetchStats}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                        title="Refresh Data"
                    >
                        <FaCalendarAlt className="text-emerald-500" />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <FaChartLine size={48} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gross Revenue</span>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">${(stats?.total_revenue || 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">Active</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <FaArrowDown size={48} className="text-red-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Outgoings</span>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">${(stats?.total_expenses || 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase">Expenses</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <FaMoneyBill size={48} className="text-blue-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Net Earnings</span>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">${(stats?.net_profit || 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase">Net Margin</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                        <FaCalendarAlt size={48} className="text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Operating Balance</span>
                    <p className="text-2xl font-black text-slate-900 tabular-nums">${(stats?.balance || 0).toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">Settled</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revenue Trajectory</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly performance curve</p>
                        </div>
                    </div>

                    <div className="relative w-full h-[240px] mt-4">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : stats.chart_data.length > 1 ? (
                            <>
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                                    <defs>
                                        <linearGradient id="financialGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={generatePath(stats.chart_data)}
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d={`${generatePath(stats.chart_data)} L 1000,200 L 0,200 Z`}
                                        fill="url(#financialGradient)"
                                    />
                                </svg>
                                <div className="flex justify-between mt-4 px-2">
                                    {stats.chart_data.map((d, i) => (
                                        <span key={i} className="text-[10px] font-black text-slate-400 uppercase">{d.month}</span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 font-black uppercase italic tracking-widest">
                                Insufficient data for trend analysis
                            </div>
                        )}
                    </div>
                </div>

                {/* Breakdown */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Revenue Mix</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <FaPills className="text-emerald-500" />
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Pharmacy</span>
                                    </div>
                                    <span className="text-[12px] font-black text-slate-900">${stats.pharmacy_revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(stats.pharmacy_revenue / (stats.total_revenue || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <FaShoppingCart className="text-blue-500" />
                                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Supermarket</span>
                                    </div>
                                    <span className="text-[12px] font-black text-slate-900">${stats.supermarket_revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(stats.supermarket_revenue / (stats.total_revenue || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quick Insight</p>
                            <p className="text-[12px] font-bold text-slate-600 leading-relaxed">
                                {stats.pharmacy_revenue > stats.supermarket_revenue
                                    ? "Pharmacy division is currently your primary revenue driver, contributing the majority of gross earnings."
                                    : "Retail supermarket sales are leading your revenue streams this period."}
                            </p>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-100">
                        <h3 className="text-sm font-black uppercase tracking-tight mb-2">Profitability Index</h3>
                        <p className="text-2xl font-black mb-4">
                            {stats.total_revenue > 0 ? ((stats.net_profit / stats.total_revenue) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest leading-relaxed">
                            Your net margin represents the efficiency of your operations after all costs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Financials;
