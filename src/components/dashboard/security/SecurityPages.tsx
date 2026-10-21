import React, { useState } from 'react';
import { 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  FileText, 
  User, 
  ShieldCheck, 
  Check, 
  X,
  AlertOctagon,
  ShieldAlert,
  Radio,
  MapPin,
  ExternalLink,
  Navigation,
  Phone,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { OutpassRequest } from '../../../types';
import { QrPassScanner } from './QrPassScanner';

export const SecurityPages: React.FC = () => {
  const { 
    currentUser, 
    activeSecurityTab, 
    setActiveSecurityTab, 
    outpasses, 
    recordGateExit, 
    recordGateReturn,
    movementLogs,
    emergencyAlerts,
    resolveEmergencyAlert,
    addToast
  } = useApp();

  const activeOutside = outpasses.filter((o) => o.status === 'Out of Campus');
  const lateReturns = outpasses.filter((o) => o.status === 'Late Return' || o.isLate);
  const readyForExit = outpasses.filter((o) => o.status === 'Approved');

  const exitsCount = movementLogs.filter((l) => l.movementType === 'EXIT').length;
  const returnsCount = movementLogs.filter((l) => l.movementType === 'RETURN').length;

  const handleRecordExitAction = (id: string) => {
    recordGateExit(id, currentUser?.gate || 'Main Campus Gate');
  };

  const handleRecordReturnAction = (id: string) => {
    recordGateReturn(id, false);
  };

  // --- TAB 1: DASHBOARD ---
  if (activeSecurityTab === 'dashboard') {
    const activeSosAlerts = emergencyAlerts.filter((a) => a.status === 'Active');

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Perimeter Gate Sentry Terminal</h2>
            <p className="text-xs text-slate-500">
              Station: <strong className="text-slate-900">{currentUser?.gate || 'Main Campus Gate'}</strong> · Turnstile System Online.
            </p>
          </div>

          {activeSosAlerts.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold animate-pulse">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>{activeSosAlerts.length} Active SOS Incident(s)</span>
            </div>
          )}
        </div>

        {/* Active Emergency SOS Alerts Sentry Console */}
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
                      SENTRY ALERT
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 font-mono">
                      <Radio className="w-3.5 h-3.5 animate-ping text-rose-600" />
                      STUDENT DISTRESS SIGNAL
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mt-0.5">
                    Security Patrol &amp; Assistance Required
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-rose-800 bg-rose-100 px-3 py-1 rounded-xl font-semibold border border-rose-300">
                Warden Alerted
              </span>
            </div>

            <div className="space-y-3">
              {activeSosAlerts.map((sos) => (
                <div key={sos.id} className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-sm font-bold text-slate-900">{sos.studentName} ({sos.studentId})</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">Room {sos.roomNo} ({sos.hostel})</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                      {sos.emergencyType} · {sos.timestamp}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono block">LOCATION:</span>
                        <a 
                          href={`https://www.google.com/maps?q=${sos.currentLocation.lat},${sos.currentLocation.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Navigation className="w-3 h-3 text-rose-600" />
                          <span>View on Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <p className="font-semibold text-slate-900 leading-snug">{sos.currentLocation.address}</p>
                      <p className="font-mono text-[10px] text-slate-500">
                        Lat: {sos.currentLocation.lat}, Lng: {sos.currentLocation.lng}
                      </p>
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
                        <p className="text-slate-500">No active outpass linked.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact: <strong className="text-slate-900">{sos.phone || 'On file'}</strong></span>
                    </div>

                    <button
                      onClick={() => resolveEmergencyAlert(sos.id, 'Patrol assisted student.')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Safe / Resolve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real KPI Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Active Outside</span>
            <span className="text-2xl font-bold font-mono text-blue-700 block mt-1 tabular-nums">{activeOutside.length}</span>
            <span className="text-[10px] text-blue-600 font-medium mt-1 block">Students Exited</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Ready for Exit</span>
            <span className="text-2xl font-bold font-mono text-teal-700 block mt-1 tabular-nums">{readyForExit.length}</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Approved Passes</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Exits Logged</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1 tabular-nums">{exitsCount}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Total Departures</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Returns Logged</span>
            <span className="text-2xl font-bold font-mono text-slate-900 block mt-1 tabular-nums">{returnsCount}</span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Total Check-ins</span>
          </div>
        </div>

        {/* Quick Launch QR Scanner Card */}
        <div className="bg-[#0f172a] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
              TURNSTILE SCANNER
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-display">
              Gate Pass QR Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Scan student pass QR code with terminal camera or enter pass ID to verify clearance and record timestamps.
            </p>
          </div>

          <button
            onClick={() => setActiveSecurityTab('scan-qr')}
            className="px-6 py-3.5 bg-teal-400 hover:bg-teal-300 text-[#0f172a] font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open Scanner &rarr;</span>
          </button>
        </div>

        {/* Recent Gate Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Gate Activity</h3>
            <span className="text-xs font-mono text-slate-400">Movement Records</span>
          </div>

          {movementLogs.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {movementLogs.map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      log.movementType === 'EXIT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.movementType}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{log.studentName} ({log.studentId})</span>
                      <span className="text-[11px] text-slate-500">{log.hostel} · Room {log.roomNo} ({log.passType})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-slate-700 block font-semibold">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-400">{log.gate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No activity recorded yet.</p>
              <p className="text-slate-400">Scanned gate exits and returns will appear here.</p>
            </div>
          )}
        </div>

      </div>
    );
  }

  // --- TAB 2: SCAN QR CODE (THE CORE SCANNER) ---
  if (activeSecurityTab === 'scan-qr') {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Gate Pass Scanner</h2>
          <p className="text-xs text-slate-500">Scan student pass QR code or enter pass ID to verify clearance.</p>
        </div>

        <QrPassScanner 
          outpasses={outpasses}
          onRecordExit={handleRecordExitAction}
          onRecordReturn={handleRecordReturnAction}
        />
      </div>
    );
  }

  // --- TAB 3: ACTIVE OUTPASSES ---
  if (activeSecurityTab === 'active-outpasses') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Active Outpasses</h2>
          <p className="text-xs text-slate-500">Students currently departed and outside campus premises.</p>
        </div>

        {activeOutside.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOutside.map((o) => (
              <div key={o.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900 text-sm">{o.studentName} ({o.studentId})</span>
                  <span className="font-mono font-bold text-blue-700">{o.id}</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Hostel &amp; Room:</strong> {o.hostel} · Room {o.roomNo}</p>
                  <p><strong>Destination:</strong> {o.destination}</p>
                  <p><strong>Departure Time:</strong> {o.exitTimeRecorded || o.departureTime}</p>
                  <p><strong>Expected Return:</strong> <span className="text-teal-700 font-bold">{o.expectedReturnDate} by {o.expectedReturnTime}</span></p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleRecordReturnAction(o.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Record Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-700">No students currently outside.</p>
            <p className="text-slate-400">All residents are accounted for within campus premises.</p>
          </div>
        )}
      </div>
    );
  }

  // --- TAB 4: MOVEMENT HISTORY ---
  if (activeSecurityTab === 'movement-history') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Gate Movement Log</h2>
          <p className="text-xs text-slate-500">Chronological history of recorded student gate exits and returns.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {movementLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Pass ID</th>
                    <th className="py-3 px-4">Hostel &amp; Room</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Gate</th>
                    <th className="py-3 px-4">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movementLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          log.movementType === 'EXIT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.movementType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.studentName} ({log.studentId})</td>
                      <td className="py-3 px-4 font-mono">{log.outpassId}</td>
                      <td className="py-3 px-4">{log.hostel} · {log.roomNo}</td>
                      <td className="py-3 px-4 font-mono">{log.timestamp}</td>
                      <td className="py-3 px-4">{log.gate}</td>
                      <td className="py-3 px-4 text-slate-600">{log.securityStaffName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-slate-400 space-y-1">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No activity recorded yet.</p>
              <p className="text-slate-400">Gate departures and returns will appear here.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- TAB 5: PROFILE ---
  return (
    <div className="space-y-6 max-w-xl text-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Security Staff Profile</h2>
        <p className="text-xs text-slate-500">Assigned terminal and duty credentials.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <p><strong>Name:</strong> {currentUser?.name || 'Gate Officer'}</p>
        <p><strong>Role:</strong> Security Staff</p>
        <p><strong>Assigned Gate:</strong> {currentUser?.gate || 'Main Campus Gate'}</p>
        <p><strong>Email:</strong> {currentUser?.email || 'security@campus.edu'}</p>
      </div>
    </div>
  );
};
