import React, { useState, useEffect } from 'react';
import logService from '../services/logService';
import { FaHistory, FaUserShield, FaSearch, FaFilter, FaClock } from 'react-icons/fa';
import axios from 'axios';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        fetchLogs(controller.signal);
        return () => controller.abort();
    }, []);

    const fetchLogs = async (signal) => {
        try {
            setLoading(true);
            const response = await logService.getLogs({ signal });
            setLogs(response.data?.results || response.data || []);
        } catch (error) {
            if (axios.isCancel(error)) return;
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">System Audit Trail</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Administrative Activity Logs</p>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-0 w-full sm:w-[300px] bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-50 focus-within:border-emerald-500 transition-all shadow-sm">
                        <FaSearch className="ml-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 pl-3 pr-3 py-2 text-xs font-bold outline-none border-none bg-transparent"
                        />
                    </div>
                    <button onClick={() => fetchLogs()} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <FaClock className="text-emerald-500" />
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Retrieving logs...</td></tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">No matching records found</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-[12px] font-bold text-slate-500 tabular-nums">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                    {log.username?.[0]?.toUpperCase() || 'S'}
                                                </div>
                                                <span className="text-[12px] font-black text-slate-900">{log.username || 'System'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-tight">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {log.module}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[12px] font-bold text-slate-700 leading-relaxed max-w-md">
                                                {log.description}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
