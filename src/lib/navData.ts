
import type { NavItem } from './types';
import {
  LayoutDashboard, Users, UserCircle, Receipt, Briefcase, FileText, Sparkles,
  Mail, History, UserPlus, QrCode, CalendarCheck, // Added CalendarCheck
  CalendarDays, BookOpen, TrendingUp, ClipboardEdit, Printer,
  Megaphone, Send, Bus, Route, BarChart3, Settings, DollarSign, FileSearch
} from 'lucide-react'; // Removed Calculator, CreditCard, FileUp, CheckCircle, PieChart, Download

// Admin Nav Items based on the new image
export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', href: '/admin/students', icon: Users }, // Assuming /admin/students is the main view students page
  { title: 'Attendance', href: '/admin/attendance/student', icon: CalendarCheck }, // Points to student attendance, can be a new page later
  { title: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { title: 'Expenses', href: '/admin/expenses', icon: DollarSign }, // New item
  { title: 'Fee Notices', href: '/admin/fees/bulk-notice', icon: Receipt }, // Assuming bulk notice is the primary fee notice page
  { title: 'Reports', href: '/admin/reports/overview', icon: BarChart3 },
  // Settings is handled by the common footer in AppSidebar, but if it needs to be in main nav:
  // { title: 'Settings', href: '/admin/settings', icon: Settings },
];

// Student Nav Items (keeping existing structure, will inherit theme)
export const studentNavItems: NavItem[] = [
  { title: 'Profile', href: '/student/profile', icon: UserCircle },
  { title: 'Fee Notices', href: '/student/fee-notices', icon: Receipt },
  { title: 'Payment History', href: '/student/payments', icon: History },
  { title: 'Report Card', href: '/student/report-card', icon: FileSearch },
  { title: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { title: 'Circulars', href: '/student/circulars', icon: Megaphone },
];

// Staff Nav Items (keeping existing structure, will inherit theme)
export const staffNavItems: NavItem[] = [
  { title: 'Profile', href: '/staff/profile', icon: Briefcase },
  { title: 'Attendance', href: '/staff/attendance', icon: QrCode },
  { title: 'Marks Entry', href: '/staff/marks', icon: ClipboardEdit },
  { title: 'Timetable', href: '/staff/timetable', icon: CalendarDays },
  { title: 'Circulars', href: '/staff/circulars', icon: Megaphone },
];
