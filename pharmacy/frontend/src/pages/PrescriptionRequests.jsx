import React, { useState } from 'react';
import { FaSearch, FaBell, FaBriefcaseMedical, FaHome, FaCashRegister, FaBox, FaFilePrescription, FaChevronRight, FaCircle } from 'react-icons/fa';

const PrescriptionRequests = () => {
  const [activeTab, setActiveTab] = useState('Pending (12)');

  const requests = [
    {
      id: 1,
      name: 'Sarah Jenkins',
      reqId: 'PR-8821',
      time: 'Today, 10:45 AM',
      status: 'PENDING',
      statusColor: 'text-amber-500 bg-amber-50',
      dotColor: 'text-amber-500',
      action: 'Review',
      actionColor: 'text-emerald-500',
      image: 'https://images.unsplash.com/photo-1586282391129-76a6df230234?w=100&h=100&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Michael Chen',
      reqId: 'PR-8819',
      time: 'Today, 09:12 AM',
      status: 'PENDING',
      statusColor: 'text-amber-500 bg-amber-50',
      dotColor: 'text-amber-500',
      action: 'Review',
      actionColor: 'text-emerald-500',
      image: 'https://images.unsplash.com/photo-1550572017-edb9b940e729?w=100&h=100&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      reqId: 'PR-8815',
      time: 'Oct 24, 04:30 PM',
      status: 'PENDING',
      statusColor: 'text-amber-500 bg-amber-50',
      dotColor: 'text-amber-500',
      action: 'Review',
      actionColor: 'text-emerald-500',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5e4a8b7dd?w=100&h=100&fit=crop&q=80'
    },
    {
      id: 4,
      name: 'David Wilson',
      reqId: 'PR-8812',
      time: 'Oct 24, 02:15 PM',
      status: 'VERIFIED',
      statusColor: 'text-emerald-500 bg-emerald-50',
      dotColor: 'text-emerald-500',
      action: 'Done',
      actionColor: 'text-slate-400',
      image: 'https://images.unsplash.com/photo-1550572017-edb9b940e729?w=100&h=100&fit=crop&q=80'
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl font-outfit text-slate-800 text-sm">
      
      {/* Top Header Areas (Fixed) */}
      <div className="bg-white shrink-0 z-10 pt-6 shadow-sm">
        
        {/* Title Bar */}
        <header className="px-5 flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <div className="bg-emerald-500 p-1 rounded-lg text-white">
               <FaBriefcaseMedical className="w-4 h-4" />
             </div>
             <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">Rx Requests</h1>
          </div>
          
          <div className="relative cursor-pointer">
            <FaBell className="w-5 h-5 text-slate-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-5 mb-4 relative">
          <FaSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]" />
          <input 
            type="text" 
            placeholder="Search patient or Rx ID..." 
            className="w-full pl-9 pr-3 py-2 bg-slate-50 text-slate-900 border-none rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-emerald-50 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="px-5 flex border-b border-slate-100">
          {['Pending (12)', 'Verified', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-[12px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab 
                  ? 'text-emerald-500 border-emerald-500' 
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50 pb-24 space-y-3">
         {requests.map((req) => (
            <div key={req.id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.98]">
              
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                <img src={req.image} alt="" className="w-full h-full object-cover grayscale opacity-50" />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                 
                 <div className="flex justify-between items-start mb-0.5">
                   <div className="truncate">
                     <h3 className="font-black text-[13px] text-slate-900 leading-tight uppercase tracking-tight">{req.name}</h3>
                     <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">ID: {req.reqId}</p>
                   </div>
                   <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${req.statusColor}`}>
                     <FaCircle className={`w-1 h-1 ${req.dotColor}`} />
                     {req.status}
                   </span>
                 </div>

                 <div className="flex justify-between items-end mt-1">
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{req.time}</p>
                   
                   {req.action === 'Review' ? (
                      <button className={`flex items-center gap-0.5 text-[11px] font-black uppercase tracking-widest ${req.actionColor}`}>
                         {req.action} <FaChevronRight className="w-2 h-2" />
                      </button>
                   ) : (
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                         {req.action}
                      </span>
                   )}
                 </div>

              </div>
            </div>
         ))}
      </main>

      {/* Bottom Navigation Navbar */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 flex justify-between items-center px-6 py-2 pb-5 z-10 shrink-0 shadow-sm">
        <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors">
          <FaHome className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors">
          <FaCashRegister className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">POS</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors">
          <FaBox className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Stock</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer text-emerald-500">
          <FaFilePrescription className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Rx</span>
        </div>
      </nav>

    </div>
  );
};

export default PrescriptionRequests;
