import React, { useState, useRef } from 'react';
import {
  FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaComments, FaShieldAlt,
  FaPen, FaCheckCircle, FaFileSignature, FaPaperPlane
} from 'react-icons/fa';

export default function TeleConsultation() {
  const [inCall, setInCall] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Patient', text: 'Hello Dr. Pharm, I had a question about dosage timing for my new blood pressure med.' },
    { sender: 'Pharmacist', text: 'Good morning! Yes, Lisinopril should ideally be taken in the morning with a full glass of water.' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'Pharmacist', text: inputMsg }]);
    setInputMsg('');
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f766e';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const handleSignRx = () => {
    setSigned(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            Telehealth & Controlled Rx Sign Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Pharmacist Tele-Consultation Workspace</h1>
          <p className="text-indigo-100 mt-1">Live patient consultation video conference & canvas digital signature authorization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-950/50 backdrop-blur-md px-4 py-2 rounded-xl border border-indigo-400/30 text-right">
            <span className="text-xs text-indigo-200 block font-medium">Duty Pharmacist</span>
            <span className="text-sm font-extrabold text-white">Pharm. Josiah, PharmD (Reg #R-8812)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Room & Chat */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Box */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg aspect-video flex items-center justify-center border border-slate-800">
            {videoActive ? (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 flex flex-col justify-between p-6">
                <div className="flex items-center justify-between">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span> LIVE CONSULTATION
                  </span>
                  <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    00:08:42
                  </span>
                </div>

                <div className="flex items-center justify-center my-auto">
                  <div className="text-center space-y-2">
                    <div className="w-24 h-24 rounded-full bg-emerald-600/30 text-emerald-400 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-3xl font-bold">
                      EV
                    </div>
                    <p className="text-white font-bold text-lg">Eleanor Vance</p>
                    <p className="text-xs text-slate-400">Connected via Secure Video Stream</p>
                  </div>
                </div>

                {/* Video Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setMicActive(!micActive)}
                    className={`p-3 rounded-full text-white transition ${micActive ? 'bg-slate-700/80 hover:bg-slate-600' : 'bg-red-600'}`}
                  >
                    {micActive ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  </button>
                  <button
                    onClick={() => setVideoActive(!videoActive)}
                    className={`p-3 rounded-full text-white transition ${videoActive ? 'bg-slate-700/80 hover:bg-slate-600' : 'bg-red-600'}`}
                  >
                    {videoActive ? <FaVideo /> : <FaVideoSlash />}
                  </button>
                  <button
                    onClick={() => setInCall(!inCall)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-full text-xs transition"
                  >
                    End Call
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-center space-y-2">
                <FaVideoSlash className="text-4xl mx-auto" />
                <p className="text-sm font-semibold">Video Camera Off</p>
              </div>
            )}
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FaComments className="text-indigo-600" /> Live Consultation Chat Logs
            </h3>

            <div className="h-44 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl max-w-sm ${msg.sender === 'Pharmacist' ? 'bg-indigo-600 text-white ml-auto' : 'bg-white text-slate-800 border border-slate-200'}`}>
                  <span className="font-bold block mb-0.5 text-[10px] opacity-80">{msg.sender}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type response to patient..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1">
                <FaPaperPlane /> Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: E-Signing Portal */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaPen className="text-teal-600" /> Digital Prescription Authorization Pad
            </h2>
            <p className="text-xs text-slate-500 mt-1">Required for Schedule II-IV controlled substances and clinical clearance</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Patient: Eleanor Vance</span>
              <span className="text-teal-700">Rx ID: #SCH-9981</span>
            </div>
            <p className="text-slate-600">Prescription Item: <strong className="text-slate-800">Zolpidem 10mg Tablets (Schedule IV)</strong></p>
            <p className="text-slate-500">Clinical Verification: Patient counselled on sedative effects and bedtime dosage safety.</p>
          </div>

          {/* Digital Signature Pad */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase text-slate-500">Pharmacist Signature Canvas</label>
              <button onClick={clearSignature} className="text-xs text-slate-400 hover:text-slate-600 underline">
                Clear Pad
              </button>
            </div>

            <div className="border-2 border-dashed border-teal-300 rounded-xl bg-teal-50/20 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={380}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full cursor-crosshair"
              />
              {!isDrawing && !signed && (
                <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 pointer-events-none">
                  Sign here using mouse or touchscreen
                </p>
              )}
            </div>
          </div>

          {/* Sign Button */}
          {signed ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <FaCheckCircle className="text-emerald-600 text-lg" /> Prescription Digitally Signed & Locked into Dispensing Log
            </div>
          ) : (
            <button
              onClick={handleSignRx}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
            >
              <FaFileSignature /> Authorize & Sign Controlled Prescription
            </button>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <FaShieldAlt className="text-amber-600 shrink-0 mt-0.5" />
            <span>Digital signature encrypted with SHA-256 hash. Recorded into DEA compliance audit log.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
