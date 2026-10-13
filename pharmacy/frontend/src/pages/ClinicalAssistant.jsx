import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaFlask, FaPlus, FaTrash, FaEdit, FaSearch, FaShieldAlt,
  FaFileAlt, FaCheckCircle, FaSpinner, FaTimes, FaUserMd,
  FaUserNurse, FaMicroscope, FaPills, FaStethoscope,
  FaExclamationTriangle, FaVirus, FaHeartbeat, FaEye,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const STORAGE_KEY = 'clinical_research_protocols';

const EMPTY_FORM = {
  title: '',
  pi: '',
  phase: 'Phase I',
  enrolled: '',
  target: '',
  status: 'Active',
  startDate: '',
  description: '',
  disease: '',
  drugs: '',
  sideEffects: '',
  doctors: '',
  nurses: '',
  scientists: '',
  pharmacists: '',
  physiotherapists: ''
};

const ClinicalAssistant = () => {
  const [protocols, setProtocols] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedProtocol, setSelectedProtocol] = useState(null); // For viewing details modal
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProtocols(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse stored research protocols", err);
      }
    } else {
      // Default initial protocols if none exist
      const defaultProtocols = [
        {
          id: 1,
          title: 'Efficacy & Safety Study of Novel Cardiovascular & Metabolic Interventions',
          pi: 'Dr. Sarah Jenkins, MD',
          phase: 'Phase III',
          enrolled: 42,
          target: 100,
          status: 'Active',
          startDate: '2026-01-15',
          description: 'Multi-center clinical investigation evaluating therapeutic outcomes, adverse event profiles, and rehabilitation protocols for combination therapies.',
          disease: 'Essential Hypertension & Type 2 Diabetes Mellitus',
          drugs: 'Amlodipine Besylate (10mg), Metformin HCl (850mg), Lisinopril (20mg)',
          sideEffects: 'Mild dizziness (12%), dry cough (8%), peripheral edema (4%), transient gastrointestinal discomfort (15%)',
          doctors: 'Dr. Sarah Jenkins (Cardiology Lead), Dr. Michael Aris (Endocrinology)',
          nurses: 'Nurse Elena Rostova (Lead Clinical Nurse), Nurse David Kalu',
          scientists: 'Dr. Aris Thorne (Lead Research Scientist), Dr. Maya Lin (Biostatistician)',
          pharmacists: 'Pharm. Chidi Okonkwo (Clinical Pharmacist), Pharm. Chloe Bennett',
          physiotherapists: 'Physio. Marcus Vance (Cardiopulmonary Rehabilitation Specialist)'
        },
        {
          id: 2,
          title: 'Post-Market Surveillance on Extended-Release Respiratory Therapeutic Agents',
          pi: 'Dr. Alexander Vance',
          phase: 'Phase IV',
          enrolled: 85,
          target: 150,
          status: 'Active',
          startDate: '2025-11-01',
          description: 'Evaluating patient compliance, pulmonary function responses, and adverse drug reactions in outpatient clinical settings.',
          disease: 'Chronic Obstructive Pulmonary Disease (COPD) & Asthma',
          drugs: 'Fluticasone Propionate / Salmeterol Inhaler (250/50 mcg), Tiotropium Bromide',
          sideEffects: 'Oropharyngeal candidiasis (5%), headache (7%), muscle cramps (3%)',
          doctors: 'Dr. Alexander Vance (Pulmonology), Dr. Miriam Zhang',
          nurses: 'Nurse Rebecca Taylor (Senior Clinical Research Nurse)',
          scientists: 'Dr. Robert Sterling (Pharmacologist & Principal Scientist)',
          pharmacists: 'Pharm. Grace Adebayo (Director of Clinical Pharmacy Services)',
          physiotherapists: 'Physio. Samantha Reed (Chest Physiotherapist)'
        }
      ];
      setProtocols(defaultProtocols);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProtocols));
    }
  }, []);

  const saveProtocolsToStorage = (updated) => {
    setProtocols(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.pi) {
      toast.error('Please enter protocol title and principal investigator.');
      return;
    }

    if (editingId) {
      const updated = protocols.map(p =>
        p.id === editingId ? { ...p, ...formData, id: editingId } : p
      );
      saveProtocolsToStorage(updated);
      toast.success('Clinical research protocol updated!');
    } else {
      const newProtocol = {
        ...formData,
        id: Date.now(),
        enrolled: formData.enrolled ? parseInt(formData.enrolled) : 0,
        target: formData.target ? parseInt(formData.target) : 0
      };
      saveProtocolsToStorage([newProtocol, ...protocols]);
      toast.success('New clinical research protocol registered!');
    }

    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (protocol) => {
    setFormData({
      title: protocol.title || '',
      pi: protocol.pi || '',
      phase: protocol.phase || 'Phase I',
      enrolled: protocol.enrolled || '',
      target: protocol.target || '',
      status: protocol.status || 'Active',
      startDate: protocol.startDate || '',
      description: protocol.description || '',
      disease: protocol.disease || '',
      drugs: protocol.drugs || '',
      sideEffects: protocol.sideEffects || '',
      doctors: protocol.doctors || '',
      nurses: protocol.nurses || '',
      scientists: protocol.scientists || '',
      pharmacists: protocol.pharmacists || '',
      physiotherapists: protocol.physiotherapists || ''
    });
    setEditingId(protocol.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this research protocol?')) {
      const updated = protocols.filter(p => p.id !== id);
      saveProtocolsToStorage(updated);
      toast.success('Protocol deleted successfully.');
      if (selectedProtocol?.id === id) setSelectedProtocol(null);
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRowId(prev => (prev === id ? null : id));
  };

  const filteredProtocols = protocols.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phase?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.disease?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.drugs?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sideEffects?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nurses?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.scientists?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pharmacists?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.physiotherapists?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-sm pb-10">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30 font-black">
              <FaFlask />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Admin Clinical Portal
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight mt-1">
                Clinical Research Findings & Trials
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Register and review clinical research findings including targeted diseases, drugs, side effects, and contributing clinical team members (Doctors, Nurses, Scientists, Pharmacists, & Physiotherapists).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
              } else {
                setFormData(EMPTY_FORM);
                setShowForm(true);
              }
            }}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-xs shrink-0 self-start md:self-auto"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            <span>{showForm ? 'Close Form' : 'Register New Protocol'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Entry / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FaFileAlt className="text-emerald-600" />
              {editingId ? 'Edit Clinical Research Findings' : 'Register New Clinical Research Protocol & Findings'}
            </h2>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
              Admin Only Access
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">

            {/* Section 1: Study Overview */}
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <FaFlask className="text-emerald-600" />
                1. Protocol & Study Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Protocol / Study Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Phase II Trial on Novel Antihypertensive Agent"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Principal Investigator (PI) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pi"
                    value={formData.pi}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Clinical Phase</label>
                  <select
                    name="phase"
                    value={formData.phase}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Pre-Clinical">Pre-Clinical</option>
                    <option value="Phase I">Phase I</option>
                    <option value="Phase II">Phase II</option>
                    <option value="Phase III">Phase III</option>
                    <option value="Phase IV">Phase IV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Completed">Completed</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enrolled Subjects</label>
                  <input
                    type="number"
                    name="enrolled"
                    value={formData.enrolled}
                    onChange={handleInputChange}
                    placeholder="e.g. 24"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Enrollment</label>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                    min="0"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Study Description & Objectives</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Enter details regarding trial scope, ethical considerations, and clinical goals..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Research Findings (Disease, Drugs, Side Effects) */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-emerald-200/60 pb-1.5">
                <FaHeartbeat className="text-emerald-600" />
                2. Clinical Research Findings (Disease, Drugs & Side Effects)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaVirus className="text-rose-500" />
                    Target Disease / Medical Condition
                  </label>
                  <input
                    type="text"
                    name="disease"
                    value={formData.disease}
                    onChange={handleInputChange}
                    placeholder="e.g. Essential Hypertension, Type 2 Diabetes, Asthma, Rheumatoid Arthritis"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaPills className="text-emerald-600" />
                    Investigated Drugs & Interventions
                  </label>
                  <input
                    type="text"
                    name="drugs"
                    value={formData.drugs}
                    onChange={handleInputChange}
                    placeholder="e.g. Amlodipine (10mg), Lisinopril (20mg), Metformin (850mg)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaExclamationTriangle className="text-amber-500" />
                    Observed Side Effects & Adverse Events
                  </label>
                  <textarea
                    name="sideEffects"
                    value={formData.sideEffects}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="e.g. Mild dizziness, persistent dry cough, peripheral edema, nausea..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 3: Clinical Research Personnel Involved in Findings */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <FaUserMd className="text-indigo-600" />
                3. Clinical Findings Personnel (Doctors, Nurses, Scientists, Pharmacists, Physiotherapists)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaUserMd className="text-indigo-600" />
                    Doctors who made findings
                  </label>
                  <input
                    type="text"
                    name="doctors"
                    value={formData.doctors}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Sarah Jenkins, Dr. Michael Aris"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaUserNurse className="text-rose-600" />
                    Nurses involved
                  </label>
                  <input
                    type="text"
                    name="nurses"
                    value={formData.nurses}
                    onChange={handleInputChange}
                    placeholder="e.g. Nurse Elena Rostova, Nurse David Kalu"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaMicroscope className="text-cyan-600" />
                    Scientists involved
                  </label>
                  <input
                    type="text"
                    name="scientists"
                    value={formData.scientists}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Aris Thorne, Dr. Maya Lin"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaPills className="text-emerald-600" />
                    Pharmacists involved
                  </label>
                  <input
                    type="text"
                    name="pharmacists"
                    value={formData.pharmacists}
                    onChange={handleInputChange}
                    placeholder="e.g. Pharm. Chidi Okonkwo, Pharm. Chloe Bennett"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1 flex items-center gap-1.5">
                    <FaStethoscope className="text-amber-600" />
                    Physiotherapists involved
                  </label>
                  <input
                    type="text"
                    name="physiotherapists"
                    value={formData.physiotherapists}
                    onChange={handleInputChange}
                    placeholder="e.g. Physio. Marcus Vance, Physio. Samantha Reed"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20"
              >
                {editingId ? 'Save Changes' : 'Submit Research Protocol'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Research Protocols Table & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Registered Clinical Protocols & Findings ({filteredProtocols.length})
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              Overview of active trials, targeted diseases, investigated drugs, side effects, and healthcare personnel
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search by disease, drug, doctor, nurse, scientist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Protocol / Study Title</th>
                <th className="py-3 px-4">Target Disease & Drugs</th>
                <th className="py-3 px-4">Phase</th>
                <th className="py-3 px-4">Enrollment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <FaFlask className="text-3xl mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">No research protocols found.</p>
                    <p className="text-[11px]">Click "Register New Protocol" to enter clinical research data.</p>
                  </td>
                </tr>
              ) : (
                filteredProtocols.map(protocol => {
                  const isExpanded = expandedRowId === protocol.id;
                  return (
                    <React.Fragment key={protocol.id}>
                      <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-emerald-50/30' : ''}`}>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-black text-slate-900 leading-snug">{protocol.title}</p>
                          <p className="text-[11px] text-slate-500 font-bold mt-0.5">PI: {protocol.pi}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {protocol.disease ? (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px] uppercase mb-1">
                              <FaVirus className="inline mr-1 text-[9px]" />
                              {protocol.disease}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Not specified</span>
                          )}
                          {protocol.drugs && (
                            <p className="text-[11px] text-emerald-700 font-bold line-clamp-1">
                              💊 {protocol.drugs}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] uppercase">
                            {protocol.phase}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-black text-slate-900">{protocol.enrolled || 0}</span>
                          <span className="text-slate-400 text-[11px]"> / {protocol.target || '-'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            protocol.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            protocol.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            protocol.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {protocol.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => toggleRowExpand(protocol.id)}
                              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold ${
                                isExpanded ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                              }`}
                              title="Toggle Research Findings"
                            >
                              <FaEye />
                              <span>{isExpanded ? 'Hide' : 'Findings'}</span>
                              {isExpanded ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}
                            </button>
                            <button
                              onClick={() => handleEdit(protocol)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit Protocol"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(protocol.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Protocol"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Findings Section */}
                      {isExpanded && (
                        <tr className="bg-gradient-to-r from-slate-50 via-emerald-50/20 to-slate-50 border-b border-emerald-100">
                          <td colSpan="6" className="p-4 md:p-6">
                            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                  <FaFlask className="text-emerald-600" />
                                  Clinical Research Findings Details
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400">
                                  Start Date: {protocol.startDate || 'N/A'}
                                </span>
                              </div>

                              {/* Findings Summary: Disease, Drugs, Side Effects */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                                  <p className="text-[10px] font-black text-rose-800 uppercase flex items-center gap-1.5 mb-1">
                                    <FaVirus /> Targeted Disease
                                  </p>
                                  <p className="text-xs font-bold text-slate-800">
                                    {protocol.disease || 'Not specified'}
                                  </p>
                                </div>

                                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                                  <p className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1.5 mb-1">
                                    <FaPills /> Investigated Drugs
                                  </p>
                                  <p className="text-xs font-bold text-slate-800">
                                    {protocol.drugs || 'Not specified'}
                                  </p>
                                </div>

                                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                                  <p className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1.5 mb-1">
                                    <FaExclamationTriangle /> Observed Side Effects
                                  </p>
                                  <p className="text-xs font-bold text-slate-800">
                                    {protocol.sideEffects || 'None reported'}
                                  </p>
                                </div>
                              </div>

                              {/* Research Personnel Breakdown */}
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2.5">
                                  Research Findings Team & Healthcare Personnel
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                    <p className="text-[10px] font-black text-indigo-800 uppercase flex items-center gap-1 mb-1">
                                      <FaUserMd /> Doctors
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-700">
                                      {protocol.doctors || 'None listed'}
                                    </p>
                                  </div>

                                  <div className="p-2.5 bg-rose-50/50 rounded-xl border border-rose-100">
                                    <p className="text-[10px] font-black text-rose-800 uppercase flex items-center gap-1 mb-1">
                                      <FaUserNurse /> Nurses
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-700">
                                      {protocol.nurses || 'None listed'}
                                    </p>
                                  </div>

                                  <div className="p-2.5 bg-cyan-50/50 rounded-xl border border-cyan-100">
                                    <p className="text-[10px] font-black text-cyan-800 uppercase flex items-center gap-1 mb-1">
                                      <FaMicroscope /> Scientists
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-700">
                                      {protocol.scientists || 'None listed'}
                                    </p>
                                  </div>

                                  <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-800 uppercase flex items-center gap-1 mb-1">
                                      <FaPills /> Pharmacists
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-700">
                                      {protocol.pharmacists || 'None listed'}
                                    </p>
                                  </div>

                                  <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                                    <p className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1 mb-1">
                                      <FaStethoscope /> Physiotherapists
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-700">
                                      {protocol.physiotherapists || 'None listed'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              {protocol.description && (
                                <div className="mt-3 pt-2 border-t border-slate-100 text-slate-600 text-xs">
                                  <p className="font-bold text-[10px] uppercase text-slate-400 mb-0.5">Trial Objectives & Notes</p>
                                  <p>{protocol.description}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ClinicalAssistant;
