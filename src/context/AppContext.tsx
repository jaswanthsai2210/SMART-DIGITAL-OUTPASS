import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserSession, 
  PublicPage, 
  OutpassRequest, 
  Student, 
  Parent, 
  Warden, 
  SecurityStaff, 
  Hostel, 
  TransportDelayReport, 
  MovementLog, 
  AppNotification, 
  ToastMessage,
  PassType,
  PriorityLevel,
  EmergencyAlert,
  ParentNotificationDispatch
} from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  providerConfigured?: boolean;
  expiresInSeconds?: number;
}

interface AppContextType {
  // Navigation & Auth State
  currentUser: UserSession | null;
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  activeStudentTab: string;
  setActiveStudentTab: (tab: string) => void;
  activeParentTab: string;
  setActiveParentTab: (tab: string) => void;
  activeWardenTab: string;
  setActiveWardenTab: (tab: string) => void;
  activeSecurityTab: string;
  setActiveSecurityTab: (tab: string) => void;
  
  // Real Auth Actions
  loginWithCredentials: (role: UserRole, identifier: string, password: string) => Promise<AuthResponse>;
  requestLoginOtp: (identifier: string, role: UserRole) => Promise<AuthResponse>;
  verifyLoginOtp: (identifier: string, code: string, role: UserRole) => Promise<AuthResponse>;
  login: (role: UserRole, identifier?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Data Collections (Clean Real Data)
  outpasses: OutpassRequest[];
  students: Student[];
  parents: Parent[];
  wardens: Warden[];
  securityStaff: SecurityStaff[];
  hostels: Hostel[];
  delayReports: TransportDelayReport[];
  movementLogs: MovementLog[];
  notifications: AppNotification[];
  toasts: ToastMessage[];
  emergencyAlerts: EmergencyAlert[];
  parentDispatches: ParentNotificationDispatch[];
  activeParentNotificationModal: ParentNotificationDispatch | null;
  setActiveParentNotificationModal: (dispatch: ParentNotificationDispatch | null) => void;

  // Mutators
  addOutpass: (data: Omit<OutpassRequest, 'id' | 'appliedAt' | 'status' | 'parentStatus' | 'wardenStatus' | 'qrCodeToken'>) => OutpassRequest;
  cancelOutpass: (id: string) => void;
  parentApproveOutpass: (id: string) => void;
  verifyStudentParentOtp: (outpassId: string, enteredOtp: string) => boolean;
  parentRejectOutpass: (id: string, reason: string) => void;
  wardenApproveOutpass: (id: string) => void;
  wardenRejectOutpass: (id: string, reason: string) => void;
  recordGateExit: (outpassId: string, gateName?: string) => boolean;
  recordGateReturn: (outpassId: string, isLate?: boolean, lateReason?: string) => boolean;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addWarden: (warden: Omit<Warden, 'id'>) => void;
  addSecurityStaff: (staff: Omit<SecurityStaff, 'id'>) => void;
  submitDelayReport: (report: Omit<TransportDelayReport, 'id' | 'submittedAt' | 'status'>) => void;
  triggerEmergencySos: (params: {
    emergencyType: EmergencyAlert['emergencyType'];
    message?: string;
    currentLocation?: EmergencyAlert['currentLocation'];
    outpassId?: string;
  }) => EmergencyAlert;
  resolveEmergencyAlert: (id: string, resolutionNote?: string) => void;
  openParentNotificationPreview: (outpassId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Clean generic role defaults for session switching
export const DEFAULT_ROLE_SESSIONS: Record<UserRole, UserSession> = {
  admin: {
    id: 'USR-ADMIN',
    name: 'System Administrator',
    email: 'admin@campus.edu',
    role: 'admin',
    assignedHostel: 'All Hostels'
  },
  student: {
    id: 'USR-STUDENT',
    name: 'Student Resident',
    email: 'student@campus.edu',
    role: 'student',
    studentId: 'STU2026',
    roomNo: 'A-101',
    assignedHostel: 'Aryabhata Block'
  },
  parent: {
    id: 'USR-PARENT',
    name: 'Registered Guardian',
    email: 'parent@campus.edu',
    phone: '9876543210',
    role: 'parent'
  },
  warden: {
    id: 'USR-WARDEN',
    name: 'Hostel Warden',
    email: 'warden@campus.edu',
    role: 'warden',
    assignedHostel: 'Aryabhata Block'
  },
  security: {
    id: 'USR-SECURITY',
    name: 'Security Gate Staff',
    email: 'security@campus.edu',
    role: 'security',
    gate: 'Main Campus Gate'
  }
};

// Kept for backward compatibility
export const PRESET_USERS = DEFAULT_ROLE_SESSIONS;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & User State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [publicPage, setPublicPage] = useState<PublicPage>('login');

  // Subpage states per role
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [activeStudentTab, setActiveStudentTab] = useState('dashboard');
  const [activeParentTab, setActiveParentTab] = useState('dashboard');
  const [activeWardenTab, setActiveWardenTab] = useState('dashboard');
  const [activeSecurityTab, setActiveSecurityTab] = useState('dashboard');

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clean Institutional Hostels (No fake students or metrics)
  const [hostels, setHostels] = useState<Hostel[]>([
    {
      id: 'HST-01',
      name: 'Aryabhata Block',
      building: 'Building A',
      capacity: 400,
      currentOccupancy: 0,
      assignedWarden: 'Hostel Warden',
      numberOfRooms: 100,
      type: 'Boys'
    },
    {
      id: 'HST-02',
      name: 'Gargi Block',
      building: 'Building B',
      capacity: 350,
      currentOccupancy: 0,
      assignedWarden: 'Hostel Warden',
      numberOfRooms: 90,
      type: 'Girls'
    }
  ]);

  // Clean empty state data collections - NO sample students or outpasses
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [securityStaff, setSecurityStaff] = useState<SecurityStaff[]>([]);
  const [outpasses, setOutpasses] = useState<OutpassRequest[]>([]);
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([]);
  const [delayReports, setDelayReports] = useState<TransportDelayReport[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [parentDispatches, setParentDispatches] = useState<ParentNotificationDispatch[]>([]);
  const [activeParentNotificationModal, setActiveParentNotificationModal] = useState<ParentNotificationDispatch | null>(null);

  // Fetch actual data from backend on mount
  useEffect(() => {
    fetch('/api/outpasses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: OutpassRequest[]) => {
        if (Array.isArray(data)) {
          setOutpasses(data);
        }
      })
      .catch(() => {});

    fetch('/api/movement-logs')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: MovementLog[]) => {
        if (Array.isArray(data)) {
          setMovementLogs(data);
        }
      })
      .catch(() => {});
  }, []);

  // ----------------------------------------------------
  // AUTHENTICATION ACTIONS
  // ----------------------------------------------------

  // Real password login via backend API
  const loginWithCredentials = async (
    role: UserRole,
    identifier: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Your email, ID, or password is incorrect.' };
      }

      setCurrentUser(data.user);
      addToast('Signed In', `Welcome, ${data.user.name}.`, 'success');
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Could not connect to authentication service. Please try again.' };
    }
  };

  // Request OTP via backend API
  const requestLoginOtp = async (identifier: string, role: UserRole): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send verification code.' };
      }

      return {
        success: true,
        message: data.message,
        providerConfigured: data.providerConfigured,
        expiresInSeconds: data.expiresInSeconds || 300
      };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Verify OTP via backend API
  const verifyLoginOtp = async (
    identifier: string,
    code: string,
    role: UserRole
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code, role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid verification code.' };
      }

      setCurrentUser(data.user);
      addToast('Verified', `Welcome, ${data.user.name}.`, 'success');
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Could not verify code. Please try again.' };
    }
  };

  // Fallback simple login
  const login = (role: UserRole, identifier?: string) => {
    const defaultUser = DEFAULT_ROLE_SESSIONS[role];
    setCurrentUser({
      ...defaultUser,
      email: identifier && identifier.includes('@') ? identifier : defaultUser.email,
      name: identifier && !identifier.includes('@') ? identifier : defaultUser.name
    });
    addToast('Signed In', `Welcome to the ${role} portal.`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    setPublicPage('login');
    addToast('Signed Out', 'You have been logged out securely.', 'info');
  };

  const switchRole = (role: UserRole) => {
    const session = DEFAULT_ROLE_SESSIONS[role];
    setCurrentUser(session);
    if (role === 'admin') setActiveAdminTab('dashboard');
    if (role === 'student') setActiveStudentTab('dashboard');
    if (role === 'parent') setActiveParentTab('dashboard');
    if (role === 'warden') setActiveWardenTab('dashboard');
    if (role === 'security') setActiveSecurityTab('dashboard');
    addToast('Role Switched', `Viewing ${role} dashboard.`, 'info');
  };

  // ----------------------------------------------------
  // OUTPASS ACTIONS
  // ----------------------------------------------------

  const addOutpass = (
    data: Omit<OutpassRequest, 'id' | 'appliedAt' | 'status' | 'parentStatus' | 'wardenStatus' | 'qrCodeToken'>
  ): OutpassRequest => {
    const newId = `OP-${Date.now().toString().slice(-6)}`;
    const newRequest: OutpassRequest = {
      ...data,
      id: newId,
      appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending Parent',
      parentStatus: 'Pending',
      wardenStatus: 'Pending',
      parentOtp: undefined,
      parentOtpVerified: false,
      qrCodeToken: undefined
    };

    setOutpasses((prev) => [newRequest, ...prev]);

    // Backend sync
    fetch('/api/outpasses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    }).catch(() => {});

    // Notification
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Outpass Submitted',
      message: `${newRequest.studentName} requested ${newRequest.passType} to ${newRequest.destination}.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      roleTarget: 'parent'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Create automated parent notification record
    const token = `CONSENT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newDispatch: ParentNotificationDispatch = {
      id: `DISP-${Date.now()}`,
      outpassId: newId,
      studentName: newRequest.studentName,
      studentId: newRequest.studentId,
      parentName: newRequest.parentName || 'Parent / Guardian',
      parentEmail: `${newRequest.parentName?.toLowerCase().replace(/\s+/g, '.') || 'parent'}@contact.com`,
      parentPhone: newRequest.parentPhone,
      passType: newRequest.passType,
      destination: newRequest.destination,
      departureTime: `${newRequest.departureDate || 'Today'} ${newRequest.departureTime || ''}`,
      expectedReturnTime: `${newRequest.expectedReturnDate || 'Today'} ${newRequest.expectedReturnTime || ''}`,
      channel: 'all',
      approvalToken: token,
      status: 'Delivered',
      timestamp: 'Just now',
      oneClickApprovalUrl: `/consent/${token}`
    };

    setParentDispatches((prev) => [newDispatch, ...prev]);
    addToast('Outpass Submitted', 'Request queued for guardian authorization.', 'success');
    return newRequest;
  };

  const cancelOutpass = (id: string) => {
    setOutpasses((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Rejected' as const } : o))
    );
    addToast('Outpass Cancelled', `Request #${id} was cancelled.`, 'info');
  };

  const parentApproveOutpass = (id: string) => {
    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              parentStatus: 'Approved' as const,
              status: 'Pending Warden' as const,
              parentOtpVerified: true
            }
          : o
      )
    );

    fetch(`/api/outpasses/${id}/parent-approve`, { method: 'POST' }).catch(() => {});
    addToast('Consent Recorded', `Parent approved pass #${id}. Queued for Warden review.`, 'success');
  };

  const verifyStudentParentOtp = (outpassId: string, enteredOtp: string): boolean => {
    if (!enteredOtp || enteredOtp.trim().length < 4) {
      addToast('Invalid Code', 'Please enter a valid verification code.', 'warning');
      return false;
    }
    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === outpassId
          ? { ...o, parentOtpVerified: true, status: 'Pending Warden' as const }
          : o
      )
    );
    addToast('Code Verified', 'Parent verification code accepted.', 'success');
    return true;
  };

  const parentRejectOutpass = (id: string, reason: string) => {
    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              parentStatus: 'Rejected' as const,
              status: 'Rejected' as const,
              parentRejectionReason: reason
            }
          : o
      )
    );

    fetch(`/api/outpasses/${id}/parent-reject`, { method: 'POST' }).catch(() => {});
    addToast('Request Declined', `Pass #${id} was declined by parent.`, 'info');
  };

  const wardenApproveOutpass = (id: string) => {
    const qrToken = `QR-${id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              wardenStatus: 'Approved' as const,
              status: 'Approved' as const,
              qrCodeToken: qrToken,
              qrGeneratedAt: new Date().toISOString()
            }
          : o
      )
    );

    fetch(`/api/outpasses/${id}/warden-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wardenName: currentUser?.name || 'Warden' })
    }).catch(() => {});

    addToast('Pass Approved', `Outpass #${id} approved. Gate QR Code is now active.`, 'success');
  };

  const wardenRejectOutpass = (id: string, reason: string) => {
    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              wardenStatus: 'Rejected' as const,
              wardenRejectionReason: reason,
              status: 'Rejected' as const
            }
          : o
      )
    );

    fetch(`/api/outpasses/${id}/warden-reject`, { method: 'POST' }).catch(() => {});
    addToast('Pass Rejected', `Outpass #${id} rejected by warden.`, 'info');
  };

  const recordGateExit = (outpassId: string, gateName = 'Main Campus Gate'): boolean => {
    const target = outpasses.find((o) => o.id === outpassId);
    if (!target) {
      addToast('Not Found', `Pass #${outpassId} not found.`, 'error');
      return false;
    }

    if (target.status !== 'Approved') {
      addToast('Cannot Exit', `Pass status is ${target.status}. Only Approved passes can exit.`, 'error');
      return false;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const officer = currentUser?.name || 'Gate Officer';

    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === outpassId
          ? { ...o, status: 'Out of Campus' as const, exitTimeRecorded: timeStr, gateExitRecordedBy: officer }
          : o
      )
    );

    const newLog: MovementLog = {
      id: `LOG-${Date.now()}`,
      outpassId,
      studentName: target.studentName,
      studentId: target.studentId,
      hostel: target.hostel || 'Main Block',
      roomNo: target.roomNo || 'Room 101',
      passType: target.passType,
      movementType: 'EXIT',
      timestamp: timeStr,
      gate: gateName,
      securityStaffName: officer
    };
    setMovementLogs((prev) => [newLog, ...prev]);

    fetch(`/api/outpasses/${outpassId}/gate-exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName: officer, gateName })
    }).catch(() => {});

    addToast('Exit Recorded', `${target.studentName} exited gate at ${timeStr}.`, 'success');
    return true;
  };

  const recordGateReturn = (outpassId: string, isLate = false, lateReason?: string): boolean => {
    const target = outpasses.find((o) => o.id === outpassId);
    if (!target) {
      addToast('Not Found', `Pass #${outpassId} not found.`, 'error');
      return false;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const officer = currentUser?.name || 'Gate Officer';

    setOutpasses((prev) =>
      prev.map((o) =>
        o.id === outpassId
          ? {
              ...o,
              status: 'Returned' as const,
              returnTimeRecorded: timeStr,
              gateReturnRecordedBy: officer,
              isLate,
              lateReason: lateReason || o.lateReason
            }
          : o
      )
    );

    const newLog: MovementLog = {
      id: `LOG-${Date.now()}`,
      outpassId,
      studentName: target.studentName,
      studentId: target.studentId,
      hostel: target.hostel || 'Main Block',
      roomNo: target.roomNo || 'Room 101',
      passType: target.passType,
      movementType: 'RETURN',
      timestamp: timeStr,
      gate: 'Main Campus Gate',
      securityStaffName: officer,
      isLateReturn: isLate
    };
    setMovementLogs((prev) => [newLog, ...prev]);

    fetch(`/api/outpasses/${outpassId}/gate-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerName: officer })
    }).catch(() => {});

    addToast('Return Recorded', `${target.studentName} checked in at ${timeStr}.`, 'success');
    return true;
  };

  // Administration CRUDs
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...studentData, id: `STU-${Date.now()}` };
    setStudents((prev) => [newStudent, ...prev]);
    addToast('Student Added', `${newStudent.name} registered.`, 'success');
  };

  const updateStudent = (id: string, partial: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
    addToast('Student Updated', 'Record updated.', 'info');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    addToast('Student Removed', 'Record deleted.', 'warning');
  };

  const addWarden = (wardenData: Omit<Warden, 'id'>) => {
    const newWarden: Warden = { ...wardenData, id: `WAR-${Date.now()}` };
    setWardens((prev) => [newWarden, ...prev]);
    addToast('Warden Added', `${newWarden.name} added.`, 'success');
  };

  const addSecurityStaff = (staffData: Omit<SecurityStaff, 'id'>) => {
    const newStaff: SecurityStaff = { ...staffData, id: `SEC-${Date.now()}` };
    setSecurityStaff((prev) => [newStaff, ...prev]);
    addToast('Staff Added', `${newStaff.name} added.`, 'success');
  };

  const submitDelayReport = (reportData: Omit<TransportDelayReport, 'id' | 'submittedAt' | 'status'>) => {
    const newReport: TransportDelayReport = {
      ...reportData,
      id: `DLY-${Date.now()}`,
      submittedAt: 'Just now',
      status: 'Pending Warden Review'
    };
    setDelayReports((prev) => [newReport, ...prev]);
    addToast('Report Filed', 'Transit delay report submitted to warden.', 'success');
  };

  const triggerEmergencySos = (params: {
    emergencyType: EmergencyAlert['emergencyType'];
    message?: string;
    currentLocation?: EmergencyAlert['currentLocation'];
    outpassId?: string;
  }): EmergencyAlert => {
    const stu = currentUser || DEFAULT_ROLE_SESSIONS.student;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const linkedPass = params.outpassId
      ? outpasses.find((o) => o.id === params.outpassId)
      : outpasses.find(
          (o) =>
            (o.studentId === stu.studentId || o.studentName === stu.name) &&
            (o.status === 'Out of Campus' || o.status === 'Approved')
        );

    const defaultLoc = {
      lat: 12.9716,
      lng: 77.5946,
      address: linkedPass?.destination
        ? `Near ${linkedPass.destination}`
        : 'Outside Campus Gate',
      accuracyMeters: 10
    };

    const newAlert: EmergencyAlert = {
      id: `SOS-${Date.now()}`,
      studentId: stu.studentId || 'Resident',
      studentName: stu.name || 'Student',
      roomNo: stu.roomNo || 'Room 101',
      hostel: stu.assignedHostel || 'Main Block',
      phone: stu.phone || '',
      timestamp: timeStr,
      currentLocation: params.currentLocation || defaultLoc,
      outpassId: linkedPass?.id,
      outpassDetails: linkedPass
        ? {
            passType: linkedPass.passType,
            destination: linkedPass.destination,
            expectedReturnTime: linkedPass.expectedReturnTime,
            expectedReturnDate: linkedPass.expectedReturnDate,
            status: linkedPass.status,
            emergencyContact: linkedPass.emergencyContact
          }
        : undefined,
      emergencyType: params.emergencyType,
      message: params.message || `Emergency reported by ${stu.name}.`,
      status: 'Active'
    };

    setEmergencyAlerts((prev) => [newAlert, ...prev]);

    const sosNotif: AppNotification = {
      id: `NOTIF-SOS-${Date.now()}`,
      title: `Emergency: ${newAlert.studentName}`,
      message: `${newAlert.emergencyType} reported at ${newAlert.currentLocation.address}.`,
      timestamp: 'Just now',
      read: false,
      type: 'alert',
      roleTarget: 'all'
    };
    setNotifications((prev) => [sosNotif, ...prev]);

    addToast('Emergency Signal Sent', 'Warden and security staff have been alerted.', 'error');
    return newAlert;
  };

  const resolveEmergencyAlert = (id: string, resolutionNote?: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const officer = currentUser?.name || 'Staff';

    setEmergencyAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'Resolved' as const,
              respondedBy: officer,
              respondedAt: timeStr,
              message: resolutionNote ? `${a.message} [Resolved: ${resolutionNote}]` : a.message
            }
          : a
      )
    );

    addToast('Resolved', 'Emergency alert has been resolved.', 'success');
  };

  const openParentNotificationPreview = (outpassId: string) => {
    const target = parentDispatches.find((d) => d.outpassId === outpassId) || parentDispatches[0];
    if (target) {
      setActiveParentNotificationModal(target);
    } else {
      addToast('Notification Ready', `Parent notification link ready for #${outpassId}.`, 'info');
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        publicPage,
        setPublicPage,
        activeAdminTab,
        setActiveAdminTab,
        activeStudentTab,
        setActiveStudentTab,
        activeParentTab,
        setActiveParentTab,
        activeWardenTab,
        setActiveWardenTab,
        activeSecurityTab,
        setActiveSecurityTab,
        loginWithCredentials,
        requestLoginOtp,
        verifyLoginOtp,
        login,
        logout,
        switchRole,
        outpasses,
        students,
        parents,
        wardens,
        securityStaff,
        hostels,
        delayReports,
        movementLogs,
        notifications,
        toasts,
        emergencyAlerts,
        parentDispatches,
        activeParentNotificationModal,
        setActiveParentNotificationModal,
        addOutpass,
        cancelOutpass,
        parentApproveOutpass,
        verifyStudentParentOtp,
        parentRejectOutpass,
        wardenApproveOutpass,
        wardenRejectOutpass,
        recordGateExit,
        recordGateReturn,
        addStudent,
        updateStudent,
        deleteStudent,
        addWarden,
        addSecurityStaff,
        submitDelayReport,
        triggerEmergencySos,
        resolveEmergencyAlert,
        openParentNotificationPreview,
        markNotificationRead,
        markAllNotificationsRead,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
