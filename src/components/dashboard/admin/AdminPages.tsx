import React, { useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  Building, 
  ScanLine, 
  Layers, 
  FileText, 
  Clock, 
  BarChart3, 
  FolderDown, 
  Settings, 
  User, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Download, 
  Check, 
  X,
  SlidersHorizontal,
  Flame,
  Activity,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Student, Parent, Warden, SecurityStaff, Hostel, OutpassRequest, PassType, PriorityLevel } from '../../../types';

export const AdminPages: React.FC = () => {
  const { 
    currentUser,
    activeAdminTab, 
    students, 
    parents, 
    wardens, 
    securityStaff, 
    hostels, 
    outpasses, 
    cancelOutpass,
    addStudent,
    deleteStudent,
    addWarden,
    addSecurityStaff,
    addToast
  } = useApp();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isDeleteStudentConfirm, setIsDeleteStudentConfirm] = useState<string | null>(null);
  const [isViewOutpassModal, setIsViewOutpassModal] = useState<OutpassRequest | null>(null);

  // New Student Form state
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Computer Science');
  const [newStudentYear, setNewStudentYear] = useState('2nd Year');
  const [newStudentHostel, setNewStudentHostel] = useState('Aryabhata Block');
  const [newStudentRoom, setNewStudentRoom] = useState('B-201');
  const [newStudentPhone, setNewStudentPhone] = useState('+91 98000 11223');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentParentPhone, setNewStudentParentPhone] = useState('+91 98000 44556');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newStudentName) return;

    addStudent({
      studentId: newStudentId,
      name: newStudentName,
      department: newStudentDept,
      year: newStudentYear,
      hostel: newStudentHostel,
      roomNo: newStudentRoom,
      phone: newStudentPhone,
      email: `${newStudentId.toLowerCase()}@student.edu`,
      parentName: newStudentParent || 'Guardian',
      parentPhone: newStudentParentPhone,
      parentEmail: 'parent@sample.com',
      accountStatus: 'Active'
    });

    setIsAddStudentOpen(false);
    setNewStudentId('');
    setNewStudentName('');
  };

  // --- SUBPAGE 1: DASHBOARD ---
  if (activeAdminTab === 'dashboard') {
    const pendingReqs = outpasses.filter(o => o.status.startsWith('Pending')).length;
    const activeOutside = outpasses.filter(o => o.status === 'Out of Campus').length;
    const lateReturns = outpasses.filter(o => o.status === 'Late Return' || o.isLate).length;
    const approvedCount = outpasses.filter(o => o.status === 'Approved').length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">System Overview</h2>
          <p className="text-xs text-slate-500">Actual student residency metrics and live outpass processing status.</p>
        </div>

        {/* Real System Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Registered Students</span>
            <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">{students.length}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Active enrolled</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Pending Requests</span>
            <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block tabular-nums">{pendingReqs}</span>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">Awaiting consent or signoff</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Students Outside</span>
            <span className="text-2xl font-bold font-mono text-blue-700 mt-1 block tabular-nums">{activeOutside}</span>
            <span className="text-[11px] text-blue-600 font-medium mt-1 block">Gate validated exit</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium block">Approved Gate Passes</span>
            <span className="text-2xl font-bold font-mono text-teal-700 mt-1 block tabular-nums">{approvedCount}</span>
            <span className="text-[11px] text-teal-600 font-medium mt-1 block">Ready for departure</span>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Outpass Requests</h3>
            <span className="text-xs text-slate-500 font-mono">Real-Time Database Records</span>
          </div>

          {outpasses.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No outpass requests yet.</p>
              <p className="text-xs text-slate-400 mt-1">When students apply for day passes or home leaves, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Pass Type</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Parent Status</th>
                    <th className="py-3 px-4">Warden Status</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outpasses.slice(0, 10).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{o.studentName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{o.studentId} · {o.roomNo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {o.passType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{o.destination}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${o.parentStatus === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {o.parentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${o.wardenStatus === 'Approved' ? 'text-teal-700' : 'text-amber-700'}`}>
                          {o.wardenStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setIsViewOutpassModal(o)}
                          className="text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SUBPAGE 2: MANAGE STUDENTS ---
  if (activeAdminTab === 'students') {
    const filtered = students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.roomNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchHostel = hostelFilter === 'All' || s.hostel === hostelFilter;
      return matchSearch && matchHostel;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Manage Registered Students</h2>
            <p className="text-xs text-slate-500">Configure hostel allocations, academic records, and parental contacts.</p>
          </div>
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Filter Hostel:</span>
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 bg-white"
            >
              <option value="All">All Hostels</option>
              <option value="Aryabhata Block">Aryabhata Block</option>
              <option value="Gargi Block">Gargi Block</option>
              <option value="C.V. Raman Block">C.V. Raman Block</option>
              <option value="Kalpana Chawla Block">Kalpana Chawla Block</option>
            </select>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No students found.</p>
              <p className="text-xs text-slate-400 mt-1">Use the "Add Student" button above to register student residents.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Student ID &amp; Name</th>
                    <th className="py-3 px-4">Department &amp; Year</th>
                    <th className="py-3 px-4">Hostel &amp; Room</th>
                    <th className="py-3 px-4">Parent Details</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{s.studentId} · {s.email}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{s.department}</span>
                        <span className="text-[10px] text-slate-500 block">{s.year}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900">{s.hostel}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Room {s.roomNo}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span>{s.parentName}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{s.parentPhone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {s.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => addToast('Edit Student', `Editing profile for ${s.name}`, 'info')}
                            className="p-1 text-slate-500 hover:text-slate-900"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setIsDeleteStudentConfirm(s.id)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Add New Student Profile</h3>
                <button onClick={() => setIsAddStudentOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Student ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 24CS099"
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Varun Teja"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <input
                      type="text"
                      value={newStudentDept}
                      onChange={(e) => setNewStudentDept(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hostel Block</label>
                    <select
                      value={newStudentHostel}
                      onChange={(e) => setNewStudentHostel(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white"
                    >
                      <option value="Aryabhata Block">Aryabhata Block</option>
                      <option value="Gargi Block">Gargi Block</option>
                      <option value="C.V. Raman Block">C.V. Raman Block</option>
                      <option value="Kalpana Chawla Block">Kalpana Chawla Block</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Room No</label>
                    <input
                      type="text"
                      value={newStudentRoom}
                      onChange={(e) => setNewStudentRoom(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Parent Phone</label>
                    <input
                      type="text"
                      value={newStudentParentPhone}
                      onChange={(e) => setNewStudentParentPhone(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-3 py-1.5 rounded-lg border text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold"
                  >
                    Save Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteStudentConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 text-center">
              <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Confirm Account Deletion</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete this student record? This action will archive historical outpasses.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsDeleteStudentConfirm(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteStudent(isDeleteStudentConfirm);
                    setIsDeleteStudentConfirm(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                >
                  Yes, Delete Record
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- SUBPAGE 3: MANAGE PARENTS ---
  if (activeAdminTab === 'parents') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Manage Guardian Accounts</h2>
          <p className="text-xs text-slate-500">Monitor parental verification status and direct consent credentials.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {parents.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No guardian accounts found.</p>
              <p className="text-xs text-slate-400 mt-1">Guardian profiles linked to registered student residents will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Parent Name</th>
                    <th className="py-3 px-4">Linked Student</th>
                    <th className="py-3 px-4">Phone &amp; Email</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Last Consent Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parents.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{p.studentName}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{p.studentId}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">{p.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          p.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.lastApprovalTime}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => addToast('Parent Verified', `Verification status confirmed for ${p.phone}`, 'info')}
                          className="text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SUBPAGE 4: MANAGE WARDENS ---
  if (activeAdminTab === 'wardens') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">Manage Hostel Wardens</h2>
            <p className="text-xs text-slate-500">Assign block proctors, track pending approval queues, and duty schedules.</p>
          </div>
        </div>

        {wardens.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs py-12 px-4 text-center">
            <Building className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No wardens registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Hostel block proctors will be listed here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wardens.map((w) => (
              <div key={w.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {w.wardenId}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {w.accountStatus}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{w.name}</h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">{w.assignedHostel}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p>Email: <span className="font-mono text-[11px] text-slate-800">{w.email}</span></p>
                  <p>Phone: <span className="font-mono text-[11px] text-slate-800">{w.phone}</span></p>
                  <p>Current Workload: <strong className="text-slate-900 font-bold">{w.currentWorkload} Pending Leaves</strong></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- SUBPAGE 5: MANAGE SECURITY STAFF ---
  if (activeAdminTab === 'security-staff') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Manage Gate Security Staff</h2>
          <p className="text-xs text-slate-500">Configure gate post assignments, shifts, and barcode turnstile devices.</p>
        </div>

        {securityStaff.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs py-12 px-4 text-center">
            <ScanLine className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No security staff registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Campus turnstile gate staff accounts will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {securityStaff.map((sec) => (
              <div key={sec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {sec.staffId}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    sec.activeStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {sec.activeStatus}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{sec.name}</h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">{sec.assignedGate}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p>Shift: <strong className="text-slate-900">{sec.shift}</strong></p>
                  <p>Contact: <span className="font-mono text-[11px] text-slate-800">{sec.phone}</span></p>
                  <p>Last Activity: <span className="font-mono text-[11px] text-slate-500">{sec.lastLogin}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- SUBPAGE 6: MANAGE HOSTELS ---
  if (activeAdminTab === 'hostels') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Manage Campus Hostels</h2>
          <p className="text-xs text-slate-500">Real-time capacity, live roll call occupancy, and block proctor assignments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostels.map((h) => {
            const occupancyPct = h.capacity > 0 ? Math.round((h.currentOccupancy / h.capacity) * 100) : 0;
            return (
              <div key={h.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{h.name}</h3>
                    <span className="text-xs text-slate-500">{h.building} · {h.type} Hostel</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {h.numberOfRooms} Rooms
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Live In-Premises Occupancy</span>
                    <span className="font-bold text-slate-900 font-mono">{h.currentOccupancy} / {h.capacity} ({occupancyPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Assigned Warden: <strong className="text-slate-900">{h.assignedWarden}</strong></span>
                  <span className="text-teal-700 font-semibold">{h.capacity - h.currentOccupancy} Capacity Available</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- SUBPAGE 7: OUTPASS MANAGEMENT ---
  if (activeAdminTab === 'outpass-management') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">All Outpass Applications</h2>
            <p className="text-xs text-slate-500">Master database of every student leave ticket across all campus wings.</p>
          </div>
          <button
            onClick={() => addToast('Export Generated', `Exported ${outpasses.length} outpass records.`, 'success')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {outpasses.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No outpass requests yet.</p>
              <p className="text-xs text-slate-400 mt-1">Leave applications submitted by students will appear in this log.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Pass ID &amp; Student</th>
                    <th className="py-3 px-4">Type &amp; Priority</th>
                    <th className="py-3 px-4">Destination &amp; Reason</th>
                    <th className="py-3 px-4">Expected Curfew</th>
                    <th className="py-3 px-4">Parent Status</th>
                    <th className="py-3 px-4">Warden Status</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outpasses.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{o.studentName}</span>
                        <span className="text-[10px] text-teal-700 font-mono">{o.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{o.passType}</span>
                        <span className="text-[10px] text-slate-400 block">{o.priority}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{o.destination}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{o.expectedReturnTime}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{o.parentStatus}</span>
                        {o.parentStatus === 'Approved' && (
                          <span className={`text-[10px] font-mono block ${o.parentOtpVerified ? 'text-emerald-700 font-bold' : 'text-amber-600 font-medium'}`}>
                            {o.parentOtpVerified ? '✓ OTP Verified' : 'Awaiting Student OTP'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{o.wardenStatus}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setIsViewOutpassModal(o)}
                          className="text-teal-700 hover:text-teal-900 font-semibold"
                        >
                          Inspect
                        </button>
                        {o.status !== 'Returned' && o.status !== 'Rejected' && (
                          <button
                            onClick={() => cancelOutpass(o.id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Outpass Details Modal */}
        {isViewOutpassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono text-teal-700 font-bold block">{isViewOutpassModal.id}</span>
                  <h3 className="font-bold text-slate-900 text-base">{isViewOutpassModal.studentName}</h3>
                </div>
                <button onClick={() => setIsViewOutpassModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p><strong>Hostel &amp; Room:</strong> {isViewOutpassModal.hostel} · {isViewOutpassModal.roomNo}</p>
                <p><strong>Destination:</strong> {isViewOutpassModal.destination}</p>
                <p><strong>Reason:</strong> {isViewOutpassModal.purpose}</p>
                <p><strong>Curfew Expected:</strong> {isViewOutpassModal.expectedReturnDate} at {isViewOutpassModal.expectedReturnTime}</p>
                <p><strong>Parent Status:</strong> {isViewOutpassModal.parentStatus} ({isViewOutpassModal.parentPhone})</p>
                {isViewOutpassModal.parentOtp && (
                  <p>
                    <strong>Security OTP:</strong> <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{isViewOutpassModal.parentOtp}</span> ({isViewOutpassModal.parentOtpVerified ? '✓ Verified by Student' : 'Pending Student Entry'})
                  </p>
                )}
                <p><strong>Warden Status:</strong> {isViewOutpassModal.wardenStatus}</p>
                <p><strong>QR Token:</strong> <span className="font-mono text-slate-900">{isViewOutpassModal.qrCodeToken}</span></p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setIsViewOutpassModal(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- SUBPAGE 8: APPROVAL MONITORING ---
  if (activeAdminTab === 'approval-monitoring') {
    const awaitingParent = outpasses.filter(o => o.parentStatus === 'Pending').length;
    const awaitingWarden = outpasses.filter(o => o.parentStatus === 'Approved' && o.wardenStatus === 'Pending').length;
    const overdueCount = outpasses.filter(o => o.status === 'Late Return' || o.isLate).length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Approval Bottleneck Telemetry</h2>
          <p className="text-xs text-slate-500">Monitor live wait times and pinpoint administrative delay points across hostel blocks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Awaiting Parent Verification</span>
            <span className="text-2xl font-bold font-mono text-amber-600 block">{awaitingParent} Requests</span>
            <p className="text-xs text-slate-500">Pending parental consent.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Awaiting Warden Review</span>
            <span className="text-2xl font-bold font-mono text-purple-600 block">{awaitingWarden} Requests</span>
            <p className="text-xs text-slate-500">Awaiting warden signoff.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold text-slate-500">Overdue Returns</span>
            <span className="text-2xl font-bold font-mono text-rose-600 block">{overdueCount} Flagged</span>
            <p className="text-xs text-slate-500">Late returns recorded.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBPAGE 9: ANALYTICS ---
  if (activeAdminTab === 'analytics') {
    const totalOutpasses = outpasses.length;
    const dayPassCount = outpasses.filter(o => o.passType === 'Day Pass').length;
    const homePassCount = outpasses.filter(o => o.passType === 'Home Pass').length;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Campus Movement Analytics</h2>
          <p className="text-xs text-slate-500">Data-driven indicators for hostel administration, mess inventory, and security.</p>
        </div>

        {totalOutpasses === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No activity recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Analytics will automatically aggregate as outpasses are processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500">Total Outpass Volume</span>
              <span className="text-2xl font-bold font-mono text-slate-900 block">{totalOutpasses}</span>
              <p className="text-[11px] text-slate-500">Cumulative applications filed.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500">Day Passes vs Home Passes</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-bold font-mono text-teal-700">{dayPassCount} Day</span>
                <span className="text-slate-300">/</span>
                <span className="text-lg font-bold font-mono text-indigo-700">{homePassCount} Home</span>
              </div>
              <p className="text-[11px] text-slate-500">Pass category breakdown.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs text-slate-500">Gate Turnstile Status</span>
              <span className="text-base font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Operational
              </span>
              <p className="text-[11px] text-slate-500">Real-time gate verification ready.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- SUBPAGE 10: REPORTS ---
  if (activeAdminTab === 'reports') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Generate Administrative Reports</h2>
          <p className="text-xs text-slate-500">Export periodic audit digests for university registrar and syndicate committee.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-xl">
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Report Timeframe</label>
              <select className="w-full p-2 border rounded-lg bg-white">
                <option>Today's Daily Movement Digest</option>
                <option>Weekly Curfew &amp; Late Return Analysis</option>
                <option>Monthly Mess Headcount &amp; Leave Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Hostel Wing</label>
              <select className="w-full p-2 border rounded-lg bg-white">
                <option>All Campus Hostels</option>
                <option>Aryabhata Block (Boys)</option>
                <option>Gargi Block (Girls)</option>
                <option>C.V. Raman Block (Boys)</option>
                <option>Kalpana Chawla Block (Girls)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => addToast('PDF Exported', 'Downloaded Daily_Outpass_Summary.pdf', 'success')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate PDF Summary</span>
            </button>
            <button
              onClick={() => addToast('CSV Exported', 'Downloaded Outpass_Movement_Log.csv', 'info')}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Raw CSV</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBPAGE 11: SYSTEM SETTINGS ---
  if (activeAdminTab === 'system-settings') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">System Configuration &amp; Policies</h2>
          <p className="text-xs text-slate-500">Curfew deadlines, QR code dynamic expiration intervals, and parental authorization rules.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-2xl text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Dynamic QR Code Token Rotation</span>
                <span className="text-slate-500 text-[11px]">Refreshes QR code every 60s to prevent screenshot sharing</span>
              </div>
              <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 font-semibold font-mono text-[10px]">Active (60s)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Direct Parent 1-Click Verification</span>
                <span className="text-slate-500 text-[11px]">Bypasses student OTP dictation via secure HMAC link</span>
              </div>
              <span className="px-2 py-1 rounded bg-teal-100 text-teal-800 font-semibold font-mono text-[10px]">Enforced</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="font-bold text-slate-900 block">Night Curfew Threshold</span>
                <span className="text-slate-500 text-[11px]">Standard hostel lock time for day passes</span>
              </div>
              <span className="font-mono font-bold text-slate-900">20:30 (08:30 PM)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- SUBPAGE 12: PROFILE ---
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-display">Admin Account Profile</h2>
        <p className="text-xs text-slate-500">Institutional administrator credentials and privilege scope.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <p><strong>Name:</strong> {currentUser?.name || 'System Administrator'}</p>
        <p><strong>Designation:</strong> System Administrator</p>
        <p><strong>Email:</strong> {currentUser?.email || 'admin@campus.edu'}</p>
        <p><strong>Role Permissions:</strong> Full Administrative Access</p>
      </div>
    </div>
  );
};
