import React, { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaUserTag, FaHandHoldingUsd, FaSearch, FaHistory, FaCheckDouble } from 'react-icons/fa';

const DebtManagement = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        try {
            setLoading(true);
            const res = await customerService.getCustomers();
            const all = res.data?.results || res.data || [];
            // Filter patients with non-zero balance
            setDebtors(all.filter(c => parseFloat(c.balance) > 0));
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) return toast.error("Invalid amount");
        try {
            await api.post(`customers/${selectedPatient.id}/collect-payment/`, {
                amount: paymentAmount,
                method: 'Cash'
            });
            toast.success("Payment Received!");
            setSelectedPatient(null);
            setPaymentAmount('');
            fetchDebtors();
        } catch (error) {
            toast.error("Failed to record payment");
        }
    };

    const filtered = debtors.filter(d => (d.first_name + ' ' + d.last_name).toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="w-full space-y-6 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">Accounts Receivable</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Patient Debt & Collections</p>
                </div>

                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search debtors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-xs w-64"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 animate-pulse">Scanning ledger...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase">Zero outstanding debts found</div>
                ) : (
                    filtered.map(debtor => (
                        <div key={debtor.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl">
                                    <FaUserTag />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase">{debtor.first_name} {debtor.last_name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 tabular-nums">{debtor.phone_number}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding</p>
                                        <p className="text-2xl font-black text-red-600 tabular-nums">${parseFloat(debtor.balance).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPatient(debtor)}
                                        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all"
                                    >
                                        Collect Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                                <FaHandHoldingUsd />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase">Receive Payment</h2>
                            <p className="text-[11px] font-bold text-slate-400">PATIENT: {selectedPatient.first_name} {selectedPatient.last_name}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Amount to pay ($)</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-black text-lg outline-none text-emerald-600"
                            />
                            <p className="text-[10px] text-right font-bold text-slate-400">Total Debt: ${selectedPatient.balance}</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setSelectedPatient(null)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
                            <button onClick={handlePayment} className="flex-1 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Post Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DebtManagement;
