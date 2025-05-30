
export type UserRole = 'admin' | 'student' | 'staff';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  children?: NavItem[];
}

// Student Dashboard Specific Types
export interface StudentProfile {
  name: string;
  avatarUrl: string;
  studentId: string;
  classSection: string;
}

export interface PendingFee {
  amount: string;
  dueDate: string;
  status: 'pending' | 'none' | 'overdue';
}

export interface NextClass {
  subject: string;
  time: string;
  teacher: string;
}

export interface StudentNotification {
  id: number;
  type: 'circular' | 'fee' | 'report' | 'event' | 'general';
  title: string;
  date: string;
  href: string;
  read?: boolean;
}

export interface QuickLink {
  title: string;
  href: string;
  icon: React.ElementType; // LucideIcon
  description: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  pendingFees: PendingFee;
  nextClass: NextClass;
  notifications: StudentNotification[];
}

// Student Fee Notices Types
export type FeeNoticeStatus = 'Pending' | 'Paid' | 'Overdue';

export interface FeeNotice {
  id: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: string; // Consider using Date object if more manipulation is needed
  status: FeeNoticeStatus;
  paymentLink?: string; // Optional, for a "Pay Now" button
}

// Student Report Card Types
export interface SubjectGrade {
  id: string;
  subjectName: string;
  grade: string; // e.g., "A+", "85%", "Good"
  marks?: number; // Optional, if you want to show specific marks
  maxMarks?: number; // Optional
  remarks?: string;
}

export interface ReportCardData {
  id: string;
  termName: string; // e.g., "Term 1 Examination - 2024"
  issueDate: string;
  subjects: SubjectGrade[];
  overallPercentage?: string;
  overallGrade?: string;
  classRank?: string;
  teacherComments?: string;
  downloadLink?: string; // Placeholder for PDF download
}

// Student Circulars Types
export interface Circular {
  id: string;
  title: string;
  date: string; // e.g., "2024-08-10"
  summary: string;
  category?: 'Academics' | 'Events' | 'Holidays' | 'Urgent' | 'General';
  attachmentLink?: string; // Optional URL to a PDF or document
}

// Student Timetable Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  period: number;
  timeSlot: string; // e.g., "09:00 AM - 09:45 AM"
  subject: string;
  teacher: string;
}

// Student Payment History Types
export interface PaymentRecord {
  id: string;
  paymentDate: string; // e.g., "2024-07-10"
  description: string; // e.g., "Term 1 Fees - 2024-2025"
  amountPaid: number;
  paymentMethod: string; // e.g., "Credit Card ending **** 1234"
  transactionId?: string;
  receiptLink?: string; // Optional URL to a receipt PDF
}


// Add more shared types here as needed
