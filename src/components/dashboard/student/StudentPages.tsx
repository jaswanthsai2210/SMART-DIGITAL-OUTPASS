import React, { useState } from 'react';
import { 
  Send, 
  FileText, 
  Clock, 
  QrCode, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2, 
  XCircle, 
  User, 
  HelpCircle, 
  Download, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Building,
  Upload,
  Sparkles,
  Phone,
  Bus,
  Check,
  X,
  KeyRound,
  Lock,
  Smartphone,
  Copy
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OutpassRequest, PassType, PriorityLevel } from '../../../types';
import { 
  DateSelector, 
  TimeSelector, 
  formatDateDisplay, 
  getTodayDateString, 
  getOffsetDateString,
  validateSchedule
} from '../../common/DateTimeSelect';
import { OutpassQRCode } from '../../common/OutpassQRCode';
import { EmergencySosModal } from '../../common/EmergencySosModal';
import { AlertOctagon, Radio } from 'lucide-react';

export const StudentPages: React.FC = () => {
  const { 
    currentUser, 
    activeStudentTab, 
    setActiveStudentTab, 
    outpasses, 
    addOutpass, 
    cancelOutpass,
    delayReports,
    submitDelayReport,
    verifyStudentParentOtp,
    activeParentNotificationModal,
    setActiveParentNotificationModal,
    addToast
  } = useApp();

  // Emergency SOS Modal state
  const [emergencySosOpen, setEmergencySosOpen] = useState(false);

  // Apply form state - Only necessary fields
  const [passType, setPassType] = useState<PassType>('Day Pass');
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [departureDate, setDepartureDate] = useState(() => getTodayDateString());
  const [departureTime, setDepartureTime] = useState('04:30 PM');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => getTodayDateString());
  const [expectedReturnTime, setExpectedReturnTime] = useState('08:00 PM');
  const [formValidationMsg, setFormValidationMsg] = useState<string | null>(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  // Selected Pass for QR Modal inspection
  const [selectedPass, setSelectedPass] = useState<OutpassRequest | null>(null);

  // OTP Verification Modal state (for My Outpasses tab)
  const [otpModalPass, setOtpModalPass] = useState<OutpassRequest | null>(null);
  const [modalOtpValue, setModalOtpValue] = useState('');

  // Dashboard inline OTP input state
  const [dashboardOtp, setDashboardOtp] = useState('');

  // Live queue inline OTP input state
  const [queueOtp, setQueueOtp] = useState('');

  // Transport Delay Form
  const [delayOutpassId, setDelayOutpassId] = useState('');
  const [carrierNumber, setCarrierNumber] = useState('');
  const [schedTime, setSchedTime] = useState('06:00 PM');
  const [missedTime, setMissedTime] = useState('07:30 PM');
  const [delayReason, setDelayReason] = useState('');
  const [delayRemarks, setDelayRemarks] = useState('');

  // Filter student's own outpasses
  const myOutpasses = outpasses.filter(
    o => o.studentId === currentUser?.studentId || o.studentName === currentUser?.name
  );

  const activePass = myOutpasses.find(o => o.status === 'Out of Campus' || o.status === 'Late Return');
  const pendingPass = myOutpasses.find(o => o.status.startsWith('Pending'));
  const latestApprovedPass = myOutpasses.find(o => o.status === 'Approved');

  // Identify any outpass awaiting Student OTP entry
  const passAwaitingOtp = myOutpasses.find(
    o => o.parentStatus === 'Approved' && !o.parentOtpVerified && o.wardenStatus === 'Pending'
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationMsg(null);

    // Validate destination and reason
    if (!destination.trim()) {
      setFormValidationMsg('Please enter your destination address or landmark.');
      addToast('Missing Destination', 'Please enter your destination address or landmark.', 'warning');
      return;
    }
    if (!purpose.trim()) {
      setFormValidationMsg('Please enter the reason for leaving campus.');
      addToast('Missing Reason', 'Please enter the reason for leaving campus.', 'warning');
      return;
    }

    const finalReturnDate = passType === 'Day Pass' ? departureDate : expectedReturnDate;
    const scheduleCheck = validateSchedule(
      passType,
      departureDate,
      departureTime,
      finalReturnDate,
      expectedReturnTime
    );

    if (!scheduleCheck.isValid) {
      setFormValidationMsg(scheduleCheck.message || 'The return time must follow the departure time according to selected dates.');
      addToast('Invalid Timing', scheduleCheck.message || 'The return time must follow the departure time according to selected dates.', 'warning');
      return;
    }

    setConfirmSubmitModal(true);
  };

  const handleConfirmApplication = () => {
    const finalReturnDate = passType === 'Day Pass' ? departureDate : expectedReturnDate;
    addOutpass({
      studentId: currentUser?.studentId || 'STU2026',
      studentName: currentUser?.name || 'Student',
      roomNo: currentUser?.roomNo || 'Room',
      hostel: currentUser?.assignedHostel || 'Hostel Block',
      passType,
      destination: destination.trim(),
      purpose: purpose.trim(),
      departureDate,
      departureTime,
      expectedReturnDate: finalReturnDate,
      expectedReturnTime,
      transportType: 'Standard Transit',
      emergencyContact: currentUser?.phone || 'On File',
      notes: '',
      parentName: 'Registered Guardian',
      parentPhone: 'On File',
      priority: 'Normal'
    });

    setConfirmSubmitModal(false);
    setActiveStudentTab('live-queue');
    // Reset form
    setDestination('');
    setPurpose('');
    setFormValidationMsg(null);
    addToast('Outpass Submitted', `Your ${passType} request to ${destination.trim()} has been submitted.`, 'success');
  };

  const handleVerifyOtp = (passId: string, otpCode: string) => {
    if (!otpCode || otpCode.trim().length !== 6) {
      addToast('Invalid OTP Format', 'Please enter a valid 6-digit numeric OTP.', 'warning');
      return;
    }
    const success = verifyStudentParentOtp(passId, otpCode.trim());
    if (success) {
      setDashboardOtp('');
      setQueueOtp('');
      setModalOtpValue('');
      setOtpModalPass(null);
    }
  };

  const handleDelaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDelayReport({
      outpassId: delayOutpassId || activePass?.id || 'OP-CURRENT',
      studentId: currentUser?.studentId || 'STU2026',
      studentName: currentUser?.name || 'Student',
      transportType: 'Bus / Train',
      carrierNumber: carrierNumber || 'Transit Carrier',
      scheduledDepartureTime: schedTime,
      actualMissedTime: missedTime,
      reason: delayReason || 'Transit delay',
      remarks: delayRemarks || 'Reported via student portal'
    });
    setDelayOutpassId('');
    setDelayReason('');
  };

  // --- TAB CONTENT RENDERER ---
  const renderTabContent = () => {
    // --- TAB 1: DASHBOARD ---
    if (activeStudentTab === 'dashboard') {
      return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Student Resident Dashboard</h2>
            <p className="text-xs text-slate-500">Welcome, {currentUser?.name}. Current Room: {currentUser?.roomNo} ({currentUser?.assignedHostel}).</p>
          </div>

          {/* EMERGENCY SOS BUTTON - HIGH VISIBILITY FOR PERSONAL SAFETY */}
          <button
            type="button"
            onClick={() => setEmergencySosOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 animate-pulse"
          >
            <AlertOctagon className="w-4 h-4 text-white" />
            <span>EMERGENCY SOS</span>
          </button>
        </div>

        {/* HIGH-PRIORITY ACTION: Parent Approved, Awaiting Student OTP Entry */}
        {passAwaitingOtp && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 font-bold text-sm sm:text-base">
                      Security Verification Required: Enter Parent Approval OTP
                    </h3>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                      Action Required
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Pass <strong className="font-mono">{passAwaitingOtp.id}</strong> ({passAwaitingOtp.passType} to {passAwaitingOtp.destination})
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-amber-200">
                Parent SMS: {passAwaitingOtp.parentName} ({passAwaitingOtp.parentPhone})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  Your parent has approved this outpass request! For campus security, a <strong>6-digit verification code</strong> was sent directly to your parent's phone.
                </p>
                <div className="flex items-center gap-2 text-amber-900 font-medium">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ask your parent for the code and enter it below to queue this application for Warden review.</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Enter 6-Digit Parent OTP
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={dashboardOtp}
                      onChange={(e) => setDashboardOtp(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-base tracking-widest text-center text-slate-900 focus:bg-white focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleVerifyOtp(passAwaitingOtp.id, dashboardOtp)}
                      disabled={dashboardOtp.length < 6}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition-colors shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Presentation Demo Autofill Helper */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Presentation Demo:</span>
                  <button
                    type="button"
                    onClick={() => setDashboardOtp(passAwaitingOtp.parentOtp || '482910')}
                    className="text-amber-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Autofill ({passAwaitingOtp.parentOtp || '482910'})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Hostel Presence</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${activePass ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-base font-bold text-slate-900">
                {activePass ? 'Currently Outside Campus' : 'Inside Hostel Premises'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              Hostel Roll Call: Synchronized
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Active Leave Status</span>
            <div className="text-base font-bold text-slate-900">
              {activePass ? activePass.passType : pendingPass ? 'Application in Review' : 'No Active Leave'}
            </div>
            <span className="text-[11px] text-teal-700 font-medium block">
              {activePass ? `Curfew: ${activePass.expectedReturnTime}` : pendingPass ? (passAwaitingOtp ? 'Awaiting Your Parent OTP' : 'Awaiting Warden Signoff') : 'Eligible for Day Pass'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Queue Position</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block tabular-nums">
              {pendingPass ? `#${pendingPass.queuePosition || 1}` : '—'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {pendingPass ? `Est wait: ${pendingPass.estimatedWaitMinutes || 8} min` : 'No pending queue wait'}
            </span>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs text-teal-400 font-mono font-bold uppercase block">Quick Action</span>
              <span className="text-sm font-bold mt-1 block">Need to leave campus?</span>
            </div>
            <button
              onClick={() => setActiveStudentTab('apply-outpass')}
              className="w-full mt-3 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply for Outpass</span>
            </button>
          </div>

        </div>

        {/* Active Outpass Card or Locked QR Notice */}
        {latestApprovedPass && latestApprovedPass.qrCodeToken ? (
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-6 border-2 border-teal-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">
                READY FOR GATE SCAN · {latestApprovedPass.id}
              </span>
              <h3 className="text-xl font-bold font-display">{latestApprovedPass.passType}: {latestApprovedPass.destination}</h3>
              <p className="text-xs text-slate-300">
                Return Curfew: <strong className="text-teal-300">{latestApprovedPass.expectedReturnDate} at {latestApprovedPass.expectedReturnTime}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Parent Approved</span>
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Security OTP Verified</span>
                <span className="flex items-center gap-1 text-teal-400"><CheckCircle2 className="w-3.5 h-3.5" /> Warden Signed</span>
              </div>
            </div>

            <div 
              onClick={() => setSelectedPass(latestApprovedPass)}
              className="cursor-pointer transition-transform hover:scale-105 shrink-0"
              title="Click to view & scan full QR pass"
            >
              <OutpassQRCode outpass={latestApprovedPass} size={105} compact={true} />
            </div>
          </div>
        ) : passAwaitingOtp ? (
          <div className="bg-slate-900 text-white rounded-2xl p-6 border-2 border-amber-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  QR GENERATION LOCKED · {passAwaitingOtp.id}
                </span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                  STEP 2 OF 3
                </span>
              </div>
              <h3 className="text-xl font-bold font-display">{passAwaitingOtp.passType}: {passAwaitingOtp.destination}</h3>
              <p className="text-xs text-slate-300">
                Institutional Policy: <strong className="text-amber-300">Dynamic QR Code will generate only after you enter the OTP code sent to your parent's phone.</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Parent Approved</span>
                <span className="flex items-center gap-1 text-amber-400 font-bold"><Lock className="w-3.5 h-3.5" /> Awaiting Your OTP Entry</span>
                <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" /> Warden Signoff (Next)</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-800/90 border-2 border-dashed border-amber-400/40 p-4 rounded-2xl text-center shrink-0 w-36 h-36">
              <Lock className="w-10 h-10 text-amber-400 mb-1" />
              <span className="text-[10px] font-mono font-bold text-amber-300">QR CODE LOCKED</span>
              <span className="text-[8px] text-slate-400 mt-0.5">Input OTP Above</span>
            </div>
          </div>
        ) : null}

        {/* Recent Applications table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">My Leave Applications</h3>
            <button
              onClick={() => setActiveStudentTab('my-outpasses')}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Curfew Return</th>
                  <th className="py-3 px-4">Parent Status</th>
                  <th className="py-3 px-4">Parent OTP</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myOutpasses.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="py-3 px-4 font-medium">{o.passType}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{o.destination}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{o.expectedReturnTime}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        o.parentStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        o.parentStatus === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.parentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {o.parentStatus === 'Approved' ? (
                        o.parentOtpVerified ? (
                          <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setOtpModalPass(o);
                              setModalOtpValue('');
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Enter OTP</span>
                          </button>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPass(o)}
                        className="text-teal-700 font-semibold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // --- TAB 2: APPLY FOR OUTPASS ---
  if (activeStudentTab === 'apply-outpass') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Apply for Digital Outpass</h2>
          <p className="text-xs text-slate-500">Fill in your outpass details. Guardian notification and warden signoff will be triggered automatically.</p>
        </div>

        <form onSubmit={handleApplySubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          
          {/* Validation Error Message Alert */}
          {formValidationMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block">Validation Error:</span>
                <span>{formValidationMsg}</span>
              </div>
            </div>
          )}

          {/* 1. Pass Type Selector: Day Pass or Home Pass */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-bold text-xs">
                Pass Type <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200/60">
                {passType === 'Day Pass' ? 'Same-Day Outing (Curfew 08:30 PM)' : 'Multi-Day Leave / Vacation'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPassType('Day Pass');
                  setExpectedReturnDate(departureDate);
                  setFormValidationMsg(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  passType === 'Day Pass'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs block">Day Pass</span>
                  {passType === 'Day Pass' && (
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                  )}
                </div>
                <span className={`text-[11px] block mt-1 ${passType === 'Day Pass' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Same-day local visit with return on the same date.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPassType('Home Pass');
                  if (expectedReturnDate === departureDate) {
                    setExpectedReturnDate(getOffsetDateString(2));
                  }
                  setFormValidationMsg(null);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  passType === 'Home Pass'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs block">Home Pass</span>
                  {passType === 'Home Pass' && (
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                  )}
                </div>
                <span className={`text-[11px] block mt-1 ${passType === 'Home Pass' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Multi-day home visit or extended leave.
                </span>
              </button>
            </div>
          </div>

          {/* 2 & 3. Departure Date & Departure Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <DateSelector
              label="Departure Date *"
              value={departureDate}
              minDate={getTodayDateString()}
              onChange={(newDate) => {
                setDepartureDate(newDate);
                if (passType === 'Day Pass') {
                  setExpectedReturnDate(newDate);
                } else if (newDate > expectedReturnDate) {
                  setExpectedReturnDate(newDate);
                }
                setFormValidationMsg(null);
              }}
              helperText="Select outing date from calendar (past dates disabled)."
            />

            <TimeSelector
              label="Departure Time *"
              value={departureTime}
              onChange={(newTime) => {
                setDepartureTime(newTime);
                setFormValidationMsg(null);
              }}
              helperText="Click clock dial to select hour, minutes & AM/PM."
            />
          </div>

          {/* 4 & 5. Expected Return Date & Expected Return Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {passType === 'Home Pass' ? (
              <DateSelector
                label="Expected Return Date *"
                value={expectedReturnDate}
                minDate={departureDate || getTodayDateString()}
                onChange={(newDate) => {
                  setExpectedReturnDate(newDate);
                  setFormValidationMsg(null);
                }}
                helperText="Select return date from calendar."
              />
            ) : (
              <div className="space-y-1.5">
                <label className="block text-slate-800 font-bold text-xs">
                  Expected Return Date
                </label>
                <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-slate-600">
                  <span className="text-xs font-semibold">
                    {formatDateDisplay(departureDate)} (Same Day)
                  </span>
                  <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200/60 font-bold">
                    Day Pass Locked
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Day pass return date is fixed to departure date.</p>
              </div>
            )}

            <TimeSelector
              label="Expected Return Time *"
              value={expectedReturnTime}
              isCurfew={true}
              onChange={(newTime) => {
                setExpectedReturnTime(newTime);
                setFormValidationMsg(null);
              }}
              helperText="Campus curfew is 08:30 PM. Must follow departure time."
            />
          </div>

          {/* 6. Destination */}
          <div className="space-y-1 pt-1">
            <label className="block text-slate-800 font-bold text-xs">
              Destination Address / Landmark <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. City Central Library, Mall, or Family Residence"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setFormValidationMsg(null);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 focus:outline-none text-xs transition-colors"
            />
          </div>

          {/* 7. Reason for Leaving */}
          <div className="space-y-1 pt-1">
            <label className="block text-slate-800 font-bold text-xs">
              Reason for Leaving <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="State the purpose or reason for leaving hostel campus"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setFormValidationMsg(null);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 focus:outline-none text-xs transition-colors resize-none"
            />
          </div>

          {/* 8. Submit Request Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-slate-500 text-[11px]">
              Review all details carefully before submitting your pass request.
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>Submit Request</span>
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        {confirmSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-sm pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Confirm Outpass Application</span>
              </div>

              {/* Selected Outing Details Summary */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{passType}</span>
                  <span className="font-mono text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                    {passType === 'Day Pass' ? 'Local Outing' : 'Vacation Leave'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DEPARTURE:</span>
                    <strong className="text-slate-800 block">{formatDateDisplay(departureDate)}</strong>
                    <span className="font-mono text-teal-700 font-bold">{departureTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">EXPECTED RETURN:</span>
                    <strong className="text-slate-800 block">
                      {formatDateDisplay(passType === 'Day Pass' ? departureDate : expectedReturnDate)}
                    </strong>
                    <span className="font-mono text-teal-700 font-bold">{expectedReturnTime}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">DESTINATION:</span>
                  <strong className="text-slate-800 block truncate">{destination}</strong>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">REASON:</span>
                  <p className="text-slate-700 text-xs line-clamp-2">{purpose}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApplication}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3 text-teal-400" />
                  <span>Confirm &amp; Submit</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- TAB 3: MY OUTPASSES ---
  if (activeStudentTab === 'my-outpasses') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">My Outpasses History</h2>
          <p className="text-xs text-slate-500">Historical records of Day and Home passes issued during this semester.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myOutpasses.map((o) => (
            <div key={o.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-mono text-xs font-bold text-teal-700">{o.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                  {o.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{o.destination}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{o.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-500 font-mono">
                <div><span>Depart: {o.departureTime}</span></div>
                <div><span>Return: {o.expectedReturnTime}</span></div>
              </div>

              {/* Security OTP Verification Highlight */}
              {o.parentStatus === 'Approved' && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-700">Guardian Verification:</span>
                  </div>
                  {o.parentOtpVerified ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OTP Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setOtpModalPass(o);
                        setModalOtpValue('');
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <span>Enter Parent OTP</span>
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPass(o)}
                  className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Inspect Digital Pass</span>
                </button>
                {o.status.startsWith('Pending') && (
                  <button
                    onClick={() => cancelOutpass(o.id)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Cancel Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* OTP Entry Modal */}
        {otpModalPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Enter Parent Security OTP</h3>
                    <span className="font-mono text-[10px] text-slate-500">{otpModalPass.id}</span>
                  </div>
                </div>
                <button onClick={() => setOtpModalPass(null)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Your parent ({otpModalPass.parentName}) approved this pass. Enter the 6-digit OTP dispatched to their registered phone ({otpModalPass.parentPhone}):
              </p>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 482910"
                  value={modalOtpValue}
                  onChange={(e) => setModalOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-lg tracking-widest text-center text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Presentation Demo:</span>
                <button
                  type="button"
                  onClick={() => setModalOtpValue(otpModalPass.parentOtp || '482910')}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Autofill ({otpModalPass.parentOtp || '482910'})
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setOtpModalPass(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyOtp(otpModalPass.id, modalOtpValue)}
                  disabled={modalOtpValue.length < 6}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Verify &amp; Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Inspector */}
        {selectedPass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-xs text-teal-700">{selectedPass.id}</span>
                <button onClick={() => setSelectedPass(null)}><X className="w-4 h-4 text-slate-400" /></button>
              </div>

              <div className="text-center space-y-3">
                {selectedPass.qrCodeToken ? (
                  <div className="py-1">
                    <OutpassQRCode 
                      outpass={selectedPass} 
                      size={170} 
                      showActions={true} 
                      showDetails={false} 
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-300 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-900 block">DYNAMIC QR CODE LOCKED</span>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {!selectedPass.parentOtpVerified && selectedPass.parentStatus === 'Approved'
                          ? 'Parental Security OTP input required before QR generation.'
                          : selectedPass.parentOtpVerified
                          ? 'Parent OTP verified. Queued for Warden authorization.'
                          : 'Awaiting initial parent approval.'}
                      </p>
                    </div>

                    {/* Inline OTP entry inside Inspector if awaiting OTP */}
                    {!selectedPass.parentOtpVerified && selectedPass.parentStatus === 'Approved' && (
                      <div className="pt-2 border-t border-amber-200/60 space-y-2 text-left">
                        <span className="text-[10px] font-bold text-slate-700 block uppercase font-mono">
                          Enter OTP sent to {selectedPass.parentPhone}:
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="6-digit OTP"
                            value={modalOtpValue}
                            onChange={(e) => setModalOtpValue(e.target.value.replace(/\D/g, ''))}
                            className="flex-1 p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm text-center tracking-widest"
                          />
                          <button
                            onClick={() => {
                              handleVerifyOtp(selectedPass.id, modalOtpValue);
                              setSelectedPass(prev => prev ? { ...prev, parentOtpVerified: true } : null);
                            }}
                            disabled={modalOtpValue.length < 6}
                            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] shadow-xs"
                          >
                            Verify
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setModalOtpValue(selectedPass.parentOtp || '482910')}
                          className="text-[10px] text-amber-700 font-bold hover:underline"
                        >
                          Autofill Demo Code ({selectedPass.parentOtp || '482910'})
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h4 className="font-bold text-slate-900">{selectedPass.destination}</h4>
                <p className="text-xs text-slate-600">Curfew: {selectedPass.expectedReturnTime} ({selectedPass.passType})</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedPass.parentStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedPass.parentStatus === 'Approved' ? 'Parent Approved' : 'Parent Pending'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedPass.parentOtpVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedPass.parentOtpVerified ? '✓ Parent OTP Verified' : 'OTP Pending'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedPass.wardenStatus === 'Approved' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedPass.wardenStatus === 'Approved' ? '✓ Warden Signed' : 'Warden Pending'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {selectedPass.qrCodeToken ? (
                  <button
                    onClick={() => addToast('Pass Downloaded', 'PDF Outpass slip downloaded to device.', 'success')}
                    className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Pass</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">QR Code Not Ready</span>
                )}
                <button
                  onClick={() => setSelectedPass(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- TAB 4: LIVE QUEUE STATUS ---
  if (activeStudentTab === 'live-queue') {
    const isParentApproved = pendingPass?.parentStatus === 'Approved' || latestApprovedPass;
    const isOtpVerified = pendingPass?.parentOtpVerified || latestApprovedPass;
    const isWardenApproved = latestApprovedPass !== undefined;

    const queueStep = latestApprovedPass ? 6 :
                      isOtpVerified ? 5 :
                      isParentApproved ? 4 :
                      pendingPass ? 2 : 1;

    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Live Queue &amp; Approval Stage</h2>
          <p className="text-xs text-slate-500">Real-time status tracking with automated multi-factor parental authorization.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-500">Current Queue Position</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">
                {pendingPass ? `#${pendingPass.queuePosition || 2}` : 'Queue Clear'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Estimated Waiting Time</span>
              <span className="text-lg font-bold font-mono text-teal-700 block">
                {pendingPass ? `${pendingPass.estimatedWaitMinutes || 6} min` : '0 min'}
              </span>
            </div>
          </div>

          {/* If waiting for student to enter parent OTP, show inline entry box */}
          {pendingPass && pendingPass.parentStatus === 'Approved' && !pendingPass.parentOtpVerified && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Next Immediate Step: Enter Parent OTP</span>
              </div>
              <p className="text-xs text-slate-600">
                Your parent approved request #{pendingPass.id}. Enter the 6-digit code sent to parent phone ({pendingPass.parentPhone}):
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={queueOtp}
                  onChange={(e) => setQueueOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-36 p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-sm tracking-widest text-center"
                />
                <button
                  onClick={() => handleVerifyOtp(pendingPass.id, queueOtp)}
                  disabled={queueOtp.length < 6}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs"
                >
                  Verify &amp; Advance
                </button>
                <button
                  type="button"
                  onClick={() => setQueueOtp(pendingPass.parentOtp || '482910')}
                  className="text-xs text-amber-700 font-bold hover:underline ml-2"
                >
                  Autofill ({pendingPass.parentOtp || '482910'})
                </button>
              </div>
            </div>
          )}

          {/* Progress Timeline with Dual-Factor Parent Security Step */}
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
              Approval Journey Sequence
            </h4>

            {[
              { stage: 1, label: 'Request Submitted to Cloud Engine', done: true },
              { stage: 2, label: 'Direct Parent 1-Click Verification Sent', done: queueStep >= 2 },
              { stage: 3, label: 'Parent Consent Confirmed & Security OTP Dispatched', done: queueStep >= 3 },
              { stage: 4, label: 'Student Enters & Validates Parent Security OTP', done: queueStep >= 5 || isOtpVerified },
              { stage: 5, label: 'Warden Queue Triage & Digital Authorization', done: queueStep >= 6 || isWardenApproved },
              { stage: 6, label: 'Dynamic QR Outpass Generated & Ready for Gate Scan', done: queueStep >= 6 },
            ].map((st) => (
              <div key={st.stage} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  st.done ? 'bg-teal-500 text-slate-950' : 'bg-slate-100 text-slate-400'
                }`}>
                  {st.done ? <Check className="w-3.5 h-3.5" /> : st.stage}
                </div>
                <span className={`font-semibold ${st.done ? 'text-slate-900' : 'text-slate-400'}`}>
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- TAB 5: TRANSPORT DELAY REPORT ---
  if (activeStudentTab === 'delay-report') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Report Transport Delay / Missed Transit</h2>
          <p className="text-xs text-slate-500">
            If your return bus or train is delayed, file an official report to alert your hostel warden and prevent late-return disciplinary flags.
          </p>
        </div>

        <form onSubmit={handleDelaySubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Carrier / Bus / Train Number</label>
            <input
              type="text"
              required
              value={carrierNumber}
              onChange={(e) => setCarrierNumber(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TimeSelector
              label="Scheduled Departure"
              value={schedTime}
              onChange={(newTime) => setSchedTime(newTime)}
            />
            <TimeSelector
              label="Actual Delayed Arrival Time"
              value={missedTime}
              onChange={(newTime) => setMissedTime(newTime)}
              isCurfew={true}
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason for Transit Delay</label>
            <textarea
              rows={2}
              required
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-xs"
          >
            Submit Official Transit Delay Filing
          </button>
        </form>

        {/* Previous Filings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Historical Delay Filings</h3>
          {delayReports.map((d) => (
            <div key={d.id} className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{d.carrierNumber}</span>
                <span className="font-mono text-teal-700 text-[10px]">{d.status}</span>
              </div>
              <p className="text-slate-600">{d.reason}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- TAB 6: HELP & CURFEW RULES ---
  if (activeStudentTab === 'help') {
    return (
      <div className="space-y-6 max-w-2xl text-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Curfew Guidelines &amp; Student Rules</h2>
          <p className="text-xs text-slate-500">Standard operating procedures for campus leaves and emergency protocols.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-slate-700">
          <p><strong>1. Parent OTP Security Rule:</strong> When your guardian approves your leave, a 6-digit security OTP is dispatched to their registered phone. You must obtain this code from your parent and enter it on your portal. The Warden will not sign off on any pass without verified parental OTP entry.</p>
          <p><strong>2. Day Pass Limits:</strong> All students departing on Day Passes must scan back through the main turnstiles before 20:30 (8:30 PM).</p>
          <p><strong>3. Home Pass Transit:</strong> Weekend home passes require prior parental approval and warden verification at least 4 hours before scheduled departure.</p>
          <p><strong>4. Dynamic QR Rules:</strong> Do not share screenshots of outpass QR codes. The QR token rotates every 60 seconds and static images will be rejected at the gate turnstile.</p>
          <p><strong>5. Emergency SOS:</strong> In case of an emergency outside campus, use the Emergency SOS button to broadcast your GPS location to the Warden and Security teams.</p>
        </div>
      </div>
    );
  }

    // --- TAB 7: PROFILE ---
    return (
      <div className="space-y-6 max-w-xl text-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Student Profile Information</h2>
          <p className="text-xs text-slate-500">Academic credentials and linked parental contact data.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <p><strong>Name:</strong> {currentUser?.name || 'Student'}</p>
          <p><strong>Student ID:</strong> {currentUser?.studentId || 'STU2026'}</p>
          <p><strong>Hostel Block:</strong> {currentUser?.assignedHostel || 'Aryabhata Block'}</p>
          <p><strong>Room Number:</strong> {currentUser?.roomNo || 'A-101'}</p>
          <p><strong>Parent Contact:</strong> Registered Guardian ({currentUser?.phone || 'On file'})</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderTabContent()}

      {/* Persistent Floating Emergency SOS Button (available on all student tabs) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setEmergencySosOpen(true)}
          className="px-4 py-3 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-rose-600/40 flex items-center gap-2 border-2 border-white transition-all transform hover:scale-105 active:scale-95 animate-pulse"
          title="Broadcast Emergency SOS with Live GPS & Outpass Details"
        >
          <AlertOctagon className="w-5 h-5 text-white" />
          <span className="tracking-wider">EMERGENCY SOS</span>
        </button>
      </div>

      {/* Emergency SOS Modal for Student Safety */}
      <EmergencySosModal
        isOpen={emergencySosOpen}
        onClose={() => setEmergencySosOpen(false)}
        activeOutpass={activePass || latestApprovedPass || pendingPass}
      />
    </div>
  );
};
