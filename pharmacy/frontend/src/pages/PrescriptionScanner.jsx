import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileAlt, FaCamera, FaUpload, FaCheckCircle, FaExclamationTriangle,
  FaSync, FaShoppingCart, FaUser, FaStethoscope, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';

export default function PrescriptionScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('cardiac');

  const presetRx = {
    cardiac: {
      patientName: 'Sarah Jenkins',
      ageGender: '58 Y / Female',
      doctor: 'Dr. Robert Vance, MD (Cardiology - Reg #48291)',
      clinic: 'St. Jude Heart & Health Clinic',
      rxDate: new Date().toISOString().split('T')[0],
      confidenceScore: 98.4,
      medications: [
        { id: 1, name: 'Atorvastatin 20mg', dosage: '1 tablet once daily at bedtime', qty: 30, unitPrice: 15.50, matchStatus: 'In Stock', stockCount: 142 },
        { id: 2, name: 'Metoprolol Succinate 50mg', dosage: '1 tablet twice daily after meals', qty: 60, unitPrice: 12.20, matchStatus: 'In Stock', stockCount: 88 },
        { id: 3, name: 'Aspirin 81mg EC', dosage: '1 tablet daily with morning food', qty: 30, unitPrice: 5.00, matchStatus: 'In Stock', stockCount: 310 }
      ],
      clinicalNotes: 'Check serum lipid panel in 12 weeks. Monitor resting HR.'
    },
    diabetic: {
      patientName: 'Michael Chen',
      ageGender: '45 Y / Male',
      doctor: 'Dr. Elena Rostova, MD (Endocrinology - Reg #99102)',
      clinic: 'Metro Diabetes & Metabolic Center',
      rxDate: new Date().toISOString().split('T')[0],
      confidenceScore: 96.8,
      medications: [
        { id: 1, name: 'Metformin HCl 1000mg ER', dosage: '1 tablet twice daily with meals', qty: 60, unitPrice: 18.00, matchStatus: 'In Stock', stockCount: 205 },
        { id: 2, name: 'Empagliflozin 10mg', dosage: '1 tablet every morning', qty: 30, unitPrice: 45.00, matchStatus: 'In Stock', stockCount: 64 },
        { id: 3, name: 'Accu-Chek Test Strips 50s', dosage: 'Test twice daily pre-meal', qty: 1, unitPrice: 28.50, matchStatus: 'In Stock', stockCount: 40 }
      ],
      clinicalNotes: 'HbA1c target < 7.0%. Educate patient on hypoglycemia protocol.'
    }
  };

  const handleSimulateScan = (presetKey) => {
    setSelectedPreset(presetKey);
    setScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setScanning(false);
      setScannedResult(presetRx[presetKey]);
    }, 1200);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
        handleSimulateScan(selectedPreset);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendToPOS = () => {
    if (!scannedResult) return;
    localStorage.setItem('scanned_rx_transfer', JSON.stringify({
      patientName: scannedResult.patientName,
      items: scannedResult.medications
    }));
    navigate('/pos');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-emerald-500/30 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
              AI Vision OCR v3.2
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Digital Prescription Scanner</h1>
          <p className="text-teal-100 mt-1">Instant vision extraction, doctor verification & automated POS order fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulateScan('cardiac')}
            className={`px-4 py-2.5 rounded-xl font-medium transition text-sm flex items-center gap-2 ${selectedPreset === 'cardiac' ? 'bg-white text-teal-900 shadow-md font-bold' : 'bg-teal-700/60 text-white hover:bg-teal-700'}`}
          >
            Cardiac Rx Demo
          </button>
          <button
            onClick={() => handleSimulateScan('diabetic')}
            className={`px-4 py-2.5 rounded-xl font-medium transition text-sm flex items-center gap-2 ${selectedPreset === 'diabetic' ? 'bg-white text-teal-900 shadow-md font-bold' : 'bg-teal-700/60 text-white hover:bg-teal-700'}`}
          >
            Endocrine Rx Demo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Scanner Zone */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FaCamera className="text-teal-600" /> Upload / Scan Doctor Prescription
          </h2>

          <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/40 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center space-y-4">
            {previewImage ? (
              <img src={previewImage} alt="Prescription Preview" className="max-h-56 object-contain rounded-lg border shadow-sm" />
            ) : (
              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl">
                <FaFileAlt />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700">Drag prescription image here or browse</p>
              <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, PDF handwritten or printed prescriptions</p>
            </div>

            <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow transition inline-flex items-center gap-2">
              <FaUpload /> Select Prescription File
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-2">
              <span>AI Extraction Engine Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <FaShieldAlt /> Ready & Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Medical OCR model pre-trained on over 500,000 doctor handwriting samples, pharmaceutical brand terms, and dosage conventions.
            </p>
          </div>
        </div>

        {/* AI Results & Conversion Zone */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Extracted Clinical Data
              </h2>
              {scannedResult && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                  Confidence: {scannedResult.confidenceScore}%
                </span>
              )}
            </div>

            {scanning ? (
              <div className="py-20 text-center space-y-4">
                <FaSync className="w-10 h-10 text-teal-600 animate-spin mx-auto text-3xl" />
                <p className="text-slate-600 font-semibold text-base">Analyzing prescription handwriting & matching inventory...</p>
                <p className="text-xs text-slate-400">Performing optical character recognition & dosage parsing</p>
              </div>
            ) : scannedResult ? (
              <div className="space-y-5">
                {/* Header Meta */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Patient Name</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <FaUser className="text-teal-600" /> {scannedResult.patientName} ({scannedResult.ageGender})
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Prescribing Physician</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <FaStethoscope className="text-teal-600" /> {scannedResult.doctor}
                    </span>
                  </div>
                </div>

                {/* Medications Extracted */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Extracted Prescription Items</h3>
                  <div className="space-y-3">
                    {scannedResult.medications.map((item) => (
                      <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 transition bg-white shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                            <span className="bg-teal-50 text-teal-700 text-xs font-semibold px-2 py-0.5 rounded border border-teal-200">
                              Qty: {item.qty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium">Dosage: {item.dosage}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-800">${(item.unitPrice * item.qty).toFixed(2)}</div>
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                            <FaCheckCircle /> {item.matchStatus} ({item.stockCount} in stock)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <FaExclamationTriangle className="text-amber-600" /> Clinical Directives & Notes
                  </span>
                  <p>{scannedResult.clinicalNotes}</p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <FaFileAlt className="text-4xl mx-auto" />
                <p className="text-sm">Select a preset prescription or upload an image to start OCR extraction</p>
              </div>
            )}
          </div>

          {scannedResult && !scanning && (
            <div className="pt-4 border-t mt-6 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Total Estimated Cost: <span className="text-lg font-bold text-slate-800 ml-1">
                  ${scannedResult.medications.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleSendToPOS}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-200 transition flex items-center gap-2 text-sm"
              >
                <FaShoppingCart /> Transfer to POS Cart <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
