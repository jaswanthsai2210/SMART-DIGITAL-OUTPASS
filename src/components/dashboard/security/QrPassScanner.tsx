import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { OutpassRequest } from '../../../types';

interface QrPassScannerProps {
  outpasses: OutpassRequest[];
  onRecordExit: (passId: string) => void;
  onRecordReturn: (passId: string) => void;
}

export const QrPassScanner: React.FC<QrPassScannerProps> = ({
  outpasses,
  onRecordExit,
  onRecordReturn
}) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [verificationResult, setVerificationResult] = useState<{
    status: 'valid' | 'invalid';
    pass?: OutpassRequest;
    message?: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-scanner-box';

  // Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch {}
      }
    };
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    setVerificationResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          verifyPassCode(decodedText);
          stopScanner();
        },
        () => {
          // Frame scanner miss, safe to ignore
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      setIsScanning(false);
      const errMsg = err?.message || '';
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('Camera permission was denied. Please allow camera access in your browser or enter the pass ID manually.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No camera device detected on this terminal. Please use manual pass ID entry below.');
      } else {
        setCameraError('Unable to start camera scanner. You can enter the pass ID manually below.');
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch {}
    }
    setIsScanning(false);
  };

  const verifyPassCode = (rawText: string) => {
    const query = rawText.trim();
    if (!query) return;

    let targetId = query;
    let targetToken = query;

    // Support JSON encoded QR codes
    if (query.startsWith('{')) {
      try {
        const parsed = JSON.parse(query);
        if (parsed.passId) targetId = parsed.passId;
        if (parsed.token) targetToken = parsed.token;
      } catch {}
    }

    const found = outpasses.find((o) => {
      const idMatch = o.id.toLowerCase() === targetId.toLowerCase();
      const tokenMatch = o.qrCodeToken && o.qrCodeToken.toLowerCase() === targetToken.toLowerCase();
      return idMatch || tokenMatch;
    });

    if (!found) {
      setVerificationResult({
        status: 'invalid',
        message: `No outpass record found matching "${query}".`
      });
      return;
    }

    if (found.status === 'Rejected') {
      setVerificationResult({
        status: 'invalid',
        pass: found,
        message: 'This pass has been rejected or cancelled. Gate passage is not permitted.'
      });
      return;
    }

    if (found.status === 'Pending Parent' || found.status === 'Pending Warden') {
      setVerificationResult({
        status: 'invalid',
        pass: found,
        message: 'This pass is still pending authorization. Both parent and warden approvals are required before exit.'
      });
      return;
    }

    if (found.status === 'Returned') {
      setVerificationResult({
        status: 'invalid',
        pass: found,
        message: 'This pass was already completed and returned. Passes cannot be reused.'
      });
      return;
    }

    // Pass is approved or currently outside
    setVerificationResult({
      status: 'valid',
      pass: found
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    verifyPassCode(manualInput);
  };

  const resetForNextPass = () => {
    setVerificationResult(null);
    setManualInput('');
    setCameraError(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">
            Gate Pass QR Verification
          </h3>
          <p className="text-xs text-slate-500">
            Scan student pass using camera or enter pass ID manually to verify clearance.
          </p>
        </div>

        {verificationResult && (
          <button
            type="button"
            onClick={resetForNextPass}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span>Scan Next Pass</span>
          </button>
        )}
      </div>

      {/* Camera Scanner Viewport Area */}
      {!verificationResult && (
        <div className="space-y-4">
          <div className="relative bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 min-h-[260px] flex flex-col items-center justify-center p-4 text-center">
            
            {/* HTML5 QR Code DOM Mounting Element */}
            <div 
              id={containerId} 
              className={`w-full max-w-sm rounded-xl overflow-hidden ${isScanning ? 'block' : 'hidden'}`}
            />

            {!isScanning && (
              <div className="py-8 px-4 max-w-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white">Camera Scanner Ready</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click the button below to start the live camera scanner and hold the student's digital QR code in front of the lens.
                </p>
                <button
                  type="button"
                  onClick={startScanner}
                  className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0f172a] font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="w-full pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={stopScanner}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <CameraOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop Scanner</span>
                </button>
              </div>
            )}
          </div>

          {/* Camera Permission / Error Warning */}
          {cameraError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{cameraError}</div>
            </div>
          )}

          {/* Manual Pass ID Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Or Enter Pass ID / Token Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Outpass ID (e.g. OP-123456)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="px-5 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-teal-400" />
                <span>Verify Pass</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERIFICATION RESULT: APPROVED / VALID PASS */}
      {verificationResult?.status === 'valid' && verificationResult.pass && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/50 p-6 space-y-5 animate-in fade-in duration-200">
          
          {/* Success Banner */}
          <div className="flex items-center justify-between pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  VERIFIED CLEARANCE
                </span>
                <h4 className="text-base font-bold text-slate-900 font-display mt-0.5">
                  Pass verified successfully.
                </h4>
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-white text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl">
              {verificationResult.pass.id}
            </span>
          </div>

          {/* Pass Details Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-emerald-200/80 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
              <p className="font-bold text-slate-900 text-sm">{verificationResult.pass.studentName}</p>
              <span className="text-slate-500 font-mono text-[11px]">ID: {verificationResult.pass.studentId}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hostel &amp; Room</span>
              <p className="font-semibold text-slate-800">{verificationResult.pass.hostel || 'Hostel Block'}</p>
              <span className="text-slate-500 text-[11px]">Room {verificationResult.pass.roomNo}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pass Type &amp; Purpose</span>
              <p className="font-semibold text-slate-800">{verificationResult.pass.passType}</p>
              <span className="text-slate-600 text-[11px] block">{verificationResult.pass.purpose}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
              <p className="font-semibold text-slate-800">{verificationResult.pass.destination}</p>
              <span className="text-slate-500 text-[11px]">Transit: {verificationResult.pass.transportType || 'Standard'}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Departure Schedule</span>
              <p className="font-mono text-slate-800 font-semibold">
                {verificationResult.pass.departureDate} at {verificationResult.pass.departureTime}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Return Curfew</span>
              <p className="font-mono text-teal-700 font-bold">
                {verificationResult.pass.expectedReturnDate} by {verificationResult.pass.expectedReturnTime}
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Current Status:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-100 text-emerald-800">
                {verificationResult.pass.status}
              </span>
            </div>
          </div>

          {/* Gate Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForNextPass}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Next Pass</span>
            </button>

            <div className="flex gap-2 w-full sm:w-auto">
              {verificationResult.pass.status === 'Approved' && (
                <button
                  type="button"
                  onClick={() => {
                    onRecordExit(verificationResult.pass!.id);
                    resetForNextPass();
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Record Exit (Student Departs)</span>
                </button>
              )}

              {verificationResult.pass.status === 'Out of Campus' && (
                <button
                  type="button"
                  onClick={() => {
                    onRecordReturn(verificationResult.pass!.id);
                    resetForNextPass();
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Return (Student Checked In)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VERIFICATION RESULT: INVALID / NOT PERMITTED */}
      {verificationResult?.status === 'invalid' && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50/60 p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-sm">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                  ENTRY / EXIT DENIED
                </span>
                <h4 className="text-base font-bold text-slate-900 font-display mt-0.5">
                  Gate Clearance Not Permitted
                </h4>
              </div>
            </div>
            {verificationResult.pass && (
              <span className="font-mono text-xs font-bold bg-white text-rose-900 border border-rose-300 px-3 py-1 rounded-xl">
                {verificationResult.pass.id}
              </span>
            )}
          </div>

          <p className="text-xs text-rose-900 font-medium leading-relaxed">
            {verificationResult.message}
          </p>

          {verificationResult.pass && (
            <div className="bg-white p-4 rounded-xl border border-rose-200 text-xs space-y-1">
              <p><strong>Student:</strong> {verificationResult.pass.studentName} ({verificationResult.pass.studentId})</p>
              <p><strong>Destination:</strong> {verificationResult.pass.destination}</p>
              <p><strong>Current Status:</strong> <span className="font-bold text-rose-700">{verificationResult.pass.status}</span></p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={resetForNextPass}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
              <span>Scan Next Pass</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
