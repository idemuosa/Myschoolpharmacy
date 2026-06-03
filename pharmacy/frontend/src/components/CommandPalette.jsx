import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaPills, FaUser, FaHistory, FaCog, FaCashRegister,
  FaShoppingCart, FaBox, FaChartLine
} from 'react-icons/fa';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const actions = [
    { id: 'pos', name: 'Open POS Terminal', icon: <FaCashRegister />, path: '/pos', category: 'General' },
    { id: 'retail', name: 'Open Supermarket POS', icon: <FaShoppingCart />, path: '/supermarket/pos', category: 'General' },
    { id: 'inventory', name: 'Manage Inventory', icon: <FaBox />, path: '/inventory', category: 'Management' },
    { id: 'customers', name: 'Patient Directory', icon: <FaUser />, path: '/customers', category: 'Management' },
    { id: 'reports', name: 'Financial Reports', icon: <FaChartLine />, path: '/reports/sales', category: 'Management' },
    { id: 'settings', name: 'System Settings', icon: <FaCog />, path: '/settings', category: 'System' },
    { id: 'logs', name: 'Audit Logs', icon: <FaHistory />, path: '/audit-logs', category: 'System' },
  ];

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleAction = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-slate-900/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative border-b border-slate-100">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. 'POS', 'Patient')..."
            className="w-full pl-14 pr-6 py-5 text-lg font-medium outline-none placeholder:text-slate-300"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && filteredActions.length > 0) handleAction(filteredActions[0].path);
            }}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length > 0 ? (
            <div className="space-y-1">
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
                  onClick={() => handleAction(action.path)}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{action.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{action.category}</p>
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100">
                    Jump to
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-bold">No results for "{query}"</p>
              <p className="text-xs">Try searching for generic terms like "Reports" or "POS"</p>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm text-slate-900">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm text-slate-900">Enter</kbd> Select</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm text-slate-900">Esc</kbd> Close</span>
          </div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Quick Action</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
