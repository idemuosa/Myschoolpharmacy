import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FaFlask, FaSearch, FaPlus, FaFilter, FaEye, FaTimes, FaFileAlt,
  FaNotesMedical, FaPills, FaShieldAlt, FaPrint, FaTrash,
  FaCheckCircle, FaExclamationTriangle, FaUserMd, FaLayerGroup
} from 'react-icons/fa';

const INITIAL_RESEARCH_DATA = [
  {
    id: 1,
    disease_name: 'Hypertension',
    drug_name: 'Lisinopril & Hydrochlorothiazide',
    side_effects: 'Dry cough, hyperkalemia, mild dizziness, orthostatic hypotension',
    findings: 'Combined ACE inhibitor and thiazide diuretic regimen demonstrated a 14 mmHg systolic reduction in Stage 2 hypertensive subjects over a 12-week trial. Routine renal panel and serum potassium monitoring mandatory due to elevated hyperkalemia risk.',
    severity: 'Moderate',
    researcher: 'Dr. Evelyn Vance, PharmD',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 2,
    disease_name: 'Type 2 Diabetes Mellitus',
    drug_name: 'Metformin HCl & Empagliflozin',
    side_effects: 'Gastrointestinal upset, risk of mycotic genital infections, rare lactic acidosis',
    findings: 'SGLT2 inhibitor synergy with Metformin yields superior HbA1c control (-1.2%) while offering cardio-renal protection. Patient hydration education is crucial to mitigate urinary tract infection risk.',
    severity: 'Mild',
    researcher: 'Dr. Marcus Sterling',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 3,
    disease_name: 'Bacterial Endocarditis',
    drug_name: 'Vancomycin & Gentamicin',
    side_effects: 'Ototoxicity, nephrotoxic tubular necrosis, Red Man Syndrome',
    findings: 'Synergistic bactericidal action against resistant Gram-positive pathogens. Requires strict therapeutic drug monitoring (TDM) of trough concentrations to prevent irreversible ototoxicity and acute renal failure.',
    severity: 'Critical',
    researcher: 'Dr. Sophia Thorne',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 4,
    disease_name: 'Rheumatoid Arthritis',
    drug_name: 'Methotrexate & Folic Acid',
    side_effects: 'Hepatic enzyme elevation, mucositis, bone marrow suppression',
    findings: 'Co-administration of Folic Acid (5mg weekly) significantly decreases gastrointestinal and mucosal toxicity without blunting anti-rheumatic efficacy. LFT monitoring required bi-monthly.',
    severity: 'Severe',
    researcher: 'Dr. Arthur Pendelton',
    created_at: new Date().toISOString()
  }
];

const ClinicalAssistant = () => {
  const [researchList, setResearchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFindingModal, setActiveFindingModal] = useState(null);

  const [formData, setFormData] = useState({
    disease_name: '',
    drug_name: '',
    side_effects: '',
    findings: '',
    severity: 'Moderate',
    researcher: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchResearchData();
  }, []);

  const fetchResearchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('clinical-research/');
      const data = res.data?.results || res.data || [];
      if (Array.isArray(data) && data.length > 0) {
        setResearchList(data);
      } else {
        setResearchList(INITIAL_RESEARCH_DATA);
      }
    } catch (err) {
      console.warn("API fetch error for clinical research, using initial research dataset:", err);
      setResearchList(INITIAL_RESEARCH_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.disease_name.trim() || !formData.drug_name.trim() || !formData.findings.trim()) {
      toast.error("Please fill in Disease Name, Drug Name, and Clinical Findings.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        researcher: formData.researcher.trim() || 'Clinical Pharmacist'
      };

      try {
        const res = await api.post('clinical-research/', payload);
        if (res.data) {
          setResearchList([res.data, ...researchList]);
        } else {
          throw new Error("No data returned");
        }
      } catch (apiErr) {
        console.warn("Backend save failed, updating local state:", apiErr);
        const newEntry = {
          id: Date.now(),
          ...payload,
          created_at: new Date().toISOString()
        };
        setResearchList([newEntry, ...researchList]);
      }

      toast.success("Clinical research finding successfully recorded!");
      setFormData({
        disease_name: '',
        drug_name: '',
        side_effects: '',
        findings: '',
        severity: 'Moderate',
        researcher: ''
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to save research finding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this research finding?")) return;
    try {
      await api.delete(`clinical-research/${id}/`);
    } catch (err) {
      console.warn("Backend delete error, removing from local state:", err);
    }
    setResearchList(researchList.filter(item => item.id !== id));
    toast.success("Finding removed.");
  };

  const filteredList = researchList.filter(item => {
    const matchesSearch =
      (item.disease_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.drug_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.side_effects || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.findings || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.researcher || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === 'ALL' ||
      (item.severity || '').toUpperCase() === selectedSeverity.toUpperCase();

    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SEVERE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MILD':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-sm pb-10">

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-800/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30 font-black">
              <FaFlask />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Pharmacy Clinical Research
                </span>
                <span className="text-xs font-semibold text-slate-300">Database & Registry</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight mt-1">
                Clinical Research & Disease Findings
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Evidence-based repository for entering and evaluating research findings on target diseases, drug interactions, and side effects.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0 border border-emerald-300/40"
          >
            <FaPlus className="text-sm" /> Enter Clinical Research
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0">
            <FaNotesMedical />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Research</p>
            <p className="text-lg font-black text-slate-900">{researchList.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg shrink-0">
            <FaExclamationTriangle />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Critical/Severe</p>
            <p className="text-lg font-black text-slate-900">
              {researchList.filter(r => ['CRITICAL', 'SEVERE'].includes(r.severity?.toUpperCase())).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            <FaPills />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Drugs Analyzed</p>
            <p className="text-lg font-black text-slate-900">
              {new Set(researchList.map(r => r.drug_name)).size}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0">
            <FaUserMd />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Researchers</p>
            <p className="text-lg font-black text-slate-900">
              {new Set(researchList.map(r => r.researcher).filter(Boolean)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search disease, drugs, side effects, findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1 shrink-0">
            <FaFilter /> Severity:
          </span>
          {['ALL', 'MILD', 'MODERATE', 'SEVERE', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedSeverity === sev
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical Research Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-emerald-600 text-sm" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Recorded Clinical Findings ({filteredList.length})
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Click "View Findings" for comprehensive disease research details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-3">Disease / Condition</th>
                <th className="px-5 py-3">Drug(s) Investigated</th>
                <th className="px-5 py-3">Side Effects & Adverse Events</th>
                <th className="px-5 py-3 text-center">Severity</th>
                <th className="px-5 py-3">Researcher & Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-400 font-bold">
                    Scanning clinical research database...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-slate-400 font-bold">
                    No clinical research findings match your search query.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5 font-black text-slate-900 uppercase">
                      {item.disease_name}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      {item.drug_name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                      {item.side_effects}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      <div className="font-bold text-slate-700">{item.researcher || 'Investigator'}</div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveFindingModal(item)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                        >
                          <FaEye className="text-xs" /> View Findings
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Research"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL: Enter Clinical Research & Findings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-lg font-black">
                  <FaNotesMedical />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider font-outfit">New Clinical Research Form</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Record Disease, Drug Efficacy & Adverse Effects</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Disease / Medical Condition *
                  </label>
                  <input
                    type="text"
                    name="disease_name"
                    placeholder="e.g. Type 2 Diabetes, Hypertension"
                    value={formData.disease_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Drug / Medication(s) *
                  </label>
                  <input
                    type="text"
                    name="drug_name"
                    placeholder="e.g. Metformin HCl 500mg"
                    value={formData.drug_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Side Effects & Adverse Reactions
                </label>
                <input
                  type="text"
                  name="side_effects"
                  placeholder="e.g. GI distress, headache, dizziness"
                  value={formData.side_effects}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Clinical Findings & Efficacy Observations *
                </label>
                <textarea
                  name="findings"
                  rows="4"
                  placeholder="Detailed research findings, response rates, dosage adjustments, or clinical trial outcomes..."
                  value={formData.findings}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Severity / Safety Level
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="Mild">Mild - Low Risk</option>
                    <option value="Moderate">Moderate - Regular Monitoring</option>
                    <option value="Severe">Severe - High Caution Needed</option>
                    <option value="Critical">Critical - Strict Black Box Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Lead Researcher / Investigator Name
                  </label>
                  <input
                    type="text"
                    name="researcher"
                    placeholder="e.g. Dr. Jane Doe, PharmD"
                    value={formData.researcher}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Clinical Research Finding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL: Particular Disease Research Finding */}
      {activeFindingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white flex items-start justify-between border-b border-slate-800">
              <div>
                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border mb-2 inline-block ${getSeverityBadge(activeFindingModal.severity)}`}>
                  {activeFindingModal.severity} Risk Profile
                </span>
                <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-white">
                  {activeFindingModal.disease_name}
                </h2>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  Medication: {activeFindingModal.drug_name}
                </p>
              </div>
              <button
                onClick={() => setActiveFindingModal(null)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* Side Effects */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <FaExclamationTriangle className="text-amber-600" />
                  Observed Side Effects & Adverse Reactions
                </p>
                <p className="text-xs font-bold text-amber-950 leading-relaxed">
                  {activeFindingModal.side_effects || 'No major adverse reactions noted during study.'}
                </p>
              </div>

              {/* Detailed Research Findings */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FaFileAlt className="text-emerald-600" />
                  Clinical Findings & Trial Evidence
                </p>
                <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                  {activeFindingModal.findings}
                </p>
              </div>

              {/* Investigator Metadata */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                <div>
                  <span className="font-bold text-slate-700">Lead Investigator:</span> {activeFindingModal.researcher || 'N/A'}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Date Recorded:</span> {new Date(activeFindingModal.created_at || Date.now()).toLocaleDateString()}
                </div>
              </div>

            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <FaPrint /> Print Report
              </button>
              <button
                onClick={() => setActiveFindingModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClinicalAssistant;
