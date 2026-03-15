import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import prescriptionService from '../services/prescriptionService';
import customerService from '../services/customerService';
import { useEffect } from 'react';
import { FaArrowLeft, FaInfoCircle, FaCamera, FaUserMd, FaFileAlt, FaPaperPlane, FaBriefcaseMedical } from 'react-icons/fa';
import { socket } from '../services/socket';
import toast from 'react-hot-toast';
const UploadPrescription = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    prescribing_doctor: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      setCustomers(response.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.customer_id || !formData.prescribing_doctor) {
      toast.error("Patient and Prescribing Doctor are required!");
      return;
    }

    try {
      setIsSubmitting(true);
      const generatedId = "RX-" + Math.floor(Math.random() * 100000);
      
      const selectedCustomer = customers.find(c => c.id === parseInt(formData.customer_id));
      const patientName = selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : "Unknown Patient";

      // Save prescription to DB
      await prescriptionService.createPrescription({
         prescription_id: generatedId,
         customer: formData.customer_id,
         prescribing_doctor: formData.prescribing_doctor,
         notes: formData.notes,
         status: 'Pending'
      });

      // Emit WS for real-time dashboard update
      socket.emit('new_prescription_uploaded', {
          prescriptionId: generatedId,
          patientName: patientName,
          time: new Date().toLocaleTimeString()
      });
      
      toast.success(`Prescription ${generatedId} submitted successfully!`);
      navigate('/'); // Go back to dashboard/home
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload prescription. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      
      {/* 1. Header */}
      <header className="px-5 py-5 flex items-center bg-white border-b border-gray-100 z-10 sticky top-0 shrink-0">
        <button onClick={() => navigate(-1)} className="text-[#10b981] hover:text-[#059669] transition-colors absolute left-5 focus:outline-none">
          <FaArrowLeft className="w-[18px] h-[18px]" />
        </button>
        <h1 className="text-[17px] font-black text-[#0f172a] tracking-tight w-full text-center">Upload Prescription</h1>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto p-5 scrollbar-hide">
         
         {/* 2. Requirement Checklist Alert Box */}
         <div className="bg-[#f0fdf4] border border-[#d1fae5] rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3">
            <FaInfoCircle className="text-[#10b981] w-5 h-5 mt-0.5 shrink-0" />
            <div>
               <h3 className="text-[16px] font-bold text-[#10b981] mb-1 leading-tight">Requirement Checklist</h3>
               <p className="text-[15px] font-medium text-[#475569] leading-relaxed">
                 Ensure the photo is clear, the doctor's signature is visible, and the date is valid (within last 6 months).
               </p>
            </div>
         </div>

         {/* 3. Upload Photo or Scan Area */}
         <div className="bg-[#f0fdf4]/50 rounded-2xl border-2 border-dashed border-[#a7f3d0] flex flex-col items-center justify-center p-8 mb-8 relative">
            
            <div className="w-14 h-14 bg-[#10b981] rounded-full flex items-center justify-center mb-5 text-white shadow-md relative z-10">
               <FaCamera className="w-[26px] h-[26px]" />
               {/* Small plus icon inside camera to match the design roughly */}
               <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center border border-[#10b981]">
                  <span className="text-[#10b981] text-[12px] font-black leading-none pb-[1px]">+</span>
               </div>
            </div>
            
            <h2 className="text-[17px] font-black text-[#0f172a] mb-2">Upload Photo or Scan</h2>
            <p className="text-[16px] font-medium text-[#64748b] text-center mb-6 max-w-[260px] leading-relaxed">
              Tap to browse gallery or capture a new photo of your prescription.
            </p>
            
            <button className="bg-[#10b981] text-white text-[16px] font-bold px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#059669] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2">
               Select File
            </button>
            
         </div>

         {/* 4. Prescription Details Section */}
         <div>
            <h3 className="text-[18px] font-black tracking-tight text-[#0f172a] mb-5">Prescription Details</h3>
            
            <div className="space-y-5">
               
                {/* Select Customer */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <FaUserMd className="text-[#10b981] w-[14px] h-[14px]" />
                     <label className="block text-[16px] font-extrabold text-[#334155]">Select Patient</label>
                  </div>
                  <select 
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleChange}
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[17px] font-medium text-[#0f172a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all shadow-sm"
                  >
                    <option value="">Choose Patient</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                    ))}
                  </select>
                </div>

                {/* Prescribing Doctor Input */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <FaBriefcaseMedical className="text-[#10b981] w-[14px] h-[14px]" />
                     <label className="block text-[16px] font-extrabold text-[#334155]">Prescribing Doctor</label>
                  </div>
                  <input 
                    type="text" 
                    name="prescribing_doctor"
                    value={formData.prescribing_doctor}
                    onChange={handleChange}
                    placeholder="Enter doctor's name" 
                    className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[17px] font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all shadow-sm"
                  />
                </div>

               {/* Notes for Pharmacist TextArea */}
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <FaFileAlt className="text-[#10b981] w-[14px] h-[14px]" />
                    <label className="block text-[16px] font-extrabold text-[#334155]">Notes for Pharmacist</label>
                 </div>
                 <textarea 
                   name="notes"
                   value={formData.notes}
                   onChange={handleChange}
                   placeholder="Add specific instructions, allergies, or medication brand preferences..." 
                   rows="4"
                   className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[17px] font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all shadow-sm resize-y"
                 ></textarea>
               </div>

            </div>
         </div>

         {/* 5. Disclaimer Text */}
         <div className="mt-6 mb-4 px-2">
            <p className="text-[14px] font-medium text-[#64748b] text-center leading-relaxed">
              By submitting, you agree that this is a valid medical prescription. Our pharmacists will verify all information.
            </p>
         </div>

      </main>

      <button onClick={handleSubmit} disabled={isSubmitting} className="fixed bottom-6 left-5 right-5 bg-[#10b981] text-white text-[16px] font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 z-20">
        <FaPaperPlane className="w-4 h-4" />
        {isSubmitting ? 'PROCESSING...' : 'SUBMIT PRESCRIPTION'}
      </button>

    </div>
  );
};

export default UploadPrescription;
