import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FaPlus, FaSearch, FaEye, FaPen, FaCalendarAlt, FaBriefcaseMedical, FaCheckCircle, FaUserShield
} from 'react-icons/fa';

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchStaff(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchStaff = async (signal) => {
    try {
      const response = await api.get('staff/', { signal });
      setStaffData(response.data);
    } catch (error) {
       console.error("Error fetching staff:", error);
    } finally {
       setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case 'PHARMACIST': return 'bg-emerald-50 text-emerald-600';
      case 'TECHNICIAN': return 'bg-blue-50 text-blue-600';
      case 'ADMIN': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 text-sm">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit">Staff Directory</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Clinical access management</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-[500px]">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input 
                type="text" 
                placeholder="Search staff members..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            
            <button 
              onClick={() => navigate('/staff/new')}
              className="btn-pharmacy px-4 py-2 w-full sm:w-auto text-xs whitespace-nowrap border shadow-none"
            >
              <FaPlus /> New Registry
            </button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
               <FaCheckCircle />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Active</p>
              <p className="text-sm font-black text-slate-900">{staffData.length}</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">
               <FaCalendarAlt />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Attendance</p>
              <p className="text-sm font-black text-slate-900">8</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
               <FaUserShield />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Clinicians</p>
              <p className="text-sm font-black text-slate-900">12</p>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Medical Professional</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Dept</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400 font-bold text-[12px]">Scanning credentials...</td></tr>
                ) : (
                  staffData.filter(s => (s.name || s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())).map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={staff.photo || 'https://via.placeholder.com/150'} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-100" />
                          <div>
                            <p className="text-[12px] font-black text-slate-900 group-hover:text-emerald-600 uppercase tracking-tight">{staff.full_name || staff.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 lowercase">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${getRoleBadge(staff.role)}`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-[12px] font-bold text-slate-600 uppercase">
                        {staff.department || 'Clinical'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                           <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                           <span className="text-[10px] font-black uppercase">Verified</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5 text-slate-300">
                          <button className="p-1.5 hover:bg-emerald-50 hover:text-emerald-500 rounded-lg transition-all"><FaEye className="text-sm" /></button>
                          <button className="p-1.5 hover:bg-emerald-50 hover:text-emerald-500 rounded-lg transition-all"><FaPen className="text-xs" /></button>
                        </div>
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

export default StaffManagement;
