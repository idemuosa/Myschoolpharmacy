import React, { useState, useEffect } from 'react';
import drugService from '../services/drugService';
import supplierService from '../services/supplierService';
import exportService from '../services/exportService';
import { FaTruck, FaFileInvoice, FaExclamationTriangle, FaArrowLeft, FaFileExport } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
            const [drugRes, supplierRes] = await Promise.all([
                drugService.getDrugs(),
                supplierService.getSuppliers()
            ]);

            const allDrugs = drugRes.data?.results || drugRes.data || [];
            const allSuppliers = supplierRes.data?.results || supplierRes.data || [];

            const lowStock = allDrugs.filter(d => (d.total_stock || 0) <= (d.reorder_level || 10));

            // Group by supplier
            const grouped = {};
            lowStock.forEach(drug => {
                const sId = drug.supplier || 'unassigned';
                if (!grouped[sId]) {
                    const sName = allSuppliers.find(s => s.id === sId)?.name || 'Unassigned Supplier';
                    grouped[sId] = { name: sName, items: [] };
                }
                grouped[sId].items.push(drug);
            });

            setAdvice(Object.values(grouped));
        } catch (error) {
            toast.error("Failed to generate procurement advice");
        } finally {
            setLoading(false);
        }
    };

    const exportOrder = (supplier) => {
        const data = supplier.items.map(item => ({
            Medication: item.name,
            Generic: item.generic_name,
            'Current Stock': item.total_stock,
            'Reorder Level': item.reorder_level,
            'Suggested Order': (item.reorder_level * 2) - item.total_stock
        }));
        exportService.exportToCSV(data, `ORDER_${supplier.name.replace(/\s+/g, '_')}`);
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <FaArrowLeft className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Procurement Advice</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Smart Stock Replenishment</p>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="py-20 text-center animate-pulse uppercase font-black text-slate-300">Calculating replenishment needs...</div>
            ) : advice.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaTruck /></div>
                    <p className="font-black text-slate-900 uppercase">Stock levels are healthy</p>
                    <p className="text-xs text-slate-400 mt-1">No items currently below reorder thresholds.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {advice.map((group, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"><FaTruck /></div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{group.name}</h3>
                                </div>
                                <button
                                    onClick={() => exportOrder(group)}
                                    className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                                >
                                    <FaFileExport /> Generate Order
                                </button>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <th className="px-6 py-3">Medication</th>
                                        <th className="px-6 py-3 text-center">In Stock</th>
                                        <th className="px-6 py-3 text-center">Reorder Lvl</th>
                                        <th className="px-6 py-3 text-right">Advice</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {group.items.map((item, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <p className="text-[12px] font-black text-slate-900 uppercase">{item.name}</p>
                                                <p className="text-[10px] text-slate-400">{item.generic_name}</p>
                                            </td>
                                            <td className="px-6 py-3 text-center font-black text-red-500 tabular-nums">{item.total_stock}</td>
                                            <td className="px-6 py-3 text-center font-bold text-slate-400 tabular-nums">{item.reorder_level}</td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-[10px] font-black uppercase">
                                                    Order {(item.reorder_level * 2) - item.total_stock} Units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProcurementAdvice;
