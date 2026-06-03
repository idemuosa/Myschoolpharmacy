import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import api from '../services/api';
import { 
  FaArrowLeft, FaUserCircle, FaBriefcaseMedical, 
  FaHistory, FaNotesMedical, FaCalendarPlus, FaPlus, FaTrash, FaCapsules,
  FaFilePrescription, FaClipboardList, FaStethoscope, FaMicroscope,
  FaHeartbeat, FaExchangeAlt, FaDoorOpen, FaShoppingCart, FaPrescriptionBottleAlt
} from 'react-icons/fa';
import drugService from '../services/drugService';
import prescriptionService from '../services/prescriptionService';
import posService from '../services/posService';
import toast from 'react-hot-toast';

const PatientPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drugs, setDrugs] = useState([]);
    const [prescriptionItems, setPrescriptionItems] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [isPrescribing, setIsPrescribing] = useState(false);

    useEffect(() => {
        fetchPatientData();
        fetchDrugs();
        fetchCombinedHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchCombinedHistory = async () => {
        try {
            const [salesRes, rxRes] = await Promise.all([
                posService.getSales(),
                prescriptionService.getPrescriptions()
            ]);

            const allSales = salesRes.data?.results || salesRes.data || [];
            const allRx = rxRes.data?.results || rxRes.data || [];

            const patientSales = Array.isArray(allSales) 
                ? allSales.filter(s => s.customer === parseInt(id))
                : [];

            const patientRx = Array.isArray(allRx)
                ? allRx.filter(p => p.customer === parseInt(id))
                : [];

            // Combine and sort by date
            const combined = [
                ...patientSales.map(s => ({ ...s, timelineType: 'SALE' })),
                ...patientRx.map(r => ({ ...r, timelineType: 'RX' }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setTimeline(combined);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const fetchDrugs = async () => {
        try {
            const response = await drugService.getDrugs();
            setDrugs(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch drugs", error);
        }
    };

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            const response = await customerService.getCustomer(id);
            setPatient(response.data);
        } catch (error) {
            console.error("Failed to fetch patient data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

     if (!patient) return <div className="p-10 text-center uppercase font-black text-slate-400 tracking-widest text-[12px]">Patient Profile Not Found</div>;
 
     const addPrescriptionItem = () => {
         setPrescriptionItems([...prescriptionItems, { drug: '', quantity: 1, directions: '' }]);
     };
 
     const removePrescriptionItem = (index) => {
         setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
     };
 
     const handleItemChange = (index, field, value) => {
         const newItems = [...prescriptionItems];
         newItems[index][field] = value;
         setPrescriptionItems(newItems);
     };
 
     const handlePrescribe = async () => {
         if (prescriptionItems.length === 0) return toast.error("Add at least one drug");
         if (prescriptionItems.some(item => !item.drug)) return toast.error("Select a drug for all items");
 
         try {
             setLoading(true);
             const payload = {
                 customer: patient.id,
                 prescribing_doctor: 'Clinic Personnel',
                 items: prescriptionItems.map(item => ({
                     drug: item.drug,
                     quantity: parseInt(item.quantity),
                     directions: item.directions
                 })),
                 prescription_id: "RX-" + Date.now().toString().slice(-6)
             };
 
             await prescriptionService.createPrescription(payload);
             toast.success("Prescription issued successfully!");
             setPrescriptionItems([]);
             setIsPrescribing(false);
             fetchCombinedHistory();
         } catch (error) {
             console.error("Prescription failed", error);
             toast.error("Failed to issue prescription");
         } finally {
             setLoading(false);
         }
     };

    return (
        <div className="flex flex-col flex-1 bg-slate-50/50 min-h-screen text-sm">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                    >
                        <FaArrowLeft className="w-3 h-3" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                            <FaUserCircle className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Clinical Profile</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-outfit">{patient.first_name} {patient.last_name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     <button 
                         onClick={() => setIsPrescribing(!isPrescribing)}
                         className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-tight flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                     >
                         <FaCalendarPlus className="w-3 h-3" />
                         {isPrescribing ? 'Close Form' : 'Prescribe Now'}
                     </button>
                </div>
            </header>

            <main className="flex-1 p-5 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Side Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl font-black mb-4 ring-4 ring-white shadow-xl shadow-emerald-50">
                                {patient.first_name[0]}{patient.last_name[0]}
                            </div>
                            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">{patient.first_name} {patient.last_name}</h2>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: RX-{patient.id.toString().padStart(4, '0')}</p>
                            
                            <div className="mt-6 w-full space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{patient.status || 'Active'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DOB</span>
                                    <span className="text-[12px] font-black text-slate-900 tabular-nums">{patient.date_of_birth || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                                    <span className="text-[12px] font-black text-slate-900 tabular-nums">{patient.phone_number || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <FaBriefcaseMedical className="text-red-500" />
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Medical Alerts</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Critical Allergies</p>
                                <p className="text-[12px] font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{patient.allergies || 'No allergies recorded'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chronic Status</p>
                                <p className="text-[12px] font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">{patient.chronic_conditions || 'None known'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Main Content Area */}
                 <div className="lg:col-span-2 space-y-6">
                     {isPrescribing && (
                         <div className="bg-white rounded-2xl border border-emerald-200 shadow-xl shadow-emerald-50 overflow-hidden animate-in slide-in-from-top duration-300">
                             <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-emerald-700">
                                     <FaCapsules />
                                     <h3 className="text-[12px] font-black uppercase tracking-widest">New Prescription Entry</h3>
                                 </div>
                                 <button onClick={addPrescriptionItem} className="text-[11px] font-black text-emerald-600 border border-emerald-200 bg-white px-3 py-1 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1">
                                     <FaPlus className="w-2 h-2" /> Add Drug
                                 </button>
                             </div>
                             
                             <div className="p-6 space-y-4">
                                 {prescriptionItems.length === 0 ? (
                                     <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                                         <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">No drugs added to list</p>
                                         <button onClick={addPrescriptionItem} className="mt-2 text-emerald-500 font-bold hover:underline">Click to start adding</button>
                                     </div>
                                 ) : (
                                     <div className="space-y-3">
                                         {prescriptionItems.map((item, idx) => (
                                             <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100 ring-1 ring-white">
                                                 <div className="col-span-12 md:col-span-5 space-y-1">
                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Medication</label>
                                                     <select 
                                                         value={item.drug}
                                                         onChange={(e) => handleItemChange(idx, 'drug', e.target.value)}
                                                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-black outline-none"
                                                     >
                                                         <option value="">-- Choose --</option>
                                                         {drugs.map(d => (
                                                             <option key={d.id} value={d.id}>{d.name} ({d.dosage})</option>
                                                         ))}
                                                     </select>
                                                 </div>
                                                 <div className="col-span-4 md:col-span-2 space-y-1">
                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</label>
                                                     <input 
                                                         type="number" 
                                                         value={item.quantity}
                                                         onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-black outline-none" 
                                                     />
                                                 </div>
                                                 <div className="col-span-6 md:col-span-4 space-y-1">
                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Directions</label>
                                                     <input 
                                                         type="text" 
                                                         value={item.directions}
                                                         onChange={(e) => handleItemChange(idx, 'directions', e.target.value)}
                                                         placeholder="1x3 Daily..."
                                                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-black outline-none" 
                                                     />
                                                 </div>
                                                 <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                                                     <button onClick={() => removePrescriptionItem(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                                         <FaTrash className="w-3 h-3" />
                                                     </button>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 )}
                                 
                                 <div className="pt-4 flex justify-end">
                                     <button 
                                         onClick={handlePrescribe}
                                         disabled={loading || prescriptionItems.length === 0}
                                         className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-tight hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                                     >
                                         Authorize Prescription
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* Prescription Entry Point Card */}
                     {!isPrescribing && (
                         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer" onClick={() => setIsPrescribing(true)}>
                             <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                     <FaFilePrescription />
                                 </div>
                                 <div>
                                     <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Prescription Operations</h3>
                                     <p className="text-[12px] font-bold text-slate-400 mt-0.5">Issue new clinical medication authorizations for this patient.</p>
                                 </div>
                             </div>
                             <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-tight text-[12px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                                 Issue New Rx
                             </button>
                         </div>
                     )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaHistory className="text-blue-500" />
                                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Integrated Timeline</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronological View</span>
                        </div>
                        
                         <div className="p-6">
                            {timeline.length === 0 ? (
                                <div className="text-center py-20 opacity-20">
                                    <FaHistory size={48} className="mx-auto mb-4" />
                                    <p className="text-[14px] font-black uppercase tracking-widest">No history recorded</p>
                                </div>
                            ) : (
                                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="relative pl-10">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] z-10 shadow-sm ${
                                                item.timelineType === 'RX' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                                            }`}>
                                                {item.timelineType === 'RX' ? <FaPrescriptionBottleAlt /> : <FaShoppingCart />}
                                            </div>

                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{item.timelineType === 'RX' ? 'Prescription' : 'Purchase'}</span>
                                                        <h4 className="text-[13px] font-black text-slate-900 uppercase">
                                                            {item.timelineType === 'RX' ? item.prescription_id : `Transaction #${item.id}`}
                                                        </h4>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>

                                                {item.timelineType === 'RX' ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {item.items && item.items.map((med, i) => (
                                                            <div key={i} className="bg-slate-50/50 p-2 rounded-xl border border-slate-50">
                                                                <p className="text-[12px] font-black text-slate-700 uppercase leading-none">{med.drug_name}</p>
                                                                <p className="text-[10px] text-slate-400 mt-1">{med.directions}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-[16px] font-black text-emerald-600 tabular-nums">${item.total_amount}</p>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Via {item.payment_method}</span>
                                                    </div>
                                                )}

                                                <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Staff: {item.staff_name || 'System'}</span>
                                                    {item.timelineType === 'RX' && (
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                                            item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>{item.status}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientPage;
