import React, { useState, useEffect } from 'react';
import auditService from '../services/auditService';
import drugService from '../services/drugService';
import toast from 'react-hot-toast';
import { FaClipboardCheck, FaPlus, FaCheck, FaTimes, FaExclamationTriangle, FaSearch } from 'react-icons/fa';

const InventoryAudit = () => {
    const [audits, setAudits] = useState([]);
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        audit_id: `AUDIT-${Date.now().toString().slice(-6)}`,
        notes: '',
        items: []
    });

    useEffect(() => {
        fetchAudits();
        fetchDrugs();
    }, []);

    const fetchAudits = async () => {
        try {
            setLoading(true);
            const res = await auditService.getAudits();
            setAudits(res.data?.results || res.data || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrugs = async () => {
        const res = await drugService.getDrugs();
        setDrugs(res.data?.results || res.data || []);
    };

    const addItem = (drug) => {
        if (formData.items.find(i => i.drug === drug.id)) return;
        setFormData({
            ...formData,
            items: [...formData.items, { drug: drug.id, name: drug.name, expected: drug.total_stock, counted_quantity: drug.total_stock }]
        });
    };

    const updateCount = (index, value) => {
        const newItems = [...formData.items];
        newItems[index].counted_quantity = parseInt(value) || 0;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await auditService.createAudit(formData);
            toast.success("Audit submitted for review!");
            setIsModalOpen(false);
            fetchAudits();
        } catch (error) {
            toast.error("Failed to submit audit");
        }
    };

    const handleReconcile = async (id) => {
        const toastId = toast.loading("Reconciling stock levels...");
        try {
            await auditService.reconcile(id);
            toast.success("Inventory adjusted to match audit!", { id: toastId });
            fetchAudits();
        } catch (error) {
            toast.error("Reconciliation failed", { id: toastId });
        }
    };

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Inventory Audits</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Stocktake & Discrepancy Control</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2"
                >
                    <FaPlus /> Start Stocktake
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {audits.map(audit => (
                    <div key={audit.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                                audit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                                <FaClipboardCheck />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">{audit.audit_id}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {new Date(audit.created_at).toLocaleDateString()} • {audit.performer_name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase block">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    audit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>{audit.status}</span>
                            </div>
                            {audit.status !== 'Completed' && (
                                <button
                                    onClick={() => handleReconcile(audit.id)}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                                >
                                    Verify & Reconcile
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 uppercase">Conduct Stocktake</h2>
                            <button onClick={() => setIsModalOpen(false)}><FaTimes className="text-slate-400" /></button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Drug Selector */}
                            <div className="w-full lg:w-1/3 border-r border-slate-50 p-4 space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase">Select Medication</h3>
                                <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                                    {drugs.map(drug => (
                                        <button
                                            key={drug.id}
                                            onClick={() => addItem(drug)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                                        >
                                            <p className="text-[12px] font-black text-slate-700 group-hover:text-emerald-600">{drug.name}</p>
                                            <p className="text-[10px] text-slate-400">System Count: {drug.total_stock}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Audit Items */}
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {formData.items.length === 0 ? (
                                        <div className="text-center py-20 opacity-20">
                                            <FaClipboardCheck size={48} className="mx-auto mb-2" />
                                            <p className="font-black uppercase">Add items to audit</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {formData.items.map((item, idx) => (
                                                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-[12px] font-black text-slate-900 uppercase">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Expected: {item.expected}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-24">
                                                            <input
                                                                type="number"
                                                                value={item.counted_quantity}
                                                                onChange={(e) => updateCount(idx, e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] font-black text-center"
                                                            />
                                                        </div>
                                                        {item.counted_quantity !== item.expected && (
                                                            <div className="text-red-500 flex items-center gap-1" title="Discrepancy detected">
                                                                <FaExclamationTriangle />
                                                                <span className="text-[12px] font-black">{item.counted_quantity - item.expected}</span>
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})}
                                                            className="text-slate-300 hover:text-red-500"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {formData.items.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <textarea
                                            placeholder="Add notes about this audit..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[12px] outline-none"
                                            rows="2"
                                        ></textarea>
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-100"
                                        >
                                            Submit Audit Record
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryAudit;
