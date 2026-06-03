import React from 'react';
import {
  FaQuestionCircle, FaCashRegister, FaUserClock, FaBoxes,
  FaUserTag, FaTruck, FaShieldAlt, FaMobileAlt
} from 'react-icons/fa';

const HelpSupport = () => {
    const guides = [
        {
            title: "Point of Sales (POS)",
            icon: <FaCashRegister className="text-emerald-500" />,
            steps: [
                "Search for items using the brand name or generic formula.",
                "Use the 'Camera' icon on mobile or a scanner on PC to add items via barcode.",
                "To issue medication on credit, select 'Credit' as the payment method (requires a selected patient).",
                "Press Ctrl+Enter to quickly finalize a sale on Windows."
            ]
        },
        {
            title: "Staff Attendance",
            icon: <FaUserClock className="text-blue-500" />,
            steps: [
                "Navigate to the 'Attendance' page every day.",
                "Click 'Clock In' at the start of your shift.",
                "Click 'Clock Out' before leaving to ensure accurate payroll logs.",
                "Admins can view master logs in the same module."
            ]
        },
        {
            title: "Inventory & Batches",
            icon: <FaBoxes className="text-orange-500" />,
            steps: [
                "The system uses FEFO (First Expiry, First Out) automatically.",
                "Expand any drug in 'Inventory' to see its specific batches.",
                "Perform a 'Stocktake' in the Audit module once a month to verify physical truth.",
                "Generate barcode labels using the barcode icon next to any medication."
            ]
        },
        {
            title: "Debtors & Finance",
            icon: <FaUserTag className="text-red-500" />,
            steps: [
                "Patients with outstanding balances appear in the 'Debtors' list.",
                "Click 'Collect Payment' when a patient pays back their debt.",
                "View the 'Financial Ledger' for real-time profit and revenue mix analysis."
            ]
        }
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500 py-8 px-4 md:px-6 lg:px-8 text-sm">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Help & Support Center</h1>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Operational Guides for Staff & Admins</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-emerald-200 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                {guide.icon}
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">{guide.title}</h2>
                        </div>
                        <ul className="space-y-3">
                            {guide.steps.map((step, i) => (
                                <li key={i} className="flex gap-3 text-[12px] font-medium text-slate-600 leading-relaxed">
                                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-emerald-600 rounded-3xl p-6 text-white space-y-2 lg:col-span-2 shadow-lg shadow-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                        <FaShieldAlt className="text-2xl" />
                        <h3 className="text-sm font-black uppercase tracking-widest">System Security Note</h3>
                    </div>
                    <p className="text-[12px] font-bold text-emerald-50 leading-relaxed">
                        Every action you perform—from sales to inventory changes—is recorded in the master audit log.
                        The system automatically backs up data every night. For emergency support, contact your system administrator.
                    </p>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-2 shadow-lg shadow-slate-200">
                    <div className="flex items-center gap-3 mb-2">
                        <FaMobileAlt className="text-2xl" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Multi-Platform</h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Version 1.1.0 Enterprise</p>
                    <p className="text-[11px] font-medium text-slate-300">
                        Compatible with Windows, Android, and Web Browsers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
