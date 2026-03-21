import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import settingsService from '../services/settingsService';
import {
  FaThLarge, FaCashRegister, FaBox,
  FaBriefcaseMedical,
  FaChartLine, FaUsers, FaCog,
  FaShoppingCart, FaSignOutAlt, FaTimes
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);
  const [shopName, setShopName] = useState('pharmacylogo');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.data && res.data.length > 0) {
          setShopName(res.data[0].shop_name);
        }
      } catch (err) {
        console.error("Branding load failed");
      }
    };
    fetchBranding();
  }, []);
  const navItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/' },
    { name: 'POS Terminal', icon: <FaCashRegister />, path: '/pos' },
    { name: 'Retail POS', icon: <FaShoppingCart />, path: '/supermarket/pos' },
    { name: 'Supermarket', icon: <FaShoppingCart />, path: '/supermarket' },
    { name: 'Inventory', icon: <FaBox />, path: '/inventory' },
    { name: 'Customers', icon: <FaUsers />, path: '/customers' },
    { name: 'Reports', icon: <FaChartLine />, path: '/reports/sales' },
    { name: 'Staff List', icon: <FaUsers />, path: '/staff' },
    { name: 'Staff Dashboards', icon: <FaChartLine />, path: '/staff/dashboards' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 w-64 bg-emerald-600 text-white flex flex-col h-full shrink-0 shadow-xl z-40 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            <FaBriefcaseMedical />
          </div>
          <span className="text-xl font-bold font-outfit tracking-tight">
            <span className="opacity-80">{shopName.split(' ')[0]} </span>{shopName.split(' ').slice(1).join(' ')}
          </span>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-bold transition-all ${isActive
                ? 'bg-white text-emerald-600 shadow-lg'
                : 'hover:bg-white/10 text-white/90 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-all bg-emerald-700/50"
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>

        <div className="bg-white/10 rounded-xl p-4 border border-white/5">
          <span className="block text-[12px] font-black uppercase tracking-widest text-white/60 mb-1">System Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-bold font-outfit">Operating Normal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
