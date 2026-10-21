import React, { useState } from 'react';
import { 
  Building, 
  Clock, 
  ShieldCheck, 
  SlidersHorizontal, 
  Users, 
  BarChart3, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Check, 
  X, 
  Search, 
  Filter, 
  FileText,
  Phone,
  ArrowRight,
  Flame,
  Info,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OutpassRequest, PriorityLevel } from '../../../types';

export const WardenPages: React.FC = () => {
  const { 
    currentUser, 
    activeWardenTab, 
    setActiveWardenTab, 
    outpasses, 
    wardenApproveOutpass, 
    wardenRejectOutpass,
    hostels,
    emergencyAlerts,
    resolveEmergencyAlert,
    addToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [rejectModalReq, setRejectModalReq] = useState<OutpassRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Academic attendance requirements not satisfied.');

  // Override confirmation modal if student hasn't entered OTP yet
  const [overrideModalReq, setOverrideModalReq] = useState<OutpassRequest | null>(null);

  // Warden requests (all or hostel-specific)
  const pendingRequests = outpasses.filter(o => o.status === 'Pending Warden' || (o.parentStatus === 'Approved' && o.wardenStatus === 'Pending'));
  const approvedToday = outpasses.filter(o => o.wardenStatus === 'Approved');
  const activeOutside = outpasses.filter(o => o.status === 'Out of Campus');
  const lateReturns = outpasses.filter(o => o.status === 'Late Return' || o.isLate);

  const awaitingStudentOtp = pendingRequests.filter(o => o.parentStatus === 'Approved' && !o.parentOtpVerified);
  const readyForSignoff = pendingRequests.filter(o => o.parentStatus === 'Approved' && o.parentOtpVerified);

  const handleApproveClick = (req: OutpassRequest) => {
    if (!req.parentOtpVerified) {
      // Prompt warden that student hasn't verified parent OTP yet
      setOverrideModalReq(req);
    } else {
      wardenApproveOutpass(req.id);
    }
  };

  const handleConfirmOverride = () => {
    if (overrideModalReq) {
      wardenApproveOutpass(overrideModalReq.id);
      addToast('Warden Override Applied', `Authorized #${overrideModalReq.id} under Warden administrative discretion.`, 'info');
      setOverrideModalReq(null);
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalReq) {
      wardenRejectOutpass(rejectModalReq.id, rejectionReason);
      setRejectModalReq(null);
    }
  };

  // --- TAB 1: DASHBOARD ---
  if (activeWardenTab === 'dashboard') {
    const activeSosAlerts = emergencyAlerts.filter(a => a.status === 'Active');

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Warden Supervisory Console</h2>
          <p className="text-xs text-slate-500">
            Hostel Block: <strong className="text-slate-900">{currentUser?.assignedHostel || 'Aryabhata Block (Boys)'}</strong> · In-Premises Census Synchronized.
          </p>
        </div>

        {/* ACTIVE EMERGENCY SOS ALERTS BANNER FOR WARDEN */}
        {activeSosAlerts.length > 0 && (
          <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold animate-pulse shadow-md">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                      CRITICAL PRIORITY
                    </span>
                    <span className="text-xs font-bold text-rose-700 font-mono">
                      {activeSosAlerts.length} ACTIVE STUDENT SOS BROADCAST
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mt-0.5">
                    Immediate Safety Intervention Required
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-rose-800 bg-rose-100 px-3 py-1 rounded-xl font-semibold border border-rose-300">
                Security Control Room Alerted
              </span>
            </div>

            <div className="space-y-3">
              {activeSosAlerts.map((sos) => (
                <div key={sos.id} className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-sm font-bold text-slate-900">{sos.studentName} ({sos.studentId})</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">Room {sos.roomNo} ({sos.hostel}) · Phone: {sos.phone}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                      {sos.emergencyType} · {sos.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">GPS LOCATION TELEMETRY:</span>
                      <p className="font-semibold text-slate-900 leading-snug">{sos.currentLocation.address}</p>
                      <p className="font-mono text-[10px] text-slate-500">Lat: {sos.currentLocation.lat}, Lng: {sos.currentLocation.lng} (Accuracy: ±{sos.currentLocation.accuracyMeters || 10}m)</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-mono block">OUTPASS DETAILS:</span>
                      {sos.outpassDetails ? (
                        <>
                          <p className="font-medium text-slate-800">
                            <strong>{sos.outpassDetails.passType}</strong> &rarr; {sos.outpassDetails.destination}
                          </p>
                          <p className="text-[11px] text-teal-700 font-mono">
                            Curfew: {sos.outpassDetails.expectedReturnTime} ({sos.outpassDetails.expectedReturnDate})
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-500">No active outpass recorded. Student on perimeter grounds.</p>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-rose-900 text-[11px]">
                    <strong>Reported Message:</strong> {sos.message}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">
                      Emergency response sentry vehicle dispatched to coordinates.
                    </span>
                    <button
                      type="button"
                      onClick={() => resolveEmergencyAlert(sos.id, 'Warden attended, student safe and assisted.')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Mark SOS Resolved &amp; Safe</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6 Metric KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Pending Reviews</span>
            <span className="text-2xl font-bold font-mono text-amber-600 block mt-1 tabular-nums">{pendingRequests.length}</span>
            <span className="text-[10px] text-amber-700 font-medium mt-1 block">Queue Depth</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">OTP Verified</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 block mt-1 tabular-nums">{readyForSignoff.length}</span>
            <span className="text-[10px] text-emerald-700 font-medium mt-1 block">Ready for Signoff</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Approved Today</span>
            <span className="text-2xl font-bold font-mono text-teal-700 block mt-1 tabular-nums">{approvedToday.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Gate Ready</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Students Outside</span>
            <span className="text-2xl font-bold font-mono text-blue-700 block mt-1 tabular-nums">{activeOutside.length}</span>
            <span className="text-[10px] text-blue-600 font-medium mt-1 block">Gate Validated</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20">
            <span className="text-[11px] text-rose-700 font-semibold block">Late Returns</span>
            <span className="text-2xl font-bold font-mono text-rose-600 block mt-1 tabular-nums">{lateReturns.length}</span>
            <span className="text-[10px] text-rose-600 font-medium mt-1 block">Curfew Flagged</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Processing Speed</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1 tabular-nums">3.2m</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Median Turnaround</span>
          </div>
        </div>

        {/* Priority Pending Reviews Callout */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Triage Queue</h3>
              <p className="text-xs text-slate-500">Student applications with dual-factor parental consent verification.</p>
            </div>
            <button
              onClick={() => setActiveWardenTab('pending-requests')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              View Full Queue ({pendingRequests.length}) &rarr;
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Zero pending leaves. All queue items cleared.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{req.studentName}</span>
                      <span className="font-mono text-slate-500">({req.studentId} · Room {req.roomNo})</span>
                      
                      {/* Security Status Badge */}
                      {req.parentOtpVerified ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Parent &amp; OTP Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          Parent Approved · Awaiting Student OTP
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700">
                      <strong>Destination:</strong> {req.destination} · <strong>Reason:</strong> {req.purpose}
                    </p>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                      Depart: {req.departureTime} · Curfew: {req.expectedReturnTime} ({req.passType})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setRejectModalReq(req)}
                      className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveClick(req)}
                      className={`px-4 py-1.5 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                        req.parentOtpVerified 
                          ? 'bg-teal-600 hover:bg-teal-700' 
                          : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {req.parentOtpVerified ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize Leave</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Review &amp; Override</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Outpass Tracking List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Hostel Outpass Activity</h3>
              <p className="text-xs text-slate-500">Live leave tracking and curfew clearance.</p>
            </div>
            <button
              onClick={() => setActiveWardenTab('pending-requests')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Manage Requests &rarr;
            </button>
          </div>

          {outpasses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No outpass requests yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {outpasses.slice(0, 5).map((o) => (
                <div key={o.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{o.studentName}</span>
                    <span className="text-slate-500 ml-2 font-mono">({o.id})</span>
                    <span className="text-slate-400 block text-[11px] mt-0.5">{o.destination} · {o.passType}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    o.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'Out of Campus' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'Returned' ? 'bg-slate-200 text-slate-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  // --- TAB: ANALYTICS ---
  if (activeWardenTab === 'analytics') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Hostel Movement Overview</h2>
          <p className="text-xs text-slate-500">
            Actual gate activity records and outpass volume statistics.
          </p>
        </div>

        {outpasses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No activity recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Analytics will be calculated from actual gate passes as students apply and travel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold block">
                TOTAL APPLICATIONS
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">{outpasses.length}</span>
              <p className="text-slate-600 text-[11px]">
                {approvedToday.length} approved, {pendingRequests.length} pending authorization.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold block">
                CAMPUS PRESENCE
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">{activeOutside.length} Outside</span>
              <p className="text-slate-600 text-[11px]">
                Students currently checked out through the gate turnstile.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold block">
                CURFEW FLAGS
              </span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">{lateReturns.length} Overdue</span>
              <p className="text-slate-600 text-[11px]">
                Outpasses requiring follow-up or overdue attendance verification.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TAB 2: PENDING REQUESTS ---
  if (activeWardenTab === 'pending-requests') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Pending Outpass Authorization Queue</h2>
          <p className="text-xs text-slate-500">Review student applications, verify parent consent OTP status, and issue Dynamic QR outpasses.</p>
        </div>

        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{req.studentName}</span>
                    <span className="font-mono text-slate-500 font-semibold">{req.studentId} · Room {req.roomNo}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Pass Ticket #{req.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {req.parentOtpVerified ? (
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Parent OTP Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      Awaiting Student OTP Entry
                    </span>
                  )}
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-semibold">
                    {req.passType}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <p><strong>Destination:</strong> {req.destination}</p>
                <p><strong>Reason:</strong> {req.purpose}</p>
                <p><strong>Departure Time:</strong> {req.departureTime} ({req.departureDate})</p>
                <p><strong>Expected Return (Curfew):</strong> {req.expectedReturnTime} ({req.expectedReturnDate})</p>
                <p><strong>Mode of Transit:</strong> {req.transportType}</p>
                <p><strong>Emergency Contact:</strong> {req.emergencyContact}</p>
                <p><strong>Parent Mobile:</strong> {req.parentPhone} ({req.parentName})</p>
                <p><strong>Security OTP Status:</strong> {req.parentOtpVerified ? 'Verified by Student' : 'Pending Student Entry'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => addToast('More Info Requested', `Notification sent to ${req.studentName} requesting additional notes.`, 'info')}
                  className="text-slate-600 hover:text-slate-900 underline"
                >
                  Request More Information
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRejectModalReq(req)}
                    className="px-4 py-2 text-rose-700 bg-rose-50 rounded-xl font-bold"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => handleApproveClick(req)}
                    className={`px-5 py-2 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors ${
                      req.parentOtpVerified ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {req.parentOtpVerified ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Approve &amp; Issue Dynamic QR Pass</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Authorize via Institutional Override</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Warden Override Warning Modal */}
        {overrideModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Parent Security OTP Not Yet Verified</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Parent {overrideModalReq.parentName} approved outpass #{overrideModalReq.id}, and an OTP was sent to their registered phone ({overrideModalReq.parentPhone}). However, student <strong>{overrideModalReq.studentName}</strong> has not entered this code in their portal yet.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <p>
                  As Warden, you may exercise institutional discretion to authorize this outpass immediately, or wait for the student to submit the code.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setOverrideModalReq(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 font-semibold"
                >
                  Wait for Student
                </button>
                <button
                  onClick={handleConfirmOverride}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Authorize Override
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Warden Rejection Justification</h3>
              <p className="text-slate-600">Provide official institutional reason for record:</p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setRejectModalReq(null)} className="px-3 py-1.5 border rounded-lg">Cancel</button>
                <button onClick={handleConfirmReject} className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold">Reject Leave</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- TAB 3: APPROVED PASSES ---
  if (activeWardenTab === 'approved-passes' || activeWardenTab === 'approved-requests') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Approved Active Outpasses</h2>
          <p className="text-xs text-slate-500">Live roster of authorized passes currently cleared or outside hostel grounds.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Curfew Return</th>
                  <th className="py-3 px-4">Parent OTP</th>
                  <th className="py-3 px-4">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outpasses.filter(o => o.wardenStatus === 'Approved').map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{req.studentName}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{req.studentId} · Room {req.roomNo}</span>
                    </td>
                    <td className="py-3 px-4">{req.destination}</td>
                    <td className="py-3 px-4 font-mono">{req.departureTime}</td>
                    <td className="py-3 px-4 font-mono">{req.expectedReturnTime}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ✓ Verified
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800">
                        {req.status}
                      </span>
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

  // --- TAB: STUDENT MOVEMENT (LIVE ROSTER & SCANS) ---
  if (activeWardenTab === 'student-movement') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Student Campus Movement Monitor</h2>
          <p className="text-xs text-slate-500">Live roster of students currently off-campus, recorded gate departure times, and destination track.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Currently Off Campus ({activeOutside.length})</span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">Gate Verified</span>
            </div>
            {activeOutside.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All resident students are currently inside hostel grounds.</p>
            ) : (
              <div className="space-y-2.5">
                {activeOutside.map((req) => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{req.studentName} ({req.studentId})</span>
                      <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Exited: {req.exitTimeRecorded || '04:28 PM'}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">Room {req.roomNo} ({req.hostel}) &rarr; {req.destination}</p>
                    <p className="text-slate-500 text-[10px] font-mono">Curfew Deadline: {req.expectedReturnTime} ({req.expectedReturnDate})</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Recent Movement Telemetry Logs</span>
              <span className="text-[10px] font-mono text-slate-400">Live Turnstiles</span>
            </div>
            <div className="space-y-2.5">
              {outpasses.slice(0, 5).map((req, idx) => (
                <div key={req.id + idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{req.studentName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{req.passType} · {req.destination}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    req.status === 'Out of Campus' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'Returned' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'Approved' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TAB: LIVE QUEUE STATUS ---
  if (activeWardenTab === 'live-queue') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Live Approval Queue Status</h2>
          <p className="text-xs text-slate-500">Real-time status of applications across parent OTP and warden review pipelines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Parent OTP Verified Queue ({readyForSignoff.length})</h3>
            <p className="text-slate-500 text-[11px]">These requests have verified guardian security OTP and are ready for immediate Warden signoff.</p>
            {readyForSignoff.map((r) => (
              <div key={r.id} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{r.studentName} ({r.studentId})</span>
                  <span className="text-slate-600 text-[10px] font-mono">{r.destination} · {r.departureTime}</span>
                </div>
                <button
                  onClick={() => handleApproveClick(r)}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Authorize
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Awaiting Student Parental OTP Input ({awaitingStudentOtp.length})</h3>
            <p className="text-slate-500 text-[11px]">Parent approved, OTP dispatched to guardian phone. Awaiting student to enter code or Warden discretion override.</p>
            {awaitingStudentOtp.map((r) => (
              <div key={r.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{r.studentName} ({r.studentId})</span>
                  <span className="text-slate-600 text-[10px] font-mono">Sent to {r.parentPhone}</span>
                </div>
                <button
                  onClick={() => handleApproveClick(r)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                >
                  Review Override
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- TAB 4: LATE RETURNS & VIOLATIONS ---
  if (activeWardenTab === 'late-returns') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Late Returns &amp; Curfew Disciplinary Log</h2>
          <p className="text-xs text-slate-500">Students who exceeded expected return time without verified transport delay filing.</p>
        </div>

        <div className="space-y-3">
          {lateReturns.map((req) => (
            <div key={req.id} className="p-5 rounded-2xl bg-white border border-rose-200 shadow-2xs text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                <span className="font-bold text-rose-900 text-sm">{req.studentName} ({req.studentId})</span>
                <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                  Curfew Overdue
                </span>
              </div>
              <p className="text-slate-700">
                <strong>Hostel Room:</strong> {req.roomNo} ({req.hostel}) · <strong>Expected Return:</strong> {req.expectedReturnTime} ({req.expectedReturnDate})
              </p>
              <p className="text-slate-600">
                <strong>Parent Contact:</strong> {req.parentName} ({req.parentPhone})
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- TAB 5: HOSTEL CENSUS & OCCUPANCY ---
  if (activeWardenTab === 'hostel-census' || activeWardenTab === 'hostel-occupancy') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Live In-Premises Hostel Census</h2>
          <p className="text-xs text-slate-500">Real-time roll call occupancy updated continuously by gate scans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hostels.map((h) => {
            const pct = Math.round((h.currentOccupancy / h.capacity) * 100);
            return (
              <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-sm">{h.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">{h.type}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-slate-900">{h.currentOccupancy}</span>
                  <span className="text-slate-500">/ {h.capacity} Total Beds</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-slate-500 text-[11px]">Assigned Warden: {h.assignedWarden}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- TAB 6: PROFILE ---
  return (
    <div className="space-y-6 max-w-xl text-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Warden Profile &amp; Assignment</h2>
        <p className="text-xs text-slate-500">Institutional credentials and administrative oversight assignment.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <p><strong>Name:</strong> {currentUser?.name}</p>
        <p><strong>Warden ID:</strong> {currentUser?.id}</p>
        <p><strong>Assigned Block:</strong> {currentUser?.assignedHostel}</p>
        <p><strong>Contact Email:</strong> {currentUser?.email}</p>
        <p><strong>Duty Phone:</strong> {currentUser?.phone || 'On file'}</p>
      </div>
    </div>
  );
};
