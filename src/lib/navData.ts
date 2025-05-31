
import type { NavItem } from './types';
import {
  LayoutDashboard, Users, UserCircle, Receipt, Briefcase, FileText, Sparkles,
  Mail, History, UserPlus, QrCode, CalendarCheck, UserCheck, // Added UserCheck
  CalendarDays, BookOpen, TrendingUp, ClipboardEdit, Printer,
  Megaphone, Send, Bus, Route, BarChart3, Settings, DollarSign, FileSearch, MessageSquare
} from 'lucide-react';

// Admin Nav Items based on the new image
export const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Students', href: '/admin/students', icon: Users },
  { title: 'Staff', href: '/admin/staff', icon: Briefcase },
  { title: 'Student Attendance', href: '/admin/attendance/student', icon: CalendarCheck }, // Renamed
  { title: 'Staff Attendance', href: '/admin/attendance/staff', icon: UserCheck }, // Added
  { title: 'Admissions', href: '/admin/admissions', icon: UserPlus },
  { title: 'Timetable', href: '/admin/timetable', icon: CalendarDays },
  { title: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  { title: 'Fee Notices', href: '/admin/fees/bulk-notice', icon: Receipt },
  { title: 'Payment History', href: '/admin/payments', icon: History },
  { title: 'Circulars', href: '/admin/circulars', icon: Megaphone },
  { title: 'Notice Summarizer (AI)', href: '/admin/notices/summary', icon: Sparkles },
  { title: 'Reports', href: '/admin/reports/overview', icon: BarChart3 },
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

