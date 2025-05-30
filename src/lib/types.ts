
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

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
  avatarUrl?: string;
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
  subjectIcon?: LucideIcon;
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
  icon: React.ElementType;
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
  dueDate: string;
  status: FeeNoticeStatus;
  paymentLink?: string;
}

// Student Report Card Types
export interface SubjectGrade {
  id: string;
  subjectName: string;
  grade: string;
  marks?: number;
  maxMarks?: number;
  remarks?: string;
}

export interface ReportCardData {
  id: string;
  termName: string;
  issueDate: string;
  subjects: SubjectGrade[];
  overallPercentage?: string;
  overallGrade?: string;
  classRank?: string;
  teacherComments?: string;
  downloadLink?: string;
}

// Circulars Types (Used by both Student and Admin)
export const circularCategories = ["Academics", "Events", "Holidays", "Urgent", "General"] as const;
export type CircularCategory = typeof circularCategories[number];

export interface Circular {
  id: string;
  title: string;
  date: string;
  summary: string;
  category?: CircularCategory;
  attachmentLink?: string;
}

export const CreateCircularSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters long." }),
  category: z.enum(circularCategories, { errorMap: () => ({ message: "Please select a category." }) }),
  attachmentLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});
export type CreateCircularFormValues = z.infer<typeof CreateCircularSchema>;


// Student Timetable Types
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableEntry {
  id: string;
  day: DayOfWeek;
  period: number;
  timeSlot: string;
  subject: string;
  teacher: string;
}

// Student Payment History Types
export interface PaymentRecord {
  id: string;
  paymentDate: string;
  description: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId?: string;
  receiptLink?: string;
}

// Admin Bulk Fee Notice Types
export const BulkFeeNoticeFormSchema = z.object({
  noticeTitle: z.string().min(5, { message: "Notice title must be at least 5 characters." }),
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  dueDate: z.date({
    required_error: "Due date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  targetClasses: z.string().min(1, { message: "Please specify at least one target class/section." }),
  additionalNotes: z.string().optional(),
});

export type BulkFeeNoticeFormValues = z.infer<typeof BulkFeeNoticeFormSchema>;

export interface BulkFeeNoticeDefinition extends BulkFeeNoticeFormValues {
  id: string;
  generatedDate: string; // ISO string date
}

// Admin Admissions Management Types
export const applicationStatuses = ['Pending Review', 'Approved', 'Rejected', 'Waitlisted', 'Interview Scheduled'] as const;
export type ApplicationStatus = typeof applicationStatuses[number];

export const StudentApplicationFormSchema = z.object({
  applicantName: z.string().min(3, { message: "Applicant name must be at least 3 characters." }),
  classAppliedFor: z.string().min(1, { message: "Class applied for is required." }),
  applicationDate: z.date({
    required_error: "Application date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  // Optional fields, can be expanded
  parentName: z.string().optional(),
  parentEmail: z.string().email({ message: "Invalid email address."}).optional().or(z.literal('')),
  parentPhone: z.string().optional(),
});

export type StudentApplicationFormValues = z.infer<typeof StudentApplicationFormSchema>;

export interface StudentApplication extends StudentApplicationFormValues {
  id: string;
  status: ApplicationStatus;
  // applicationDate is already in StudentApplicationFormValues, ensure it's a string after processing
  applicationDate: string; // Store as ISO string
}
