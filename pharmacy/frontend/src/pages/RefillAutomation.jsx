import React, { useState } from 'react';
import {
  FaBell, FaWhatsapp, FaPhoneAlt, FaPaperPlane, FaCheckCircle, FaClock,
  FaCalendarAlt, FaUser, FaCapsules, FaSync
} from 'react-icons/fa';

export default function RefillAutomation() {
  const [activeTab, setActiveTab] = useState('due_now');
  const [sendingChannel, setSendingChannel] = useState({});

  const refillQueue = [
    {
      id: 'RF-1092',
      patientName: 'Eleanor Vance',
      phone: '+1 (555) 382-9011',
      medication: 'Metformin HCl 500mg ER',
      condition: 'Type 2 Diabetes',
      lastRefillDate: '2025-02-28',
      dueDate: '2025-03-28',
      daysOverdue: 2,
      complianceScore: 94,
      preferredChannel: 'WhatsApp',
      status: 'due_now',
      refillCount: '3 / 6 Refills Used'
    },
    {
      id: 'RF-1093',
      patientName: 'Marcus Holloway',
      phone: '+1 (555) 771-4402',
      medication: 'Lisinopril 20mg Tablets',
      condition: 'Hypertension',
      lastRefillDate: '2025-03-01',
      dueDate: '2025-03-31',
      daysOverdue: 0,
      complianceScore: 98,
      preferredChannel: 'SMS',
      status: 'due_now',
      refillCount: '5 / 12 Refills Used'
    },
    {
      id: 'RF-1094',
      patientName: 'David Miller',
      phone: '+1 (555) 892-1100',
      medication: 'Atorvastatin 40mg',
      condition: 'Hyperlipidemia',
      lastRefillDate: '2025-03-05',
      dueDate: '2025-04-04',
      daysOverdue: -5,
      complianceScore: 89,
      preferredChannel: 'Email',
      status: 'upcoming',
      refillCount: '2 / 6 Refills Used'
    }
  ];

  const filteredQueue = refillQueue.filter(item => {
    if (activeTab === 'due_now') return item.status === 'due_now';
    if (activeTab === 'upcoming') return item.status === 'upcoming';
    return true;
  });

  const handleSendReminder = (id, channel) => {
    setSendingChannel(prev => ({ ...prev, [id]: channel }));
    setTimeout(() => {
      setSendingChannel(prev => ({ ...prev, [id]: `${channel}_sent` }));
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="bg-cyan-500/30 text-cyan-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            Chronic Care Compliance Engine
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Patient Refill & Engagement Automation</h1>
          <p className="text-teal-100 mt-1">Multi-channel WhatsApp, SMS & Telehealth reminders for recurring prescriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-emerald-500/30 text-right">
            <span className="text-xs text-emerald-200 block font-medium">Refill Adherence Rate</span>
            <span className="text-2xl font-black text-emerald-100">96.2%</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Refills Due This Week</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">28 Patients</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">85% Automated Dispatch</p>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl">
            <FaClock />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp Reminders Delivered</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">142 Messages</h3>
            <p className="text-xs text-teal-600 font-semibold mt-0.5">99.1% Delivery Rate</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
            <FaWhatsapp />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Telehealth Consultation Booked</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">9 Appointments</h3>
            <p className="text-xs text-cyan-600 font-semibold mt-0.5">Pharmacist Review Required</p>
          </div>
          <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center text-xl">
            <FaPhoneAlt />
          </div>
        </div>
      </div>

      {/* Queue & Dispatch Workspace */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('due_now')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'due_now'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Refills Due Now (2)
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'upcoming'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Upcoming 7 Days (1)
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <FaBell className="text-emerald-600" /> Automated Cron Job runs daily at 08:00 AM
          </span>
        </div>

        <div className="space-y-4">
          {filteredQueue.map((patient) => {
            const currentStatus = sendingChannel[patient.id];
            return (
              <div key={patient.id} className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                      <FaUser className="text-emerald-600" /> {patient.patientName}
                    </h3>
                    <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {patient.phone}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                      Adherence: {patient.complianceScore}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-2 font-medium">
                      <FaCapsules className="text-teal-600" /> Medication: <strong className="text-slate-800">{patient.medication}</strong> ({patient.condition})
                    </p>
                    <p className="flex items-center gap-2 text-slate-500">
                      <FaCalendarAlt className="text-slate-400" /> Due Date: <strong className="text-slate-700">{patient.dueDate}</strong> • Status: {patient.refillCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 justify-end">
                  {currentStatus?.endsWith('_sent') ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200">
                      <FaCheckCircle className="text-emerald-600" /> Reminder Dispatched
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSendReminder(patient.id, 'whatsapp')}
                        disabled={currentStatus === 'whatsapp'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        {currentStatus === 'whatsapp' ? <FaSync className="animate-spin" /> : <FaWhatsapp />}
                        Send WhatsApp
                      </button>
                      <button
                        onClick={() => handleSendReminder(patient.id, 'sms')}
                        disabled={currentStatus === 'sms'}
                        className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        {currentStatus === 'sms' ? <FaSync className="animate-spin" /> : <FaPaperPlane />}
                        SMS / Email
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
