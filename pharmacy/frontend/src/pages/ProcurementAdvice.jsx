import React, { useState, useEffect } from 'react';
import drugService from '../services/drugService';
import purchaseOrderService from '../services/purchaseOrderService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaLightbulb, FaShoppingCart, FaArrowRight, FaTruck, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProcurementAdvice = () => {
    const navigate = useNavigate();
    const [advice, setAdvice] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdvice();
    }, []);

    const fetchAdvice = async () => {
        try {
            setLoading(true);
            const res = await api.get('drugs/procurement-advice/');
            setAdvice(res.data);
        } catch (error) {
            toast.error("Failed to generate advice");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePO = (supplierId, items) => {
        // Navigate to PO creation with pre-filled items
        // For now, let's just show a toast
        toast.success(`Generated draft PO for vendor.`);
        navigate('/procurement');
    };

    // Group advice by supplier
    const groupedAdvice = advice.reduce((acc, item) => {
        const key = item.supplier_name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FaLightbulb className="text-amber-500" /> Smart Restocking
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Inventory Intelligence & Procurement Advice</p>
            </header>

            {loading ? (
                <div className="py-20 text-center text-slate-400 animate-pulse font-black uppercase">Analyzing stock velocity...</div>
            ) : Object.keys(groupedAdvice).length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                        <FaCheck />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">Inventory Secure</h2>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto">No medications are currently below their reorder thresholds. The vault is well-provisioned.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedAdvice).map(([supplier, items]) => (
                        <div key={supplier} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FaTruck className="text-slate-400" />
                                    <h2 className="text-[12px] font-black uppercase text-slate-900">{supplier}</h2>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase">{items.length} Suggestions</span>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    {items.map(item => (
                                        <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 uppercase">{item.name}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">Current: {item.current_stock}</span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Min: {item.reorder_level}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Suggest Buying</p>
                                                    <p className="text-[14px] font-black text-emerald-600">+{item.suggested_qty} units</p>
                                                </div>
                                                <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Est. Cost</p>
                                                    <p className="text-[14px] font-black text-slate-900">${(item.suggested_qty * item.unit_price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => handleCreatePO(items[0].supplier_id)}
                                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black transition-all"
                                    >
                                        Convert to Purchase Order <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProcurementAdvice;
