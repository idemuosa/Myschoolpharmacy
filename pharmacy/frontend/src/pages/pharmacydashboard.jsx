import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import { socket } from '../services/socket';
import reportService from '../services/reportService';
import drugService from '../services/drugService';
import settingsService from '../services/settingsService';
import customerService from '../services/customerService';
import prescriptionService from '../services/prescriptionService';
import activityService from '../services/activityService';
import posService from '../services/posService';
import exportService from '../services/exportService';
import toast from 'react-hot-toast';
import NotificationCenter from '../components/NotificationCenter';
import {
  FaCalendarAlt, FaMoneyBill, FaFilePrescription, FaExclamationTriangle, FaUsers,
  FaThLarge, FaCashRegister, FaBox, FaAddressCard, 
  FaBriefcaseMedical, FaChartLine, FaCog, FaPlus, FaArrowRight, FaSearch, FaBell,
  FaShoppingCart, FaHistory
} from 'react-icons/fa';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    scripts: 0,
    lowStock: 0,
    customers: 0
  });
  const [lowStockDrugs, setLowStockDrugs] = useState([]);
  const [expiringDrugs, setExpiringDrugs] = useState([]);
  const [refillReminders, setRefillReminders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [financials, setFinancials] = useState({
    total_revenue: 0,
    total_expenses: 0,
    net_profit: 0,
    pharmacy_revenue: 0,
    supermarket_revenue: 0,
    chart_data: []
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ shop_name: 'pharmacylogo', location: "St. Mary's" });

  const handleZReport = async () => {
    try {
      setLoading(true);
      const res = await posService.getSales();
      const allSales = res.data?.results || res.data || [];
      const today = new Date().toISOString().split('T')[0];
      const todaySales = allSales.filter(s => s.created_at.startsWith(today));

      const summary = {
        date: today,
        totalSales: todaySales.length,
        grossRevenue: todaySales.reduce((acc, s) => acc + parseFloat(s.total_amount), 0),
        cashSales: todaySales.filter(s => s.payment_method.includes('Cash')).reduce((acc, s) => acc + parseFloat(s.total_amount), 0),
        cardSales: todaySales.filter(s => s.payment_method.includes('Card')).reduce((acc, s) => acc + parseFloat(s.total_amount), 0),
        otherSales: todaySales.filter(s => s.payment_method.includes('Transfer') || s.payment_method.includes('Split')).reduce((acc, s) => acc + parseFloat(s.total_amount), 0),
      };

      const exportData = [{
        'Report Date': summary.date,
        'Total Transactions': summary.totalSales,
        'Gross Revenue': summary.grossRevenue,
        'Cash in Drawer': summary.cashSales,
        'Card Payments': summary.cardSales,
        'Other (Split/Transfer)': summary.otherSales
      }];

      exportService.exportToCSV(exportData, `Z_REPORT_${today}`);
      toast.success("Z-Report generated and downloaded.");
    } catch (err) {
      toast.error("Failed to generate Z-Report");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (signal) => {
    try {
      setLoading(true);
      const [statsRes, drugRes, scriptsRes, customerRes, settingsRes, financialRes, activityRes] = await Promise.all([
        reportService.getDashboardStats({ signal }),
        drugService.getDrugs({ signal }),
        prescriptionService.getPrescriptions({ signal }),
        customerService.getCustomers({ signal }),
        settingsService.getSettings({ signal }),
        axios.get(`${api.defaults.baseURL}/expenses/financial-summary/`, { signal }),
        activityService.getLogs({ signal })
      ]);

      if (settingsRes.data && settingsRes.data.length > 0) {
        setSettings(settingsRes.data[0]);
      }

      if (financialRes.data) {
        setFinancials(financialRes.data);
      }

      if (activityRes.data) {
        setRecentLogs(Array.isArray(activityRes.data.results) ? activityRes.data.results.slice(0, 5) : activityRes.data.slice(0, 5));
      }

      const data = statsRes.data || {};
      const allDrugs = drugRes.data?.results || drugRes.data || [];
      const lowStock = Array.isArray(allDrugs) ? allDrugs.filter(d => d.total_stock <= (d.reorder_level || 0)) : [];

      // Calculate expiring soon (next 60 days)
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      const expiring = [];
      allDrugs.forEach(drug => {
        if (drug.batches) {
          drug.batches.forEach(batch => {
            const expDate = new Date(batch.expiry_date);
            if (expDate <= sixtyDaysFromNow && expDate >= new Date() && batch.quantity > 0) {
              expiring.push({ ...drug, batch_number: batch.batch_number, expiry_date: batch.expiry_date, batch_qty: batch.quantity });
            }
          });
        }
      });

      setLowStockDrugs(lowStock.slice(0, 5));
      setExpiringDrugs(expiring.slice(0, 5));

      const scripts = scriptsRes.data?.results || scriptsRes.data || [];
      const customers = customerRes.data?.results || customerRes.data || [];

      setStats({
        revenue: data.total_revenue || 0,
        scripts: Array.isArray(scripts) ? scripts.filter(p => p.status === 'Pending').length : 0,
        lowStock: lowStock.length,
        customers: Array.isArray(customers) ? customers.length : 0
      });

      // Calculate Refill Reminders
      const reminders = [];
      const today = new Date();
      scripts.filter(rx => rx.status === 'Completed').forEach(rx => {
        if (rx.items) {
          rx.items.forEach(item => {
            // Very simple heuristic: try to find a number in directions like "1x3 daily" or "once daily"
            let frequency = 1;
            const dir = (item.directions || "").toLowerCase();
            if (dir.includes('x3') || dir.includes('three times')) frequency = 3;
            else if (dir.includes('x2') || dir.includes('twice')) frequency = 2;
            else if (dir.includes('x4')) frequency = 4;

            const daysSupply = Math.floor((item.quantity || 0) / frequency);
            if (daysSupply > 0 && daysSupply < 100) {
                const refillDate = new Date(rx.created_at);
                refillDate.setDate(refillDate.getDate() + daysSupply);

                // If refill is in the next 7 days
                const diff = (refillDate - today) / (1000 * 60 * 60 * 24);
                if (diff >= -2 && diff <= 7) {
                    reminders.push({
                        patient: rx.customer_name || 'Patient',
                        drug: item.drug_name,
                        date: refillDate,
                        status: diff < 0 ? 'Overdue' : 'Due Soon'
                    });
                }
            }
          });
        }
      });
      setRefillReminders(reminders.slice(0, 5).sort((a,b) => a.date - b.date));

      // Calculate Top Products
      try {
        const salesRes = await posService.getSales({ signal });
        const allSales = salesRes.data?.results || salesRes.data || [];
        const productMap = {};
        allSales.forEach(sale => {
            if (sale.items) {
                sale.items.forEach(item => {
                    const name = item.drug_name || 'Unknown';
                    productMap[name] = (productMap[name] || 0) + parseInt(item.quantity);
                });
            }
        });
        const sorted = Object.entries(productMap)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);
        setTopProducts(sorted);
      } catch (err) { console.error("Top products calc failed", err); }

    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Dashboard data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    socket.on('alert_new_prescription', (data) => {
        toast.success(`ALERT: New Prescription Received! ID: ${data.prescriptionId}`, {
            duration: 6000,
            icon: '🔔',
        });
        fetchData();
    });

    socket.on('stock_updated', (data) => {
        console.log('Stock updated event received:', data);
        fetchData(); // Refresh stock levels on dashboard
    });

    return () => {
        controller.abort();
        socket.off('alert_new_prescription');
        socket.off('stock_updated');
    };
  }, []);

  const modules = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/', desc: 'Real-time metrics.' },
    { name: 'POS Terminal', icon: <FaCashRegister />, path: '/pos', desc: 'Efficiency & payments.' },
    { name: 'Supermarket', icon: <FaShoppingCart />, path: '/supermarket', desc: 'Retail Hub.' },
    { name: 'Inventory', icon: <FaBox />, path: '/inventory', desc: 'Stock control.' },
    { name: 'Patients', icon: <FaAddressCard />, path: '/customers', desc: 'History.' },
    { name: 'Prescriptions', icon: <FaBriefcaseMedical />, path: '/prescriptions/review', desc: 'E-scripts.' },
    { name: 'Reports', icon: <FaChartLine />, path: '/reports/sales', desc: 'Audits.' },
    { name: 'Staff List', icon: <FaUsers />, path: '/staff', desc: 'Access levels.' },
    { name: 'Settings', icon: <FaCog />, path: '/settings', desc: 'Integrations.' }
  ];

  // For the grid display below, we'll use a subset or update the count

  return (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-hidden text-sm">
      
      {/* Search Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <img src="https://images.unsplash.com/photo-1587854685352-c8462d18c962?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative w-full max-w-[600px] z-10">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input 
            type="text" 
            placeholder="Search medications, transactions, or patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                // Determine where to redirect based on search term
                // Simple logic: if it's a number/id-like, maybe sales, else inventory
                if (searchTerm.startsWith('TX-') || searchTerm.startsWith('TX')) {
                  navigate('/reports/sales');
                } else {
                  navigate(`/inventory?search=${encodeURIComponent(searchTerm)}`);
                }
              }
            }}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-300"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <FaCalendarAlt className="text-emerald-500 text-sm" />
            <span className="text-[13px] font-black text-emerald-800 uppercase tracking-tight">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <NotificationCenter />

          <button
            onClick={() => fetchData()}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:rotate-180 duration-500"
          >
            <FaUndo className="text-sm" />
          </button>

          <div className="group relative flex items-center gap-2 bg-white pl-1 pr-3 py-1 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer" onClick={() => navigate('/settings')}>
            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-200">A</div>
            <div>
              <p className="text-[13px] font-black text-slate-900 leading-none">Admin Panel</p>
              <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">{settings.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
         
         {/* Left Side: Stats & Low Stock Table */}
         <div className="lg:col-span-8 space-y-4">
            
            {/* KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm"><FaMoneyBill /></div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Revenue</p>
                    <p className="text-sm font-black text-slate-900 tabular-nums">${financials.total_revenue.toLocaleString()}</p>
                  </div>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm"><FaChartLine /></div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Net Profit</p>
                    <p className="text-sm font-black text-emerald-600 tabular-nums">${financials.net_profit.toLocaleString()}</p>
                  </div>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 border-l-2 border-l-orange-500">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm"><FaExclamationTriangle /></div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Critical</p>
                    <p className="text-sm font-black text-orange-600 tabular-nums">{stats.lowStock}</p>
                  </div>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm"><FaUsers /></div>
                  <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Patients</p>
                    <p className="text-sm font-black text-slate-900 tabular-nums">{stats.customers}</p>
                  </div>
               </div>
            </div>

            {/* Revenue Trend Chart (CSS Only) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Revenue Trend</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Growth</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Pharmacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Supermarket</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between h-32 gap-2 px-2">
                {financials.chart_data && financials.chart_data.length > 0 ? (
                  financials.chart_data.map((data, index) => {
                    const maxVal = Math.max(...financials.chart_data.map(d => d.revenue), 100);
                    const height = (data.revenue / maxVal) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div
                          className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all rounded-t-lg relative"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            ${data.revenue.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{data.month}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-black uppercase text-[10px] tracking-widest">
                    Insufficient Data for Trends
                  </div>
                )}
              </div>
            </div>

            {/* Expiring Soon TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
               <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between relative z-10">
                  <div>
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight text-orange-600">Expiry Watchlist</h3>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Next 60 Days</p>
                  </div>
                  <button onClick={() => navigate('/inventory')} className="text-[11px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600">View All</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50">
                        <tr>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Batch</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Expiry</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loading ? (
                           <tr><td colSpan="3" className="py-6 text-center text-slate-400 animate-pulse uppercase text-[10px]">Checking Dates...</td></tr>
                        ) : expiringDrugs.length === 0 ? (
                           <tr><td colSpan="3" className="py-6 text-center text-emerald-500 font-black uppercase tracking-widest text-[10px]">No Immediate Expiries</td></tr>
                        ) : (
                           expiringDrugs.map((drug, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-5 py-2">
                                    <p className="text-[12px] font-black text-slate-900 uppercase">{drug.name}</p>
                                 </td>
                                 <td className="px-5 py-2 text-center text-[10px] font-bold text-slate-500">{drug.batch_number}</td>
                                 <td className="px-5 py-2 text-center">
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-black uppercase tracking-tighter">
                                        {new Date(drug.expiry_date).toLocaleDateString()}
                                    </span>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Low Stock DRUGS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                  <img src="https://images.unsplash.com/photo-1587854685352-c8462d18c962?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
               </div>
               <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between relative z-10">
                  <div>
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Stock Replenishment</h3>
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inventory Alert</p>
                  </div>
                  <button onClick={() => navigate('/inventory')} className="text-[11px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600">Full Audit</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50">
                        <tr>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">In Vault</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loading ? (
                           <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Scanning...</td></tr>
                        ) : lowStockDrugs.length === 0 ? (
                           <tr><td colSpan="4" className="py-10 text-center text-emerald-500 font-black uppercase tracking-widest text-[12px]">All Stocks Secure</td></tr>
                        ) : (
                           lowStockDrugs.map(drug => (
                              <tr key={drug.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="px-5 py-3">
                                    <p className="text-[13px] font-black text-slate-900 group-hover:text-emerald-600 uppercase tracking-tight">{drug.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">{drug.generic_name}</p>
                                 </td>
                                 <td className="px-5 py-3">
                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-black uppercase">{drug.category}</span>
                                 </td>
                                 <td className="px-5 py-3 text-center">
                                    <span className="text-[13px] font-black text-red-600 tabular-nums">{drug.stock}</span>
                                 </td>
                                 <td className="px-5 py-3 text-center">
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase">Reorder</span>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

         </div>

         {/* Right Side: Quick Links & Actions */}
         <div className="lg:col-span-4 space-y-4">
            
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-emerald-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-emerald-700 transition-all shadow-lg" onClick={() => navigate('/pos')}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                     <FaPlus />
                  </div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight">New Sale</p>
               </div>
               <div className="bg-blue-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-blue-700 transition-all shadow-lg" onClick={() => navigate('/customers')}>
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center text-lg mb-2 shadow-sm group-hover:scale-110 transition-transform">
                     <FaFilePrescription />
                  </div>
                  <p className="text-[13px] font-black text-white uppercase tracking-tight">Prescribe</p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">End of Shift</h3>
                  <button
                    onClick={handleZReport}
                    className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black transition-all"
                  >
                    Generate Z-Report
                  </button>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                  Calculates total cash, card, and digital payments since 12:00 AM for reconciliation.
               </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Refill Reminders</h3>
                  <FaBell className="text-emerald-500 text-sm animate-bounce" />
               </div>
               <div className="space-y-3">
                  {refillReminders.length > 0 ? (
                    refillReminders.map((rem, i) => (
                      <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative group overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${rem.status === 'Overdue' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <div className="flex justify-between items-start">
                            <p className="text-[12px] font-black text-slate-900 uppercase truncate">{rem.patient}</p>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${rem.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {rem.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{rem.drug}</p>
                        <p className="text-[9px] font-black text-slate-400 mt-1 italic">{rem.date.toLocaleDateString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] font-black text-slate-300 uppercase text-center py-4">No pending refills</p>
                  )}
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Feed</h3>
                  <FaHistory className="text-slate-300 text-sm" />
               </div>
               <div className="space-y-4">
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log, i) => (
                      <div key={i} className="flex gap-3 relative group">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full mt-1.5 z-10 ${
                            log.action.includes('Sale') ? 'bg-emerald-500' :
                            log.action.includes('Return') ? 'bg-red-500' : 'bg-blue-500'
                          }`}></div>
                          {i !== recentLogs.length - 1 && <div className="w-0.5 h-full bg-slate-50 absolute top-3"></div>}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{log.action}</p>
                          <p className="text-[10px] font-bold text-slate-400 leading-tight">{log.description}</p>
                          <span className="text-[9px] font-black text-slate-300 uppercase mt-1 block">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] font-black text-slate-300 uppercase text-center py-4">No recent activity logged</p>
                  )}
                  <button onClick={() => navigate('/audit-logs')} className="w-full py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-lg hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
                    View Full History
                  </button>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Inventory Velocity</h3>
               <div className="space-y-4">
                  {topProducts.length > 0 ? topProducts.map((p, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[12px] font-black text-slate-900 uppercase">{p.name}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase">{p.qty} Sold</span>
                        </div>
                        <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}></div>
                        </div>
                      </div>
                  )) : (
                    <p className="text-[10px] font-black text-slate-300 text-center uppercase py-2">No sales data yet</p>
                  )}
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Department Revenue</h3>
               <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Pharmacy</span>
                       <span className="text-[12px] font-black text-emerald-500">${financials.pharmacy_revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(financials.pharmacy_revenue / (financials.total_revenue || 1)) * 100}%` }}
                       ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Supermarket</span>
                       <span className="text-[12px] font-black text-indigo-500">${financials.supermarket_revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(financials.supermarket_revenue / (financials.total_revenue || 1)) * 100}%` }}
                       ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                     <span className="text-[12px] font-black text-slate-400 uppercase tracking-tight">Total Sales</span>
                     <span className="text-[12px] font-black text-slate-900">{financials.sales_count} Transactions</span>
                  </div>
               </div>
            </div>

         </div>

      </div>

    </div>
  );
};

export default PharmacyDashboard;
