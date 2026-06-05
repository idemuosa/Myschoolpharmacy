import React, { useState, useEffect } from 'react';
import posService from '../services/posService';
import ProfessionalReceipt from '../components/ProfessionalReceipt';
import settingsService from '../services/settingsService';
import { FaHistory, FaSearch, FaPrint, FaEye, FaFileInvoiceDollar } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TransactionArchive = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);
    const [shopSettings, setShopSettings] = useState(null);

    useEffect(() => {
        fetchSales();
        fetchBranding();
    }, []);

    const fetchBranding = async () => {
        const res = await settingsService.getSettings();
        if (res.data?.length > 0) setShopSettings(res.data[0]);
    };

    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await posService.getSales();
            setSales(res.data?.results || res.data || []);
        } finally {
            setLoading(false);
        }
    };

    const handleReprint = (sale) => {
        const formattedSale = {
            id: sale.transaction_id,
            date: new Date(sale.created_at).toLocaleString(),
            sellerName: sale.staff_name,
            paymentMethod: sale.payment_method,
            items: sale.items.map(i => ({ name: i.drug_name, quantity: i.quantity, unitPrice: i.unit_price })),
            subtotal: parseFloat(sale.total_amount),
            total: parseFloat(sale.total_amount),
            discount: 0
        };
        setSelectedSale(formattedSale);
        setTimeout(() => window.print(), 300);
    };

    const filtered = sales.filter(s =>
        s.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm no-print">
            <ProfessionalReceipt sale={selectedSale} shopSettings={shopSettings} />

            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Receipt Archive</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Historical Transaction Records</p>
                </div>

                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search TX ID or Patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs w-64"
                    />
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400">
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Method</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-12 text-center animate-pulse">Syncing Archive...</td></tr>
                        ) : filtered.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-black text-slate-900 uppercase">{sale.transaction_id}</td>
                                <td className="px-6 py-4 font-bold text-slate-600 uppercase">{sale.customer_name || 'Walk-in'}</td>
                                <td className="px-6 py-4 text-slate-400 tabular-nums">{new Date(sale.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right font-black text-emerald-600">${sale.total_amount}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px] font-black uppercase">{sale.payment_method}</span>
                                </td>
                                <td className="px-6 py-4 text-center flex justify-center gap-2">
                                    <button onClick={() => handleReprint(sale)} className="p-2 text-slate-400 hover:text-emerald-500 transition-all"><FaPrint /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionArchive;
