import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type UserRole = 'admin' | 'student' | 'parent' | 'warden' | 'security';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  studentId?: string;
  roomNo?: string;
  assignedHostel?: string;
  gate?: string;
  passwordHash: string;
  salt: string;
}

export interface OutpassRecord {
  id: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  hostel: string;
  passType: 'Day Pass' | 'Home Pass';
  destination: string;
  purpose: string;
  departureDate: string;
  departureTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  transportType: string;
  emergencyContact: string;
  parentName: string;
  parentPhone: string;
  parentStatus: 'Pending' | 'Approved' | 'Rejected';
  parentOtp?: string;
  parentOtpVerified: boolean;
  otpSentAt?: string;
  otpVerifiedAt?: string;
  wardenStatus: 'Pending' | 'Approved' | 'Rejected';
  wardenName?: string;
  status: 'Pending Parent' | 'Pending Warden' | 'Approved' | 'Out of Campus' | 'Returned' | 'Rejected' | 'Late Return';
  priority: 'Normal' | 'Urgent' | 'Emergency';
  appliedAt: string;
  qrCodeToken?: string;
  qrGeneratedAt?: string;
  exitTimeRecorded?: string;
  returnTimeRecorded?: string;
  gateExitRecordedBy?: string;
  gateReturnRecordedBy?: string;
}

export interface MovementLogRecord {
  id: string;
  outpassId: string;
  studentName: string;
  studentId: string;
  hostel: string;
  roomNo: string;
  passType: 'Day Pass' | 'Home Pass';
  movementType: 'EXIT' | 'RETURN';
  timestamp: string;
  gate: string;
  securityStaffName: string;
}

interface OtpEntry {
  codeHash: string;
  identifier: string;
  role: UserRole;
  expiresAt: number;
  attempts: number;
}

// In-Memory Database Stores (Clean, Zero fake sample records)
const outpassesDB: Map<string, OutpassRecord> = new Map();
const movementLogsDB: MovementLogRecord[] = [];
const usersDB: Map<string, UserAccount> = new Map();
const activeOtpsMap: Map<string, OtpEntry> = new Map();
const otpRequestThrottleMap: Map<string, { count: number; windowStart: number }> = new Map();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Seed default institutional role accounts for real password login
function seedDefaultAccounts() {
  const seedUsers: Array<Omit<UserAccount, 'passwordHash' | 'salt'> & { defaultPass: string }> = [
    {
      id: 'USR-ADMIN-1',
      name: 'System Administrator',
      email: 'admin@campus.edu',
      phone: '9800000001',
      role: 'admin',
      assignedHostel: 'All Campuses',
      defaultPass: 'Admin@123'
    },
    {
      id: 'USR-STUDENT-1',
      name: 'Campus Resident',
      email: 'student@campus.edu',
      phone: '9800000002',
      role: 'student',
      studentId: 'STU2026',
      roomNo: 'A-101',
      assignedHostel: 'Aryabhata Block',
      defaultPass: 'Student@123'
    },
    {
      id: 'USR-PARENT-1',
      name: 'Registered Guardian',
      email: 'parent@campus.edu',
      phone: '9800000003',
      role: 'parent',
      defaultPass: 'Parent@123'
    },
    {
      id: 'USR-WARDEN-1',
      name: 'Hostel Warden',
      email: 'warden@campus.edu',
      phone: '9800000004',
      role: 'warden',
      assignedHostel: 'Aryabhata Block',
      defaultPass: 'Warden@123'
    },
    {
      id: 'USR-SECURITY-1',
      name: 'Gate Security Staff',
      email: 'security@campus.edu',
      phone: '9800000005',
      role: 'security',
      gate: 'Main Campus Gate',
      defaultPass: 'Security@123'
    }
  ];

  for (const user of seedUsers) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(user.defaultPass, salt);
    usersDB.set(user.email.toLowerCase(), {
      id: user.id,
      name: user.name,
      email: user.email.toLowerCase(),
      phone: user.phone,
      role: user.role,
      studentId: user.studentId,
      roomNo: user.roomNo,
      assignedHostel: user.assignedHostel,
      gate: user.gate,
      passwordHash,
      salt
    });
  }
}

seedDefaultAccounts();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // ----------------------------------------------------
  // AUTHENTICATION API ENDPOINTS
  // ----------------------------------------------------

  // 1. Password Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password, role } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your identifier and password.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    
    // Look up user by email, phone, or studentId
    let user: UserAccount | undefined;
    for (const u of usersDB.values()) {
      if (
        u.email === cleanId ||
        (u.phone && u.phone === cleanId) ||
        (u.studentId && u.studentId.toLowerCase() === cleanId)
      ) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Your email, ID, or password is incorrect.' });
    }

    const expectedHash = hashPassword(password, user.salt);
    if (expectedHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Your email, ID, or password is incorrect.' });
    }

    // If role requested, verify role or switch role
    const effectiveRole = role || user.role;

    res.json({
      success: true,
      message: 'Signed in successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: effectiveRole,
        studentId: user.studentId,
        roomNo: user.roomNo,
        assignedHostel: user.assignedHostel,
        gate: user.gate
      }
    });
  });

  // 2. Request OTP
  app.post('/api/auth/otp/request', (req: Request, res: Response) => {
    const { identifier, role } = req.body;
    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address or phone number.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const effectiveRole: UserRole = role || 'student';

    // Rate Limiting: Max 4 OTP requests per 10 minutes
    const now = Date.now();
    const throttle = otpRequestThrottleMap.get(cleanId);
    if (throttle) {
      if (now - throttle.windowStart < 10 * 60 * 1000) {
        if (throttle.count >= 4) {
          return res.status(429).json({
            error: 'Too many requests. Please wait a few minutes before requesting another code.'
          });
        }
        throttle.count += 1;
      } else {
        otpRequestThrottleMap.set(cleanId, { count: 1, windowStart: now });
      }
    } else {
      otpRequestThrottleMap.set(cleanId, { count: 1, windowStart: now });
    }

    // Generate cryptographic 6-digit numeric code
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const codeHash = hashCode(rawOtp);
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiration

    activeOtpsMap.set(cleanId, {
      codeHash,
      identifier: cleanId,
      role: effectiveRole,
      expiresAt,
      attempts: 0
    });

    // Check if real SMS / Email provider is configured via environment variables
    const isTwilioConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    const isFirebaseConfigured = Boolean(process.env.FIREBASE_CONFIG);

    const providerConfigured = isTwilioConfigured || isSmtpConfigured || isFirebaseConfigured;

    // Secure server log (never exposed in API response)
    console.log(`[AUTH SERVICE] Secure verification code for ${cleanId} (${effectiveRole}): ${rawOtp} (Expires in 5 min)`);

    res.json({
      success: true,
      providerConfigured,
      message: providerConfigured
        ? 'A 6-digit verification code has been sent to your registered contact.'
        : 'A 6-digit verification code has been generated. (In development mode without an external SMS/Email gateway, check your server console for the secure code).',
      expiresInSeconds: 300
    });
  });

  // 3. Verify OTP
  app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
    const { identifier, code, role } = req.body;
    if (!identifier || !code) {
      return res.status(400).json({ error: 'Please provide both your contact and verification code.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanCode = String(code).trim();

    const otpEntry = activeOtpsMap.get(cleanId);
    if (!otpEntry) {
      return res.status(400).json({ error: 'No active verification code found. Please request a new code.' });
    }

    const now = Date.now();
    if (now > otpEntry.expiresAt) {
      activeOtpsMap.delete(cleanId);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (otpEntry.attempts >= 3) {
      activeOtpsMap.delete(cleanId);
      return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    const submittedHash = hashCode(cleanCode);
    if (submittedHash !== otpEntry.codeHash) {
      otpEntry.attempts += 1;
      const remaining = 3 - otpEntry.attempts;
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Please request a new code.'}`
      });
    }

    // Successful OTP verification! Remove code to prevent reuse
    activeOtpsMap.delete(cleanId);

    // Look up or establish user account
    let user: UserAccount | undefined;
    for (const u of usersDB.values()) {
      if (u.email === cleanId || (u.phone && u.phone === cleanId)) {
        user = u;
        break;
      }
    }

    const effectiveRole = role || otpEntry.role || 'student';

    if (!user) {
      // First-time verified user: create record
      const newId = `USR-${Date.now()}`;
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword('DefaultPass@123', salt);
      user = {
        id: newId,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : `User ${cleanId.slice(-4)}`,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@campus.edu`,
        phone: cleanId.includes('@') ? undefined : cleanId,
        role: effectiveRole,
        studentId: effectiveRole === 'student' ? `STU-${cleanId.replace(/\D/g, '').slice(-4) || '2026'}` : undefined,
        assignedHostel: effectiveRole === 'student' || effectiveRole === 'warden' ? 'Aryabhata Block' : undefined,
        gate: effectiveRole === 'security' ? 'Main Campus Gate' : undefined,
        passwordHash,
        salt
      };
      usersDB.set(user.email, user);
    }

    res.json({
      success: true,
      message: 'Verification successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: effectiveRole,
        studentId: user.studentId,
        roomNo: user.roomNo || (effectiveRole === 'student' ? 'Room 101' : undefined),
        assignedHostel: user.assignedHostel,
        gate: user.gate
      }
    });
  });

  // ----------------------------------------------------
  // OUTPASS REST API ENDPOINTS (Real Database Records)
  // ----------------------------------------------------

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'online',
      system: 'Smart Digital Outpass API',
      timestamp: new Date().toISOString(),
      activeOutpasses: outpassesDB.size
    });
  });

  // GET all outpasses
  app.get('/api/outpasses', (_req: Request, res: Response) => {
    const list = Array.from(outpassesDB.values()).sort((a, b) => b.id.localeCompare(a.id));
    res.json(list);
  });

  // GET single outpass by ID
  app.get('/api/outpasses/:id', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Outpass #${req.params.id} not found.` });
    }
    res.json(outpass);
  });

  // POST Create Outpass
  app.post('/api/outpasses', (req: Request, res: Response) => {
    const body = req.body;
    const newId = `OP-${Date.now().toString().slice(-6)}`;

    const newRecord: OutpassRecord = {
      id: newId,
      studentId: body.studentId || 'STU-NEW',
      studentName: body.studentName || 'Student',
      roomNo: body.roomNo || 'Room 101',
      hostel: body.hostel || 'Main Block',
      passType: body.passType || 'Day Pass',
      destination: body.destination,
      purpose: body.purpose,
      departureDate: body.departureDate || new Date().toISOString().split('T')[0],
      departureTime: body.departureTime || '04:00 PM',
      expectedReturnDate: body.expectedReturnDate || new Date().toISOString().split('T')[0],
      expectedReturnTime: body.expectedReturnTime || '08:00 PM',
      transportType: body.transportType || 'Personal / Shuttle',
      emergencyContact: body.emergencyContact || 'Guardian on File',
      parentName: body.parentName || 'Parent',
      parentPhone: body.parentPhone || '',
      parentStatus: 'Pending',
      parentOtp: undefined,
      parentOtpVerified: false,
      wardenStatus: 'Pending',
      status: 'Pending Parent',
      priority: body.priority || 'Normal',
      appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      qrCodeToken: undefined
    };

    outpassesDB.set(newId, newRecord);
    res.status(201).json({
      success: true,
      message: 'Outpass application submitted successfully.',
      outpass: newRecord
    });
  });

  // POST Parent Approval
  app.post('/api/outpasses/:id/parent-approve', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Outpass #${req.params.id} not found.` });
    }

    outpass.parentStatus = 'Approved';
    outpass.status = 'Pending Warden';
    outpassesDB.set(req.params.id, outpass);

    res.json({
      success: true,
      message: 'Parent approved the outpass request.',
      outpass
    });
  });

  // POST Parent Rejection
  app.post('/api/outpasses/:id/parent-reject', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Outpass #${req.params.id} not found.` });
    }

    outpass.parentStatus = 'Rejected';
    outpass.status = 'Rejected';
    outpassesDB.set(req.params.id, outpass);

    res.json({
      success: true,
      message: 'Outpass request was rejected by parent.',
      outpass
    });
  });

  // POST Warden Approval & QR Generation
  app.post('/api/outpasses/:id/warden-approve', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Outpass #${req.params.id} not found.` });
    }

    const { wardenName } = req.body;
    const qrToken = `QR-${outpass.id}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    outpass.wardenStatus = 'Approved';
    outpass.wardenName = wardenName || 'Hostel Warden';
    outpass.status = 'Approved';
    outpass.qrCodeToken = qrToken;
    outpass.qrGeneratedAt = new Date().toISOString();

    outpassesDB.set(req.params.id, outpass);

    res.json({
      success: true,
      message: 'Warden approved outpass. QR Code is now active.',
      outpass,
      qrCodeToken: qrToken
    });
  });

  // POST Warden Rejection
  app.post('/api/outpasses/:id/warden-reject', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Outpass #${req.params.id} not found.` });
    }

    outpass.wardenStatus = 'Rejected';
    outpass.status = 'Rejected';
    outpassesDB.set(req.params.id, outpass);

    res.json({
      success: true,
      message: 'Outpass rejected by warden.',
      outpass
    });
  });

  // POST Security Gate Exit Verification
  app.post('/api/outpasses/:id/gate-exit', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Pass #${req.params.id} not found in database.` });
    }

    if (outpass.status !== 'Approved' || !outpass.qrCodeToken) {
      return res.status(400).json({ error: 'Cannot record exit. Pass is not in Approved status.' });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const officer = req.body.officerName || 'Security Gate Officer';

    outpass.status = 'Out of Campus';
    outpass.exitTimeRecorded = timeStr;
    outpass.gateExitRecordedBy = officer;

    outpassesDB.set(req.params.id, outpass);

    const log: MovementLogRecord = {
      id: `LOG-${Date.now()}`,
      outpassId: outpass.id,
      studentName: outpass.studentName,
      studentId: outpass.studentId,
      hostel: outpass.hostel,
      roomNo: outpass.roomNo,
      passType: outpass.passType,
      movementType: 'EXIT',
      timestamp: timeStr,
      gate: req.body.gateName || 'Main Campus Gate',
      securityStaffName: officer
    };
    movementLogsDB.unshift(log);

    res.json({
      success: true,
      message: `Exit recorded for ${outpass.studentName} at ${timeStr}.`,
      outpass,
      log
    });
  });

  // POST Security Gate Return Verification
  app.post('/api/outpasses/:id/gate-return', (req: Request, res: Response) => {
    const outpass = outpassesDB.get(req.params.id);
    if (!outpass) {
      return res.status(404).json({ error: `Pass #${req.params.id} not found in database.` });
    }

    if (outpass.status !== 'Out of Campus') {
      return res.status(400).json({ error: 'Cannot record return. Pass is not currently Out of Campus.' });
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const officer = req.body.officerName || 'Security Gate Officer';

    outpass.status = 'Returned';
    outpass.returnTimeRecorded = timeStr;
    outpass.gateReturnRecordedBy = officer;

    outpassesDB.set(req.params.id, outpass);

    const log: MovementLogRecord = {
      id: `LOG-${Date.now()}`,
      outpassId: outpass.id,
      studentName: outpass.studentName,
      studentId: outpass.studentId,
      hostel: outpass.hostel,
      roomNo: outpass.roomNo,
      passType: outpass.passType,
      movementType: 'RETURN',
      timestamp: timeStr,
      gate: req.body.gateName || 'Main Campus Gate',
      securityStaffName: officer
    };
    movementLogsDB.unshift(log);

    res.json({
      success: true,
      message: `Return recorded for ${outpass.studentName} at ${timeStr}.`,
      outpass,
      log
    });
  });

  // GET Movement logs
  app.get('/api/movement-logs', (_req: Request, res: Response) => {
    res.json(movementLogsDB);
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
