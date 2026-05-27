import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shopName, setShopName] = useState('Pharmacy');

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await api.get('settings/');
        if (res.data && res.data.length > 0) {
          setShopName(res.data[0].shop_name);
        }
      } catch {
        // Branding load failed
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
      const role = localStorage.getItem('role');
      if (role === 'Admin') {
        navigate('/');
      } else {
        navigate('/pos');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row font-outfit overflow-hidden bg-emerald-950">
      {/* FULL PAGE BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=2070&auto=format&fit=crop"
          alt="Pharmacy Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-950/60 to-black/80"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row min-h-screen">

        {/* Left side: Branding (Hidden on small screens) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-start justify-center p-16 text-white">
          <div className="bg-white/20 backdrop-blur-xl p-4 rounded-3xl mb-8 border border-white/20 shadow-2xl">
            <div className="bg-white text-emerald-600 rounded-2xl w-16 h-16 flex items-center justify-center text-4xl font-black shadow-xl">J</div>
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-[0.9] uppercase mb-6 drop-shadow-2xl">
            Pharmacy & <br/> Supermarket <br/> Store
          </h1>
          <p className="text-emerald-50/80 text-2xl font-medium max-w-md leading-relaxed border-l-4 border-emerald-500 pl-6">
            Reliable access to quality medications and professional pharmaceutical care. Optimized for excellence in clinical service.
          </p>

          <div className="mt-16 flex items-center gap-10">
             <div className="flex flex-col">
                <span className="text-4xl font-black">99.9%</span>
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-emerald-400">System Uptime</span>
             </div>
             <div className="w-px h-12 bg-white/10"></div>
             <div className="flex flex-col">
                <span className="text-4xl font-black">256-bit</span>
                <span className="text-[13px] font-black uppercase tracking-[0.2em] text-emerald-400">AES Encryption</span>
             </div>
          </div>

          <div className="absolute bottom-10 left-16 opacity-20">
             <div className="text-[120px] font-black text-white select-none pointer-events-none leading-none">
                PHARMA
             </div>
          </div>
        </div>

        {/* Right side: Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20">
          <div className="w-full max-w-3xl">

            {/* Mobile Branding */}
            <div className="mb-10 lg:hidden text-center">
              <div className="bg-emerald-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-xl">J</div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">{shopName}</h1>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
              <div className="mb-10 space-y-1">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Welcome Back</h2>
                <p className="text-[14px] font-black text-emerald-400 uppercase tracking-[0.3em]">Sign in to portal</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[13px] font-black text-emerald-100/50 uppercase tracking-widest ml-1">UserName</label>
                  <input
                    type="text"
                    placeholder="Username or Staff ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-white/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[13px] font-black text-emerald-100/50 uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" size="sm" className="text-[12px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-2xl pl-6 pr-14 py-5 text-lg font-bold text-white outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-white/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors p-2"
                    >
                      {showPassword ? <FaEyeSlash size={24} /> : <FaEye size={24} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 px-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-6 h-6 rounded-lg border-white/10 bg-black/20 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-[12px] font-black text-emerald-100/40 uppercase tracking-widest cursor-pointer select-none">Remember me</label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white font-black py-6 rounded-2xl text-[16px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-900/20 hover:bg-emerald-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Login
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Secured Protocol</p>
                <div className="flex justify-center gap-6 opacity-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
