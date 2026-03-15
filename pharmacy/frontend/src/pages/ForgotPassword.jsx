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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-xs">
            <div className="w-full max-w-[400px] bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 pb-4 text-center">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl mx-auto mb-6 shadow-lg shadow-emerald-200 animate-bounce">
                        <FaShieldAlt />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase font-outfit">Credential Recovery</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-8">Secure system access restoration</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username or Email</label>
                            <input 
                                type="text" 
                                placeholder="Enter your identity" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all placeholder:text-slate-300"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-emerald-500 text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 border border-emerald-500 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                        >
                            {loading ? 'Transmitting...' : 'Request Secure Link'}
                        </button>

                        <button 
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors"
                        >
                            <FaArrowLeft className="text-[10px]" /> Return to Login
                        </button>
                    </form>
                ) : (
                    <div className="p-8 text-center space-y-6">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <p className="text-[11px] font-black text-emerald-800 leading-relaxed uppercase">
                                System Authorization Restored!
                            </p>
                            <p className="text-[9px] font-bold text-emerald-600 mt-2">
                                For this demo, the admin password has been immediately reset to: <span className="underline">admin123</span>
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-900 text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            Log In with New Key
                        </button>
                    </div>
                )}

                <div className="p-6 bg-slate-50/50 text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        Encyption: 256-Bit AES • Secure-OS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
