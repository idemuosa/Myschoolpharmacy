import React, { useState, useEffect } from 'react';
import drugService from '../services/drugService';
import activityService from '../services/activityService';
import { FaBalanceScale, FaTrash, FaUndo, FaArrowLeft, FaBoxOpen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const StockAdjustment = () => {
    const navigate = useNavigate();
    const [drugs, setDrugs] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [adjustment, setAdjustment] = useState({ quantity: 0, reason: 'Wastage', notes: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDrugs();
    }, []);

    const fetchDrugs = async () => {
        const res = await drugService.getDrugs();
        setDrugs(res.data?.results || res.data || []);
    };

    const handleAdjustment = async () => {
        if (!selectedBatch) return toast.error("Select a batch to adjust");
        if (adjustment.quantity <= 0) return toast.error("Enter a valid quantity");

        try {
            setLoading(true);
            const newQty = selectedBatch.quantity - adjustment.quantity;
            if (newQty < 0 && adjustment.reason === 'Wastage') {
                return toast.error("Cannot waste more than batch quantity");
            }

            // In a real app, we'd have an adjustment endpoint.
            // Here we'll update the batch quantity directly via an internal put if available,
            // or through a generic update.
            await api.put(`drug-batches/${selectedBatch.id}/`, {
                ...selectedBatch,
                quantity: newQty
            });

            await activityService.log({
                action: 'Stock Adjustment',
                module: 'Inventory',
                description: `${adjustment.reason}: Removed ${adjustment.quantity} units from ${selectedDrug.name} (Batch ${selectedBatch.batch_number}). Reason: ${adjustment.notes}`
            });

            toast.success("Inventory adjusted successfully");
            navigate('/inventory');
        } catch (error) {
            toast.error("Failed to adjust stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 py-8 px-4 text-sm">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <FaArrowLeft className="text-slate-400" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Stock Adjustment</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Wastage & Damages Recording</p>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Medication</label>
                    <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none"
                        onChange={(e) => {
                            const drug = drugs.find(d => d.id == e.target.value);
                            setSelectedDrug(drug);
                            setSelectedBatch(null);
                        }}
                    >
                        <option value="">Choose item...</option>
                        {drugs.map(d => <option key={d.id} value={d.id}>{d.name} ({d.dosage})</option>)}
                    </select>
                </div>

                {selectedDrug && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Batch</label>
                        <div className="grid grid-cols-1 gap-2">
                            {selectedDrug.batches?.map(batch => (
                                <button
                                    key={batch.id}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        selectedBatch?.id === batch.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-100 bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-slate-900 uppercase">Batch: {batch.batch_number}</span>
                                        <span className="text-[10px] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-full uppercase">In Stock: {batch.quantity}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1">Expires: {batch.expiry_date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Adjustment Type</label>
                        <select
                            value={adjustment.reason}
                            onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none"
                        >
                            <option>Wastage</option>
                            <option>Expired</option>
                            <option>Damaged</option>
                            <option>Return to Supplier</option>
                            <option>Correction</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Quantity to Remove</label>
                        <input
                            type="number"
                            value={adjustment.quantity}
                            onChange={(e) => setAdjustment({...adjustment, quantity: parseInt(e.target.value) || 0})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Notes / Internal Explanation</label>
                    <textarea
                        value={adjustment.notes}
                        onChange={(e) => setAdjustment({...adjustment, notes: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold outline-none h-24"
                        placeholder="Detail the reason for this adjustment..."
                    />
                </div>

                <button
                    onClick={handleAdjustment}
                    disabled={loading || !selectedBatch}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-30"
                >
                    {loading ? "COMMITTING ADJUSTMENT..." : "AUTHORIZE STOCK ADJUSTMENT"}
                </button>
            </div>
        </div>
    );
};

export default StockAdjustment;
