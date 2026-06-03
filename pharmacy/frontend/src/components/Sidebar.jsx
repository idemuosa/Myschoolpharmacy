import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import settingsService from '../services/settingsService';
import {
  FaThLarge, FaCashRegister, FaBox,
  FaBriefcaseMedical,
  FaChartLine, FaUsers, FaCog,
  FaShoppingCart, FaSignOutAlt, FaTimes,
  FaUserPlus, FaArrowLeft, FaMoneyBill, FaHistory, FaTruck, FaUserClock, FaFileInvoice, FaClipboardCheck, FaBullhorn, FaUserTag, FaHeartbeat, FaQuestionCircle, FaLightbulb
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);
  const [shopName, setShopName] = useState('pharmacylogo');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.data && res.data.length > 0) {
          setShopName(res.data[0].shop_name);
        }
      } catch {
        // Branding load failed
      }
    };
    fetchBranding();
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/', adminOnly: true },
    { name: 'POS Terminal', icon: <FaCashRegister />, path: '/pos' },
    { name: 'Retail POS', icon: <FaShoppingCart />, path: '/supermarket/pos' },
    { name: 'Supermarket', icon: <FaShoppingCart />, path: '/supermarket', adminOnly: true },
    { name: 'Inventory', icon: <FaBox />, path: '/inventory', adminOnly: true },
    { name: 'Suppliers', icon: <FaTruck />, path: '/suppliers', adminOnly: true },
    { name: 'Procurement', icon: <FaFileInvoice />, path: '/procurement', adminOnly: true },
    { name: 'Smart Restock', icon: <FaLightbulb />, path: '/procurement/advice', adminOnly: true },
    { name: 'Audit', icon: <FaClipboardCheck />, path: '/audit', adminOnly: true },
    { name: 'Outreach', icon: <FaBullhorn />, path: '/outreach', adminOnly: true },
    { name: 'Customers', icon: <FaUsers />, path: '/customers', adminOnly: true },
    { name: 'Reports', icon: <FaChartLine />, path: '/reports/sales', adminOnly: true },
    { name: 'Attendance', icon: <FaUserClock />, path: '/attendance' },
    { name: 'Staff List', icon: <FaUsers />, path: '/staff', adminOnly: true },
    { name: 'Staff Registration', icon: <FaUserPlus />, path: '/staff/new', adminOnly: true },
    { name: 'Staff Dashboards', icon: <FaChartLine />, path: '/staff/dashboards', adminOnly: true },
    { name: 'Expenses', icon: <FaMoneyBill />, path: '/expenses', adminOnly: true },
    { name: 'Financials', icon: <FaChartLine />, path: '/financials', adminOnly: true },
    { name: 'Debtors', icon: <FaUserTag />, path: '/debts', adminOnly: true },
    { name: 'Audit Logs', icon: <FaHistory />, path: '/audit-logs', adminOnly: true },
    { name: 'Help & Support', icon: <FaQuestionCircle />, path: '/help' },
    { name: 'Settings', icon: <FaCog />, path: '/settings', adminOnly: true },
  ].filter(item => !item.adminOnly || user?.isAdmin);

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 w-64 bg-emerald-600 text-white flex flex-col h-full shrink-0 shadow-xl z-40 overflow-y-auto transition-transform duration-300 ease-in-out relative
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Subtle Sidebar Background */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none overflow-hidden z-0">
        <img
          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-lg"
            title="Go Back"
          >
            <FaArrowLeft />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black font-outfit">
            J
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

      <nav className="flex-1 px-4 py-4 space-y-1 relative z-10">
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

      <div className="p-6 mt-auto space-y-4 relative z-10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-all bg-emerald-700/50"
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>

        <div
          onClick={() => navigate('/system/health')}
          className="bg-white/10 rounded-xl p-4 border border-white/5 cursor-pointer hover:bg-white/20 transition-all group"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="block text-[12px] font-black uppercase tracking-widest text-white/60">System Status</span>
            <FaHeartbeat className="text-white/30 group-hover:text-emerald-400 transition-colors" />
          </div>
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
