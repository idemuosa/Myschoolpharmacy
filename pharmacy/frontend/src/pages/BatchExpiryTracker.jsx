import React, { useState } from 'react';
import {
  FaExclamationTriangle, FaCalendarAlt, FaCheckCircle, FaPaperPlane,
  FaSearch, FaShieldAlt, FaTruck, FaSync
} from 'react-icons/fa';

export default function BatchExpiryTracker() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [poStatus, setPoStatus] = useState({});

  const batches = [
    {
      id: 'BT-9021',
      drugName: 'Amoxicillin 500mg Trihydrate',
      category: 'Antibiotics',
      batchNumber: 'B-2023-8812',
      supplier: 'Novartis Healthcare',
      stockQty: 340,
      minThreshold: 100,
      expiryDate: '2025-04-10',
      daysUntilExpiry: 18,
      urgency: 'critical', // < 30 days
      unitCost: 12.40,
      suggestedReorderQty: 500
    },
    {
      id: 'BT-9044',
      drugName: 'Insulin Glargine 100 U/mL Pen',
      category: 'Endocrine / Diabetes',
      batchNumber: 'IG-2023-4109',
      supplier: 'Sanofi Pharmaceuticals',
      stockQty: 42,
      minThreshold: 50,
      expiryDate: '2025-05-02',
      daysUntilExpiry: 40,
      urgency: 'warning', // 30 - 60 days
      unitCost: 85.00,
      suggestedReorderQty: 100
    },
    {
      id: 'BT-8810',
      drugName: 'Azithromycin 250mg Tablets',
      category: 'Antibiotics',
      batchNumber: 'AZ-2023-0092',
      supplier: 'Pfizer Global Supply',
      stockQty: 18,
      minThreshold: 60,
      expiryDate: '2025-05-18',
      daysUntilExpiry: 56,
      urgency: 'warning',
      unitCost: 18.50,
      suggestedReorderQty: 200
    },
    {
      id: 'BT-9102',
      drugName: 'Omeprazole 20mg Delayed-Release',
      category: 'Gastrointestinal',
      batchNumber: 'OM-2023-7721',
      supplier: 'Teva Pharmaceuticals',
      stockQty: 820,
      minThreshold: 200,
      expiryDate: '2025-06-25',
      daysUntilExpiry: 94,
      urgency: 'normal',
      unitCost: 8.20,
      suggestedReorderQty: 400
    },
    {
      id: 'BT-9221',
      drugName: 'Loratadine 10mg Antihistamine',
      category: 'Allergy Care',
      batchNumber: 'LR-2023-3312',
      supplier: 'Bayer Consumer Health',
      stockQty: 25,
      minThreshold: 80,
      expiryDate: '2025-07-15',
      daysUntilExpiry: 114,
      urgency: 'reorder_needed', // low stock trigger
      unitCost: 6.50,
      suggestedReorderQty: 300
    }
  ];

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          batch.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'critical') return matchesSearch && batch.urgency === 'critical';
    if (filter === 'warning') return matchesSearch && batch.urgency === 'warning';
    if (filter === 'reorder') return matchesSearch && (batch.stockQty <= batch.minThreshold || batch.urgency === 'reorder_needed');
    return matchesSearch;
  });

  const handleDispatchPO = (batchId) => {
    setPoStatus(prev => ({ ...prev, [batchId]: 'sending' }));
    setTimeout(() => {
      setPoStatus(prev => ({ ...prev, [batchId]: 'sent' }));
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-amber-500/30 text-amber-100 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            <FaExclamationTriangle /> Automated Supply Chain Monitor
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Batch Expiry & Smart Reordering</h1>
          <p className="text-amber-100 mt-1">Real-time batch shelf-life analytics, threshold breach alerts & 1-click Purchase Order generation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-amber-500/30 text-right">
            <span className="text-xs text-amber-200 block font-medium">Expiring &lt; 30 Days</span>
            <span className="text-2xl font-black text-amber-100">1 Batch (340 Units)</span>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase">Critical (&lt; 30 Days)</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">1 Batch</h3>
            <p className="text-xs text-slate-500 mt-0.5">$4,216.00 at risk</p>
          </div>
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl">
            <FaShieldAlt />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase">Warning (30-60 Days)</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">2 Batches</h3>
            <p className="text-xs text-slate-500 mt-0.5">60 units needing markdowns</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl">
            <FaCalendarAlt />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase">Low Stock Triggers</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">3 SKUs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Below minimum stock level</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">
            <FaTruck />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase">Auto-Reorder Dispatch</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">Active</h3>
            <p className="text-xs text-slate-500 mt-0.5">EDI Vendor Protocol Ready</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaCheckCircle />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by drug name, batch ID, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Batches' },
              { id: 'critical', label: 'Critical Expiry (<30d)' },
              { id: 'warning', label: 'Warning Expiry (30-60d)' },
              { id: 'reorder', label: 'Low Stock / Reorder Needed' }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filter === btn.id
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                <th className="p-4">Medication & Batch ID</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Current Stock / Min</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Shelf-Life Status</th>
                <th className="p-4 text-right">Smart Purchase Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredBatches.map((item) => {
                const status = poStatus[item.id];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{item.drugName}</div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>Batch: {item.batchNumber}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.category}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{item.supplier}</td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-800">{item.stockQty} units</div>
                      <div className="text-xs text-slate-400">Min Threshold: {item.minThreshold}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{item.expiryDate}</div>
                      <div className="text-xs text-slate-500">{item.daysUntilExpiry} days remaining</div>
                    </td>
                    <td className="p-4">
                      {item.urgency === 'critical' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                          <FaExclamationTriangle className="text-red-600" /> &lt; 30 Days Left
                        </span>
                      )}
                      {item.urgency === 'warning' && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                          <FaCalendarAlt className="text-amber-600" /> Expiry Approaching
                        </span>
                      )}
                      {(item.urgency === 'normal' || item.urgency === 'reorder_needed') && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          <FaCheckCircle className="text-slate-500" /> Optimal Shelf-Life
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {status === 'sent' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <FaCheckCircle /> PO #{item.id}-REORDER Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDispatchPO(item.id)}
                          disabled={status === 'sending'}
                          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
                        >
                          {status === 'sending' ? (
                            <>
                              <FaSync className="animate-spin" /> Dispatching PO...
                            </>
                          ) : (
                            <>
                              <FaPaperPlane /> Reorder {item.suggestedReorderQty} Units
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
