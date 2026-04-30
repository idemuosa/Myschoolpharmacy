import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCamera } from 'react-icons/fa';

const AddNewStaff = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: '',
    department: '',
    employee_id: 'EMP-2026-' + Math.floor(Math.random() * 1000)
  });
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.role) {
      toast.error("Name and Role are required");
      return;
    }

    try {
      setIsSaving(true);
      await api.post('staff/', formData);
      toast.success("Staff member added successfully!");
      navigate('/staff');
    } catch (error) {
      console.error("Staff save failed", error);
      const errorMsg = error.response?.data ? Object.values(error.response.data).flat().join(' ') : "Failed to add staff member.";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">

      {/* 1. Header */}
      <header className="px-5 py-5 flex items-center bg-white border-b border-gray-100 z-10 sticky top-0 shrink-0">
        <FaArrowLeft onClick={() => navigate('/staff')} className="text-[#1e293b] w-[18px] h-[18px] cursor-pointer hover:text-gray-600 transition-colors absolute left-5" />
        <h1 className="text-[17px] font-black text-[#0f172a] tracking-tight w-full text-center">Add New Staff</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-5 pb-8">

        <div className="bg-white rounded-2xl shadow-sm border border-[#f1f5f9] relative pb-8">

          {/* 2. Profile Picture Upload */}
          <div className="pt-8 pb-6 border-b border-[#f1f5f9] flex flex-col items-center">
            <div className="relative">
              <div className="w-[110px] h-[110px] rounded-full bg-[#38b2ac] border-4 border-white shadow-sm overflow-hidden flex items-end justify-center">
                {/* Mock Avatar Illustration */}
                <div className="w-16 h-20 bg-[#e6fffa] rounded-t-[30px] flex justify-center relative mt-4">
                  <div className="w-8 h-8 bg-[#fbbf24] rounded-full absolute -top-4"></div>
                  <div className="w-12 h-6 bg-white absolute top-3 flex items-center justify-center text-[5px] text-[#cbd5e1] font-bold">PROFESSIONAL</div>
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-[30px] h-[30px] bg-[#10b981] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:bg-[#059669] transition-colors">
                <FaCamera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h2 className="text-[19px] font-black text-[#0f172a] mt-4 mb-1">Profile Picture</h2>
            <p className="text-[13px] font-medium text-[#64748b] text-center max-w-[200px] leading-relaxed">
              Tap the camera icon to upload a professional photo
            </p>
          </div>

          {/* 3. Main Form Fields */}
          <div className="px-6 py-6 space-y-6">

            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-extrabold text-[#334155] mb-2 tracking-wide">Full Name</label>
              <input
                type="text"
                name="full_name"
                placeholder="Dr. Jane Smith"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[13px] font-extrabold text-[#334155] mb-2 tracking-wide">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="jane.smith@pharmacy.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[13px] font-extrabold text-[#334155] mb-2 tracking-wide">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-[13px] font-extrabold text-[#334155] mb-2 tracking-wide">Clinical Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#0f172a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all appearance-none cursor-pointer pr-10"
                >
                  <option className="text-[#0f172a]" value="">Select Role</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Technician">Technician</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Sales Rep">Sales Rep</option>
                  <option value="Sales Attendant">Sales Attendant</option>
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Nurses">Nurses</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748b]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-[13px] font-extrabold text-[#334155] mb-2 tracking-wide">Department</label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#0f172a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all appearance-none cursor-pointer pr-10"
                >
                  <option className="text-[#0f172a]" value="">Select Department</option>
                  <option value="Dispensary">Dispensary</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Clinical Care">Clinical Care</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#64748b]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                </div>
              </div>
            </div>

            {/* Employee ID with Auto-generate Toggle */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[13px] font-extrabold text-[#334155] tracking-wide">Employee ID</label>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[#64748b]">Auto-generate</span>

                  {/* Custom Toggle Switch */}
                  <button
                    onClick={() => setAutoGenerate(!autoGenerate)}
                    className={`w-10 h-[22px] rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${autoGenerate ? 'bg-[#10b981]' : 'bg-[#cbd5e1]'}`}
                  >
                    <div className={`bg-white w-[18px] h-[18px] rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${autoGenerate ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
              <input
                type="text"
                name="employee_id"
                placeholder="EMP-2024-089"
                readOnly={autoGenerate}
                value={formData.employee_id}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all ${autoGenerate
                    ? 'bg-[#f1f5f9] border-[#e2e8f0] text-[#64748b] cursor-not-allowed'
                    : 'bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]'
                  }`}
              />
            </div>

          </div>

          {/* 4. Action Buttons */}
          <div className="px-6 pt-2 pb-2 space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl hover:bg-[#059669] transition-colors shadow-sm text-[15px] border border-[#10b981]"
            >
              {isSaving ? 'Saving...' : 'Save Staff Member'}
            </button>
          </div>

        </div>

      </main>

      {/* Footer Text */}
      <footer className="text-center pb-6">
        <p className="text-[11px] font-semibold text-[#94a3b8]">
          © 2024 Pharmacy Management System. All rights reserved.
        </p>
      </footer>

    </div>
  );
};

export default AddNewStaff;
