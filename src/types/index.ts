export type UserRole = 'admin' | 'student' | 'parent' | 'warden' | 'security';

export type PublicPage = 'home' | 'about' | 'features' | 'how-it-works' | 'login';

export type PassType = 'Day Pass' | 'Home Pass';
export type PassStatus = 
  | 'Pending Parent' 
  | 'Pending Warden' 
  | 'Approved' 
  | 'Out of Campus' 
  | 'Returned' 
  | 'Rejected' 
  | 'Late Return'
  | 'Expired';

export type PriorityLevel = 'Normal' | 'Urgent' | 'Emergency';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  assignedHostel?: string;
  studentId?: string;
  roomNo?: string;
  gate?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  hostel: string;
  roomNo: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  accountStatus: 'Active' | 'Suspended';
}

export interface Parent {
  id: string;
  name: string;
  studentName: string;
  studentId: string;
  phone: string;
  email: string;
  verificationStatus: 'Verified' | 'Pending';
  lastApprovalTime: string;
  accountStatus: 'Active' | 'Inactive';
}

export interface Warden {
  id: string;
  wardenId: string;
  name: string;
  email: string;
  phone: string;
  assignedHostel: string;
  currentWorkload: number;
  accountStatus: 'Active' | 'On Leave';
}

export interface SecurityStaff {
  id: string;
  staffId: string;
  name: string;
  assignedGate: string;
  shift: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 06:00)';
  phone: string;
  activeStatus: 'Active' | 'Off Duty';
  lastLogin: string;
}

export interface MetricAnalysisRow {
  metric: string;
  purpose: string;
  exampleInsight: string;
  impactScore: 'High' | 'Critical' | 'Medium';
}

export interface WorkflowStep {
  step: number;
  title: string;
  actor: 'Student' | 'Parent' | 'Warden' | 'Security Gate' | 'Analytics Engine';
  description: string;
  detail: string;
}

export interface ProblemStep {
  step: number;
  label: string;
  bottleneck?: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  building: string;
  capacity: number;
  currentOccupancy: number;
  assignedWarden: string;
  numberOfRooms: number;
  type: 'Boys' | 'Girls';
}

export interface OutpassRequest {
  id: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  hostel?: string;
  block?: string;
  passType: PassType;
  destination: string;
  purpose: string;
  departureDate?: string;
  departureTime?: string;
  expectedReturnDate?: string;
  expectedReturnTime?: string;
  outTimeExpected?: string;
  inTimeExpected?: string;
  transportType?: string;
  emergencyContact?: string;
  notes?: string;
  parentName: string;
  parentPhone: string;
  parentStatus: 'Approved' | 'Pending' | 'Rejected';
  parentResponseTime?: string;
  parentRejectionReason?: string;
  parentOtp?: string;
  parentOtpVerified?: boolean;
  otpSentAt?: string;
  otpVerifiedAt?: string;
  wardenStatus: 'Approved' | 'Pending' | 'Rejected';
  wardenName?: string;
  wardenRejectionReason?: string;
  status: PassStatus;
  priority: PriorityLevel;
  appliedAt: string;
  qrCodeToken?: string;
  qrGeneratedAt?: string;
  exitTimeRecorded?: string;
  returnTimeRecorded?: string;
  gateExitRecordedBy?: string;
  gateReturnRecordedBy?: string;
  isLate?: boolean;
  lateReason?: string;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
}

export interface TransportDelayReport {
  id: string;
  outpassId: string;
  studentId: string;
  studentName: string;
  transportType: string;
  carrierNumber: string; // e.g. Bus 142 or Train #12951
  scheduledDepartureTime: string;
  actualMissedTime: string;
  reason: string;
  remarks?: string;
  submittedAt: string;
  status: 'Reviewed' | 'Pending Warden Review';
}

export interface MovementLog {
  id: string;
  outpassId: string;
  studentName: string;
  studentId: string;
  hostel: string;
  roomNo: string;
  passType: PassType;
  movementType: 'EXIT' | 'RETURN';
  timestamp: string;
  gate: string;
  securityStaffName: string;
  isLateReturn?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  roleTarget: UserRole | 'all';
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface EmergencyAlert {
  id: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  hostel: string;
  phone: string;
  timestamp: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    accuracyMeters?: number;
  };
  outpassId?: string;
  outpassDetails?: {
    passType: PassType;
    destination: string;
    expectedReturnTime?: string;
    expectedReturnDate?: string;
    status: PassStatus;
    emergencyContact?: string;
  };
  emergencyType: 'Medical' | 'Personal Safety' | 'Stranded / Transit' | 'Harassment' | 'General SOS';
  message: string;
  status: 'Active' | 'Dispatched' | 'Resolved';
  respondedBy?: string;
  respondedAt?: string;
}

export interface ParentNotificationDispatch {
  id: string;
  outpassId: string;
  studentName: string;
  studentId: string;
  parentName: string;
  parentEmail?: string;
  parentPhone: string;
  passType: PassType;
  destination: string;
  departureTime: string;
  expectedReturnTime: string;
  channel: 'email' | 'push' | 'sms' | 'all';
  approvalToken: string;
  status: 'Delivered' | 'Pending' | 'ApprovedViaLink' | 'RejectedViaLink';
  timestamp: string;
  oneClickApprovalUrl: string;
}
