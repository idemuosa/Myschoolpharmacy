import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';
import settingsService from '../services/settingsService';
import { FaHeartbeat, FaCapsules, FaClock, FaCheckCircle } from 'react-icons/fa';

const DigitalDisplay = () => {
    const [readyRx, setReadyRx] = useState([]);
    const [settings, setSettings] = useState({ shop_name: 'Josiah Pharmacy' });
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        const dataInterval = setInterval(fetchDisplayData, 10000); // Every 10 seconds
        fetchDisplayData();
        return () => {
            clearInterval(timer);
            clearInterval(dataInterval);
        };
    }, []);

    const fetchDisplayData = async () => {
        try {
            const rxRes = await prescriptionService.getPrescriptions();
            const allRx = rxRes.data?.results || rxRes.data || [];
            // Show RXs that are 'Ready' or recently 'Completed'
            setReadyRx(allRx.filter(r => r.status === 'Ready' || r.status === 'Completed').slice(0, 8));

            const settingsRes = await settingsService.getSettings();
            if (settingsRes.data?.length > 0) setSettings(settingsRes.data[0]);
        } catch (e) {
            console.error("Display sync failed", e);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900 text-white font-sans overflow-hidden flex flex-col">
            {/* Top Branding Bar */}
            <header className="bg-emerald-600 p-8 flex justify-between items-center shadow-2xl z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white text-emerald-600 rounded-3xl flex items-center justify-center text-4xl font-black shadow-lg">J</div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">{settings.shop_name}</h1>
                        <p className="text-xl font-bold opacity-80 uppercase tracking-widest">Prescription Status Board</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-black tabular-nums">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xl font-bold opacity-60 uppercase tracking-widest">{time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <main className="flex-1 p-12 grid grid-cols-12 gap-12">

                {/* Ready for Pickup Column */}
                <div className="col-span-8 space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                        <FaCheckCircle className="text-emerald-400 text-4xl" />
                        <h2 className="text-5xl font-black uppercase tracking-tight">Ready for Pickup</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {readyRx.length > 0 ? readyRx.map((rx) => (
                            <div key={rx.id} className="bg-slate-800/50 border-2 border-emerald-500/30 p-8 rounded-[40px] flex items-center justify-between animate-pulse-slow">
                                <div>
                                    <span className="text-2xl font-bold text-emerald-400 uppercase tracking-widest block mb-2">Order ID</span>
                                    <h3 className="text-6xl font-black tracking-tighter">{rx.prescription_id}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black uppercase opacity-40">{rx.customer_name?.split(' ')[0]}</p>
                                    <div className="mt-4 px-4 py-1 bg-emerald-500 text-white rounded-full text-xl font-black uppercase">Collect Now</div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 py-32 text-center">
                                <p className="text-4xl font-black text-slate-700 uppercase tracking-widest italic">Monitoring Live Dispensary Feed...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info / Promo Side */}
                <div className="col-span-4 space-y-8">
                    <div className="bg-emerald-600/10 border-2 border-emerald-500/20 rounded-[50px] p-10 h-full flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FaHeartbeat size={180} />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-emerald-400 mb-6 italic">Health Insight</h3>
                            <p className="text-4xl font-black leading-tight">
                                "Stay hydrated this season. Drinking water supports medication absorption."
                            </p>
                        </div>

                        <div className="mt-12 bg-white/5 rounded-3xl p-8 border border-white/5 relative z-10">
                            <h4 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-4">Retail Special</h4>
                            <p className="text-3xl font-black uppercase leading-none text-emerald-400">20% OFF ALL</p>
                            <p className="text-5xl font-black uppercase mt-1">Multi-Vitamins</p>
                            <p className="text-lg font-bold opacity-40 mt-4 uppercase">Valid at Supermarket POS Only</p>
                        </div>

                        <div className="mt-auto pt-10 flex items-center gap-4 text-slate-500 relative z-10">
                            <FaClock />
                            <span className="text-xl font-black uppercase tracking-widest">Live System Feed v1.1</span>
                        </div>
                    </div>
                </div>

            </main>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.01); opacity: 0.9; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default DigitalDisplay;
