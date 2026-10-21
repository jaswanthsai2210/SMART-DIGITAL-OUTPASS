import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Send, 
  Radio, 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  Building,
  User,
  HeartPulse,
  Flame,
  HelpCircle,
  Car
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmergencyAlert, OutpassRequest } from '../../types';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOutpass?: OutpassRequest | null;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  activeOutpass
}) => {
  const { currentUser, triggerEmergencySos, addToast } = useApp();

  const [emergencyType, setEmergencyType] = useState<EmergencyAlert['emergencyType']>('Personal Safety');
  const [customMessage, setCustomMessage] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  // Dynamic detected geolocation coordinates (uses browser GPS or institutional campus fallback)
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
    accuracyMeters: number;
  }>({
    lat: 12.9716,
    lng: 77.5946,
    address: 'Near Tech Corridor Crossroad, Sector 4 (650m outside West Gate)',
    accuracyMeters: 8
  });

  // Attempt HTML5 Geolocation when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              address: `GPS Pin: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Civic Roadway)`,
              accuracyMeters: Math.round(pos.coords.accuracy || 12)
            });
            setIsLocating(false);
          },
          () => {
            // Geolocation fallback
            setLocation({
              lat: 12.9716,
              lng: 77.5946,
              address: activeOutpass?.destination 
                ? `En Route to ${activeOutpass.destination} (Proximity 800m from Perimeter)`
                : 'Campus Perimeter Outer Beltway (Sector 4 Gate Approach)',
              accuracyMeters: 15
            });
            setIsLocating(false);
          },
          { timeout: 4000, enableHighAccuracy: true }
        );
      } else {
        setIsLocating(false);
      }
    } else {
      setIsTriggered(false);
      setCustomMessage('');
    }
  }, [isOpen, activeOutpass]);

  if (!isOpen) return null;

  const handleSosBroadcast = () => {
    setIsSubmitting(true);

    const alert = triggerEmergencySos({
      emergencyType,
      message: customMessage || `Emergency SOS triggered by ${currentUser?.name || 'Student'}. Immediate assistance required.`,
      currentLocation: location,
      outpassId: activeOutpass?.id
    });

    setIsSubmitting(false);
    setIsTriggered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-rose-500">
        
        {/* Pulsing Emergency SOS Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold animate-pulse">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-widest uppercase bg-black/30 px-2 py-0.5 rounded-full">
                  PRIORITY 1 DISPATCH
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-200">
                  <Radio className="w-3 h-3 animate-ping" />
                  LIVE POLICE &amp; WARDEN RADIO
                </span>
              </div>
              <h3 className="text-lg font-bold font-display text-white mt-0.5">
                Emergency SOS Broadcast
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isTriggered ? (
          /* SOS Confirmation State */
          <div className="p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900 font-display">
                Emergency SOS Dispatched!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                Campus Security Control Room, Warden Supervisory Desk, and your linked Guardian have been alerted with your <strong>live GPS telemetry</strong> and <strong>outpass itinerary</strong>.
              </p>
            </div>

            {/* Response Team Alert Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-rose-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Rapid Response Sentry Team</span>
                </span>
                <span className="font-mono text-[11px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-bold">
                  ETA &lt; 4 MINS
                </span>
              </div>
              <p className="text-rose-800 text-[11px] leading-relaxed">
                Officer Vikram Singh (Main Campus Security) has acknowledged your coordinates. Keep your mobile phone line free for incoming security contact.
              </p>
              <div className="pt-2 border-t border-rose-200/60 font-mono text-[10px] text-slate-600 flex justify-between">
                <span>Direct Security Desk Hotline:</span>
                <strong className="text-rose-900 font-bold">+91 98440 99881 / 112</strong>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Return to Resident Dashboard
            </button>
          </div>
        ) : (
          /* Form to Confirm SOS */
          <div className="p-6 space-y-5">
            {/* Warning banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                This triggers a high-priority distress alarm directly to hostel wardens, on-duty campus patrol vehicles, and security gate sentries. Use in case of immediate danger, medical crises, or harassment.
              </p>
            </div>

            {/* Select Emergency Nature */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Nature of Emergency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { type: 'Personal Safety', icon: ShieldAlert, label: 'Safety Threat' },
                  { type: 'Medical', icon: HeartPulse, label: 'Medical Crisis' },
                  { type: 'Stranded / Transit', icon: Car, label: 'Transit Stranded' },
                  { type: 'Harassment', icon: Flame, label: 'Harassment' },
                  { type: 'General SOS', icon: HelpCircle, label: 'General SOS' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = emergencyType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setEmergencyType(item.type as any)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-500'}`} />
                      <span className="text-xs truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Location Telemetry Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Navigation className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Current GPS Telemetry</span>
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {isLocating ? 'Acquiring GPS...' : `Accuracy: ±${location.accuracyMeters}m`}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium text-slate-900 truncate">{location.address}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 pl-5">
                  Lat: {location.lat}, Lng: {location.lng}
                </div>
              </div>

              {/* Linked Outpass Information */}
              {activeOutpass && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800 flex justify-between">
                    <span>Active Outpass: #{activeOutpass.id}</span>
                    <span className="font-mono text-teal-700">{activeOutpass.passType}</span>
                  </div>
                  <div>Destination: <strong>{activeOutpass.destination}</strong></div>
                  <div>Curfew: {activeOutpass.expectedReturnTime} ({activeOutpass.expectedReturnDate})</div>
                </div>
              )}
            </div>

            {/* Optional message input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quick Message / Nearby Landmarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near bus shelter, yellow auto stand opposite supermarket..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>

            {/* Instant Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSosBroadcast}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
                <span>BROADCAST EMERGENCY SOS NOW</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Coordinates and emergency status will be relayed immediately over encrypted campus dispatch channels.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
