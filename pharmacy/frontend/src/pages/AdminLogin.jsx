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
  const [shopName, setShopName] = useState('Pharmacy');
  const [shopEmail, setShopEmail] = useState('info@pharmacy.com');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('settings/');
        if (res.data && res.data.length > 0) {
          if (res.data[0].shop_name) setShopName(res.data[0].shop_name);
          if (res.data[0].email) setShopEmail(res.data[0].email);
        }
      } catch {
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
      <div className="login-card flex flex-col items-center justify-between">
        <div className="image-div flex flex-col items-center justify-between mb-4 w-full">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 10.5V6a2 2 0 00-2-2H7a2 2 0 00-2 2v4.5a3.5 3.5 0 00-1 2.45V18a2 2 0 002 2h12a2 2 0 002-2v-5.05a3.5 3.5 0 00-1-2.45zM10.5 6h3v3h-3V6zm-3.5 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit text-center">{shopName}</h1>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 text-center">{shopEmail}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 px-4 text-center">Pharmacy and Clinical Consultation Portal</p>
        </div>

        <div className="login-div w-full flex flex-col items-center justify-between">
          <form className="login-form w-full space-y-4" onSubmit={handleSubmit}>
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
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
