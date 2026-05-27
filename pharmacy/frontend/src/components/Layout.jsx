import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaBars, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false);
  }, [location]);

  // Global Back arrow key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If user presses ArrowLeft and isn't in an input/textarea
      if (e.key === 'ArrowLeft' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-base relative">
      {/* Background Pattern Spread Across All Pages */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden z-0">
        <img
          src="https://images.unsplash.com/photo-1587854685352-c8462d18c962?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover fixed"
        />
      </div>

      {/* Sidebar with mobile state */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Page-specific background pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden z-0">
          <img
            src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-emerald-600 text-white shadow-md z-20 shrink-0 relative">
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FaBars className="text-xl" />
            </button>
            <span className="font-outfit font-bold tracking-tight">pharmacylogo</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
