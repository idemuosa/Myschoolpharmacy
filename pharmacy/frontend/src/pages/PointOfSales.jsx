import React, { useState, useEffect, useRef, useContext } from 'react';
import drugService from '../services/drugService';
import posService from '../services/posService';
import staffService from '../services/staffService';
import barcodeService from '../services/barcodeService';
import settingsService from '../services/settingsService';
import ProfessionalReceipt from '../components/ProfessionalReceipt';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { socket } from '../services/socket';
import {
  FaPlus, FaMinus, FaSearch, FaTimes,
  FaShoppingCart, FaUserMd, FaUndo, FaReceipt, FaPrint, FaBarcode, FaCamera
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PointOfSales = () => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmacy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse cart", e);
      return [];
    }
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [lastSale, setLastSale] = useState(null);
  const [shopSettings, setShopSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastScanned, setLastScanned] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [splitPayment, setSplitPayment] = useState({ isSplit: false, cash: 0, card: 0 });
  const [discount, setDiscount] = useState(0);
  const scanInputRef = useRef(null);

  useEffect(() => {
    if (user?.staff_id) {
      setStaffId(user.staff_id.toString());
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    fetchStaff(controller.signal);
    fetchBranding(controller.signal);
    fetchCustomers(controller.signal);

    if (scanInputRef.current) {
      scanInputRef.current.focus();
    }

    const handleStockUpdate = (data) => {
      if (data.type === 'drug' || !data.type) {
        fetchProducts();
      }
    };

    socket.on('stock_updated', handleStockUpdate);

    const handleGlobalScan = (e) => {
      // Shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        scanInputRef.current?.focus();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        setPaymentMethod(prev => prev === 'Cash' ? 'Card' : prev === 'Card' ? 'Transfer' : 'Cash');
        toast(`Payment: ${paymentMethod === 'Cash' ? 'Card' : paymentMethod === 'Card' ? 'Transfer' : 'Cash'}`, { icon: '💳' });
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (window.confirm("Clear cart?")) clearCart();
        return;
      }
      if (e.key === 'End' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleCheckout();
        return;
      }

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
      socket.off('stock_updated', handleStockUpdate);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBranding = async (signal) => {
    try {
      const res = await settingsService.getSettings({ signal });
      if (res.data && res.data.length > 0) setShopSettings(res.data[0]);
    } catch {}
  };

  const fetchStaff = async (signal) => {
    try {
      const response = await staffService.getStaff({ signal });
      setStaffList(response.data?.results || response.data || []);
    } catch (err) {
      if (axios.isCancel(err)) return;
    }
  };

  const fetchProducts = async (signal) => {
    try {
      setLoading(true);
      const response = await drugService.getDrugs({ signal });
      setProducts(response.data?.results || response.data || []);
    } catch (error) {
      if (axios.isCancel(error)) return;
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (id, change) => {
    const product = products.find(p => p.id === id);
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change;
        const totalStock = product?.total_stock || product?.stock || 0;
        if (change > 0 && newQty > totalStock) {
          toast.error(`Only ${totalStock} units available.`);
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const fetchCustomers = async (signal) => {
    try {
      const res = await axios.get(`${api.defaults.baseURL}/customers/`, { signal });
      setCustomers(res.data?.results || res.data || []);
    } catch {}
  };

  const checkAllergies = (product) => {
    if (!selectedPatient || !selectedPatient.allergies) return true;

    const allergyList = selectedPatient.allergies.toLowerCase();
    const drugName = product.name.toLowerCase();
    const genericName = (product.generic_name || "").toLowerCase();

    if (allergyList.includes(drugName) || (genericName && allergyList.includes(genericName))) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="font-bold text-red-600">⚠️ ALLERGY ALERT</span>
          <p className="text-xs">Patient is allergic to <span className="font-black uppercase">{product.name}</span> or its components.</p>
          <div className="flex gap-2">
            <button onClick={() => { addToCartConfirmed(product); toast.dismiss(t.id); }} className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold">PROCEED ANYWAY</button>
            <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-[10px] font-bold">CANCEL</button>
          </div>
        </div>
      ), { duration: 6000, position: 'top-center' });
      return false;
    }
    return true;
  };

  const addToCart = (product) => {
    if (!product) return;
    if (!checkAllergies(product)) return;
    addToCartConfirmed(product);
  };

  const addToCartConfirmed = (product) => {
    const totalStock = product.total_stock || product.stock || 0;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= totalStock) {
          toast.error(`Stock limit reached.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (totalStock <= 0) {
          toast.error(`${product.name} is out of stock!`);
          return prevCart;
        }
        return [...prevCart, {
          id: product.id,
          name: product.name,
          unitPrice: parseFloat(product.unit_price) || 0,
          quantity: 1
        }];
      }
    });
  };

  const handleMobileScan = async () => {
    try {
      const code = await barcodeService.scan();
      if (code) {
        const found = products.find(p => p.barcode === code);
        if (found) {
            addToCart(found);
            setLastScanned({ name: found.name, time: Date.now() });
        } else {
            toast.error("Barcode not found");
        }
      }
    } catch (error) {
      toast.error("Scanner failed");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (product.category_name || "").includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalAmount = Math.max(0, (subtotal - parseFloat(discount || 0)));

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!staffId) return toast.error("Select personnel");

    try {
      setIsCheckingOut(true);
      const txId = "TX-" + Math.floor(Math.random() * 100000);
      const items = cart.map(item => ({
        drug: item.id,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      await posService.createSale({
        transaction_id: txId,
        staff: staffId,
        customer: selectedPatient?.id || null,
        total_amount: totalAmount.toFixed(2),
        payment_method: splitPayment.isSplit ? `Split (Cash: ${splitPayment.cash}, Card: ${splitPayment.card})` : paymentMethod,
        items: items
      });

      setLastSale({
        id: txId,
        customerName: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Walk-in Guest',
        sellerName: staffList.find(s => s.id == staffId)?.full_name || user?.fullName,
        items: cart,
        subtotal: subtotal,
        discount: discount,
        total: totalAmount,
        paymentMethod: splitPayment.isSplit ? 'Split Payment' : paymentMethod,
        date: new Date().toLocaleString()
      });

      toast.success(`Transaction Completed`);
      clearCart();
      fetchProducts();
    } catch (error) {
      toast.error("Checkout failed");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const clearCart = () => setCart([]);
  const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id));

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 animate-in fade-in duration-500 text-sm no-print">
      <ProfessionalReceipt sale={lastSale} shopSettings={shopSettings} />

      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <header className="p-4 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center w-full max-w-[600px] bg-slate-50 border border-slate-100 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-50 shadow-sm">
              <input
                type="text"
                placeholder="Search or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const code = searchTerm.trim();
                        const found = products.find(p => p.barcode === code);
                        if (found) { addToCart(found); setSearchTerm(''); }
                    }
                }}
                ref={scanInputRef}
                className="flex-1 pl-4 pr-3 py-2 text-xs font-bold outline-none border-none bg-transparent"
              />
              <button onClick={handleMobileScan} className="p-3 bg-white text-emerald-600 border-l border-slate-100"><FaCamera /></button>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/sales/return" className="btn-pharmacy text-[12px] py-1.5 px-3 uppercase text-red-500 border-red-200"><FaUndo /> Returns</Link>
              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">{user.username[0].toUpperCase()}</div>
                  <span className="text-[10px] font-black uppercase truncate max-w-[80px]">{user.fullName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Antibiotic', 'Analgesic', 'Vitamin', 'Antimalarial'].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase border ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-400 border-slate-100'}`}>{cat}</button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
              <tr className="bg-slate-50/50">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">Medication</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-center">In Stock</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Price</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-10 text-center animate-pulse uppercase font-black text-slate-300">Syncing...</td></tr>
              ) : filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-black text-slate-900 uppercase">{product.name}</p>
                    <p className="text-[9px] font-bold text-slate-400">{product.generic_name}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[12px] font-black tabular-nums ${product.total_stock <= (product.reorder_level || 10) ? 'text-red-500' : 'text-emerald-600'}`}>{product.total_stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-black text-slate-900">${product.unit_price}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => addToCart(product)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"><FaPlus /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="w-full lg:w-[320px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] lg:h-auto text-xs">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase">Cart</h2>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">{cart.length} ITEMS</span>
        </header>

        <div className="p-4 border-b border-slate-50 space-y-2">
            <div className="relative">
              <FaUserMd className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <select
                value={selectedPatient?.id || ""}
                onChange={(e) => setSelectedPatient(customers.find(c => c.id == e.target.value))}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-3 py-2 text-[12px] font-black outline-none appearance-none"
              >
                <option value="">Walk-in Patient (Guest)</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>

            <select value={staffId} onChange={(e) => setStaffId(e.target.value)} disabled={!user?.isAdmin} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[12px] font-black outline-none appearance-none">
                <option value="">Dispensed By...</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>

            <div className="flex gap-2">
                <select
                  value={splitPayment.isSplit ? 'Split' : paymentMethod}
                  onChange={(e) => {
                    if (e.target.value === 'Split') setSplitPayment({ isSplit: true, cash: totalAmount / 2, card: totalAmount / 2 });
                    else {
                        setSplitPayment({ ...splitPayment, isSplit: false });
                        setPaymentMethod(e.target.value);
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[12px] font-black outline-none appearance-none"
                >
                    <option value="Cash">Cash Only</option>
                    <option value="Card">Card Only</option>
                    <option value="Transfer">Bank Transfer</option>
                    {selectedPatient && <option value="Credit">On Account (Credit)</option>}
                    <option value="Split">Split Payment</option>
                </select>
            </div>

            {paymentMethod === 'Credit' && selectedPatient && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in slide-in-from-top-1">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Credit Sale</p>
                    <p className="text-[11px] font-bold text-blue-500 mt-1">This amount will be added to {selectedPatient.first_name}'s outstanding balance.</p>
                </div>
            )}

            {splitPayment.isSplit && (
                <div className="grid grid-cols-2 gap-2 p-2 bg-emerald-50 rounded-xl animate-in fade-in duration-300">
                    <div>
                        <label className="text-[9px] font-black uppercase text-emerald-700 block mb-1">Cash Part</label>
                        <input
                            type="number"
                            value={splitPayment.cash}
                            onChange={(e) => setSplitPayment({ ...splitPayment, cash: parseFloat(e.target.value) || 0, card: totalAmount - (parseFloat(e.target.value) || 0) })}
                            className="w-full bg-white border border-emerald-100 rounded-lg px-2 py-1 text-[11px] font-black"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-black uppercase text-emerald-700 block mb-1">Card/Other</label>
                        <input
                            type="number"
                            value={splitPayment.card}
                            disabled
                            className="w-full bg-slate-50 border border-emerald-100 rounded-lg px-2 py-1 text-[11px] font-black text-slate-400"
                        />
                    </div>
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/30 scrollbar-hide">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative group">
                <button onClick={() => removeFromCart(item.id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-red-400 border border-slate-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><FaTimes className="text-[8px]" /></button>
                <h4 className="text-[11px] font-black text-slate-900 uppercase pr-3 truncate">{item.name}</h4>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-slate-50 p-0.5 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500"><FaMinus /></button>
                    <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500"><FaPlus /></button>
                  </div>
                  <span className="text-[11px] font-black text-slate-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
            <span>Total Payable</span>
            <span className="text-emerald-600 text-lg tabular-nums">${totalAmount.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={isCheckingOut || cart.length === 0} className="w-full btn-pharmacy-primary py-4 text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-100">
            {isCheckingOut ? "PROCESSING..." : "FINALIZE TRANSACTION"}
          </button>
        </div>
      </div>

      {lastSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
            <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xs text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto text-3xl"><FaReceipt /></div>
                <div>
                    <h2 className="text-base font-black uppercase text-slate-900">Success!</h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction Completed</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => window.print()} className="py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"><FaPrint /> Print</button>
                    <button onClick={() => setLastSale(null)} className="py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all">Done</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSales;
