import React, { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBullhorn, FaCalendarCheck, FaSms, FaPhone, FaSearch, FaHistory } from 'react-icons/fa';

const PatientOutreach = () => {
    const [duePatients, setDueList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDueList();
    }, []);

    const fetchDueList = async () => {
        try {
            setLoading(true);
            const response = await api.get('customers/due-for-refill/');
            setDueList(response.data);
        } catch (error) {
            toast.error("Failed to calculate refill schedule");
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = (patient) => {
        // In a real app, this would call an SMS/WhatsApp API
        const message = `Hello ${patient.name}, this is a reminder from Josiah Pharmacy. Your supply of ${patient.medication} is likely running low. Visit us for a refill!`;

        // Mocking the intent
        window.open(`https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success(`Reminder intent sent for ${patient.name}`);
    };

    const filtered = duePatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Patient Outreach</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Refill Analytics & Loyalty</p>
                </div>

                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search due patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-50 outline-none font-bold text-xs w-64"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-black animate-pulse uppercase">Analyzing purchase patterns...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase">No patients due for refills today</div>
                ) : (
                    filtered.map(patient => (
                        <div key={patient.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <FaCalendarCheck size={64} className="text-emerald-500" />
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black">
                                    {patient.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-[13px] font-black text-slate-900 uppercase pr-8 truncate">{patient.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 tabular-nums">{patient.phone}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Medication Balance Low</p>
                                    <p className="text-[12px] font-black text-slate-700 uppercase">{patient.medication}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Bought {patient.quantity} units, {patient.days_since} days ago.</p>
                                </div>

                                <button
                                    onClick={() => handleSendReminder(patient)}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                >
                                    <FaSms /> Send Refill Reminder
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientOutreach;
