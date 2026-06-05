import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTerminal, FaBolt } from 'react-icons/fa';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const inputRef = useRef(null);

    const commands = [
        { name: 'Go to Dashboard', path: '/', icon: '📊' },
        { name: 'POS Terminal', path: '/pos', icon: '🛒' },
        { name: 'Retail POS', path: '/supermarket/pos', icon: '🛍️' },
        { name: 'Inventory Vault', path: '/inventory', icon: '📦' },
        { name: 'Staff Management', path: '/staff', icon: '👥' },
        { name: 'Financial Overview', path: '/financials', icon: '📈' },
        { name: 'Attendance Logging', path: '/attendance', icon: '🕒' },
        { name: 'Smart Procurement', path: '/procurement/advice', icon: '💡' },
        { name: 'Audit Logs', path: '/audit-logs', icon: '📜' },
        { name: 'Help & Support', path: '/help', icon: '❓' },
    ];

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredCommands = commands.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                    <FaTerminal className="text-emerald-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search commands (e.g. 'pos', 'stock')..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none font-black text-sm uppercase tracking-tight"
                    />
                    <div className="flex gap-1">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-black text-slate-400">ESC</span>
                    </div>
                </div>

                <div className="p-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {filteredCommands.length > 0 ? filteredCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                navigate(cmd.path);
                                onClose();
                                setQuery('');
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50 text-left group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-lg">{cmd.icon}</span>
                                <span className="text-[12px] font-black text-slate-700 uppercase group-hover:text-emerald-700">{cmd.name}</span>
                            </div>
                            <FaBolt className="text-slate-100 group-hover:text-emerald-200" />
                        </button>
                    )) : (
                        <p className="p-8 text-center text-slate-400 font-black uppercase text-[10px]">No matching command found</p>
                    )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Press <span className="text-emerald-500 font-black">ENTER</span> to execute
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
