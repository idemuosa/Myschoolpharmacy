import React, { useState, useEffect } from 'react';
import drugService from '../services/drugService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBoxes, FaHistory, FaSearch, FaTrashRestore, FaPlus } from 'react-icons/fa';

const StockAdjustments = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        drug: '',
        quantity: '',
        reason: 'Damage',
        notes: ''
    });

    useEffect(() => { fetchDrugs(); }, []);

    const fetchDrugs = async () => {
        try {
            const res = await drugService.getDrugs();
            setDrugs(res.data?.results || res.data || []);
        } finally { setLoading(false); }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await api.post('stock-adjustments/', formData);
            toast.success("Inventory adjusted!");
            setIsModalOpen(false);
            fetchDrugs();
        } catch (error) { toast.error("Failed to post adjustment"); }
    };

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Stock Adjustments</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Damage, Loss & Branch Transfers</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                    <FaTrashRestore /> Record Loss
                </button>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8 text-center opacity-30">
                <FaBoxes size={64} className="mx-auto mb-4 text-slate-200" />
                <p className="font-black uppercase tracking-widest text-slate-400">Inventory Syncing Module Active</p>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 space-y-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase">Manual Adjustment</h2>
                        <form onSubmit={handleAdjust} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Item</label>
                                <select required value={formData.drug} onChange={(e) => setFormData({...formData, drug: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold outline-none">
                                    <option value="">Select Drug</option>
                                    {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Quantity Delta</label>
                                    <input type="number" placeholder="-5 or 5" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Reason</label>
                                    <select value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold outline-none">
                                        <option value="Damage">Damage</option>
                                        <option value="Expiry">Expiry</option>
                                        <option value="Found">Found</option>
                                        <option value="Transfer">Transfer</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-black transition-all">Finalize Adjustment</button>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-[10px] font-black text-slate-400 uppercase">Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAdjustments;
