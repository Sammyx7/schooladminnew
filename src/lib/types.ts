
import type { LucideIcon } from 'lucide-react';
import { z } from 'zod';

export type UserRole = 'admin' | 'staff';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  children?: NavItem[];
}

// Student Profile Schema (also used by admin)
export const StudentProfileSchema = z.object({
  studentId: z.string(),
  name: z.string(),
  classSection: z.string(),
  avatarUrl: z.string().optional(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;

// Staff List Item Schema (for admin view)
export const AdminStaffListItemSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  name: z.string(),
  role: z.string(),
  department: z.string(),
  email: z.string().email(),
});
export type AdminStaffListItem = z.infer<typeof AdminStaffListItemSchema>;

// Payment Record Schema (for admin view)
export const AdminPaymentRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  paymentDate: z.string(), // Kept as string for AI tool simplicity
  amountPaid: z.number(),
  description: z.string(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
});
export type AdminPaymentRecord = z.infer<typeof AdminPaymentRecordSchema>;

export const AdminPaymentFiltersSchema = z.object({
  studentIdOrName: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});
export type AdminPaymentFiltersFormValues = z.infer<typeof AdminPaymentFiltersSchema>;

// Circulars Types
export const circularCategories = ["Academics", "Events", "Holidays", "Urgent", "General"] as const;
export type CircularCategory = typeof circularCategories[number];

export const CircularSchema = z.object({
    id: z.string(),
    title: z.string(),
    date: z.string(),
    summary: z.string(),
    category: z.enum(circularCategories).optional(),
    attachmentLink: z.string().optional(),
});
export type Circular = z.infer<typeof CircularSchema>;

export const CreateCircularSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }),
  summary: z.string().min(10, { message: "Summary must be at least 10 characters long." }),
  category: z.enum(circularCategories, { errorMap: () => ({ message: "Please select a category." }) }),
  attachmentLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});
export type CreateCircularFormValues = z.infer<typeof CreateCircularSchema>;

// Attendance Types
export const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'] as const;
export type AttendanceStatus = typeof attendanceStatuses[number];

export const StudentAttendanceRecordSchema = z.object({
    id: z.string(),
    studentId: z.string(),
    studentName: z.string(),
    class: z.string(),
    section: z.string(),
    date: z.string(), // ISO String
    status: z.enum(attendanceStatuses),
});
export type StudentAttendanceRecord = z.infer<typeof StudentAttendanceRecordSchema>;

export const StudentAttendanceFilterSchema = z.object({
  classFilter: z.string().optional(),
  sectionFilter: z.string().optional(),
  dateFilter: z.date().optional(),
});
export type StudentAttendanceFilterFormValues = z.infer<typeof StudentAttendanceFilterSchema>;

export const StaffAttendanceRecordSchema = z.object({
    id: z.string(),
    staffId: z.string(),
    staffName: z.string(),
    department: z.string(),
    date: z.string(), // ISO String
    status: z.enum(attendanceStatuses),
});
export type StaffAttendanceRecord = z.infer<typeof StaffAttendanceRecordSchema>;

export const StaffAttendanceFilterSchema = z.object({
  departmentFilter: z.string().optional(),
  staffNameOrIdFilter: z.string().optional(),
  dateFilter: z.date().optional(),
});
export type StaffAttendanceFilterFormValues = z.infer<typeof StaffAttendanceFilterSchema>;


// Expense Types
export const expenseCategories = ['Utilities', 'Salaries', 'Maintenance', 'Supplies', 'Transport', 'Other'] as const;
export type ExpenseCategory = typeof expenseCategories[number];

export const ExpenseRecordSchema = z.object({
    id: z.string(),
    date: z.string(), // ISO String
    category: z.enum(expenseCategories),
    description: z.string(),
    amount: z.number(),
    paymentMethod: z.string().optional(),
});
export type ExpenseRecord = z.infer<typeof ExpenseRecordSchema>;

export const ExpenseFormSchema = z.object({
  date: z.date(),
  category: z.enum(expenseCategories, { errorMap: () => ({ message: "Please select a category." }) }),
  description: z.string().min(3, "Description is required."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  paymentMethod: z.string().optional(),
});
export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;


// Timetable Types
export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof daysOfWeek[number];

export type TimetableEntry = {
    id: string;
    day: DayOfWeek;
    period: number;
    timeSlot: string;
    subject: string;
    teacher: string;
    class?: string;
    section?: string;
};

export const AdminTimetableFilterSchema = z.object({
  classFilter: z.string().optional(),
  sectionFilter: z.string().optional(),
  teacherFilter: z.string().optional(),
});
export type AdminTimetableFilterFormValues = z.infer<typeof AdminTimetableFilterSchema>;


// Admin Bulk Fee Notice Types
export const BulkFeeNoticeFormSchema = z.object({
  noticeTitle: z.string().min(5, { message: "Notice title must be at least 5 characters." }),
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  targetClasses: z.string().min(1, { message: "Please specify at least one target class/section." }),
  additionalNotes: z.string().optional(),
});
export type BulkFeeNoticeFormValues = z.infer<typeof BulkFeeNoticeFormSchema>;
export type BulkFeeNoticeDefinition = BulkFeeNoticeFormValues & {
  id: string;
  generatedDate: string;
};

// Admin Admissions Management Types
export const applicationStatuses = ['Pending Review', 'Approved', 'Rejected', 'Waitlisted', 'Interview Scheduled'] as const;
export type ApplicationStatus = typeof applicationStatuses[number];

export const StudentApplicationFormSchema = z.object({
  applicantName: z.string().min(3, { message: "Applicant name must be at least 3 characters." }),
  classAppliedFor: z.string().min(1, { message: "Class applied for is required." }),
  applicationDate: z.date({
    required_error: "Application date is required.",
  }),
  parentName: z.string().optional(),
  parentEmail: z.string().email({ message: "Invalid email address."}).optional().or(z.literal('')),
  parentPhone: z.string().optional(),
});
export type StudentApplicationFormValues = z.infer<typeof StudentApplicationFormSchema>;

export const StudentApplicationSchema = StudentApplicationFormSchema.extend({
    id: z.string(),
    status: z.enum(applicationStatuses),
    applicationDate: z.string(), // Stored as ISOString
});
export type StudentApplication = z.infer<typeof StudentApplicationSchema>;

// Staff Profile (for Staff Portal)
export type StaffProfile = {
    id: string;
    staffId: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    dateOfJoining: string; // Should be ISOString
    qualifications: string[];
    avatarUrl?: string;
};

// Staff Marks Entry
export const MarksEntryFilterSchema = z.object({
  class: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  subject: z.string().min(1, "Please select a subject."),
  exam: z.string().min(1, "Please select an exam/term."),
});
export type MarksEntryFilterFormValues = z.infer<typeof MarksEntryFilterSchema>;


// Reports
export type ReportListItem = {
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    actionText: string;
    isImplemented: boolean;
};

export type FeeReportData = {
  name: string; // e.g., 'Class 1'
  paid: number;
  pending: number;
  overdue: number;
};


// AI Assistant Chat
export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// A generic type for filters used in Admin Payment History
export type AdminPaymentFilters = {
    studentIdOrName?: string;
    dateFrom?: Date;
    dateTo?: Date;
}
