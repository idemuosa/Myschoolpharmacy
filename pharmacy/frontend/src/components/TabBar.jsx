import React, { useState, useRef } from 'react';
import { useTabs } from '../context/TabContext';
import { FaTimes, FaEllipsisV, FaPlus, FaLaptop, FaMinus, FaSquare, FaCompress } from 'react-icons/fa';
import { isElectron, minimizeWindow, maximizeWindow, closeWindow } from '../services/platform';
import { useNavigate } from 'react-router-dom';

const TabBar = () => {
  const { tabs, activeTabId, switchTab, closeTab, closeOtherTabs, closeAllTabs } = useTabs();
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handleQuickAdd = () => {
    navigate('/pos');
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 pt-1.5 select-none shrink-0 overflow-hidden shadow-inner">
      {/* Scrollable Tabs List */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-full flex-1 pr-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-black transition-all cursor-pointer shrink-0 border-t border-x ${
                isActive
                  ? 'bg-slate-50 text-slate-900 border-slate-200 shadow-md font-extrabold -mb-px z-10'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-500 opacity-50'}`} />
              <span className="truncate max-w-[130px] sm:max-w-[160px] tracking-tight">{tab.title}</span>

              {tab.closable !== false && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className={`p-1 rounded-md transition-colors ${
                    isActive
                      ? 'text-slate-400 hover:text-red-600 hover:bg-slate-200'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Close Tab"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>
          );
        })}

        {/* Quick Open POS Tab */}
        <button
          onClick={handleQuickAdd}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors text-xs shrink-0 ml-1"
          title="Open POS Terminal Tab"
        >
          <FaPlus />
        </button>
      </div>

      {/* Tab Management Actions */}
      <div className="flex items-center gap-1.5 pl-2 shrink-0 border-l border-slate-800 py-1">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs transition-colors"
            title="Tab Options"
          >
            <FaEllipsisV />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1 text-xs text-slate-200"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  closeOtherTabs(activeTabId);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-emerald-400 transition-colors font-bold"
              >
                Close Other Tabs
              </button>
              <button
                onClick={() => {
                  closeAllTabs();
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800 hover:text-red-400 transition-colors font-bold border-t border-slate-800"
              >
                Close All Tabs
              </button>
            </div>
          )}
        </div>

        {/* Desktop App Window Controls (if running inside Electron Desktop App) */}
        {isElectron() && (
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800 text-slate-400">
            <button
              onClick={minimizeWindow}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded text-[10px]"
              title="Minimize Window"
            >
              <FaMinus />
            </button>
            <button
              onClick={maximizeWindow}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded text-[10px]"
              title="Maximize / Restore"
            >
              <FaCompress />
            </button>
            <button
              onClick={closeWindow}
              className="p-1.5 hover:text-white hover:bg-red-600 rounded text-[10px]"
              title="Close Application"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabBar;
