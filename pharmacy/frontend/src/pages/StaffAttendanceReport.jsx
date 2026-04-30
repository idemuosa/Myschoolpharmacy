import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FaSearch, FaBell, FaDownload, FaUsers, 
  FaCalendarAlt, 
  FaChevronLeft, FaChevronRight, FaSignInAlt, 
  FaClock, FaUserMinus
} from 'react-icons/fa';

const StaffAttendanceReport = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('staff/');
      setStaff(response.data);
    } catch (error) {
       console.error("Error fetching staff for attendance:", error);
    }
  };

  const attendanceData = staff.map(s => ({
    initials: s.name.split(' ').map(n => n[0]).join(''),
    initialsColor: 'bg-emerald-50 text-emerald-600',
    name: s.name,
    role: s.role,
    date: new Date().toLocaleDateString(),
    clockIn: '08:00 AM', 
    clockOut: '05:00 PM',
    totalHours: '9h',
    status: 'PRESENT',
    statusColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    clockInColor: 'text-slate-900'
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative text-xs">
        
        {/* Top Header */}
        <header className="bg-white px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0 h-14">
          <div className="flex-1 max-w-md relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]" />
            <input 
              type="text" 
              placeholder="Search attendance logs..." 
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-transparent rounded-lg text-[10px] font-black focus:ring-2 focus:ring-emerald-50 transition-all outline-none uppercase tracking-tight"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-6">
            <div className="relative">
              <FaBell className="text-slate-400 w-3.5 h-3.5" />
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500 border border-white"></div>
            </div>
            
            <button className="bg-emerald-500 text-white font-black py-1 px-4 rounded-lg flex items-center gap-2 transition-all shadow-none text-[9px] uppercase tracking-widest h-8 border border-emerald-500">
               <FaDownload className="w-2.5 h-2.5" /> Export
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-5 relative scrollbar-hide">
           
           <div className="mb-6">
              <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-outfit">Staff Attendance</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Clinical workforce activity & historical logs</p>
           </div>

           {/* KPI Cards Grid */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                   <div className="p-1 text-blue-500 text-sm"><FaUsers /></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                </div>
                <p className="text-sm font-black text-slate-900 tabular-nums">{staff.length}</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                   <div className="p-1 text-emerald-500 text-sm"><FaSignInAlt /></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                </div>
                <p className="text-sm font-black text-slate-900 tabular-nums">98</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                   <div className="p-1 text-orange-500 text-sm"><FaClock /></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Late</span>
                </div>
                <p className="text-sm font-black text-slate-900 tabular-nums">05</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                   <div className="p-1 text-red-500 text-sm"><FaUserMinus /></div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                </div>
                <p className="text-sm font-black text-slate-900 tabular-nums">12</p>
              </div>
           </div>

           {/* Filter Section */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date Period</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         value="Today, Oct 24"
                         readOnly
                         className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-[10px] font-black rounded-lg px-3 py-1.5 outline-none"
                       />
                       <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
                    <select className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-[10px] font-black rounded-lg px-3 py-1.5 outline-none appearance-none">
                      <option>Pharmacy</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Specialist</label>
                    <select className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-[10px] font-black rounded-lg px-3 py-1.5 outline-none appearance-none">
                      <option>All Staff</option>
                    </select>
                 </div>
                 <button className="h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[9px] rounded-lg tracking-widest uppercase border border-slate-100 transition-all">
                    Update Audit
                 </button>
              </div>
           </div>

           {/* Table */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase">Name</th>
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase">Role</th>
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase text-center">Clock In</th>
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase text-center">Clock Out</th>
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase text-right">Hours</th>
                      <th className="py-2.5 px-5 text-[8px] font-black text-slate-400 tracking-widest uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {attendanceData.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${record.initialsColor}`}>{record.initials}</div>
                             <span className="font-black text-[10px] text-slate-900 uppercase tracking-tight">{record.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-[9px] font-bold text-slate-400 uppercase">{record.role}</td>
                        <td className="py-3 px-5 text-center text-[10px] font-black text-slate-900 tabular-nums">{record.clockIn.split(' ')[0]}</td>
                        <td className="py-3 px-5 text-center text-[10px] font-black text-slate-900 tabular-nums">{record.clockOut.split(' ')[0]}</td>
                        <td className="py-3 px-5 text-right font-black text-[10px] text-slate-600 tabular-nums">{record.totalHours}</td>
                        <td className="py-3 px-5 text-center">
                          <span className={`px-2 py-0.5 text-[7px] font-black rounded-full uppercase tracking-widest ${record.statusColor}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 bg-slate-50/30 flex items-center justify-between">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                   Showing 5 of 124
                 </span>
                 <div className="flex items-center gap-1.5">
                   <button className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400"><FaChevronLeft className="w-2 h-2" /></button>
                   <button className="w-5 h-5 rounded bg-emerald-500 text-white font-black text-[9px] flex items-center justify-center">1</button>
                   <button className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-400"><FaChevronRight className="w-2 h-2" /></button>
                 </div>
              </div>
           </div>
        </main>
    </div>
  );
};

export default StaffAttendanceReport;
