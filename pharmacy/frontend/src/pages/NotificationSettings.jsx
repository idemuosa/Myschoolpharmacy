import { FaArrowLeft, FaExchangeAlt, FaCheckCircle, FaBoxOpen, FaClipboardList, FaCog, FaBell, FaEnvelope, FaCommentDots, FaSave } from 'react-icons/fa';
import settingsService from '../services/settingsService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.getSettings();
      if (response.data && response.data.length > 0) {
        setSettings(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setLoading(true);
      await settingsService.updateSettings(settings.id, settings);
      toast.success("Notification preferences saved!");
    } catch (error) {
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="h-screen flex items-center justify-center text-slate-400 font-black uppercase tracking-widest">Scanning Preferences...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-2">
            <button 
                onClick={() => navigate('/settings')}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all"
            >
                <FaArrowLeft className="text-sm" />
            </button>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight font-outfit text-sm">Notification Architecture</h1>
        </div>
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Configure real-time alerts & delivery channels</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alert Preferences Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FaBell className="text-emerald-500" />
                <h2 className="text-[12px] font-black uppercase tracking-widest">Trigger Events</h2>
            </div>
            
            <div className="p-6 space-y-6">
                {[
                    { key: 'notify_new_swap', title: 'Shift Swap Requests', icon: <FaExchangeAlt />, desc: 'Alert when colleagues request coverage' },
                    { key: 'notify_swap_approval', title: 'Swap Decisions', icon: <FaCheckCircle />, desc: 'Confirmations for your active requests' },
                    { key: 'notify_low_stock', title: 'Inventory Depletion', icon: <FaBoxOpen />, desc: 'Alert when medication stock hits critical levels' },
                    { key: 'notify_prescription_review', title: 'Script Verification', icon: <FaClipboardList />, desc: 'Queue alerts for pending pharmacist reviews' },
                    { key: 'notify_system_updates', title: 'Core Updates', icon: <FaCog />, desc: 'System maintenance & feature releases' }
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between group">
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-[11px] font-bold text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleToggle(item.key)}
                            className={`w-10 h-5 flex items-center rounded-full p-1 transition-all duration-300 ${settings[item.key] ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <div className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform duration-300 ${settings[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            {/* Notification Method Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <FaCog className="text-blue-500" />
                    <h2 className="text-[12px] font-black uppercase tracking-widest">Delivery Protocol</h2>
                </div>
                
                <div className="p-6 space-y-3">
                    {[
                        { id: 'push', title: 'Native Push', icon: <FaBell />, desc: 'Real-time browser notifications' },
                        { id: 'email', title: 'Secure Email', icon: <FaEnvelope />, desc: 'Daily digests & critical alerts' },
                        { id: 'sms', title: 'Direct SMS', icon: <FaCommentDots />, desc: 'Emergency priority messaging' }
                    ].map((method) => (
                        <div 
                            key={method.id}
                            onClick={() => setSettings({...settings, notification_method: method.id})}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${settings.notification_method === method.id ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${settings.notification_method === method.id ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                                    {method.icon}
                                </div>
                                <div>
                                    <h3 className={`text-[13px] font-black uppercase tracking-tight ${settings.notification_method === method.id ? 'text-emerald-700' : 'text-slate-900'}`}>{method.title}</h3>
                                    <p className="text-[11px] font-bold text-slate-400">{method.desc}</p>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${settings.notification_method === method.id ? 'border-emerald-500' : 'border-slate-200'}`}>
                                {settings.notification_method === method.id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Card */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-lg shadow-slate-200 text-white space-y-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest">Save Configuration</h3>
                    <p className="text-[11px] text-slate-400 font-bold">Changes propagate across all connected terminals instantly.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl py-3.5 font-black text-[12px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <FaSave className="text-sm" />
                    )}
                    {loading ? 'Propagating...' : 'Sync Preferences'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
