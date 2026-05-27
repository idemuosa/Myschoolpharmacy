import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const cleanIdentifier = identifier.trim().toLowerCase();
            await api.post('reset-password/', { username: cleanIdentifier });
            setLoading(false);
            setIsSubmitted(true);
            toast.success(`Password for ${identifier} has been reset to admin123`);
        } catch (err) {
            setLoading(false);
            const errorMsg = err.response?.data?.error || 'Recovery failed. Please consult system logs.';
            toast.error(errorMsg);
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 font-outfit overflow-hidden bg-emerald-950">
            {/* FULL PAGE BACKGROUND IMAGE - DRUGS */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1587854685352-c8462d18c962?q=80&w=2070&auto=format&fit=crop"
                    alt="Drugs Background"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-950/60 to-black/80"></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-10 pb-4 text-center">
                    <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-xl shadow-orange-500/20 animate-bounce">
                        <FaShieldAlt />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Admin Recovery Portal</h1>
                    <p className="text-sm font-black text-orange-400 uppercase tracking-widest mt-3 px-8">Restricted Access: Staff password reset</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="p-10 pt-6 space-y-8">
                        <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-2xl mb-4">
                            <p className="text-[12px] font-bold text-orange-100 uppercase leading-relaxed text-center">
                                Policy Notice: Password resets must be performed by an <span className="text-white underline">Authorized Admin</span>.
                                Staff cannot reset their own credentials.
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-sm font-black text-emerald-100/50 uppercase tracking-widest ml-1">Staff Username to Reset</label>
                            <input 
                                type="text" 
                                placeholder="Enter staff identity"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-5 text-lg font-bold text-white outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-white/20"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl text-base uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/20 hover:bg-orange-400 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Verifying...' : 'Authorize Reset'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                        >
                            <FaArrowLeft className="text-lg" /> Return to Login
                        </button>
                    </form>
                ) : (
                    <div className="p-10 text-center space-y-8">
                        <div className="bg-emerald-500/10 backdrop-blur-md p-8 rounded-[2rem] border border-emerald-500/20">
                            <p className="text-lg font-black text-white leading-relaxed uppercase">
                                System Authorization Restored!
                            </p>
                            <p className="text-sm font-bold text-emerald-400 mt-3">
                                For this demo, the admin password has been immediately reset to: <span className="underline font-black text-white">admin123</span>
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full bg-white text-emerald-900 font-black py-5 rounded-2xl text-base uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl"
                        >
                            Log In with New Key
                        </button>
                    </div>
                )}

                <div className="p-8 bg-black/20 text-center border-t border-white/5">
                    <p className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">
                        Encyption: 256-Bit AES • Secure-OS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
