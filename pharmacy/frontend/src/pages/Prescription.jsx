import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import drugService from '../services/drugService';
import prescriptionService from '../services/prescriptionService';
import toast from 'react-hot-toast';
import { 
  FaArrowLeft, FaFilePrescription, FaUserMd, 
  FaPills, FaNotesMedical, FaSave, FaPlus, FaTrash
} from 'react-icons/fa';

const Prescription = () => {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patientId');
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [patient, setPatient] = useState(null);
    const [drugs, setDrugs] = useState([]);
    
    const [formData, setFormData] = useState({
        prescription_id: `RX-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
        customer: patientId || '',
        prescribing_doctor: '',
        notes: '',
        status: 'Pending',
        items: [
            { drug: '', quantity: 1, directions: '', refills: 0 }
        ]
    });

    useEffect(() => {
        fetchInitialData();
    }, [patientId]);

    const fetchInitialData = async () => {
        try {
            const [drugRes, patientRes] = await Promise.all([
                drugService.getDrugs(),
                patientId ? customerService.getCustomer(patientId) : Promise.resolve({ data: null })
            ]);
            setDrugs(drugRes.data.results || drugRes.data);
            if (patientRes.data) setPatient(patientRes.data);
        } catch (error) {
            console.error("Failed to load initial data", error);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { drug: '', quantity: 1, directions: '', refills: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await prescriptionService.createPrescription(formData);
            toast.success("Prescription synchronized successfully!");
            navigate('/prescriptions/review');
        } catch (error) {
            console.error("Submission failed", error);
            toast.error("Failed to sync prescription. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 bg-slate-50/50 min-h-screen text-sm">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm">
                        <FaArrowLeft className="w-3 h-3" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                            <FaFilePrescription className="w-2.5 h-2.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Digital Prescription</span>
                        </div>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-outfit">Generate New Rx</h1>
                    </div>
                </div>

                <button form="rx-form" type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-tight flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50">
                    <FaSave className="w-3 h-3" />
                    {loading ? 'Processing...' : 'Authorize & Sync'}
                </button>
            </header>

            <main className="flex-1 p-5 w-full">
                <form id="rx-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Identification */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest">Patient Identification</label>
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-900 flex flex-col">
                                {patient ? `${patient.first_name} ${patient.last_name}` : 'Loading context...'}
                                <span className="text-[10px] text-slate-400 font-bold mt-1">RX-{patientId?.padStart(4, '0')}</span>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest">Prescribing Medical Professional</label>
                            <div className="relative">
                                <FaUserMd className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input 
                                    required
                                    name="prescribing_doctor"
                                    value={formData.prescribing_doctor}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
                                    placeholder="Enter Physician / Clinician Name..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-black focus:ring-2 focus:ring-emerald-50 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medications List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaPills className="text-blue-500" />
                                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Regimen Items</h3>
                            </div>
                            <button type="button" onClick={addItem} className="text-[11px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 flex items-center gap-1.5 transition-all">
                                <FaPlus className="w-2.5 h-2.5" /> Add Medication
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {formData.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-all">
                                    <div className="lg:col-span-4 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pharmaceutical Unit</label>
                                        <select 
                                            required
                                            value={item.drug}
                                            onChange={(e) => handleItemChange(index, 'drug', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[12px] font-black outline-none focus:ring-2 focus:ring-emerald-50 transition-all font-outfit"
                                        >
                                            <option value="">Choose Medication</option>
                                            {drugs.map(d => (
                                                <option key={d.id} value={d.id}>{d.name} ({d.dosage})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="lg:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Units (Qty)</label>
                                        <input 
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[12px] font-black outline-none"
                                        />
                                    </div>
                                    <div className="lg:col-span-5 space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Clinical Directions</label>
                                        <input 
                                            required
                                            value={item.directions}
                                            onChange={(e) => handleItemChange(index, 'directions', e.target.value)}
                                            placeholder="e.g., 1 BD x 7 days"
                                            className="w-full px-3 py-2.5 bg-white border border-slate-100 rounded-xl text-[12px] font-bold outline-none"
                                        />
                                    </div>
                                    <div className="lg:col-span-1 flex items-end justify-center pb-1">
                                        <button type="button" onClick={() => removeItem(index)} className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                                            <FaTrash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                            <FaNotesMedical className="text-emerald-500" />
                            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Clinical Commentary</h3>
                        </div>
                        <textarea 
                            rows="4"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Provide diagnostic context or special handling instructions..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-emerald-50 transition-all outline-none resize-none italic"
                        />
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Prescription;
