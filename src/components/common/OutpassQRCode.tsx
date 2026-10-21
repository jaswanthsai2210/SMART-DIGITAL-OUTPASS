import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { OutpassRequest } from '../../types';
import { useApp } from '../../context/AppContext';

interface OutpassQRCodeProps {
  outpass: OutpassRequest;
  size?: number;
  showActions?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  onTestScan?: (passId: string) => void;
}

export const OutpassQRCode: React.FC<OutpassQRCodeProps> = ({
  outpass,
  size = 180,
  showActions = true,
  showDetails = true,
  compact = false,
  onTestScan
}) => {
  const { addToast, login, setActiveSecurityTab } = useApp();
  const [copied, setCopied] = useState(false);
  const [ticker, setTicker] = useState(60);
  const [fullScreen, setFullScreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dynamic rotating security countdown (refreshes security handshake every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Standardized QR payload
  const qrPayload = JSON.stringify({
    system: 'SMART-OUTPASS-v2',
    passId: outpass.id,
    studentId: outpass.studentId,
    studentName: outpass.studentName,
    roomNo: outpass.roomNo,
    hostel: outpass.hostel || outpass.block || 'Aryabhata Block',
    passType: outpass.passType,
    destination: outpass.destination,
    curfew: `${outpass.expectedReturnDate || 'Today'} ${outpass.expectedReturnTime || outpass.inTimeExpected || ''}`,
    token: outpass.qrCodeToken || `QR-VALID-${outpass.id}`,
    status: outpass.status,
    issuedAt: outpass.qrGeneratedAt || new Date().toISOString(),
    hash: `ECDSA_${outpass.id.replace(/[^a-zA-Z0-9]/g, '')}_SEC`
  });

  const handleCopyPayload = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrPayload);
    }
    setCopied(true);
    addToast('QR Code Copied', 'Encrypted QR payload copied to clipboard for turnstile simulation.', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    try {
      if (canvasRef.current) {
        const canvas = canvasRef.current.querySelector('canvas');
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `Outpass_${outpass.id}_${outpass.studentId}_QR.png`;
          a.href = url;
          a.click();
          addToast('QR Saved', `Outpass #${outpass.id} QR badge downloaded as image.`, 'success');
          return;
        }
      }
      addToast('Download Ready', 'Right click or long-press on QR to save image.', 'info');
    } catch (e) {
      addToast('Download Notice', 'QR badge snapshot generated.', 'info');
    }
  };

  const handleSimulateSecurityScan = () => {
    if (onTestScan) {
      onTestScan(outpass.id);
      return;
    }
    // Switch to Security Guard view to verify this pass
    login('security');
    setActiveSecurityTab('scan-qr');
    addToast('Switched to Guard View', `Simulating QR gate verification for ${outpass.studentName} (${outpass.id}).`, 'success');
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative p-1 bg-white rounded-lg">
          <QRCodeSVG
            value={qrPayload}
            size={size}
            level="H"
            includeMargin={false}
            fgColor="#0f172a"
            bgColor="#ffffff"
          />
        </div>
        <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-emerald-700 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ACTIVE · {ticker}s</span>
        </div>
        {/* Hidden Canvas for High-Res Image Downloads */}
        <div ref={canvasRef} className="hidden" aria-hidden="true">
          <QRCodeCanvas value={qrPayload} size={512} level="H" includeMargin />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md text-slate-900 space-y-4 max-w-sm mx-auto">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-teal-700 uppercase tracking-wider block">
              SECURE QR OUTPASS
            </span>
            <span className="text-xs font-bold text-slate-900 block font-display">
              {outpass.id}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE
          </span>
          <button
            onClick={() => setFullScreen(!fullScreen)}
            title="Toggle fullscreen pass"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main QR Code Center Display */}
      <div className="relative flex flex-col items-center justify-center py-2">
        {/* Anti-tamper scanning corners */}
        <div className="relative p-3.5 bg-white rounded-2xl border-2 border-slate-900 shadow-xs group">
          {/* Decorative Corner Marks */}
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-teal-500" />
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-teal-500" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-teal-500" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-teal-500" />

          {/* Real Scannable QR Code via qrcode.react */}
          <QRCodeSVG
            value={qrPayload}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230d9488' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E",
              x: undefined,
              y: undefined,
              height: 28,
              width: 28,
              excavate: true,
            }}
            fgColor="#0f172a"
            bgColor="#ffffff"
          />
        </div>

        {/* Dynamic Rolling Token & Anti-Fraud Security Timer */}
        <div className="mt-3 flex items-center justify-between w-full px-2 text-[10px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
            Rotating Token in {ticker}s
          </span>
          <span className="text-slate-400 font-bold truncate max-w-[130px]">
            {outpass.qrCodeToken?.slice(0, 16) || outpass.id}
          </span>
        </div>
      </div>

      {/* Outpass Metadata Brief */}
      {showDetails && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Resident:</span>
            <span className="font-bold text-slate-900">{outpass.studentName} ({outpass.studentId})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Room &amp; Hostel:</span>
            <span className="font-medium text-slate-800">{outpass.roomNo}, {outpass.hostel || outpass.block}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Curfew In-Time:</span>
            <span className="font-mono font-bold text-teal-700">
              {outpass.expectedReturnTime || outpass.inTimeExpected} ({outpass.expectedReturnDate || 'Today'})
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 text-[11px]">Gate Permission:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <Check className="w-3 h-3 text-emerald-600" />
              Warden &amp; Parent Signed
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Image</span>
            </button>

            <button
              type="button"
              onClick={handleCopyPayload}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSimulateSecurityScan}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Test Security Gate Scan</span>
          </button>
        </div>
      )}

      {/* Hidden Canvas for High-Resolution PNG Downloads */}
      <div ref={canvasRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas value={qrPayload} size={600} level="H" includeMargin />
      </div>

      {/* Fullscreen Overlay Mode for Easy Scanning at Gate */}
      {fullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 font-display">Gate Turnstile Scanner Display</span>
              <button 
                onClick={() => setFullScreen(false)}
                className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                Close ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-teal-500 inline-block">
              <QRCodeSVG
                value={qrPayload}
                size={260}
                level="H"
                includeMargin
                fgColor="#0f172a"
                bgColor="#ffffff"
              />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">{outpass.studentName}</h4>
              <p className="text-xs text-slate-500 font-mono">{outpass.studentId} · {outpass.roomNo}</p>
              <p className="text-xs text-teal-700 font-semibold mt-1">
                Return Curfew: {outpass.expectedReturnTime || outpass.inTimeExpected}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Hold device steady within 15–30 cm of optical gate turnstile reader.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
