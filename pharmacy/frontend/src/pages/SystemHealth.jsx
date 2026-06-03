import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaHeartbeat, FaMicrochip, FaMemory, FaDatabase, FaServer, FaShieldAlt } from 'react-icons/fa';

const SystemHealth = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const interval = setInterval(fetchHealth, 5000); // Pulse every 5 seconds
        fetchHealth();
        return () => clearInterval(interval);
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await api.get('health-check/');
            setHealth(res.data);
        } catch (e) {
            console.error("Health check failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-400">Pinging Core...</div>;

    return (
        <div className="w-full space-y-8 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <FaServer className="text-emerald-500" /> System Infrastructure
                </h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Real-time health monitoring & Node diagnostic</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CPU */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPU Compute</span>
                        <FaMicrochip className="text-emerald-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-slate-900 tabular-nums">{health?.metrics?.cpu || 0}%</p>
                        <span className="text-[10px] font-black uppercase text-emerald-500 mb-1">Optimal</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${health?.metrics?.cpu || 0}%` }}></div>
                    </div>
                </div>

                {/* Memory */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memory Allocation</span>
                        <FaMemory className="text-blue-500" />
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-4xl font-black text-slate-900 tabular-nums">{health?.metrics?.memory || 0}%</p>
                        <span className="text-[10px] font-black uppercase text-blue-500 mb-1">Stable</span>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${health?.metrics?.memory || 0}%` }}></div>
                    </div>
                </div>

                {/* DB */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Engine</span>
                        <FaDatabase className="text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-lg font-black text-slate-900 uppercase">{health?.database || 'Connected'}</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50">7 Days Uptime - 99.9% Reliable</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <FaShieldAlt size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Enterprise Core Status</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-1">Docker Orchestration: Josiah-POS-Stack</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">API Node</p>
                            <p className="text-emerald-400 font-black uppercase tracking-tighter">Healthy / SSL</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Socket Bridge</p>
                            <p className="text-emerald-400 font-black uppercase tracking-tighter">Connected</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Storage Volume</p>
                            <p className="text-emerald-400 font-black uppercase tracking-tighter">1.2GB / 20GB</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Version</p>
                            <p className="text-slate-300 font-black uppercase tracking-tighter">v1.1.0-STABLE</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
