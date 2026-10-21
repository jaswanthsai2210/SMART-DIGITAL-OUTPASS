import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogOut, 
  Search, 
  Bell, 
  Menu, 
  X, 
  User, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Home,
  Users,
  GraduationCap,
  Building,
  ScanLine,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  Send,
  SlidersHorizontal,
  FolderDown,
  Layers,
  HeartHandshake,
  AlertOctagon,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { 
    currentUser, 
    logout, 
    switchRole,
    notifications,
    emergencyAlerts,
    markNotificationRead,
    markAllNotificationsRead,
    activeAdminTab,
    setActiveAdminTab,
    activeStudentTab,
    setActiveStudentTab,
    activeParentTab,
    setActiveParentTab,
    activeWardenTab,
    setActiveWardenTab,
    activeSecurityTab,
    setActiveSecurityTab
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  const role = currentUser.role;

  // Active Tab & Setter mapping
  const currentTab = 
    role === 'admin' ? activeAdminTab :
    role === 'student' ? activeStudentTab :
    role === 'parent' ? activeParentTab :
    role === 'warden' ? activeWardenTab :
    activeSecurityTab;

  const setCurrentTab = (tab: string) => {
    if (role === 'admin') setActiveAdminTab(tab);
    else if (role === 'student') setActiveStudentTab(tab);
    else if (role === 'parent') setActiveParentTab(tab);
    else if (role === 'warden') setActiveWardenTab(tab);
    else if (role === 'security') setActiveSecurityTab(tab);
    setSidebarOpen(false);
  };

  // Role Nav Items definition
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Manage Students', icon: GraduationCap },
    { id: 'parents', label: 'Manage Parents', icon: HeartHandshake },
    { id: 'wardens', label: 'Manage Wardens', icon: Building },
    { id: 'security-staff', label: 'Manage Security Staff', icon: ScanLine },
    { id: 'hostels', label: 'Manage Hostels', icon: Layers },
    { id: 'outpass-management', label: 'Outpass Management', icon: FileText },
    { id: 'approval-monitoring', label: 'Approval Monitoring', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FolderDown },
    { id: 'system-settings', label: 'System Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'apply-outpass', label: 'Apply for Outpass', icon: Send },
    { id: 'my-outpasses', label: 'My Outpasses', icon: FileText },
    { id: 'live-queue', label: 'Live Queue Status', icon: Clock },
    { id: 'delay-report', label: 'Transport Delay Report', icon: AlertCircle },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'help', label: 'Help & Curfew Rules', icon: HelpCircle },
  ];

  const parentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pending-approvals', label: 'Pending Approvals', icon: Clock },
    { id: 'approval-history', label: 'Approval History', icon: FileText },
    { id: 'student-details', label: 'Student Details', icon: GraduationCap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const wardenNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pending-requests', label: 'Pending Requests', icon: Clock },
    { id: 'approved-requests', label: 'Approved Requests', icon: ShieldCheck },
    { id: 'live-queue', label: 'Live Queue', icon: SlidersHorizontal },
    { id: 'student-movement', label: 'Student Movement', icon: Users },
    { id: 'hostel-occupancy', label: 'Hostel Occupancy', icon: Building },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const securityNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'scan-qr', label: 'Scan QR Code', icon: ScanLine },
    { id: 'exit-verification', label: 'Exit Verification', icon: Check },
    { id: 'return-verification', label: 'Return Verification', icon: Clock },
    { id: 'active-outpasses', label: 'Active Outpasses', icon: Users },
    { id: 'late-returns', label: 'Late Returns', icon: AlertCircle },
    { id: 'movement-history', label: 'Movement History', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const navItems = 
    role === 'admin' ? adminNav :
    role === 'student' ? studentNav :
    role === 'parent' ? parentNav :
    role === 'warden' ? wardenNav :
    securityNav;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleColor = (r: UserRole) => {
    switch (r) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'student': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'warden': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'security': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight font-display">
                Smart Digital Outpass
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {currentUser.assignedHostel || currentUser.gate || 'Institutional Portal'}
              </span>
            </div>
          </div>

          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ml-2 ${getRoleColor(role)}`}>
            {role.toUpperCase()}
          </span>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search outpasses, students, gates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100/80 text-xs rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
          />
        </div>

        {/* Right: Actions, Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Role Switcher Button (Crucial for Viva Presentation) */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors"
              title="Quickly switch role to test multi-user workflow"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Switch Role</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role (Demo)
                </div>
                {(['admin', 'student', 'parent', 'warden', 'security'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                      role === r ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="capitalize">{r} Dashboard</span>
                    {role === r && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} new)</span>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-teal-700 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications.</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.read ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 font-bold text-xs flex items-center justify-center">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 block truncate">{currentUser.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono block truncate">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>View Account Profile</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Workspace Body with Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between 
          transform transition-transform duration-200 ease-in-out lg:transform-none border-r border-slate-800
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          
          <div className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
              {role.toUpperCase()} NAVIGATION
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Status Card */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs space-y-1">
              <span className="text-[10px] font-mono text-teal-400 block font-semibold">
                SYSTEM TELEMETRY · DEMO
              </span>
              <p className="text-[11px] text-slate-300">
                Gate turnstiles and parent SMS webhooks connected.
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>

        </aside>

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Dynamic Main Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Subtle Demo Banner & Breadcrumb */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="capitalize">{role} Portal</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-slate-900 capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Live Simulation · Demo Data
              </span>
            </div>
          </div>

          {children}

        </main>

      </div>

    </div>
  );
};
