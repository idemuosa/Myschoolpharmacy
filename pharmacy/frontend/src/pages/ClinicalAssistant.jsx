import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  FaFlask, FaPlus, FaTrash, FaEdit, FaSearch, FaShieldAlt,
  FaFileAlt, FaCheckCircle, FaSpinner, FaTimes
} from 'react-icons/fa';

const STORAGE_KEY = 'clinical_research_protocols';

const ClinicalAssistant = () => {
  const [protocols, setProtocols] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    pi: '',
    phase: 'Phase I',
    enrolled: '',
    target: '',
    status: 'Active',
    startDate: '',
    description: ''
  });

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
          title: 'Ethical Medical Breakthrough Protocol A',
          pi: 'Dr. Admin Lead',
          phase: 'Phase III',
          enrolled: 42,
          target: 100,
          status: 'Active',
          startDate: '2026-01-15',
          description: 'Evaluating novel pharmaceutical interventions.'
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

    setFormData({
      title: '',
      pi: '',
      phase: 'Phase I',
      enrolled: '',
      target: '',
      status: 'Active',
      startDate: '',
      description: ''
    });
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
      description: protocol.description || ''
    });
    setEditingId(protocol.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this research protocol?')) {
      const updated = protocols.filter(p => p.id !== id);
      saveProtocolsToStorage(updated);
      toast.success('Protocol deleted successfully.');
    }
  };

  const filteredProtocols = protocols.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phase?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.status?.toLowerCase().includes(searchTerm.toLowerCase())
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
                Clinical Research & Trials
              </h1>
              <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                Register and manage clinical trial protocols, research data, and participant enrollment.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
              } else {
                setFormData({
                  title: '',
                  pi: '',
                  phase: 'Phase I',
                  enrolled: '',
                  target: '',
                  status: 'Active',
                  startDate: '',
                  description: ''
                });
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <FaFileAlt className="text-emerald-600" />
              {editingId ? 'Edit Clinical Protocol' : 'Register New Clinical Research Protocol'}
            </h2>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">
              Admin Only Access
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
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
                  rows="3"
                  placeholder="Enter details regarding trial scope, ethical considerations, and clinical goals..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
              Registered Clinical Protocols ({filteredProtocols.length})
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              Overview of active, pending, and completed research trials
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search research protocols..."
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
                <th className="py-3 px-5">Protocol / Study Title</th>
                <th className="py-3 px-5">Investigator</th>
                <th className="py-3 px-5">Phase</th>
                <th className="py-3 px-5">Enrollment</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Start Date</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <FaFlask className="text-3xl mx-auto mb-2 text-slate-300" />
                    <p className="font-bold">No research protocols found.</p>
                    <p className="text-[11px]">Click "Register New Protocol" to enter clinical research data.</p>
                  </td>
                </tr>
              ) : (
                filteredProtocols.map(protocol => (
                  <tr key={protocol.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-black text-slate-900">{protocol.title}</p>
                      {protocol.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1">{protocol.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{protocol.pi}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded text-[10px] uppercase">
                        {protocol.phase}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="font-black text-slate-900">{protocol.enrolled || 0}</span>
                      <span className="text-slate-400 text-[11px]"> / {protocol.target || '-'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        protocol.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        protocol.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        protocol.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {protocol.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-bold">{protocol.startDate || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ClinicalAssistant;
