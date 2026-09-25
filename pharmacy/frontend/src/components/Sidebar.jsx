import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import settingsService from '../services/settingsService';
import {
  FaThLarge, FaCashRegister, FaBox,
  FaBriefcaseMedical,
  FaChartLine, FaUsers, FaCog,
  FaShoppingCart, FaSignOutAlt, FaTimes,
  FaUserPlus, FaArrowLeft, FaMoneyBill
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [shopName, setShopName] = useState('pharmacylogo');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.data && res.data.length > 0) {
          setShopName(res.data[0].shop_name);
        }
      } catch {
        console.error("Branding load failed");
      }
    };
    fetchBranding();
  }, []);

  const role = (user?.role || 'Admin').toLowerCase();
  const isAdmin = user?.isAdmin || role.includes('admin') || role.includes('manager');
  const isPharmacist = role.includes('pharmacist') || role.includes('doctor');
  const isCashier = role.includes('cashier') || role.includes('sales');

  const navItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/', roles: ['all'] },
    { name: 'POS Terminal', icon: <FaCashRegister />, path: '/pos', roles: ['admin', 'pharmacist', 'cashier', 'all'] },
    { name: 'Retail POS', icon: <FaShoppingCart />, path: '/supermarket/pos', roles: ['admin', 'cashier', 'all'] },
    { name: 'Supermarket', icon: <FaShoppingCart />, path: '/supermarket', roles: ['admin', 'cashier', 'all'] },
    { name: 'Inventory', icon: <FaBox />, path: '/inventory', roles: ['admin', 'pharmacist', 'cashier', 'all'] },
    { name: 'Customers', icon: <FaUsers />, path: '/customers', roles: ['admin', 'pharmacist', 'cashier', 'all'] },
    { name: 'Reports', icon: <FaChartLine />, path: '/reports/sales', roles: ['admin', 'pharmacist'] },
    { name: 'Staff List', icon: <FaUsers />, path: '/staff', roles: ['admin'] },
    { name: 'Staff Registration', icon: <FaUserPlus />, path: '/staff/new', roles: ['admin'] },
    { name: 'Staff Dashboards', icon: <FaChartLine />, path: '/staff/dashboards', roles: ['admin', 'pharmacist'] },
    { name: 'Expenses', icon: <FaMoneyBill />, path: '/expenses', roles: ['admin'] },
    { name: 'Financials', icon: <FaChartLine />, path: '/financials', roles: ['admin'] },
    { name: 'Settings', icon: <FaCog />, path: '/settings', roles: ['admin'] },
  ].filter(item => {
    if (isAdmin) return true;
    if (isPharmacist && (item.roles.includes('pharmacist') || item.roles.includes('all'))) return true;
    if (isCashier && (item.roles.includes('cashier') || item.roles.includes('all'))) return true;
    return item.roles.includes('all');
  });

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 w-64 bg-emerald-600 text-white flex flex-col h-full shrink-0 shadow-xl z-40 overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-lg"
            title="Go Back"
          >
            <FaArrowLeft />
          </button>
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

        <div className="bg-white/10 rounded-xl p-4 border border-white/5 space-y-1">
          <span className="block text-[10px] font-black uppercase tracking-widest text-white/60">Active Profile</span>
          <p className="text-xs font-black truncate">{user?.fullName || user?.username || 'User'}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded text-white uppercase tracking-wider">
              {user?.role || 'Staff'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[10px] font-bold">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
