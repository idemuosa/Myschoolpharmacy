import React, { useState, useEffect, useRef } from 'react';
import drugService from '../services/drugService';
import posService from '../services/posService';
import staffService from '../services/staffService';
import barcodeService from '../services/barcodeService';
import toast from 'react-hot-toast';
import {
  FaPlus, FaMinus, FaSearch, FaBell, FaTrashAlt, FaTimes,
  FaShoppingCart, FaUserMd, FaUndo, FaReceipt, FaPrint, FaBarcode, FaCamera
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PointOfSales = () => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('pharmacy_cart');
    return saved ? JSON.parse(saved) : [];
  });
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
    const controller = new AbortController();
    fetchProducts(controller.signal);
    fetchStaff(controller.signal);

    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    const handleGlobalScan = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key.length > 1 && e.key !== 'Enter') return;
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalScan);
    return () => {
      controller.abort();
      window.removeEventListener('keydown', handleGlobalScan);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchStaff = async (signal) => {
    try {
      const response = await staffService.getStaff({ signal });
      setStaffList(response.data?.results || response.data || []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Failed to fetch staff", err);
    }
  };

  const fetchProducts = async (signal) => {
    try {
      const response = await drugService.getDrugs({ signal });
      setProducts(response.data?.results || response.data || []);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error("Error fetching products:", error);
      toast.error("Failed to load inventory products.");
    } finally {
      if (signal && signal.aborted) return;
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

  const handleMobileScan = async () => {
    try {
      const code = await barcodeService.scan();
      if (code) {
        const found = products.find(p => p.barcode === code || p.sku === code);
        if (found) {
          addToCart(found);
          setLastScanned({
            name: found.name,
            price: found.unit_price,
            time: Date.now()
          });
          toast.success(`Scanned: ${found.name}`);
        } else {
          toast.error(`Barcode ${code} not found in inventory`);
        }
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast.error(error.message || "Failed to scan barcode");
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

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) * 1.05; // Including 5% VAT

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!staffId) return toast.error("Please select a pharmacist");

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
    } catch (error) {
      console.error(error);
      toast.error("Checkout failed.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 animate-in fade-in duration-500 text-sm">
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <header className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-0 w-full max-w-[600px] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-50 focus-within:border-emerald-500 transition-all shadow-sm">
              <input
                type="text"
                placeholder="Search or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const found = products.find(p => p.barcode === searchTerm || p.sku === searchTerm);
                    if (found) {
                      addToCart(found);
                      setSearchTerm('');
                    } else {
                      toast.error("Not found");
                    }
                  }
                }}
                ref={scanInputRef}
                className="flex-1 pl-4 pr-3 py-2 text-xs font-bold outline-none border-none bg-transparent"
              />
              <button
                onClick={handleMobileScan}
                className="p-3 bg-white text-emerald-600 hover:text-emerald-700 border-l border-slate-100 transition-colors shrink-0"
                title="Scan with Camera"
              >
                <FaCamera className="text-sm" />
              </button>
            </div>

            <div className="flex items-center gap-3">
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
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest">Added to cart</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Antibiotics', 'Analgesics', 'Vitamins', 'Antimalarials'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight transition-all border ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
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
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest">Loading...</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-[12px] font-black text-slate-900 group-hover:text-emerald-600 uppercase tracking-tight">{product.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">Barcode: {product.barcode || 'N/A'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[12px] font-black tabular-nums ${product.stock <= 5 ? 'text-red-500' : 'text-slate-900'}`}>{product.stock}</span>
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

      <div className="w-full lg:w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] lg:h-auto text-xs">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Cart</h2>
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
            <span>Total (+VAT)</span>
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

      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-mono no-print">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <FaReceipt className="text-3xl text-emerald-500 mx-auto mb-2" />
              <h2 className="text-lg font-black text-slate-900 uppercase">Success</h2>
            </div>
            <div className="space-y-2 text-[12px] mb-4 pb-4 border-b border-dashed">
              <div className="flex justify-between"><span>TX ID:</span><span className="font-black">{lastSale.id}</span></div>
              <div className="flex justify-between"><span>Total:</span><span className="font-black">${lastSale.total.toFixed(2)}</span></div>
            </div>
            <div className="mb-4 text-[12px] max-h-32 overflow-y-auto pr-1">
              <div className="font-bold border-b border-slate-100 pb-1 mb-2 text-center">Items</div>
              <div className="space-y-1">
                {lastSale.items && lastSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                    <span className="font-black shrink-0">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[12px] font-black uppercase flex items-center justify-center gap-2" 
                onClick={() => window.print()}
              >
                <FaPrint /> Print
              </button>
              <button className="w-full py-3 rounded-xl bg-emerald-500 text-white text-[12px] font-black uppercase" onClick={() => setLastSale(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSales;
