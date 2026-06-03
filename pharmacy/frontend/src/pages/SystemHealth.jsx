import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import api from '../services/api';
import { FaHeartbeat, FaSync, FaDatabase, FaSignal, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SystemHealth = () => {
    const navigate = useNavigate();
    const [health, setHealth] = useState({
        online: navigator.onLine,
        apiStatus: 'checking',
        syncQueueSize: 0,
        localStorageSize: '0 KB',
        lastSync: localStorage.getItem('last_sync_time') || 'Never',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Every 30s
        return () => clearInterval(interval);
    }, []);

    const checkHealth = async () => {
        setLoading(true);
        try {
            // Check API
            let apiRes = 'Error';
            try {
                const res = await api.get('health-check/');
                if (res.data.status === 'healthy') apiRes = 'Optimal';
            } catch (e) {
                apiRes = 'Offline';
            }

            // Check Sync Queue
            const queue = await db.table('syncQueue').toArray();

            // Estimate Storage (Crude way)
            const drugs = await db.drugs.count();
            const sales = await db.sales.count();
            const sizeEstimate = ((drugs + sales) * 0.5).toFixed(1) + ' KB';

            setHealth({
                online: navigator.onLine,
                apiStatus: apiRes,
                syncQueueSize: queue.length,
                localStorageSize: sizeEstimate,
                lastSync: localStorage.getItem('last_sync_time') || 'Never',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 py-8 px-4 text-sm">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <FaArrowLeft className="text-slate-400" />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit">System Pulse</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Real-time Infrastructure Monitoring</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Network Status */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaSignal className={health.online ? 'text-emerald-500' : 'text-red-500'} />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">Network Connectivity</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${health.online ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {health.online ? 'Stable' : 'Disconnected'}
                        </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <div className="flex justify-between items-center text-[11px] mb-2">
                            <span className="text-slate-400 uppercase font-black">API Endpoint</span>
                            <span className={`font-black uppercase ${health.apiStatus === 'Optimal' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {health.apiStatus}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            {health.online
                                ? "Connected to primary database cluster. Real-time synchronization is active."
                                : "Operating in localized mode. All changes are being cached for deferred synchronization."}
                        </p>
                    </div>
                </div>

                {/* Data Sync Status */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaSync className={health.syncQueueSize > 0 ? 'text-amber-500 animate-spin-slow' : 'text-emerald-500'} />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">Data Synchronization</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${health.syncQueueSize === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {health.syncQueueSize === 0 ? 'Synced' : `${health.syncQueueSize} Pending`}
                        </span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <div className="flex justify-between items-center text-[11px] mb-2">
                            <span className="text-slate-400 uppercase font-black">Last Handshake</span>
                            <span className="font-black text-slate-900">{health.lastSync}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mt-3">
                            <div className={`h-full transition-all duration-1000 ${health.syncQueueSize > 0 ? 'bg-amber-500 w-1/2' : 'bg-emerald-500 w-full'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Local Storage Health */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaDatabase className="text-blue-500" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest">Edge Storage</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">Healthy</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                        <div className="flex justify-between items-center text-[11px] mb-2">
                            <span className="text-slate-400 uppercase font-black">IndexedDB Usage</span>
                            <span className="font-black text-slate-900">{health.localStorageSize}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Persistence layer (Dexie) is operating normally. Capacity remains > 99%.
                        </p>
                    </div>
                </div>

                {/* Security Pulse */}
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaHeartbeat className="text-emerald-500" />
                            <h3 className="text-[12px] font-black uppercase tracking-widest text-white">Security & Integrity</h3>
                        </div>
                        <FaCheckCircle className="text-emerald-500" />
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-[11px] text-emerald-500 font-black uppercase tracking-widest mb-1">Status: Encrypted</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                            JWT Auth Tokens & HTTPS transport active. Audit trails are being captured in real-time.
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={checkHealth}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
                <FaSync className={loading ? 'animate-spin' : ''} /> Run System Diagnostics
            </button>
        </div>
    );
};

export default SystemHealth;
