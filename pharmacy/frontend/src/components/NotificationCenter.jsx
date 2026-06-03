import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaTimes, FaInbox, FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { setIsOpen(!isOpen); if(!isOpen) markAllAsRead(); }}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all relative"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Notifications</h3>
                        <div className="flex gap-2">
                             <button onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">Clear</button>
                             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><FaTimes className="text-slate-400 text-[10px]" /></button>
                        </div>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
                        {notifications.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                                <FaInbox size={32} className="mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No alerts recorded</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <Link
                                        key={notif.id}
                                        to={notif.link}
                                        onClick={() => setIsOpen(false)}
                                        className="block p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'opacity-0' : 'bg-emerald-500'}`} />
                                            <div className="flex-1">
                                                <p className="text-[12px] font-black text-slate-900 leading-tight mb-0.5">{notif.title}</p>
                                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{notif.message}</p>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 block">{notif.time}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-50 text-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auto-clears every 24 hours</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
