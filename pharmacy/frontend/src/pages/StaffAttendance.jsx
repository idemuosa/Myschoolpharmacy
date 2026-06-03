import React, { useState, useEffect, useContext } from 'react';
import attendanceService from '../services/attendanceService';
import staffService from '../services/staffService';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaClock, FaFingerprint, FaHistory, FaUserClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

const StaffAttendance = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffList, setStaffList] = useState([]);
    const [clocking, setClocking] = useState(false);

    useEffect(() => {
        fetchHistory();
        if (user?.isAdmin) {
            fetchStaff();
        }
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await attendanceService.getAttendance();
            const data = response.data?.results || response.data || [];
            // If not admin, only show own history
            setHistory(user?.isAdmin ? data : data.filter(a => a.staff === user?.staff_id));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await staffService.getStaff();
            setStaffList(res.data?.results || res.data || []);
        } catch {}
    };

    const handleClockIn = async () => {
        if (!user?.staff_id) return toast.error("Staff profile not linked to user");
        try {
            setClocking(true);
            const res = await attendanceService.clockIn(user.staff_id);
            toast.success(res.data.message || "Clocked In");
            fetchHistory();
        } catch (error) {
            toast.error("Clock-in failed");
        } finally {
            setClocking(false);
        }
    };

    const handleClockOut = async () => {
        if (!user?.staff_id) return toast.error("Staff profile not linked to user");
        try {
            setClocking(true);
            const res = await attendanceService.clockOut(user.staff_id);
            toast.success(res.data.message || "Clocked Out");
            fetchHistory();
        } catch (error) {
            toast.error(error.response?.data?.error || "Clock-out failed");
        } finally {
            setClocking(false);
        }
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Time & Attendance</h1>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Digital Clocking System</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Action Card */}
                <div className="lg:col-span-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden sticky top-8">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner ring-1 ring-emerald-100">
                                <FaFingerprint />
                            </div>

                            <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">System Access</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: {user?.fullName || 'Active Session'}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleClockIn}
                                    disabled={clocking}
                                    className="group relative bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase text-[12px] tracking-[0.1em] transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        <FaClock className="group-hover:rotate-12 transition-transform" />
                                        Clock In
                                    </span>
                                </button>
                                <button
                                    onClick={handleClockOut}
                                    disabled={clocking}
                                    className="group relative bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase text-[12px] tracking-[0.1em] transition-all active:scale-[0.98] shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        <FaClock className="group-hover:rotate-[-12deg] transition-transform" />
                                        Clock Out
                                    </span>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed px-4">
                                    Attendance is automatically verified via network timestamp and encrypted ID.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History/Report Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaHistory className="text-blue-500" />
                                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Attendance Logs</h3>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.isAdmin ? 'Admin Master View' : 'My Session Records'}</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Clock In</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Clock Out</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="5" className="py-12 text-center text-slate-400 font-black uppercase animate-pulse">Syncing Logs...</td></tr>
                                    ) : history.length === 0 ? (
                                        <tr><td colSpan="5" className="py-12 text-center text-slate-300 font-black uppercase tracking-widest">No activity recorded for this period</td></tr>
                                    ) : (
                                        history.map((record) => (
                                            <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500">
                                                            {record.staff_name?.[0]}
                                                        </div>
                                                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{record.staff_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-[12px] font-bold text-slate-500 tabular-nums">{new Date(record.date).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[12px] font-black text-emerald-600 tabular-nums">
                                                        {record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[12px] font-black text-slate-700 tabular-nums">
                                                        {record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                        record.clock_out ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {record.clock_out ? 'Completed' : 'On Shift'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;
