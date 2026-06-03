import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import drugService from '../services/drugService';
import categoryService from '../services/categoryService';
import exportService from '../services/exportService';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../services/socket';
import axios from 'axios';
import {
  FaSearch, FaBell, FaPlus, FaThLarge, FaCashRegister, FaBox,
  FaUsers, FaClipboardList, FaCog, FaPills, FaExclamationTriangle,
  FaClock, FaMoneyBill, FaFilter, FaFileExport, FaChevronLeft, FaChevronRight, FaEdit, FaTimes, FaTrash, FaChevronDown, FaChevronUp, FaBarcode
} from 'react-icons/fa';
import BarcodeLabel from '../components/BarcodeLabel';

const InventoryManagement = () => {
  const { user } = useContext(AuthContext);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [labelItem, setLabelItem] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDrugs(controller.signal);
    fetchCategories(controller.signal);

    const handleStockUpdate = (data) => {
      if (data.type === 'drug') fetchDrugs();
    };

    socket.on('stock_updated', handleStockUpdate);
    return () => {
      controller.abort();
      socket.off('stock_updated', handleStockUpdate);
    };
  }, []);

  const fetchCategories = async (signal) => {
    try {
      const response = await categoryService.getCategories({ signal });
      const data = response.data?.results || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      if (axios.isCancel(error)) return;
    }
  };

  const fetchDrugs = async (signal) => {
    try {
      setLoading(true);
      const response = await drugService.getDrugs({ signal });
      const drugs = response.data?.results || response.data || [];
      setInventoryData(Array.isArray(drugs) ? drugs : []);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) newExpandedRows.delete(id);
    else newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  const handleExport = () => {
    const exportData = filteredData.map(item => ({
      ID: item.id,
      Name: item.name,
      Generic: item.generic_name,
      Category: item.category_name,
      Stock: item.total_stock,
      Price: item.unit_price,
      Reorder_Level: item.reorder_level,
      Barcode: item.barcode
    }));
    exportService.exportToCSV(exportData, 'pharmacy_inventory');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 text-sm py-8 px-4 md:px-6 lg:px-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Master Inventory</h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Batches & Stock Integrity</p>
        </div>

        <div className="flex gap-2">
            <Link to="/inventory/adjust" className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all">
                <FaBalanceScale /> Adjustment
            </Link>
            <Link to="/procurement/advice" className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-indigo-100 transition-all">
                <FaTruck /> Smart Reorder
            </Link>
            <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                <FaFileExport /> Export CSV
            </button>
            <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="Search med..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-50 outline-none font-bold text-xs w-64" />
            </div>
            <Link to="/inventory/new" className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <FaPlus /> New Entry
            </Link>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <BarcodeLabel item={labelItem} shopName="Josiah Pharmacy" />
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-black tracking-widest text-slate-400">
                    <th className="px-6 py-4">Medication Details</th>
                    <th className="px-6 py-4">Total Stock</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-center">Batches</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {loading ? (
                    <tr><td colSpan="6" className="py-12 text-center animate-pulse">Scanning Vault...</td></tr>
                ) : filteredData.map(item => (
                    <React.Fragment key={item.id}>
                        <tr className={`hover:bg-slate-50/50 transition-colors ${expandedRows.has(item.id) ? 'bg-slate-50/30' : ''}`}>
                            <td className="px-6 py-4">
                                <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.category_name || 'General'}</p>
                            </td>
                            <td className="px-6 py-4 font-black text-slate-900 tabular-nums text-[13px]">{item.total_stock}</td>
                            <td className="px-6 py-4 font-black text-slate-900 tabular-nums text-[13px]">${item.unit_price}</td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => toggleRow(item.id)} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                                    {item.batches?.length || 0} Batches {expandedRows.has(item.id) ? <FaChevronUp className="inline ml-1" /> : <FaChevronDown className="inline ml-1" />}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    item.total_stock <= (item.reorder_level || 10) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>{item.total_stock <= (item.reorder_level || 10) ? 'Low Stock' : 'Secure'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        onClick={() => { setLabelItem(item); setTimeout(() => window.print(), 200); }}
                                        className="text-slate-300 hover:text-blue-500 p-2"
                                        title="Print Label"
                                    >
                                        <FaBarcode />
                                    </button>
                                    <Link to={`/inventory/edit/${item.id}`} className="text-slate-300 hover:text-emerald-500 p-2"><FaEdit /></Link>
                                </div>
                            </td>
                        </tr>
                        {expandedRows.has(item.id) && (
                            <tr className="bg-slate-50/30 border-b border-slate-100 animate-in slide-in-from-top-2 duration-200">
                                <td colSpan="6" className="px-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {item.batches?.length > 0 ? item.batches.map((batch, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Batch Number</span>
                                                        <p className="text-[12px] font-black text-slate-900 uppercase">{batch.batch_number}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        new Date(batch.expiry_date) < new Date() ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {new Date(batch.expiry_date) < new Date() ? 'EXPIRED' : `Exp: ${batch.expiry_date}`}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase">Quantity</p>
                                                        <p className="text-[16px] font-black text-emerald-600 tabular-nums">{batch.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase">Unit Cost</p>
                                                        <p className="text-[12px] font-bold text-slate-900">${batch.cost_price}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="col-span-full py-4 text-center text-slate-400 italic font-bold">No active batches for this medication.</p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagement;
