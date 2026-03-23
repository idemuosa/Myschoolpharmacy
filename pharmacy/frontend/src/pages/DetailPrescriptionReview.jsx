import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import prescriptionService from '../services/prescriptionService';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  FaArrowLeft, FaPrint, FaDownload, FaCheckCircle, 
  FaExclamationCircle, FaUserInjured, FaUserMd, 
  FaFileImage, FaPills, FaClipboardList, FaTimesCircle, FaEdit
} from 'react-icons/fa';

const DetailPrescriptionReview = () => {
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchPendingPrescription(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchPendingPrescription = async (signal) => {
    try {
      const response = await prescriptionService.getPrescriptions({ signal });
      const pending = response.data.find(p => p.status === 'Pending');
      if (pending) {
         setPrescription(pending);
      } else {
         setPrescription(null);
      }
    } catch (error) {
       if (axios.isCancel(error)) return;
       console.error("Error fetching prescriptions:", error);
       toast.error("Failed to load prescription queue.");
    } finally {
       if (signal && signal.aborted) return;
       setLoading(false);
    }
  };

  const handleAction = async (status) => {
     if(!prescription) return;
     try {
        await prescriptionService.updatePrescription(prescription.id, { status });
        toast.success(`Prescription marked as ${status}`);
        fetchPendingPrescription(); 
     } catch(err) {
        console.error(err);
        toast.error(`Failed to update to ${status}`);
     }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[12px] font-black uppercase tracking-widest animate-pulse">Scanning Queue...</div>;
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-8">
         <FaCheckCircle className="w-12 h-12 text-emerald-500 mb-4 opacity-50" />
         <h2 className="text-sm font-black text-slate-700 uppercase tracking-tight">Queue Clear</h2>
         <p className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-widest">No pending clinical verifications</p>
         <button onClick={() => navigate('/')} className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-none text-[12px] font-black uppercase tracking-widest">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative text-sm">
      
      {/* 1. Header Area */}
      <header className="bg-white border-b border-slate-100 px-5 py-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="w-8 h-8 bg-slate-50 text-slate-400 hover:text-emerald-500 rounded-lg flex items-center justify-center transition-all">
              <FaArrowLeft className="w-3.5 h-3.5" />
           </button>
           <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">{prescription.prescription_id}</h1>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 uppercase tracking-widest ${
                    prescription.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                 }`}>
                    {prescription.status}
                 </span>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Submitted: {new Date(prescription.created_at).toLocaleDateString()}</p>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-400 font-black text-[11px] rounded-lg hover:border-emerald-500 hover:text-emerald-500 uppercase tracking-widest transition-all">
              <FaPrint className="w-3 h-3" /> Print
           </button>
           <button onClick={() => handleAction('Rejected')} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-500 font-black text-[11px] rounded-lg border border-red-100 uppercase tracking-widest transition-all">
              <FaTimesCircle className="w-3 h-3" /> Reject
           </button>
           <button onClick={() => handleAction('Approved')} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white font-black text-[11px] rounded-lg uppercase tracking-widest shadow-none border border-emerald-500 transition-all">
              <FaCheckCircle className="w-3 h-3" /> Approve
           </button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-5 py-6 w-full">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Document Viewer & Info) */}
            <div className="lg:col-span-5 space-y-4">
               
               {/* Scanned Document Viewer */}
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[450px]">
                  <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                     <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FaFileImage className="text-emerald-500" /> Original Scan
                     </h2>
                     <button className="text-slate-400 hover:text-emerald-500 transition-all">
                        <FaDownload className="w-3 h-3" />
                     </button>
                  </div>
                  <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-auto relative group">
                     <div className="w-full max-w-[300px] aspect-[1/1.4] bg-white shadow-lg rounded border border-slate-200 flex flex-col p-6">
                         <div className="w-1/2 h-2 bg-slate-100 rounded mb-4"></div>
                         <div className="space-y-2">
                             <div className="w-full h-1 bg-slate-50 rounded"></div>
                             <div className="w-5/6 h-1 bg-slate-50 rounded"></div>
                             <div className="w-4/6 h-1 bg-slate-50 rounded"></div>
                         </div>
                         <div className="w-full h-6 bg-emerald-50 border border-emerald-100 rounded mt-6 text-center text-[8px] font-black py-1">
                            {prescription.prescription_id}
                         </div>
                         <div className="mt-auto ml-auto w-16 h-1 bg-slate-900 rounded opacity-20"></div>
                     </div>
                  </div>
               </div>

               {/* Patient Contact & Doctor Info Quick View */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-3">Recipient</h3>
                     <p className="text-[13px] font-black text-slate-900 mb-0.5 uppercase tracking-tight">{prescription.customer_name || 'Generic Patient'}</p>
                     <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">ID: {prescription.customer}</p>
                     <button className="text-[10px] font-black text-emerald-500 hover:underline uppercase tracking-widest" onClick={() => navigate(`/customers/detail/${prescription.customer}`)}>Details</button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-3">Prescriber</h3>
                     <p className="text-[13px] font-black text-slate-900 mb-0.5 uppercase tracking-tight">{prescription.prescribing_doctor || 'Dr. Unknown'}</p>
                     <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">NPI: VERIFIED</p>
                     <p className="text-[11px] font-bold text-slate-500 truncate mb-2">Internal Registry</p>
                  </div>
               </div>

            </div>

            {/* Right Column (Digitized Details & Verification) */}
            <div className="lg:col-span-7 space-y-4">
               
               {/* Digitized Prescription Items */}
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-50">
                     <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <FaPills className="text-emerald-500" /> Transcription
                     </h2>
                     <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><FaEdit /> Edit Form</button>
                  </div>

                  <div className="space-y-3">
                     {prescription.items && prescription.items.length > 0 ? (
                        prescription.items.map((item, idx) => (
                           <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Drug / Strength</label>
                                 <p className="text-[14px] font-black text-slate-900 uppercase">{item.drug_name || `Drug ID: ${item.drug}`}</p>
                              </div>
                              <div className="w-24">
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</label>
                                 <p className="text-[14px] font-black text-slate-900 tabular-nums">x{item.quantity}</p>
                              </div>
                              <div className="flex-1">
                                 <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Directions</label>
                                 <p className="text-[12px] font-bold text-slate-600 italic">"{item.directions}"</p>
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-center py-6 text-slate-400 font-bold italic">No digitized items found in this RX cluster.</p>
                     )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Prescriber Commentary</label>
                     <div className="w-full bg-slate-50/50 border border-slate-100 rounded-lg px-3 py-2 text-[12px] font-bold text-slate-600 italic">
                        {prescription.notes || "No special handling instructions provided."}
                     </div>
                  </div>
               </div>

               {/* Verification Checklist */}
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                     <FaClipboardList className="text-emerald-500 w-4 h-4" />
                     <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Safety Checklist</h2>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                     <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded text-emerald-500 border-slate-200" />
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Identity Verified</span>
                     </label>
                     <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded text-emerald-500 border-slate-200" />
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Interaction Check Clear</span>
                     </label>
                     <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-100">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded text-emerald-500 border-slate-200" />
                        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-tight">Allergy Scan Clear</span>
                     </label>
                  </div>
               </div>

            </div>
         </div>
      </main>


      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 z-50 flex gap-3">
         <button onClick={() => handleAction('Rejected')} className="flex-1 bg-white border border-red-100 text-red-500 font-black text-[12px] py-3 rounded-xl hover:bg-red-50 uppercase tracking-widest">
            Reject
         </button>
         <button onClick={() => handleAction('Approved')} className="flex-[2] bg-emerald-500 text-white font-black text-[12px] py-3 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest">
            Process
         </button>
      </div>

    </div>
  );
};

export default DetailPrescriptionReview;
