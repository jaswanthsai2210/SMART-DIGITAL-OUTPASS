import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  GraduationCap, 
  Bell, 
  User, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  KeyRound,
  Copy,
  Smartphone,
  Send,
  Lock,
  MessageSquare,
  Mail,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OutpassRequest } from '../../../types';

export const ParentPages: React.FC = () => {
  const { 
    currentUser, 
    activeParentTab, 
    setActiveParentTab, 
    outpasses, 
    parentApproveOutpass, 
    parentRejectOutpass,
    students,
    parentDispatches,
    openParentNotificationPreview,
    activeParentNotificationModal,
    setActiveParentNotificationModal,
    addToast
  } = useApp();

  // Rejection modal
  const [rejectModalReq, setRejectModalReq] = useState<OutpassRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Parent unavailable for pickup / requested travel deferred.');

  // Approval with OTP confirmation modal
  const [approvedModalReq, setApprovedModalReq] = useState<OutpassRequest | null>(null);

  // Find linked student (safely handle empty database)
  const linkedStudent = students.find(
    s => s.parentPhone === currentUser?.phone || s.parentEmail === currentUser?.email
  ) || students[0];

  // Requests linked to parent's student
  const parentRequests = outpasses.filter(
    o => (linkedStudent && o.studentName === linkedStudent.name) ||
         (currentUser?.phone && o.parentPhone === currentUser.phone) ||
         !linkedStudent // If no specific student profile exists, show available outpasses for guardian review
  );

  const pendingRequests = parentRequests.filter(o => o.parentStatus === 'Pending');
  const approvedHistory = parentRequests.filter(o => o.parentStatus === 'Approved');
  const activeOutside = parentRequests.find(o => o.status === 'Out of Campus');

  const handleApprove = (req: OutpassRequest) => {
    parentApproveOutpass(req.id);
    // Find the updated outpass to show in modal with its OTP
    setTimeout(() => {
      // Find latest state
      const target = outpasses.find(o => o.id === req.id);
      if (target) {
        setApprovedModalReq(target);
      } else {
        setApprovedModalReq({
          ...req,
          parentStatus: 'Approved',
          parentOtp: req.parentOtp,
          parentOtpVerified: false
        });
      }
    }, 50);
  };

  const handleConfirmReject = () => {
    if (rejectModalReq) {
      parentRejectOutpass(rejectModalReq.id, rejectionReason);
      setRejectModalReq(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    addToast('OTP Copied', `Security OTP ${text} copied to clipboard.`, 'info');
  };

  // --- TAB 1: DASHBOARD ---
  if (activeParentTab === 'dashboard') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Guardian Overview &amp; Consent Portal</h2>
          <p className="text-xs text-slate-500">
            {linkedStudent ? (
              <>
                Linked Ward: <strong className="text-slate-900">{linkedStudent.name}</strong> ({linkedStudent.studentId}), {linkedStudent.hostel} · Room {linkedStudent.roomNo}.
              </>
            ) : (
              <>
                Guardian Account: <strong className="text-slate-900">{currentUser?.name || 'Registered Guardian'}</strong> · Campus Movement Synchronized.
              </>
            )}
          </p>
        </div>

        {/* 3 Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Pending Authorization</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">{pendingRequests.length}</span>
              <span className="text-xs font-medium text-slate-400">awaiting your consent</span>
            </div>
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setActiveParentTab('pending-approvals')}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Review Application Now &rarr;
              </button>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Student Campus Presence</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${activeOutside ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-base font-bold text-slate-900">
                {activeOutside ? 'Currently Outside Campus' : 'Safe Inside Hostel'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">
              {activeOutside ? `Exit time: ${activeOutside.exitTimeRecorded}` : 'Last roll call verified'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Upcoming Curfew Deadline</span>
            <span className="text-lg font-bold font-mono text-slate-900 block">
              {activeOutside ? activeOutside.expectedReturnTime : 'Today at 20:30 (Curfew)'}
            </span>
            <span className="text-[11px] text-slate-400 block">Standard campus gate lock time</span>
          </div>
        </div>

        {/* Security Innovation Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Dual-Factor Parental Security Verification Active</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  ANTI-FRAUD PROTECTION
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                When you approve an outpass, a 6-digit security OTP is dispatched exclusively to your registered mobile phone. Your student must enter this OTP on their portal to prove parental consent before the Warden will authorize gate departure.
              </p>
            </div>
          </div>
          <div className="text-xs text-right shrink-0">
            <span className="text-slate-400 block">Parent Phone Number</span>
            <span className="font-mono font-bold text-teal-300">{currentUser?.phone || '+91 98765 00112'}</span>
          </div>
        </div>

        {/* Pending Requests Alert */}
        {pendingRequests.length > 0 ? (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>Action Required: Student Outpass Application Awaiting Your Approval</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Direct Web Token
              </span>
            </div>

            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-xl border border-amber-200/80 shadow-2xs space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">
                    {req.passType}: {req.destination}
                  </span>
                  <span className="font-mono text-slate-500">{req.id}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <p><strong>Purpose:</strong> {req.purpose}</p>
                  <p><strong>Expected Return:</strong> {req.expectedReturnTime} ({req.expectedReturnDate})</p>
                  <p><strong>Mode of Transit:</strong> {req.transportType}</p>
                  <p><strong>Emergency Contact:</strong> {req.emergencyContact}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">
                    Approving will generate a security OTP sent to your phone.
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openParentNotificationPreview(req.id)}
                      className="px-3.5 py-2 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                      title="Preview the exact automated notification dispatched to parent email and phone"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>1-Click Email / SMS Preview</span>
                    </button>
                    <button
                      onClick={() => setRejectModalReq(req)}
                      className="px-4 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl font-bold transition-colors"
                    >
                      Decline Request
                    </button>
                    <button
                      onClick={() => handleApprove(req)}
                      className="px-5 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve &amp; Generate OTP</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">No Pending Approvals</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your ward has no active leave requests waiting for parental authorization.
            </p>
          </div>
        )}

        {/* Recently Approved Leaves & Generated Security OTPs */}
        {approvedHistory.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Approved Leaves &amp; Security OTP Dispatches</h3>
                <p className="text-xs text-slate-500">Review generated OTPs sent to your mobile and student verification status.</p>
              </div>
              <button
                onClick={() => setActiveParentTab('approval-history')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                View Full History &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {approvedHistory.slice(0, 3).map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-teal-800">{req.id}</span>
                      <span className="font-bold text-slate-900">{req.destination}</span>
                      <span className="text-slate-500">({req.passType})</span>
                    </div>
                    <p className="text-slate-600">
                      Curfew Return: <span className="font-mono text-slate-800 font-semibold">{req.expectedReturnTime} ({req.expectedReturnDate})</span>
                    </p>
                  </div>

                  {/* OTP and Verification Status */}
                  <div className="flex items-center gap-3">
                    {req.parentOtp && (
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-2">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-mono">Parent OTP</span>
                          <span className="font-mono font-bold text-slate-900 tracking-wider">{req.parentOtp}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(req.parentOtp || '')}
                          title="Copy OTP"
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div>
                      {req.parentOtpVerified ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Student Verified OTP
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Awaiting Student OTP Entry
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approval Confirmed & OTP Dispatch Modal */}
        {approvedModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-sm">Leave Approved Successfully!</h3>
                    <span className="text-[11px] font-normal text-slate-500">Security Verification OTP Dispatched</span>
                  </div>
                </div>
                <button
                  onClick={() => setApprovedModalReq(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Simulated Phone SMS Received Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-teal-400 font-mono font-bold">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS SENT TO PARENT PHONE</span>
                  </div>
                  <span className="text-slate-400 font-mono">{currentUser?.phone || '+91 98765 00112'}</span>
                </div>

                <div className="text-xs space-y-2">
                  <p className="text-slate-200">
                    &ldquo;[SMART OUTPASS] You approved leave for {approvedModalReq.studentName} ({approvedModalReq.passType}) to {approvedModalReq.destination}.
                  </p>
                  
                  <div className="bg-slate-800/90 rounded-lg p-3 border border-teal-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-teal-400 font-mono uppercase tracking-wider block">Security Verification OTP</span>
                      <span className="text-2xl font-mono font-bold tracking-widest text-white">
                        {approvedModalReq.parentOtp || '849201'}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(approvedModalReq.parentOtp || '849201')}
                      className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy OTP</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    For campus safety, share this OTP with your ward so they can enter it in their student dashboard to verify parental consent.&rdquo;
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Security Rule:</strong> The Hostel Warden cannot authorize campus exit until the student enters this exact OTP to authenticate that you granted consent.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setApprovedModalReq(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  I Understand / Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- TAB 2: PENDING APPROVALS ---
  if (activeParentTab === 'pending-approvals') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Parent Direct Authorization</h2>
          <p className="text-xs text-slate-500">One-touch approvals with automated security OTP generation sent to your phone.</p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No pending outpass authorizations for your student.
          </div>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-teal-700 font-bold block">{req.id}</span>
                  <h3 className="font-bold text-slate-900 text-base">{req.studentName}</h3>
                </div>
                <span className="px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-800">
                  {req.passType}
                </span>
              </div>

              <div className="space-y-2 text-slate-700">
                <p><strong>Destination:</strong> {req.destination}</p>
                <p><strong>Reason:</strong> {req.purpose}</p>
                <p><strong>Curfew:</strong> {req.expectedReturnTime} ({req.expectedReturnDate})</p>
                <p><strong>Transport:</strong> {req.transportType}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Approval SMS with OTP will be sent to: <strong>{req.parentPhone}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRejectModalReq(req)}
                    className="px-4 py-2 text-rose-700 bg-rose-50 rounded-xl font-bold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req)}
                    className="px-5 py-2 text-white bg-teal-600 rounded-xl font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize Leave</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Rejection Reason Modal */}
        {rejectModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">State Reason for Declining Leave</h3>
              <p className="text-slate-600">
                Your reason will be recorded on the official outpass docket for the hostel warden.
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalReq(null)}
                  className="px-3 py-1.5 border rounded-lg text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- TAB 3: APPROVAL HISTORY ---
  if (activeParentTab === 'approval-history') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Parental Approval History</h2>
          <p className="text-xs text-slate-500">Historical records of leaves approved, dispatched OTPs, and verification status.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Destination &amp; Purpose</th>
                  <th className="py-3 px-4">Pass Type</th>
                  <th className="py-3 px-4">Return Curfew</th>
                  <th className="py-3 px-4">Parent Status</th>
                  <th className="py-3 px-4">Security OTP</th>
                  <th className="py-3 px-4">Student Verification</th>
                  <th className="py-3 px-4">Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{req.destination}</span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-xs">{req.purpose}</span>
                    </td>
                    <td className="py-3 px-4">{req.passType}</td>
                    <td className="py-3 px-4 font-mono">{req.expectedReturnTime}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{req.parentStatus}</td>
                    <td className="py-3 px-4 font-mono">
                      {req.parentOtp ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{req.parentOtp}</span>
                          <button
                            onClick={() => copyToClipboard(req.parentOtp || '')}
                            className="text-slate-400 hover:text-slate-700"
                            title="Copy OTP"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {req.parentOtpVerified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Verified by Student
                        </span>
                      ) : req.parentStatus === 'Approved' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Awaiting Student OTP
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
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

  // --- TAB 4: STUDENT DETAILS ---
  if (activeParentTab === 'student-details') {
    return (
      <div className="space-y-6 max-w-xl text-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Student Ward Profile</h2>
          <p className="text-xs text-slate-500">Official residency details and proctor contact information.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <p><strong>Student Name:</strong> {linkedStudent.name}</p>
          <p><strong>Roll / Student ID:</strong> {linkedStudent.studentId}</p>
          <p><strong>Department &amp; Year:</strong> {linkedStudent.department} ({linkedStudent.year})</p>
          <p><strong>Hostel Block:</strong> {linkedStudent.hostel}</p>
          <p><strong>Room Number:</strong> {linkedStudent.roomNo}</p>
          <p><strong>Assigned Warden:</strong> Dr. V. Raman (+91 98440 22334)</p>
        </div>
      </div>
    );
  }

  // --- TAB 5: NOTIFICATIONS & 1-CLICK DISPATCH LOG ---
  if (activeParentTab === 'notifications') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Automated Parent Notifications &amp; Consent Feed</h2>
            <p className="text-xs text-slate-500">
              Dispatched alerts via Email, SMS Webhook, and Push notifications with instant 1-click approval links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Channel Webhook Active</span>
            </span>
          </div>
        </div>

        {/* Dispatch Channel Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Registered Guardian Email</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-900 truncate">
              {currentUser?.email || 'ramesh.sharma@parent.com'}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold block">✓ Instant HTML Dispatch &amp; 1-Click Link</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Mobile Phone Gateway</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-900">
              {currentUser?.phone || '+91 98765 00112'}
            </p>
            <span className="text-[10px] text-blue-600 font-bold block">✓ SMS Webhook &amp; Security OTP Relay</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Mobile App Push Notifications</span>
            </div>
            <p className="font-mono text-xs font-bold text-slate-900">
              Subscribed (Device: Pixel 8)
            </p>
            <span className="text-[10px] text-teal-600 font-bold block">✓ Lock Screen Actionable Banners</span>
          </div>
        </div>

        {/* Notifications and Dispatches Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Automated Dispatches ({parentDispatches.length})</h3>
            <span className="text-xs text-slate-400 font-mono">Real-time Notification Queue</span>
          </div>

          {parentDispatches.length > 0 ? (
            <div className="space-y-3">
              {parentDispatches.map((disp) => {
                const linkedPass = outpasses.find(o => o.id === disp.outpassId);
                const isAlreadyApproved = linkedPass?.parentStatus === 'Approved' || disp.status === 'ApprovedViaLink';

                return (
                  <div 
                    key={disp.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
                          <Bell className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{disp.studentName} ({disp.studentId})</span>
                            <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                              {disp.outpassId}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAlreadyApproved 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {isAlreadyApproved ? 'Approved via Link' : 'Pending Guardian Action'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Dispatched via Email to {disp.parentEmail || currentUser?.email} &amp; SMS to {disp.parentPhone} · {disp.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveParentNotificationModal(disp)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-teal-600" />
                          <span>Preview Multi-Channel Notice</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">PASS TYPE:</span>
                        <strong className="text-slate-900">{disp.passType}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">DESTINATION:</span>
                        <span className="text-slate-800 font-semibold">{disp.destination}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">DEPARTURE:</span>
                        <span className="font-mono text-slate-700">{disp.departureTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">CURFEW RETURN:</span>
                        <span className="font-mono text-teal-700 font-bold">{disp.expectedReturnTime}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono truncate max-w-md">
                        <span>1-Click Token:</span>
                        <span className="font-bold text-slate-700">{disp.approvalToken}</span>
                      </div>

                      {!isAlreadyApproved ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              parentRejectOutpass(disp.outpassId, 'Declined by parent via direct notification action.');
                              addToast('Outpass Declined', `Leave request #${disp.outpassId} declined.`, 'info');
                            }}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              parentApproveOutpass(disp.outpassId);
                              addToast('1-Click Approved', `Outpass #${disp.outpassId} authorized. Security OTP dispatched.`, 'success');
                            }}
                            className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>1-Click Approve Outpass</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Authorized &amp; Security OTP Sent to Phone</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
              <Bell className="w-8 h-8 text-teal-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No Dispatches Recorded Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When your ward submits an outpass application, automated Email, SMS, and Push notifications will appear here immediately with 1-click approvals.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TAB 6: PROFILE ---
  return (
    <div className="space-y-6 max-w-xl text-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Parent Account Information</h2>
        <p className="text-xs text-slate-500">Guardian identity credentials and authenticated phone number.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <p><strong>Name:</strong> {currentUser?.name || 'Registered Guardian'}</p>
        <p><strong>Registered Phone:</strong> {currentUser?.phone || 'On file'}</p>
        <p><strong>Email:</strong> {currentUser?.email || 'parent@campus.edu'}</p>
        <p><strong>Linked Ward:</strong> {linkedStudent ? `${linkedStudent.name} (${linkedStudent.studentId})` : 'Student Ward on Record'}</p>
      </div>
    </div>
  );
};
