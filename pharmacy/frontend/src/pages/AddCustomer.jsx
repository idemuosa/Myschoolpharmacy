import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import toast from 'react-hot-toast';
import { FaUserPlus, FaTimes, FaUser, FaHistory, FaPlus } from 'react-icons/fa';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone_number: '',
    email: '',
    address: '',
    allergies: '',
    chronic_conditions: '',
    medications: '',
    gender: 'Male',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!formData.first_name || !formData.last_name || !formData.date_of_birth) {
        toast.error("Name and Date of Birth are mandatory.");
        return;
      }
      setLoading(true);
      const generatedId = "CUST-" + Math.floor(Math.random() * 10000);
      const payload = {
        ...formData,
        customer_id: generatedId,
        date_of_birth: formData.date_of_birth || null,
        email: formData.email || null,
        phone_number: formData.phone_number || "N/A"
      };
       
      await customerService.createCustomer(payload);

      toast.success('Patient registry updated.');
      navigate('/customers');
    } catch (error) {
      console.error(error);
      toast.error('Registry failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-sm bg-slate-50/30">
        <header className="bg-white px-5 py-3 border-b border-slate-100 flex justify-between items-center h-14">
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-outfit leading-none">Add Patient Profile</h1>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry of medical clinical history</p>
          </div>
          <div className="flex gap-3">
            <button className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 hover:bg-slate-50 rounded-lg" onClick={() => navigate('/customers')}>Discard</button>
            <button className="bg-emerald-500 text-white text-[12px] font-black uppercase tracking-widest px-6 py-2 rounded-lg border border-emerald-500 shadow-none hover:bg-emerald-600 transition-all min-w-[140px]" onClick={handleSave} disabled={loading}>
              {loading ? "SAVING..." : "AUTHORIZE PROFILE"}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8">
           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              
              {/* Left Column */}
              <div className="space-y-6">
                 <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                       <FaUser className="text-emerald-500 text-xs" />
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Personal Identification</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                          <input 
                            type="text" 
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-black text-slate-900 outline-none uppercase"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                          <input 
                            type="text" 
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-black text-slate-900 outline-none uppercase"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">DOB</label>
                          <input 
                            type="date" 
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-black text-slate-900 outline-none"
                          />
                       </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                           <select 
                             name="gender" 
                             value={formData.gender}
                             onChange={handleChange}
                             className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[12px] font-black text-slate-900 outline-none appearance-none"
                           >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                          <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-black text-slate-900 outline-none"
                          />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                          <input 
                            type="tel" 
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-black text-slate-900 outline-none tabular-nums"
                          />
                       </div>
                    </div>
                 </section>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                 <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                       <FaHistory className="text-blue-500 text-xs" />
                       <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Clinical Matrix</span>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Allergies</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                             <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">Penicillin <FaTimes className="cursor-pointer" /></span>
                             <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">Peanuts <FaTimes className="cursor-pointer" /></span>
                          </div>
                          <input 
                             type="text" 
                             placeholder="ADD ALLERGEN +"
                             className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black text-slate-400 outline-none tracking-widest uppercase focus:bg-white" 
                          />
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chronic Conditions</label>
                          <textarea 
                            name="chronic_conditions"
                            value={formData.chronic_conditions}
                            onChange={handleChange}
                            rows="2" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-900 outline-none resize-none"
                          ></textarea>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">current medications</label>
                          <textarea 
                            name="medications"
                            value={formData.medications}
                            onChange={handleChange}
                            rows="2" 
                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[13px] font-bold text-slate-900 outline-none resize-none"
                          ></textarea>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500" />
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">Diabetic</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500" />
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600">Hypertension</span>
                          </label>
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        </div>
    </div>
  );
};

export default AddCustomer;
