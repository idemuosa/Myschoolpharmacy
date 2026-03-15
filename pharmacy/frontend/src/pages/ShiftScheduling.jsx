import React from 'react';
import { FaSearch, FaBell, FaUsers, FaClock, FaExclamationTriangle, FaPlus, FaCalendarAlt, FaThLarge, FaBox, FaCog } from 'react-icons/fa';

const ShiftScheduling = () => {
  const staffMembers = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      role: 'LEAD PHARMACIST',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      schedule: {
        mon: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        tue: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        wed: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        thu: null,
        fri: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        sat: null,
        sun: null
      }
    },
    {
      id: 2,
      name: 'Michael Rivera',
      role: 'PHARMACY TECH',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      schedule: {
        mon: { type: 'Night Shift', hours: '20:00 - 04:00', status: 'pending' },
        tue: null,
        wed: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        thu: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        fri: { type: 'Night Shift', hours: '20:00 - 04:00', status: 'confirmed' },
        sat: { type: 'Morning', hours: '09:00 - 15:00', status: 'light' },
        sun: null
      }
    },
    {
      id: 3,
      name: 'Emily Chen',
      role: 'FRONT DESK ADMIN',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      schedule: {
        mon: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        tue: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        wed: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'pending' },
        thu: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        fri: { type: 'Morning', hours: '08:00 - 14:00', status: 'confirmed' },
        sat: null,
        sun: null
      }
    },
    {
      id: 4,
      name: 'David Okafor',
      role: 'LAB ASSISTANT',
      avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
      schedule: {
        mon: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        tue: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        wed: null,
        thu: { type: 'Morning', hours: '08:00 - 14:00', status: 'pending' },
        fri: { type: 'Afternoon', hours: '14:00 - 20:00', status: 'confirmed' },
        sat: { type: 'Night Shift', hours: '18:00 - 02:00', status: 'confirmed' },
        sun: null
      }
    }
  ];

  const getShiftColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 text-white';
      case 'pending': return 'bg-amber-400 text-white';
      case 'light': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100/50';
    }
  };

  const renderShiftSquare = (shift) => {
    if (!shift) {
      return (
        <div className="h-full flex items-center justify-center p-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-200">
             <div className="w-full h-0 border-t-2 border-gray-200 transform -rotate-45 relative top-1.5"></div>
          </div>
        </div>
      );
    }

    return (
      <div className={`h-full w-full rounded-lg p-2 flex flex-col justify-center ${getShiftColor(shift.status)}`}>
        <p className="font-bold text-xs">{shift.type}</p>
        <p className="text-[10px] opacity-90">{shift.hours}</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3">
             <div className="bg-emerald-600 p-2 rounded-full text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
                </svg>
             </div>
             <div>
                <span className="block text-lg font-bold text-gray-900 leading-tight">Green Cross</span>
                <span className="block text-[10px] text-emerald-500 font-semibold tracking-wider">Pharmacy Management</span>
             </div>
          </div>

          <nav className="mt-4 text-gray-600 space-y-2 px-4">
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors text-gray-600">
              <FaThLarge className="text-gray-400 w-5 h-5" /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold">
              <FaCalendarAlt className="text-emerald-500 w-5 h-5" /> Schedule
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors text-gray-600">
              <FaUsers className="text-gray-400 w-5 h-5" /> Staff
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors text-gray-600">
              <FaBox className="text-gray-400 w-5 h-5" /> Inventory
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-semibold transition-colors text-gray-600 mt-4">
              <FaCog className="text-gray-400 w-5 h-5" /> Settings
            </a>
          </nav>
        </div>

        <div className="p-6">
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <FaPlus className="w-4 h-4" /> New Entry
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-900">Weekly Staff Schedule</h1>
            
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-emerald-500 w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm w-64 focus:outline-none focus:bg-white focus:border-gray-200 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-gray-600">
            <div className="relative">
                <FaBell className="w-5 h-5 hover:text-emerald-600 cursor-pointer transition-colors" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="Admin" className="w-9 h-9 rounded-full object-cover border border-gray-200 cursor-pointer" />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-1">
                        <span>Management</span>
                        <span className="text-gray-300">›</span>
                        <span>Shift Scheduling</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Week of Oct 23 - Oct 29, 2023</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Publish Schedule
                    </button>
                    <button className="px-5 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors text-sm flex items-center gap-2">
                        <FaCalendarAlt /> Schedule New Shift
                    </button>
                </div>
            </div>

            {/* Filters & Legend */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-100 text-emerald-800 font-semibold text-xs tracking-wider rounded border border-emerald-200 flex items-center gap-1">
                        ALL DEPARTMENTS <span className="text-[10px]">▼</span>
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 font-bold text-xs tracking-wider rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                        PHARMACY
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 font-bold text-xs tracking-wider rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                        FRONT DESK
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-600 font-bold text-xs tracking-wider rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                        TECHNICIANS
                    </button>
                </div>

                <div className="flex gap-4 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Confirmed</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Pending</div>
                </div>
            </div>

            {/* The Schedule Grid (Table) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-6 px-6 w-64 bg-gray-50/50 text-xs font-bold text-gray-500 tracking-wider">
                                    STAFF MEMBERS
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-1">MON</p>
                                    <p className="text-2xl font-bold text-gray-900">23</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-1">TUE</p>
                                    <p className="text-2xl font-bold text-gray-900">24</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100 bg-emerald-50/50">
                                    <p className="text-xs font-bold text-emerald-500 tracking-wider mb-1">WED</p>
                                    <p className="text-2xl font-bold text-emerald-500">25</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-1">THU</p>
                                    <p className="text-2xl font-bold text-gray-900">26</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-1">FRI</p>
                                    <p className="text-2xl font-bold text-gray-900">27</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-red-500/80 tracking-wider mb-1">SAT</p>
                                    <p className="text-2xl font-bold text-red-500/80">28</p>
                                </th>
                                <th className="py-4 px-2 text-center border-l border-gray-100">
                                    <p className="text-xs font-bold text-red-500/80 tracking-wider mb-1">SUN</p>
                                    <p className="text-2xl font-bold text-red-500/80">29</p>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staffMembers.map((staff) => (
                                <tr key={staff.id} className="group">
                                    <td className="py-4 px-6 border-r border-gray-100 bg-white group-hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-gray-900">{staff.name}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 tracking-wider">{staff.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-2 border-r border-gray-100 bg-white align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.mon)}
                                    </td>
                                    <td className="p-2 border-r border-gray-100 bg-white align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.tue)}
                                    </td>
                                    <td className="p-2 border-r border-emerald-50/50 bg-emerald-50/30 align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.wed)}
                                    </td>
                                    <td className="p-2 border-r border-gray-100 bg-white align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.thu)}
                                    </td>
                                    <td className="p-2 border-r border-gray-100 bg-white align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.fri)}
                                    </td>
                                    <td className="p-2 border-r border-gray-100 bg-white align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.sat)}
                                    </td>
                                    <td className="p-2 bg-gray-50/30 align-top h-24 w-32">
                                        {renderShiftSquare(staff.schedule.sun)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4 tracking-wider text-sm uppercase">
                        <FaUsers /> Staff Coverage
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-extrabold text-gray-900 leading-none">92%</span>
                        <span className="text-emerald-500 font-bold text-sm mb-1">+4% from last week</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4 tracking-wider text-sm uppercase">
                        <FaClock /> Total Hours
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-extrabold text-gray-900 leading-none">482</span>
                        <span className="text-gray-400 font-bold text-sm mb-1">Scheduled hours</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-amber-500 font-bold mb-4 tracking-wider text-sm uppercase">
                        <FaExclamationTriangle /> Unfilled Slots
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-extrabold text-amber-500 leading-none">3</span>
                        <span className="text-gray-500 font-bold text-sm mb-1">Critical shifts open</span>
                    </div>
                </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ShiftScheduling;
