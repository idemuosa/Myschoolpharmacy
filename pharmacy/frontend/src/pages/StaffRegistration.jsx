import React, { useState, useRef } from 'react';
import {
  FaBell, FaCog, FaCamera, FaUser, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StaffRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: '',
    department: '',
    employee_id: 'EP-' + Math.floor(Math.random() * 100000)
  });
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Camera access failed.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if(!formData.full_name || !formData.role) {
      return toast.error("Required: Name & Role");
    }

    try {
      setIsSaving(true);
      const payload = { ...formData, photo: capturedImage };
      await api.post('staff/', payload);
      toast.success("Staff profile created.");
      navigate('/staff');
    } catch (err) {
      console.error(err);
      toast.error("Registration failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden text-xs">
        {/* Header */}
        <header className="bg-white px-5 py-3 border-b border-slate-100 flex justify-between items-center z-10 w-full h-14">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <span>Staff</span>
             <span className="text-slate-300">/</span>
             <span className="text-emerald-500">Registration</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <FaBell className="w-3.5 h-3.5 hover:text-emerald-500 cursor-pointer" />
            <FaCog className="w-3.5 h-3.5 hover:text-emerald-500 cursor-pointer" />
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase font-outfit">New staff registry</h1>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel authentication & identification</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">

                {/* Photo Column */}
                <div className="md:w-[35%] p-8 flex flex-col items-center bg-slate-50/20">
                  <div className="relative w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 overflow-hidden border border-slate-200 shadow-inner">
                    {isCameraOpen ? (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    ) : capturedImage ? (
                      <img src={capturedImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser className="w-10 h-10 text-slate-300" />
                    )}
                    
                    {!isCameraOpen && (
                      <button onClick={startCamera} className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-lg shadow-lg">
                        <FaCamera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {isCameraOpen && (
                    <div className="flex gap-2 mb-4 w-full">
                      <button onClick={capturePhoto} className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Capture</button>
                      <button onClick={stopCamera} className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-[9px]"><FaTimes /></button>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1.5">Profile Scan</h3>
                  <p className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-tighter mb-6">Biometric Identification</p>
                  
                  <div className="w-full flex flex-col gap-2">
                    <label className="w-full py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-slate-50 transition-all">
                      Load Digital Key
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setCapturedImage(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>

                {/* Details Column */}
                <div className="md:w-[65%] p-8 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black text-slate-900 outline-none uppercase" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black text-slate-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone</label>
                      <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black text-slate-900 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clinical Role</label>
                      <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black text-slate-900 outline-none">
                        <option value="">Select Role</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="tech">Technician</option>
                        <option value="nurse">Nurse</option>
                        <option value="sales-rep">Sales Rep</option>
                        <option value="sales-attendant">Sales Attendant</option>
                        <option value="admin">Desk Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Department</label>
                      <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] font-black text-slate-900 outline-none">
                        <option value="">Select Dept</option>
                        <option value="clinical">Clinical</option>
                        <option value="ops">Inventory</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-[10px] font-black text-slate-900 uppercase">System ID</span>
                         <button onClick={() => setAutoGenerate(!autoGenerate)} className={`w-8 h-4 rounded-full transition-all relative ${autoGenerate ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${autoGenerate ? 'left-4.5' : 'left-0.5'}`} />
                         </button>
                      </div>
                      <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} disabled={autoGenerate} className="w-full bg-white border border-slate-100 rounded-lg px-3 py-2 font-mono text-[10px] font-black text-slate-600 uppercase" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-end gap-3">
                <button onClick={() => navigate('/staff')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 hover:text-slate-600">Dismiss</button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-lg border border-emerald-500 shadow-none hover:bg-emerald-600 transition-all min-w-[140px]"
                >
                  {isSaving ? "Saving..." : "Authorize Personnel"}
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
};

export default StaffRegistration;
