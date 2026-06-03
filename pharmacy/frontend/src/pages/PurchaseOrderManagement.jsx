import React, { useState, useEffect } from 'react';
import purchaseOrderService from '../services/purchaseOrderService';
import supplierService from '../services/supplierService';
import drugService from '../services/drugService';
import toast from 'react-hot-toast';
import { FaPlus, FaTruck, FaFileInvoice, FaCheck, FaTimes, FaEye, FaTrash } from 'react-icons/fa';

const PurchaseOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        supplier: '',
        order_id: `PO-${Date.now().toString().slice(-6)}`,
        items: []
    });

    useEffect(() => {
        fetchOrders();
        fetchSuppliers();
        fetchDrugs();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await purchaseOrderService.getOrders();
            setOrders(res.data?.results || res.data || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        const res = await supplierService.getSuppliers();
        setSuppliers(res.data?.results || res.data || []);
    };

    const fetchDrugs = async () => {
        const res = await drugService.getDrugs();
        setDrugs(res.data?.results || res.data || []);
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { drug: '', quantity: 0, unit_cost: 0 }] });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await purchaseOrderService.createOrder(formData);
            toast.success("Purchase Order Created!");
            setIsModalOpen(false);
            fetchOrders();
        } catch (error) {
            toast.error("Failed to create order");
        }
    };

    const handleReceive = async (id) => {
        try {
            await purchaseOrderService.receiveOrder(id);
            toast.success("Order received and stock updated!");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to receive order");
        }
    };

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Purchase Orders</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Supply Chain & Procurement</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                >
                    <FaPlus /> Create Order
                </button>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Order ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Supplier</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Created</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-12 text-center animate-pulse">Loading orders...</td></tr>
                        ) : orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900 uppercase">{order.order_id}</td>
                                <td className="px-6 py-4 font-bold text-slate-600 uppercase">{order.supplier_name}</td>
                                <td className="px-6 py-4 text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        order.status === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>{order.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">${order.total_amount}</td>
                                <td className="px-6 py-4 text-center">
                                    {order.status !== 'Received' && (
                                        <button onClick={() => handleReceive(order.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg" title="Receive Items">
                                            <FaCheck />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-sm font-black text-slate-900 uppercase">New Purchase Order</h2>
                            <button onClick={() => setIsModalOpen(false)}><FaTimes className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Vendor</label>
                                    <select required value={formData.supplier} onChange={(e) => setFormData({...formData, supplier: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold outline-none">
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Order ID</label>
                                    <input value={formData.order_id} readOnly className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-400" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-[10px] font-black text-emerald-500 uppercase">Order Items</h3>
                                    <button type="button" onClick={addItem} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">+ Add Item</button>
                                </div>
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-3 rounded-xl">
                                        <div className="col-span-5 space-y-1">
                                            <select value={item.drug} onChange={(e) => handleItemChange(idx, 'drug', e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1 text-[11px] font-bold outline-none">
                                                <option value="">Select Drug</option>
                                                {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1 text-[11px] font-bold outline-none" />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <input type="number" placeholder="Cost" value={item.unit_cost} onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)} className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1 text-[11px] font-bold outline-none" />
                                        </div>
                                        <div className="col-span-1 pb-1">
                                            <button type="button" onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})} className="text-red-400"><FaTrash className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-emerald-100">Authorize Purchase Order</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderManagement;
