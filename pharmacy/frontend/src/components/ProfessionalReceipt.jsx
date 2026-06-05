import React from 'react';
import { FaHeartbeat } from 'react-icons/fa';

const ProfessionalReceipt = ({ sale, shopSettings }) => {
    if (!sale) return null;

    return (
        <div className="print-only receipt-professional">
            <div className="text-center mb-6 space-y-1">
                <div className="flex justify-center mb-2">
                    <FaHeartbeat size={24} className="text-emerald-600" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tight">{shopSettings?.shop_name || 'Josiah Pharmacy'}</h1>
                <p className="text-[10px] font-bold uppercase text-slate-500">{shopSettings?.location || "Main Branch"}</p>
                <p className="text-[10px] font-bold text-slate-400">{shopSettings?.phone_number || ""}</p>
            </div>

            <div className="border-y border-dashed border-slate-300 py-3 mb-4 space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Receipt No:</span>
                    <span className="font-black">{sale.id}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Date:</span>
                    <span>{sale.date}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Dispenser:</span>
                    <span>{sale.sellerName}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Payment:</span>
                    <span>{sale.paymentMethod}</span>
                </div>
            </div>

            <table className="w-full text-left mb-4">
                <thead>
                    <tr className="border-b border-slate-200 text-[9px] font-black uppercase">
                        <th className="py-2">Item</th>
                        <th className="py-2 text-center">Qty</th>
                        <th className="py-2 text-right">Price</th>
                        <th className="py-2 text-right">Sub</th>
                    </tr>
                </thead>
                <tbody className="text-[10px] font-bold">
                    {sale.items.map((item, i) => (
                        <tr key={i} className="border-b border-slate-50">
                            <td className="py-2 uppercase leading-tight pr-4">
                                {item.name}
                            </td>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="space-y-1 border-t border-dashed border-slate-300 pt-3">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Subtotal:</span>
                    <span>${sale.subtotal.toFixed(2)}</span>
                </div>
                {sale.discount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold uppercase text-red-500">
                        <span>Discount:</span>
                        <span>-${parseFloat(sale.discount).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-base font-black uppercase pt-2">
                    <span>Total Paid:</span>
                    <span>${sale.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center mt-8 space-y-4">
                <div className="flex justify-center">
                   {/* Barcode placeholder for thermal printers */}
                   <div className="h-8 w-40 bg-slate-100 flex items-center justify-center rounded overflow-hidden">
                       <div className="w-full h-full flex gap-1 items-center px-2">
                           {[...Array(20)].map((_, i) => (
                               <div key={i} className="h-full bg-slate-300" style={{ width: Math.random() * 3 + 1 + 'px' }}></div>
                           ))}
                       </div>
                   </div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Keep your receipt for verification.<br/>
                    Thank you for choosing {shopSettings?.shop_name || 'us'}.
                </p>
                <p className="text-[8px] italic text-slate-300 uppercase">System Powered by Josiah POS v1.1</p>
            </div>

            <style jsx="true">{`
                .receipt-professional {
                    width: 80mm;
                    margin: 0 auto;
                    color: black !important;
                    background: white !important;
                    font-family: 'Inter', sans-serif;
                }
                @media print {
                    .receipt-professional {
                        padding: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfessionalReceipt;
