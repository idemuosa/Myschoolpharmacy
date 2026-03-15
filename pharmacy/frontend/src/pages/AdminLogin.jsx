import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shopName, setShopName] = useState('Josiah Pharmacy and Stores');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('settings/');
        if (res.data && res.data.length > 0) {
          setShopName(res.data[0].shop_name);
        }
      } catch (err) {
        console.error("Branding load failed");
      }
    };
    fetchBranding();
  }, []);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(username, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="admin-login-container text-xs">
      <div className="login-card">
        <div className="login-header text-center">
          <div className="login-logo text-sm font-black mx-auto mb-4">P</div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit">{shopName}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-4 italic underline decoration-emerald-500/30">Clinical Personnel Portal</p>
        </div>
        <form className="login-form mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="form-group space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Username</label>
            <input
              type="text"
              placeholder="System Identity"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all placeholder:text-slate-200"
              required
            />
          </div>

          <div className="form-group space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-4 pr-10 py-2.5 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all placeholder:text-slate-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-options flex justify-between items-center py-2">
            <label className="remember-me flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-200 text-emerald-500" /> Remember Me
            </label>
            <Link to="/forgot-password" size="sm" className="forgot-password text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Reset Password</Link>
          </div>

          <button type="submit" className="w-full bg-emerald-500 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 border border-emerald-500 hover:bg-emerald-600 transition-all mt-4" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Authorize Session'}
          </button>
        </form>

        <div className="login-footer mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest">
          Vault Security Active • <a href="#" className="text-slate-400 hover:text-emerald-500">Node Logs</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
