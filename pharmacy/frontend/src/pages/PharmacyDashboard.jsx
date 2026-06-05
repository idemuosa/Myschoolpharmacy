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
  FaShoppingCart, FaHistory, FaTv, FaUndo
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

  const fetchData = async (signal) => {
    try {
      setLoading(true);
      const [statsRes, drugRes, scriptsRes, customerRes, settingsRes, financialRes, activityRes] = await Promise.all([
        reportService.getDashboardStats({ signal }),
        drugService.getDrugs({ signal }),
        prescriptionService.getPrescriptions({ signal }),
        customerService.getCustomers({ signal }),
        settingsService.getSettings({ signal }),
        axios.get(`${api.defaults.baseURL}expenses/financial-summary/`, { signal }),
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
            let frequency = 1;
            const dir = (item.directions || "").toLowerCase();
            if (dir.includes('x3')) frequency = 3;
            else if (dir.includes('x2')) frequency = 2;

            const daysSupply = Math.floor((item.quantity || 0) / frequency);
            if (daysSupply > 0 && daysSupply < 100) {
                const refillDate = new Date(rx.created_at);
                refillDate.setDate(refillDate.getDate() + daysSupply);
                const diff = (refillDate - today) / (1000 * 60 * 60 * 24);
                if (diff >= -2 && diff <= 7) {
                    reminders.push({ patient: rx.customer_name || 'Patient', drug: item.drug_name, date: refillDate, status: diff < 0 ? 'Overdue' : 'Due Soon' });
                }
            }
          });
        }
      });
      setRefillReminders(reminders.slice(0, 5));

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
        toast.success(`ALERT: New Prescription Received!`, { icon: '🔔' });
        fetchData();
    });

    socket.on('stock_updated', () => fetchData());

    return () => {
        controller.abort();
        socket.off('alert_new_prescription');
        socket.off('stock_updated');
    };
  }, []);

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
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
          />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <FaCalendarAlt className="text-emerald-500 text-sm" />
            <span className="text-[13px] font-black text-emerald-800 uppercase tracking-tight">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <NotificationCenter />

          <button onClick={() => fetchData()} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:rotate-180 duration-500"><FaUndo /></button>
          <button onClick={() => window.open('/#/display', '_blank')} className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all"><FaTv /></button>

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

         <div className="lg:col-span-8 space-y-4">
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

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase">Revenue Mix</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Pharmacy</span>
                       <span className="text-[12px] font-black text-emerald-500">${financials.pharmacy_revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(financials.pharmacy_revenue / (financials.total_revenue || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">Supermarket</span>
                       <span className="text-[12px] font-black text-indigo-500">${financials.supermarket_revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(financials.supermarket_revenue / (financials.total_revenue || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Low Stock TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between relative z-10">
                  <h3 className="text-xs font-black text-slate-900 uppercase">Stock Alerts</h3>
                  <button onClick={() => navigate('/inventory')} className="text-[11px] font-black text-emerald-500 uppercase">Full Audit</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50/50">
                        <tr>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase">Medication</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase text-center">In Vault</th>
                           <th className="px-5 py-2 text-[11px] font-black text-slate-400 uppercase text-center">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {lowStockDrugs.map(drug => (
                           <tr key={drug.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3 font-black text-slate-900 uppercase text-[12px]">{drug.name}</td>
                              <td className="px-5 py-3 text-center text-red-600 font-black">{drug.stock}</td>
                              <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase">Reorder</span></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Right Side */}
         <div className="lg:col-span-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-emerald-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-emerald-700 transition-all shadow-lg" onClick={() => navigate('/pos')}>
                  <FaPlus className="text-white mb-2" />
                  <p className="text-[13px] font-black text-white uppercase">New Sale</p>
               </div>
               <div className="bg-blue-600 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-blue-700 transition-all shadow-lg" onClick={() => navigate('/customers')}>
                  <FaFilePrescription className="text-white mb-2" />
                  <p className="text-[13px] font-black text-white uppercase">Prescribe</p>
               </div>
            </div>

               <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase">End of Shift</h3>
                  <button onClick={async () => {
                      try {
                        const res = await axios.get(`${api.defaults.baseURL}reports/z-report/`);
                        const s = res.data;
                        const exportData = [{
                            'Date': new Date().toLocaleDateString(),
                            'Total Sales': s.total_sales,
                            'Gross Revenue': s.gross_revenue,
                            'Cash': s.cash,
                            'POS': s.pos,
                            'Transfer': s.transfer,
                            'Credit': s.credit
                        }];
                        exportService.exportToCSV(exportData, `Z_REPORT_${new Date().toISOString().split('T')[0]}`);
                        toast.success("Z-Report Downloaded");
                      } catch (e) {
                        toast.error("Failed to generate report");
                      }
                  }} className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg">Download Z-Report</button>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase">Final reconciliation for daily cash, pos, and transfer totals.</p>
            </div>


            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4">Audit Feed</h3>
               <div className="space-y-4">
                  {recentLogs.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 bg-emerald-500"></div>
                      <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase">{log.action}</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-tight">{log.description}</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => navigate('/audit-logs')} className="w-full py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase rounded-lg">View All Logs</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
