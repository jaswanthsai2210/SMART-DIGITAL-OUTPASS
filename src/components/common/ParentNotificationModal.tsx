import React, { useState } from 'react';
import { 
  Mail, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Bell, 
  ChevronRight, 
  X,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { ParentNotificationDispatch } from '../../types';
import { useApp } from '../../context/AppContext';

interface ParentNotificationModalProps {
  notification: ParentNotificationDispatch | null;
  onClose: () => void;
}

export const ParentNotificationModal: React.FC<ParentNotificationModalProps> = ({
  notification,
  onClose
}) => {
  const { parentApproveOutpass, parentRejectOutpass, addToast } = useApp();
  const [activeChannel, setActiveChannel] = useState<'email' | 'push' | 'sms'>('email');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!notification) return null;

  const handleOneClickApprove = () => {
    setIsProcessing(true);
    setTimeout(() => {
      parentApproveOutpass(notification.outpassId);
      setIsProcessing(false);
      addToast(
        'One-Click Approval Successful',
        `Parent verified outpass #${notification.outpassId}. Parental security OTP generated.`,
        'success'
      );
      onClose();
    }, 400);
  };

  const handleOneClickDecline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      parentRejectOutpass(notification.outpassId, 'Declined by parent via instant notification link.');
      setIsProcessing(false);
      addToast(
        'Request Declined',
        `Outpass #${notification.outpassId} was declined by parent.`,
        'info'
      );
      onClose();
    }, 400);
  };

  const copyApprovalLink = () => {
    navigator.clipboard?.writeText(window.location.origin + notification.oneClickApprovalUrl);
    setCopiedLink(true);
    addToast('Link Copied', 'Direct one-click approval token copied.', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header with Notification Delivery Status */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                  AUTOMATED PARENT NOTIFICATION
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DELIVERED
                </span>
              </div>
              <h3 className="text-base font-bold font-display text-white mt-0.5">
                Outpass Consent Dispatch
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Simulator (Email / Push / SMS) */}
        <div className="bg-slate-100/80 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Preview Recipient View:</span>
          <div className="flex bg-slate-200 p-0.5 rounded-xl font-semibold">
            <button
              onClick={() => setActiveChannel('email')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                activeChannel === 'email' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-teal-600" />
              <span>Email Preview</span>
            </button>
            <button
              onClick={() => setActiveChannel('push')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                activeChannel === 'push' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Push Notification</span>
            </button>
            <button
              onClick={() => setActiveChannel('sms')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 text-xs ${
                activeChannel === 'sms' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>SMS Direct</span>
            </button>
          </div>
        </div>

        {/* Channel View Content */}
        <div className="p-6 space-y-5">
          {activeChannel === 'email' && (
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              {/* Email Client Simulated Header */}
              <div className="pb-3 border-b border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>From: <strong className="text-slate-800">Campus Outpass Safety Desk &lt;outpass-safety@campus.edu&gt;</strong></span>
                  <span className="font-mono">{notification.timestamp}</span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  To: <strong className="text-slate-800">{notification.parentName} &lt;{notification.parentEmail || 'guardian@parent.com'}&gt;</strong>
                </div>
                <div className="pt-1 font-bold text-slate-900 text-sm">
                  Action Required: Outpass Approval for {notification.studentName} ({notification.studentId})
                </div>
              </div>

              {/* Email Body */}
              <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                <p>
                  Dear <strong>{notification.parentName}</strong>,
                </p>
                <p>
                  Your ward <strong>{notification.studentName}</strong> has submitted an application for a <strong>{notification.passType}</strong>. Please review the departure details and approve or decline with a single click below.
                </p>

                {/* Details Card */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <strong className="text-slate-900">{notification.destination}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Departure:</span>
                    <span className="font-mono text-slate-800 font-semibold">{notification.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Curfew Return:</span>
                    <span className="font-mono text-teal-700 font-bold">{notification.expectedReturnTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outpass ID:</span>
                    <span className="font-mono text-slate-700">{notification.outpassId}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Dual-Factor Anti-Fraud: Approving will immediately generate a 6-digit security OTP to your phone ({notification.parentPhone}) which your ward must verify.
                </p>
              </div>

              {/* 1-Click Action Buttons inside Email */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleOneClickApprove}
                  disabled={isProcessing}
                  className="w-full sm:flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1-Click Approve Outpass</span>
                </button>
                <button
                  type="button"
                  onClick={handleOneClickDecline}
                  disabled={isProcessing}
                  className="w-full sm:w-auto py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {activeChannel === 'push' && (
            <div className="max-w-sm mx-auto bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CAMPUS RESIDENT SAFETY</span>
                </span>
                <span>Just Now</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Outpass Consent Requested</h4>
                <p className="text-xs text-slate-300 leading-snug">
                  {notification.studentName} requested {notification.passType} to {notification.destination}. Return curfew {notification.expectedReturnTime}. Tap to authorize.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleOneClickDecline}
                  disabled={isProcessing}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-xs rounded-xl transition-colors"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={handleOneClickApprove}
                  disabled={isProcessing}
                  className="py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve Now</span>
                </button>
              </div>
            </div>
          )}

          {activeChannel === 'sms' && (
            <div className="max-w-sm mx-auto bg-slate-100 rounded-3xl p-4 border border-slate-300 shadow-xs space-y-3">
              <div className="text-center">
                <span className="text-[10px] font-mono font-bold text-slate-500 block">
                  SMS · SENDER: CAMPUS-ALERT
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Delivered to {notification.parentPhone}
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-2xs text-xs text-slate-800 space-y-2 leading-relaxed">
                <p>
                  ALERT: {notification.studentName} ({notification.studentId}) applied for {notification.passType} to {notification.destination}.
                </p>
                <p className="text-teal-700 font-bold font-mono">
                  Return Curfew: {notification.expectedReturnTime}
                </p>
                <p className="text-[11px] text-slate-600">
                  Tap below for Instant 1-Click Parent Approval:
                </p>
                <button
                  onClick={handleOneClickApprove}
                  className="text-teal-600 underline font-mono text-[11px] block break-all text-left font-bold"
                >
                  https://outpass.campus.edu/consent/{notification.approvalToken}
                </button>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleOneClickApprove}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Tap 1-Click Link
                </button>
              </div>
            </div>
          )}

          {/* Copy Direct Web Link Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
              Token: {notification.approvalToken}
            </span>
            <button
              type="button"
              onClick={copyApprovalLink}
              className="text-teal-700 font-semibold hover:underline flex items-center gap-1 text-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Direct Token'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Automated Outpass Dispatch Engine v2.4</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
};
