
import type { NavItem } from './types';
import {
  LayoutDashboard, Users, UserCircle, Receipt, Briefcase, FileText, Sparkles,
  Mail, Calculator, History, CreditCard, UserPlus, FileUp, CheckCircle, QrCode,
  CalendarDays, BookOpen, TrendingUp, ClipboardEdit, Printer, // Removed CalendarGrid
  Megaphone, Send, Bus, Route, BarChart3, PieChart, Download, Settings, DollarSign, FileSearch
} from 'lucide-react';

export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    title: 'Students',
    href: '/admin/students',
    icon: Users,
    children: [
      { title: 'View Students', href: '/admin/students', icon: Users },
      { title: 'Admission Mgmt', href: '/admin/admissions', icon: UserPlus },
      { title: 'Student Attendance', href: '/admin/attendance/student', icon: CalendarDays },
    ]
  },
  {
    title: 'Staff',
    href: '/admin/staff',
    icon: Briefcase,
    children: [
      { title: 'View Staff', href: '/admin/staff', icon: Briefcase },
      { title: 'Teacher Onboarding', href: '/admin/staff/onboard', icon: UserPlus },
      { title: 'Staff Attendance', href: '/admin/attendance/staff', icon: QrCode },
      { title: 'Staff Management', href: '/admin/staff-management', icon: Users },
    ]
  },
  {
    title: 'Academics',
    href: '/admin/academics',
    icon: BookOpen,
    children: [
      { title: 'Marks Entry', href: '/admin/marks', icon: ClipboardEdit },
      { title: 'Report Cards', href: '/admin/reports/report-cards', icon: Printer },
      { title: 'Timetable', href: '/admin/timetable', icon: CalendarDays }, // Changed from CalendarGrid
    ]
  },
  {
    title: 'Finance',
    href: '/admin/finance',
    icon: DollarSign,
    children: [
      { title: 'Fee Notices', href: '/admin/fees/bulk-notice', icon: Mail },
      { title: 'Payment History', href: '/admin/payments', icon: History },
    ]
  },
  {
    title: 'Communication',
    href: '/admin/communication',
    icon: Megaphone,
    children: [
      { title: 'Circulars/Notices', href: '/admin/circulars', icon: Megaphone },
      { title: 'Summarize Notices (AI)', href: '/admin/notices/summary', icon: Sparkles },
    ]
  },
  { title: 'Transport', href: '/admin/transport', icon: Bus },
  { title: 'Reports', href: '/admin/reports/overview', icon: BarChart3 },
  // Settings is handled by the common footer in AppSidebar
];

export const studentNavItems: NavItem[] = [
  { title: 'Profile', href: '/student/profile', icon: UserCircle },
  { title: 'Fee Notices', href: '/student/fee-notices', icon: Receipt },
  { title: 'Payment History', href: '/student/payments', icon: History },
  { title: 'Report Card', href: '/student/report-card', icon: FileSearch },
  { title: 'Timetable', href: '/student/timetable', icon: CalendarDays }, // Changed from CalendarGrid
  { title: 'Circulars', href: '/student/circulars', icon: Megaphone },
  // Settings is handled by the common footer in AppSidebar
];

export const staffNavItems: NavItem[] = [
  { title: 'Profile', href: '/staff/profile', icon: Briefcase },
  { title: 'Attendance', href: '/staff/attendance', icon: QrCode },
  { title: 'Marks Entry', href: '/staff/marks', icon: ClipboardEdit }, // Conditional based on role (e.g. teacher)
  { title: 'Timetable', href: '/staff/timetable', icon: CalendarDays }, // Changed from CalendarGrid
  { title: 'Circulars', href: '/staff/circulars', icon: Megaphone },
  // Settings is handled by the common footer in AppSidebar
];
