import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, Check, Sun, Moon, AlertTriangle, X, ChevronRight } from 'lucide-react';

// --- HELPERS ---

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parse12HourTime(timeStr: string): { hour: string; minute: string; period: 'AM' | 'PM' } {
  const fallback = { hour: '04', minute: '30', period: 'PM' as const };
  if (!timeStr) return fallback;

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return fallback;

  let hour = match[1].padStart(2, '0');
  const minute = match[2];
  const period = match[3].toUpperCase() as 'AM' | 'PM';

  const hNum = parseInt(hour, 10);
  if (hNum < 1 || hNum > 12) hour = '12';

  return { hour, minute, period };
}

export function format12HourTime(hour: string, minute: string, period: 'AM' | 'PM'): string {
  const h = hour.padStart(2, '0');
  const m = minute.padStart(2, '0');
  return `${h}:${m} ${period}`;
}

export function time12To24(time12: string): string {
  const { hour, minute, period } = parse12HourTime(time12);
  let h = parseInt(hour, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${minute}`;
}

export function time24To12(time24: string): string {
  if (!time24) return '12:00 PM';
  const parts = time24.split(':');
  if (parts.length < 2) return '12:00 PM';
  let h = parseInt(parts[0], 10);
  const m = parts[1].padStart(2, '0');
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

export function timeToMinutes(timeStr: string): number {
  const { hour, minute, period } = parse12HourTime(timeStr);
  let h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export interface ScheduleValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateSchedule(
  passType: 'Day Pass' | 'Home Pass',
  departureDate: string,
  departureTime: string,
  expectedReturnDate: string,
  expectedReturnTime: string
): ScheduleValidationResult {
  const today = getTodayDateString();
  if (!departureDate) {
    return { isValid: false, message: 'Please select a departure date from the calendar.' };
  }
  if (departureDate < today) {
    return { isValid: false, message: 'Departure date cannot be in the past.' };
  }
  if (passType === 'Day Pass') {
    const depMins = timeToMinutes(departureTime);
    const retMins = timeToMinutes(expectedReturnTime);
    if (retMins <= depMins) {
      return { isValid: false, message: 'Return time must be after departure time on the same day.' };
    }
    return { isValid: true };
  } else {
    if (!expectedReturnDate) {
      return { isValid: false, message: 'Please select an expected return date.' };
    }
    if (expectedReturnDate < departureDate) {
      return { isValid: false, message: 'Return date cannot be earlier than departure date.' };
    }
    if (expectedReturnDate === departureDate) {
      const depMins = timeToMinutes(departureTime);
      const retMins = timeToMinutes(expectedReturnTime);
      if (retMins <= depMins) {
        return { isValid: false, message: 'Return time must be after departure time on the same day.' };
      }
    }
    return { isValid: true };
  }
}

// -------------------------------------------------------------
// Standard Date Picker Component (Calendar-based, native, no manual typing)
// -------------------------------------------------------------
interface DateSelectorProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (newDate: string) => void;
  minDate?: string;
  helperText?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  label,
  value,
  onChange,
  minDate = getTodayDateString(),
  helperText
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleOpenCalendar = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-slate-800 font-bold text-xs">
          {label}
        </label>
        {value && (
          <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60 font-semibold">
            {formatDateDisplay(value)}
          </span>
        )}
      </div>

      {/* Standard Calendar Date Input Container */}
      <div className="relative">
        <div
          onClick={handleOpenCalendar}
          className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-teal-500 rounded-xl cursor-pointer transition-colors shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {value ? formatDateDisplay(value) : 'Click to select from calendar'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                {value || 'YYYY-MM-DD'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCalendar();
            }}
            className="text-[11px] font-bold text-teal-700 bg-teal-100/70 hover:bg-teal-200/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <span>Open Calendar</span>
          </button>
        </div>

        {/* Browser native date input positioned for accessibility & direct calendar popover */}
        <input
          ref={dateInputRef}
          type="date"
          min={minDate}
          value={value}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-label={label}
        />
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// Standard Clock-Style Time Picker Component
// Features:
// - Clock-style radial dial interface for selecting hours & minutes by clicking
// - AM / PM toggle
// - No predefined dropdown presets (no 8:00 AM, 9:00 AM presets)
// - Click-to-select on the clock dial with interactive hand pointer
// - Accessible on both desktop and mobile
// -------------------------------------------------------------
interface TimeSelectorProps {
  label: string;
  value: string; // e.g. "04:30 PM"
  onChange: (newTime: string) => void;
  helperText?: string;
  isCurfew?: boolean;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  value,
  onChange,
  helperText,
  isCurfew = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clockMode, setClockMode] = useState<'hours' | 'minutes'>('hours');
  const clockRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const { hour, minute, period } = parse12HourTime(value);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Clock constants
  const clockSize = 220; // dial diameter
  const center = clockSize / 2; // 110
  const radius = 80; // distance of numbers from center

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Active numeric value
  const selectedHourNum = parseInt(hour, 10);
  const selectedMinuteNum = parseInt(minute, 10);

  // Calculate pointer angle (in degrees from top/12 o'clock)
  const currentAngle = clockMode === 'hours'
    ? ((selectedHourNum % 12) * 30)
    : (selectedMinuteNum * 6);

  // Handle direct click on clock dial (calculates angle and maps to hour or minute)
  const handleDialClick = (e: React.MouseEvent<SVGSVGElement | HTMLDivElement>) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - center;
    const clickY = e.clientY - rect.top - center;

    // Angle in degrees from 12 o'clock (top): 0 deg = 12 o'clock, clockwise
    let angleDeg = (Math.atan2(clickY, clickX) * (180 / Math.PI)) + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (clockMode === 'hours') {
      let chosenHour = Math.round(angleDeg / 30);
      if (chosenHour === 0) chosenHour = 12;
      if (chosenHour > 12) chosenHour = 12;
      onChange(format12HourTime(String(chosenHour), minute, period));
      // Automatically switch to minutes after selecting hour
      setTimeout(() => setClockMode('minutes'), 180);
    } else {
      let chosenMinute = Math.round(angleDeg / 6);
      if (chosenMinute >= 60) chosenMinute = 0;
      onChange(format12HourTime(hour, String(chosenMinute).padStart(2, '0'), period));
    }
  };

  const handleSelectHour = (h: number) => {
    onChange(format12HourTime(String(h), minute, period));
    setTimeout(() => setClockMode('minutes'), 180);
  };

  const handleSelectMinute = (m: number) => {
    onChange(format12HourTime(hour, String(m).padStart(2, '0'), period));
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    onChange(format12HourTime(hour, minute, newPeriod));
  };

  // Curfew warning check (Day passes after 08:30 PM require special signoff)
  const isLateCurfew = isCurfew && (
    period === 'PM' && (
      (selectedHourNum >= 9 && selectedHourNum !== 12) ||
      (selectedHourNum === 8 && selectedMinuteNum > 30)
    )
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-slate-800 font-bold text-xs">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          {isLateCurfew ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Late Curfew (&gt;8:30 PM)
            </span>
          ) : isCurfew ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              <Check className="w-3 h-3 text-emerald-600" />
              Standard Curfew
            </span>
          ) : null}
          <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60 font-bold">
            {value}
          </span>
        </div>
      </div>

      {/* Main Selectable Box Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-teal-500 rounded-xl cursor-pointer transition-colors shadow-2xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-700 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-slate-900 block">
                {value}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                period === 'AM' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {period}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">
              Click to select time on clock face
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="text-[11px] font-bold text-teal-700 bg-teal-100/70 hover:bg-teal-200/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <span>Select Time</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-500">{helperText}</p>
      )}

      {/* MODAL / POPOVER: Clock-Style Time Picker */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl max-w-xs w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Clock Header: Large digital interactive readout + AM/PM */}
            <div className="bg-slate-900 text-white p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400">
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Time Display with Clickable Hour & Minute buttons */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setClockMode('hours')}
                    className={`px-3 py-1.5 rounded-xl font-mono text-2xl font-black transition-all ${
                      clockMode === 'hours'
                        ? 'bg-teal-500 text-slate-950 shadow-sm ring-2 ring-teal-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {hour}
                  </button>

                  <span className="text-2xl font-bold font-mono text-slate-400">:</span>

                  <button
                    type="button"
                    onClick={() => setClockMode('minutes')}
                    className={`px-3 py-1.5 rounded-xl font-mono text-2xl font-black transition-all ${
                      clockMode === 'minutes'
                        ? 'bg-teal-500 text-slate-950 shadow-sm ring-2 ring-teal-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {minute}
                  </button>
                </div>

                {/* AM / PM Segmented Toggle */}
                <div className="flex flex-col bg-slate-800 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('AM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      period === 'AM'
                        ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('PM')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      period === 'PM'
                        ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="text-[11px] text-teal-300 font-medium">
                  {clockMode === 'hours'
                    ? 'Click any number to set Hour'
                    : 'Click any number to set Minutes'}
                </span>
              </div>
            </div>

            {/* Clock Dial Area */}
            <div className="p-4 flex flex-col items-center bg-slate-50">
              <div
                ref={clockRef}
                onClick={handleDialClick}
                className="relative rounded-full bg-white shadow-inner border border-slate-200 cursor-pointer select-none"
                style={{ width: `${clockSize}px`, height: `${clockSize}px` }}
              >
                {/* SVG Dial with Center Pivot and Pointer Hand */}
                <svg
                  width={clockSize}
                  height={clockSize}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Subtle outer tick marks */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius + 15}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="2, 6"
                  />

                  {/* Pointer Hand Line */}
                  {(() => {
                    const angleRad = ((currentAngle - 90) * Math.PI) / 180;
                    const handEndX = center + radius * Math.cos(angleRad);
                    const handEndY = center + radius * Math.sin(angleRad);
                    return (
                      <>
                        <line
                          x1={center}
                          y1={center}
                          x2={handEndX}
                          y2={handEndY}
                          stroke="#0d9488"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* Selector Disc at hand tip */}
                        <circle
                          cx={handEndX}
                          cy={handEndY}
                          r="16"
                          fill="#0d9488"
                          fillOpacity="0.2"
                          stroke="#0d9488"
                          strokeWidth="1.5"
                        />
                      </>
                    );
                  })()}

                  {/* Center Pivot Point */}
                  <circle cx={center} cy={center} r="4" fill="#0d9488" />
                </svg>

                {/* Clock Face Numbers: Clickable */}
                {clockMode === 'hours'
                  ? hoursList.map((h, i) => {
                      const angle = ((i * 30 - 90) * Math.PI) / 180;
                      const x = center + radius * Math.cos(angle);
                      const y = center + radius * Math.sin(angle);
                      const isSelected = selectedHourNum === h;

                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectHour(h);
                          }}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all z-10 ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-md scale-110 ring-2 ring-teal-300'
                              : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })
                  : minutesList.map((m, i) => {
                      const angle = ((i * 30 - 90) * Math.PI) / 180;
                      const x = center + radius * Math.cos(angle);
                      const y = center + radius * Math.sin(angle);
                      const isSelected = selectedMinuteNum === m;

                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectMinute(m);
                          }}
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all z-10 ${
                            isSelected
                              ? 'bg-teal-600 text-white shadow-md scale-110 ring-2 ring-teal-300'
                              : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          {String(m).padStart(2, '0')}
                        </button>
                      );
                    })}
              </div>

              {/* Mode switch pills below dial */}
              <div className="flex items-center gap-2 mt-4 w-full">
                <button
                  type="button"
                  onClick={() => setClockMode('hours')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    clockMode === 'hours'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Hours Dial ({hour})
                </button>
                <button
                  type="button"
                  onClick={() => setClockMode('minutes')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    clockMode === 'minutes'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Minutes Dial ({minute})
                </button>
              </div>

              {/* Action Buttons: Set & Close */}
              <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-slate-200">
                <span className="text-xs font-mono font-bold text-teal-800">
                  Selected: {value}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  Set Time
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ClockTimePicker = TimeSelector;
