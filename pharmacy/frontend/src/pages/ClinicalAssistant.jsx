import React, { useState, useEffect } from 'react';
import drugService from '../services/drugService';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FaRobot, FaExclamationTriangle, FaCheckCircle, FaSearch, FaUserCheck,
  FaCapsules, FaTrash, FaShieldAlt, FaInfoCircle, FaPills, FaPrint,
  FaNotesMedical, FaList, FaSyringe, FaHeartbeat, FaTimesCircle
} from 'react-icons/fa';

const KNOWN_INTERACTIONS = [
  {
    drugs: ['warfarin', 'aspirin'],
    severity: 'Severe',
    title: 'High Risk of Major Hemorrhage / Bleeding',
    description: 'Concomitant use of Warfarin and Aspirin significantly increases antiplatelet and anticoagulant effects, leading to high risk of major GI or systemic hemorrhage.',
    recommendation: 'Avoid combination unless explicitly indicated under close specialist monitor with routine INR monitoring.'
  },
  {
    drugs: ['lisinopril', 'spironolactone'],
    severity: 'Severe',
    title: 'Risk of Severe Hyperkalemia',
    description: 'Combining ACE inhibitors (e.g. Lisinopril) with potassium-sparing diuretics (Spironolactone) can cause dangerously high serum potassium levels.',
    recommendation: 'Monitor serum potassium levels frequently if co-administered.'
  },
  {
    drugs: ['ibuprofen', 'lisinopril'],
    severity: 'Moderate',
    title: 'Reduced Antihypertensive Efficacy & Renal Impairment Risk',
    description: 'NSAIDs like Ibuprofen can diminish the blood pressure lowering effect of ACE inhibitors and decrease renal perfusion.',
    recommendation: 'Consider alternative analgesic (e.g. Paracetamol) and monitor renal function.'
  },
  {
    drugs: ['ciprofloxacin', 'calcium'],
    severity: 'Moderate',
    title: 'Chelation & Decreased Antibiotic Absorption',
    description: 'Calcium cations chelate fluoroquinolones like Ciprofloxacin in the GI tract, markedly reducing antibiotic bioavailability.',
    recommendation: 'Administer Ciprofloxacin at least 2 hours before or 6 hours after calcium or antacid administration.'
  },
  {
    drugs: ['metformin', 'contrast'],
    severity: 'Moderate',
    title: 'Risk of Metformin-Associated Lactic Acidosis',
    description: 'Iodinated contrast agents may cause acute kidney injury, leading to Metformin accumulation and lactic acidosis.',
    recommendation: 'Withhold Metformin prior to or at time of procedure and resume after 48h if renal function is stable.'
  },
  {
    drugs: ['amoxicillin', 'methotrexate'],
    severity: 'Moderate',
    title: 'Decreased Renal Clearance of Methotrexate',
    description: 'Penicillins inhibit renal tubular secretion of Methotrexate, potentially increasing toxicity.',
    recommendation: 'Monitor for signs of Methotrexate toxicity (leukopenia, mucositis).'
  }
];

const ClinicalAssistant = () => {
  const [drugsList, setDrugsList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [drugsRes, customersRes] = await Promise.all([
          drugService.getDrugs(),
          api.get('customers/')
        ]);

        const rawDrugs = drugsRes.data?.results || drugsRes.data || [];
        const rawCustomers = customersRes.data?.results || customersRes.data || [];

        setDrugsList(rawDrugs);
        setCustomersList(rawCustomers);
      } catch (err) {
        console.error("Clinical data fetch error:", err);
        toast.error("Failed to load medication catalog.");
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleAddDrug = (drug) => {
    if (selectedDrugs.some(d => d.id === drug.id)) {
      toast.error(`${drug.name} is already added.`);
      return;
    }
    setSelectedDrugs([...selectedDrugs, drug]);
    setSearchTerm('');
  };

  const handleRemoveDrug = (id) => {
    setSelectedDrugs(selectedDrugs.filter(d => d.id !== id));
    setAnalysis(null);
  };

  const handleRunAnalysis = () => {
    if (selectedDrugs.length === 0) {
      toast.error("Select at least one drug to run safety analysis.");
      return;
    }

    const drugNames = selectedDrugs.map(d => (d.name || '').toLowerCase());
    const genericNames = selectedDrugs.map(d => (d.generic_name || '').toLowerCase());
    const allIdentifiers = [...drugNames, ...genericNames];

    const detectedInteractions = [];

    // Check interaction rulebase
    KNOWN_INTERACTIONS.forEach(rule => {
      const match = rule.drugs.every(drugKey =>
        allIdentifiers.some(id => id.includes(drugKey))
      );
      if (match) {
        detectedInteractions.push(rule);
      }
    });

    // Check Patient Allergy Flags
    const allergyWarnings = [];
    if (selectedCustomer) {
      const allergies = (selectedCustomer.allergies || '').toLowerCase();
      const conditions = (selectedCustomer.chronic_conditions || '').toLowerCase();

      selectedDrugs.forEach(drug => {
        const dName = (drug.name || '').toLowerCase();
        const gName = (drug.generic_name || '').toLowerCase();

        if (allergies && (allergies.includes(dName) || allergies.includes(gName) || (allergies.includes('penicillin') && (dName.includes('amph') || dName.includes('amox') || gName.includes('amox'))))) {
          allergyWarnings.push({
            type: 'Allergy Alert',
            severity: 'Severe',
            message: `Patient ${selectedCustomer.first_name} ${selectedCustomer.last_name} has registered ALLERGY matching medication: ${drug.name}!`
          });
        }

        if (conditions.includes('kidney') || conditions.includes('renal')) {
          if (dName.includes('ibuprofen') || dName.includes('naproxen') || dName.includes('metformin')) {
            allergyWarnings.push({
              type: 'Condition Contraindication',
              severity: 'Moderate',
              message: `Caution: ${drug.name} in patient with chronic kidney condition (${selectedCustomer.chronic_conditions}).`
            });
          }
        }

        if (conditions.includes('hypertension') || conditions.includes('high blood pressure')) {
          if (dName.includes('pseudoephedrine') || dName.includes('ibuprofen')) {
            allergyWarnings.push({
              type: 'Condition Caution',
              severity: 'Moderate',
              message: `${drug.name} may elevate blood pressure in hypertensive patients.`
            });
          }
        }
      });
    }

    setAnalysis({
      interactions: detectedInteractions,
      allergyWarnings,
      totalDrugsChecked: selectedDrugs.length,
      evaluatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    toast.success("AI Clinical Safety Scan Completed!");
  };

  const filteredCatalog = drugsList.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-sm pb-10">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/30 font-black">
              <FaRobot />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  AI Clinical Intelligence
                </span>
                <span className="text-xs font-semibold text-slate-400">v2.5 Engine</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-outfit text-white tracking-tight mt-1">
                Clinical Drug Interaction & Safety Assistant
              </h1>
              <p className="text-xs text-slate-300 max-w-xl mt-0.5">
                Real-time pharmacovigilance engine checking multi-drug contraindications, patient allergy triggers, and organ toxicity risks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 shrink-0">
            <FaShieldAlt className="text-emerald-400 text-2xl ml-2" />
            <div className="pr-3 text-right">
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Safety Status</p>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wide">Active Pharmacopeia Scan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Drug & Patient Selection */}
        <div className="lg:col-span-5 space-y-5">

          {/* Patient Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FaUserCheck className="text-indigo-600" />
                Select Patient Context (Optional)
              </label>
              {selectedCustomer && (
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-[10px] font-bold text-red-500 hover:underline uppercase"
                >
                  Clear Patient
                </button>
              )}
            </div>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customersList.find(c => c.id === parseInt(e.target.value));
                setSelectedCustomer(found || null);
                setAnalysis(null);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="">-- Choose Patient for Allergy & Condition Cross-Check --</option>
              {customersList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name} ({c.customer_id}) {c.allergies ? `[Allergies: ${c.allergies}]` : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                <p className="font-black text-indigo-950">{selectedCustomer.first_name} {selectedCustomer.last_name}</p>
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">
                    Allergies: {selectedCustomer.allergies || 'None listed'}
                  </span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                    Conditions: {selectedCustomer.chronic_conditions || 'None listed'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search & Add Medication */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FaPills className="text-emerald-600" />
              Add Medications to Evaluate
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search drug name, generic, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Dropdown search results */}
            {searchTerm.trim().length > 0 && (
              <div className="border border-slate-100 rounded-xl bg-slate-50 p-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {filteredCatalog.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2 text-center">No matching drugs in stock catalog.</p>
                ) : (
                  filteredCatalog.map(drug => (
                    <div
                      key={drug.id}
                      onClick={() => handleAddDrug(drug)}
                      className="p-2 hover:bg-white rounded-lg cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div>
                        <p className="text-xs font-black text-slate-800 group-hover:text-emerald-600">{drug.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{drug.generic_name || drug.category}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        + Add
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Drugs list */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                Medication Regimen ({selectedDrugs.length})
              </p>
              {selectedDrugs.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400">
                  <FaCapsules className="text-2xl mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold">No drugs added yet</p>
                  <p className="text-[10px]">Search above to add drugs for interaction screening.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDrugs.map(drug => (
                    <div
                      key={drug.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <FaCapsules />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{drug.name}</p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            {drug.dosage} • {drug.form} {drug.generic_name ? `(${drug.generic_name})` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDrug(drug.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove drug"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={selectedDrugs.length === 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FaRobot className="text-base" />
              Run AI Safety Analysis
            </button>

          </div>

        </div>

        {/* Right Column: AI Analysis Results */}
        <div className="lg:col-span-7 space-y-5">
          {!analysis ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center text-3xl mb-4 border border-emerald-100 shadow-inner">
                <FaShieldAlt />
              </div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Ready for Safety Scan</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select medications and optional patient profile, then click "Run AI Safety Analysis" to evaluate contraindications and clinical warnings.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Scan Summary Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Safety Scan Results
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    Evaluated {analysis.totalDrugsChecked} medication(s) at {analysis.evaluatedAt}
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FaPrint /> Print Report
                </button>
              </div>

              {/* Allergy / Condition Alerts */}
              {analysis.allergyWarnings.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-wider">
                    <FaExclamationTriangle className="text-base text-red-600" />
                    Patient Allergy & Contraindication Trigger ({analysis.allergyWarnings.length})
                  </div>
                  <div className="space-y-2">
                    {analysis.allergyWarnings.map((warn, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-red-200 text-xs text-red-950 font-bold flex items-start gap-2 shadow-sm">
                        <FaTimesCircle className="text-red-500 text-base shrink-0 mt-0.5" />
                        <div>
                          <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded uppercase font-black mr-2">
                            {warn.severity}
                          </span>
                          {warn.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug-Drug Interactions Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FaHeartbeat className="text-indigo-600" />
                    Drug-Drug Interactions Detected
                  </h3>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    analysis.interactions.length > 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {analysis.interactions.length > 0 ? `${analysis.interactions.length} Interaction(s)` : 'No Known Severe Interactions'}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {analysis.interactions.length === 0 ? (
                    <div className="p-6 text-center text-emerald-600 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <FaCheckCircle className="text-3xl mx-auto mb-2 text-emerald-500" />
                      <p className="text-xs font-black uppercase tracking-wide">No Severe Drug-Drug Interactions Found</p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Selected medications do not match major contraindication triggers in rulebase.</p>
                    </div>
                  ) : (
                    analysis.interactions.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                            {item.severity} Interaction
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 uppercase">
                            Drugs: {item.drugs.join(' + ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-amber-950 uppercase tracking-tight">{item.title}</h4>
                        <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
                        <div className="pt-2 border-t border-amber-200/60 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <FaInfoCircle className="text-amber-600 shrink-0" />
                          <span>Recommendation: {item.recommendation}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dosing & Administration Advice */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <FaNotesMedical className="text-teal-600" />
                  Clinical Pharmacist Notes & Administration Guidance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-black text-slate-800 uppercase text-[10px]">Timing & Food Precautions</p>
                    <p className="text-slate-600 text-[11px]">Advise patient on taking medications with meals or on an empty stomach based on GI tolerance.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <p className="font-black text-slate-800 uppercase text-[10px]">Hydration & Organ Monitoring</p>
                    <p className="text-slate-600 text-[11px]">Ensure adequate hydration for nephrotoxic compounds and follow up with routine renal/liver panels.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default ClinicalAssistant;
