import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';
import { 
  FaSearch, FaBell, FaEye, FaCheckCircle, FaFilePrescription, FaTimesCircle
} from 'react-icons/fa';

const PrescriptionManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionService.getPrescriptions();
      const data = response.data;
      setPrescriptions(data);
      if (data.length > 0) {
        setSelectedPrescription(data[0]);
      }
    } catch (error) {
       console.error("Error fetching prescriptions:", error);
    } finally {
       setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 text-orange-600';
      case 'Verified': return 'bg-emerald-50 text-emerald-600';
      case 'Rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-full gap-4 animate-in fade-in duration-500 text-sm">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <header className="p-5 border-b border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit">Rx Management</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prescription Verification Queue</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all relative">
                    <FaBell className="text-lg" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                 </button>
              </div>
            </div>

            <div className="relative w-full max-w-[600px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input 
                type="text" 
                placeholder="Search prescription database..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {['All', 'Pending', 'Verified', 'Rejected'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all border ${
                      activeFilter === filter 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                        : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-0 scrollbar-hide">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Serial ID</th>
                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Security</th>
                    <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                     <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-[12px]">Syncing...</td></tr>
                  ) : (
                    prescriptions
                      .filter(p => (p.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || p.prescription_id.toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter(p => activeFilter === 'All' || p.status === activeFilter)
                      .map((px) => (
                      <tr 
                        key={px.id} 
                        onClick={() => setSelectedPrescription(px)}
                        className={`hover:bg-slate-50 transition-all cursor-pointer group ${selectedPrescription?.id === px.id ? 'bg-emerald-50/50' : ''}`}
                      >
                        <td className="px-5 py-3 text-[12px] font-black text-slate-400 tabular-nums">
                          {new Date(px.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="text-[13px] font-black text-slate-900 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{px.customer_name || 'Generic'}</span>
                              <span className="text-[10px] font-bold text-slate-400 tracking-widest">MRN: {px.customer}</span>
                            </div>
                        </td>
                        <td className="px-5 py-3 font-black text-slate-900 tabular-nums tracking-widest text-[12px]">
                          {px.prescription_id}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(px.status)}`}>
                            {px.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-[11px] font-black text-emerald-500 hover:text-emerald-700 tracking-widest uppercase">
                            Open
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
          </div>
        </div>

        {/* Sidebar Review Panel */}
        <aside className="w-full xl:w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px] xl:h-auto animate-in slide-in-from-right-4 duration-500">
          {selectedPrescription ? (
            <div className="p-5 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg">
                  <FaFilePrescription />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedPrescription.prescription_id}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Verification</p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</p>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedPrescription.customer_name || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MD</p>
                      <p className="text-[12px] font-black text-slate-900 uppercase">{selectedPrescription.prescribing_doctor || 'N/A'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-[12px] font-black text-slate-900 tabular-nums">{new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                   </div>
                </div>

                 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Directive</p>
                   <p className="text-[12px] font-bold text-slate-600 leading-relaxed italic">
                     "{selectedPrescription.notes || "Standard issuance protocols apply."}"
                   </p>
                 </div>
 
                 <div className="space-y-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Prescribed Items</p>
                   <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                      {selectedPrescription.items && selectedPrescription.items.length > 0 ? (
                        selectedPrescription.items.map((item, idx) => (
                          <div key={idx} className="bg-emerald-50/30 p-2 rounded-lg border border-emerald-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[12px] font-black text-slate-900 uppercase">{item.drug_name || `Drug #${item.drug}`}</span>
                              <span className="text-[10px] font-bold text-slate-500 italic">{item.directions}</span>
                            </div>
                            <span className="text-[12px] font-black text-emerald-600 shrink-0">x{item.quantity}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 italic px-1">No items listed</p>
                      )}
                   </div>
                 </div>
               </div>

              <div className="space-y-2 pt-6 mt-auto border-t border-slate-100">
                <button className="w-full btn-pharmacy-primary py-3 text-xs uppercase tracking-widest shadow-none">
                  <FaCheckCircle className="mr-2" /> Verify
                </button>
                
                <button className="w-full btn-pharmacy py-2 text-[11px] uppercase tracking-widest text-red-500 border-red-50 shadow-none">
                  <FaTimesCircle className="mr-2" /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
               <FaFilePrescription size={48} className="mb-3" />
               <p className="text-sm font-black uppercase tracking-tight">Select Entry</p>
            </div>
          )}
        </aside>
    </div>
  );
};

export default PrescriptionManagement;
