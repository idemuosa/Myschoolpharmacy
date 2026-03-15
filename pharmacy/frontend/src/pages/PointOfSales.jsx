import React, { useState, useEffect, useRef } from 'react';
import drugService from '../services/drugService';
import posService from '../services/posService';
import staffService from '../services/staffService';
import toast from 'react-hot-toast';
import {
  FaPlus, FaMinus, FaSearch, FaBell, FaTrashAlt, FaTimes,
  FaShoppingCart, FaUserMd, FaUndo, FaReceipt, FaPrint, FaBarcode
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PointOfSales = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [lastSale, setLastSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastScanned, setLastScanned] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const scanInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchStaff();

    // Auto-focus the scan input on mount
    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    // Global listener to redirect scanner input to the scan field
    const handleGlobalScan = (e) => {
      // Don't interfere if an input is already focused
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // Ignore functional keys
      if (e.key.length > 1 && e.key !== 'Enter') return;

      if (scanInputRef.current) {
        scanInputRef.current.focus();
        // The character will be naturally typed into the focused input
      }
    };

    window.addEventListener('keydown', handleGlobalScan);
    return () => window.removeEventListener('keydown', handleGlobalScan);
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await staffService.getStaff();
      setStaffList(response.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await drugService.getDrugs();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load inventory products.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Not enough stock!");
        return;
      }
      updateQuantity(product.id, 1);
    } else {
      if (product.stock <= 0) {
        toast.error("Product out of stock!");
        return;
      }
      setCart([...cart, {
        id: product.id,
        name: product.name,
        unitPrice: parseFloat(product.unit_price),
        quantity: 1
      }]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.generic_name && product.generic_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const drugCategory = (product.category || "").toLowerCase();
    const targetCategory = selectedCategory.toLowerCase();

    const matchesCategory = selectedCategory === 'All' ||
      drugCategory === targetCategory ||
      drugCategory.includes(targetCategory.replace(/s$/, '')) ||
      targetCategory.includes(drugCategory.replace(/s$/, ''));

    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const vat = subtotal * 0.05;
  const totalAmount = subtotal + vat;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      return toast.error("Cart is empty");
    }
    if (!staffId) {
      return toast.error("Please select a pharmacist");
    }

    try {
      setIsCheckingOut(true);
      const txId = "TX-" + Math.floor(Math.random() * 100000);

      const items = cart.map(item => ({
        drug: item.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: (item.unitPrice * item.quantity).toFixed(2)
      }));

      await posService.createSale({
        transaction_id: txId,
        staff: staffId,
        total_amount: totalAmount.toFixed(2),
        payment_method: 'Cash',
        items: items
      });

      setLastSale({
        id: txId,
        pharmacist: staffList.find(s => s.id == staffId),
        items: cart,
        total: totalAmount,
        date: new Date().toLocaleString()
      });

      toast.success(`Transaction Completed: ${txId}`);
      clearCart();
      fetchProducts();
      if (autoPrint) {
        setTimeout(() => window.print(), 500);
      }
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 animate-in fade-in duration-500 text-sm">

      {/* Search and Product Column */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">

        <header className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-0 w-full max-w-[600px] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-50 focus-within:border-emerald-500 transition-all shadow-sm">
              <input
                type="text"
                placeholder="Search medications or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const found = products.find(p => p.barcode === searchTerm);
                    if (found) {
                      addToCart(found);
                      setLastScanned({
                        name: found.name,
                        price: found.unit_price,
                        time: Date.now()
                      });
                      setSearchTerm('');
                      // Keep focus for next scan
                      e.target.focus();
                    } else {
                      toast.error("Barcode not found");
                    }
                  }
                }}
                ref={scanInputRef}
                autoFocus
                className="flex-1 pl-4 pr-3 py-2 text-xs font-bold outline-none border-none bg-transparent"
              />
              <button className="w-5 h-10 flex items-center justify-center bg-white text-slate-400 hover:text-emerald-500 border-l border-slate-100 transition-colors shrink-0">
                <FaSearch className="text-sm" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">
                <input
                  type="checkbox"
                  id="auto-print"
                  checked={autoPrint}
                  onChange={(e) => setAutoPrint(e.target.checked)}
                  className="w-3 h-3 accent-emerald-500"
                />
                <label htmlFor="auto-print" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none">Auto Print</label>
              </div>
              <Link to="/sales/return" className="btn-pharmacy text-[12px] py-1.5 px-3 uppercase tracking-widest text-red-500 border-red-200">
                <FaUndo /> Returns
              </Link>
            </div>
          </div>

          {lastScanned && (Date.now() - lastScanned.time < 3000) && (
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300 shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FaBarcode className="text-xl animate-pulse" />
                </div>
                <div>
                  <span className="text-[14px] font-black uppercase tracking-tight block">{lastScanned.name}</span>
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest">Successfully Scanned & Added</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-black tabular-nums block">${parseFloat(lastScanned.price).toFixed(2)}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 italic">Current Price</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Antibiotics', 'Analgesics', 'Cardiovascular', 'Dermatology', 'Vitamins', 'Antipyretics', 'Antimalarials', 'Antihistamines'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight transition-all border ${selectedCategory === cat
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Medication</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generic</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-black text-slate-900 group-hover:text-emerald-600 uppercase tracking-tight">{product.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">#{product.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-slate-400 italic">{product.generic_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-black uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[12px] font-black tabular-nums ${product.stock <= product.reorder_level ? 'text-red-500' : 'text-slate-900'}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-bold text-slate-400 tabular-nums">{product.expiry_date || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[12px] font-black text-slate-900 tabular-nums">${parseFloat(product.unit_price).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => addToCart(product)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all shadow-sm">
                        <FaPlus className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Column */}
      <div className="w-full lg:w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] lg:h-auto text-xs">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Cart</h2>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[12px] font-black rounded-full uppercase tracking-widest">{cart.length}</span>
        </header>

        <div className="p-4 border-b border-slate-50">
          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Authorize Pharmacist</label>
          <div className="relative">
            <FaUserMd className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs" />
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[13px] font-bold outline-none appearance-none"
            >
              <option value="">Choose Staff...</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-20">
              <FaShoppingCart size={32} className="mb-2" />
              <p className="text-[13px] font-black uppercase">Empty Cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group animate-in slide-in-from-right-2 duration-300">
                <button onClick={() => removeFromCart(item.id)} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white text-red-400 border border-slate-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow">
                  <FaTimes className="text-[10px]" />
                </button>
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight pr-3 truncate">{item.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-slate-50 p-0.5 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[12px] text-slate-400 hover:text-emerald-500"><FaMinus /></button>
                    <span className="text-[11px] font-black w-4 text-center tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center text-[12px] text-slate-400 hover:text-emerald-500"><FaPlus /></button>
                  </div>
                  <span className="text-[12px] font-black text-slate-900 tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 space-y-2">
          <div className="flex justify-between text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Total</span>
            <span className="text-emerald-600 font-black text-sm tabular-nums">${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isCheckingOut || cart.length === 0}
            className="w-full mt-2 btn-pharmacy-primary py-3 text-xs uppercase tracking-widest shadow-none"
          >
            {isCheckingOut ? "PROCESSING..." : "FINALIZE SALE"}
          </button>
        </div>
      </div>

      {/* Simplified Receipt Modal */}
      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-mono no-print">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 receipt-print-area">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-lg">
                <FaReceipt />
              </div>
              <h2 className="text-lg font-black text-slate-900 font-outfit uppercase">Pharmacy Receipt</h2>
              <p className="text-[12px] font-bold text-slate-400">THANK YOU FOR YOUR PATRONAGE</p>
            </div>
            <div className="space-y-2 text-[12px] mb-4 border-b border-dashed border-slate-200 pb-4">
              <div className="flex justify-between"><span>TX ID:</span><span className="font-black text-slate-900">{lastSale.id}</span></div>
              <div className="flex justify-between"><span>Date:</span><span className="font-black text-slate-900 font-sans">{lastSale.date}</span></div>
              <div className="flex justify-between"><span>Pharmacist:</span><span className="font-black text-slate-900">{lastSale.pharmacist?.full_name || 'N/A'}</span></div>
            </div>
            <div className="space-y-2 border-b border-dashed border-slate-200 mb-4 pb-4">
              {lastSale.items.map(item => (
                <div key={item.id} className="flex justify-between text-[13px]">
                  <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                  <span className="font-black">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                <span className="text-xs font-black uppercase">Paid:</span>
              </div>
              <span className="text-2xl font-black text-emerald-600 font-outfit tabular-nums">${lastSale.total.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-[12px] font-black uppercase shadow-lg shadow-emerald-100 flex items-center justify-center gap-2" onClick={() => window.print()}>
                <FaPrint /> Print
              </button>
              <button className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-400 text-[12px] uppercase font-black" onClick={() => setLastSale(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt for Automatic Printing if needed */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[200]">
        {lastSale && (
          <div className="p-8 w-full max-w-xs mx-auto text-black font-mono">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold uppercase">Pharmacy Receipt</h1>
              <p className="text-xs">Clinical Services & Registry</p>
            </div>
            <div className="mb-4 border-b border-dashed pb-4 text-xs space-y-1">
              <div className="flex justify-between"><span>ID:</span><span>{lastSale.id}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{lastSale.date}</span></div>
              <div className="flex justify-between"><span>Staff:</span><span>{lastSale.pharmacist?.full_name}</span></div>
            </div>
            <div className="mb-4 border-b border-dashed pb-4 text-xs space-y-2">
              {lastSale.items.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>TOTAL PAID:</span>
              <span>${lastSale.total.toFixed(2)}</span>
            </div>
            <div className="mt-8 text-center text-[12px]">
              <p>Thank you for choosing our pharmacy.</p>
              <p>Contact: +234 (0) 7041754159</p>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .no-print { display: none !important; }
          .hidden.print\\:block { display: block !important; position: static !important; }
          .hidden.print\\:block * { visibility: visible; }
        }
      `}} />

    </div>
  );
};

export default PointOfSales;
