import React, { useState, useEffect } from 'react';
import supplierService from '../services/supplierService';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaTruck, FaPhone, FaEnvelope } from 'react-icons/fa';

const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone_number: '',
        email: '',
        address: '',
        category: 'Drugs'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await supplierService.getSuppliers();
            setSuppliers(response.data?.results || response.data || []);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
            toast.error("Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await supplierService.updateSupplier(editingId, formData);
                toast.success("Supplier updated!");
            } else {
                await supplierService.addSupplier(formData);
                toast.success("New supplier added!");
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', contact_person: '', phone_number: '', email: '', address: '', category: 'Drugs' });
            fetchSuppliers();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const handleEdit = (supplier) => {
        setEditingId(supplier.id);
        setFormData({
            name: supplier.name,
            contact_person: supplier.contact_person || '',
            phone_number: supplier.phone_number,
            email: supplier.email || '',
            address: supplier.address || '',
            category: supplier.category || 'Drugs'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this supplier?")) return;
        try {
            await supplierService.deleteSupplier(id);
            toast.success("Supplier removed");
            fetchSuppliers();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Supplier Hub</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Procurement & Vendors</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-50 outline-none font-bold text-xs w-64"
                        />
                    </div>
                    <button
                        onClick={() => { setEditingId(null); setFormData({name:'', contact_person:'', phone_number:'', email:'', address:'', category:'Drugs'}); setIsModalOpen(true); }}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all"
                    >
                        <FaPlus /> Add Vendor
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-black uppercase animate-pulse">Loading Suppliers...</div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase">No vendors found</div>
                ) : (
                    filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group relative">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(supplier)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><FaEdit className="w-3 h-3" /></button>
                                <button onClick={() => handleDelete(supplier.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FaTrash className="w-3 h-3" /></button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl">
                                    <FaTruck />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{supplier.name}</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">{supplier.category}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FaPhone className="text-[10px]" />
                                    <span className="text-[11px] font-bold tabular-nums">{supplier.phone_number}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500">
                                    <FaEnvelope className="text-[10px]" />
                                    <span className="text-[11px] font-bold truncate">{supplier.email || 'No email provided'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Person</p>
                                <p className="text-[12px] font-black text-slate-700 uppercase">{supplier.contact_person || 'N/A'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">{editingId ? 'Edit Supplier' : 'New Supplier Profile'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none focus:ring-2 focus:ring-emerald-50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none">
                                        <option value="Drugs">Drugs</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Equipment">Medical Equipment</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</label>
                                <input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none focus:ring-2 focus:ring-emerald-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                                    <input required value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none focus:ring-2 focus:ring-emerald-50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none focus:ring-2 focus:ring-emerald-50" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                                <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 font-bold text-[12px] outline-none focus:ring-2 focus:ring-emerald-50 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">Save Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierManagement;
