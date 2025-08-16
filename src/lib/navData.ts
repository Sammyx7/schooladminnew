
import type { NavItem } from './types';
import {
  LayoutDashboard, Users, UserCircle, Receipt, Briefcase, FileText, Sparkles,
  Mail, History, UserPlus, QrCode, CalendarCheck, UserCheck, 
  CalendarDays, BookOpen, TrendingUp, ClipboardEdit, Printer,
  Megaphone, Send, Bus, Route, BarChart3, Settings, DollarSign, FileSearch, MessageSquare, GraduationCap
} from 'lucide-react';

// Admin Nav Items
export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', href: '/admin/students', icon: Users },
  { title: 'Staff', href: '/admin/staff', icon: Briefcase }, 
  { title: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { title: 'Teacher Onboarding', href: '/admin/staff/onboard', icon: UserPlus },
  { title: 'Student Attendance', href: '/admin/attendance/student', icon: CalendarCheck },
  { title: 'Staff Attendance', href: '/admin/attendance/staff', icon: UserCheck },
  { title: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { title: 'Circulars', href: '/admin/circulars', icon: Megaphone },
  { title: 'Transport', href: '/admin/transport', icon: Bus },
  { title: 'Fee Notices', href: '/admin/fees/bulk-notice', icon: Receipt },
  { title: 'Payment History', href: '/admin/payments', icon: History },
  { title: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  { title: 'Marks Entry', href: '/admin/marks', icon: ClipboardEdit }, 
  { 
    title: 'Reports', 
    href: '/admin/reports/overview', 
    icon: BarChart3,
    children: [
      { title: 'Overview', href: '/admin/reports/overview', icon: BarChart3 },
      { title: 'Report Cards', href: '/admin/reports/report-cards', icon: FileText },
      { title: 'Fee Summary', href: '/admin/reports/fee-summary', icon: DollarSign },
      { title: 'Demographics', href: '/admin/reports/demographics', icon: Users },
    ]
  },
];

// Staff Nav Items
export const staffNavItems: NavItem[] = [
  { title: 'Profile', href: '/staff/profile', icon: Briefcase },
  { title: 'Attendance', href: '/staff/attendance', icon: QrCode },
  { title: 'Marks Entry', href: '/staff/marks', icon: ClipboardEdit },
  { title: 'Timetable', href: '/staff/timetable', icon: CalendarDays },
  { title: 'Circulars', href: '/staff/circulars', icon: Megaphone },
];


// Student Nav Items
export const studentNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Fee Notices', href: '/student/fees', icon: Receipt },
  { title: 'Payment History', href: '/student/payments', icon: History },
  { title: 'Report Card', href: '/student/report-card', icon: GraduationCap },
  { title: 'Timetable', href: '/student/timetable', icon: CalendarDays },
  { title: 'Circulars', href: '/student/circulars', icon: Megaphone },
];
