
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
export const StudentProfileSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().optional(),
  studentId: z.string(),
  classSection: z.string(),
  rollNo: z.number().optional(),
  parentName: z.string().optional(),
  parentContact: z.string().optional(),
  admissionNumber: z.string().optional(),
  address: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  emergencyContact: z.string().optional(),
});
export type StudentProfile = z.infer<typeof StudentProfileSchema>;


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
export const feeNoticeStatuses = ['Pending', 'Paid', 'Overdue'] as const;
export type FeeNoticeStatus = typeof feeNoticeStatuses[number];

export const FeeNoticeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  dueDate: z.string(), 
  status: z.enum(feeNoticeStatuses),
  paymentLink: z.string().optional(),
});
export type FeeNotice = z.infer<typeof FeeNoticeSchema>;


// Student Report Card Types
export const SubjectGradeSchema = z.object({
  id: z.string(),
  subjectName: z.string(),
  grade: z.string(),
  marks: z.number().optional(),
  maxMarks: z.number().optional(),
  remarks: z.string().optional(),
});
export type SubjectGrade = z.infer<typeof SubjectGradeSchema>;

export const ReportCardDataSchema = z.object({
  id: z.string(),
  termName: z.string(),
  issueDate: z.string(), 
  subjects: z.array(SubjectGradeSchema),
  overallPercentage: z.string().optional(),
  overallGrade: z.string().optional(),
  classRank: z.string().optional(),
  teacherComments: z.string().optional(),
  downloadLink: z.string().optional(),
});
export type ReportCardData = z.infer<typeof ReportCardDataSchema>;


// Circulars Types (Used by both Student and Admin)
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


// Timetable Types (Shared by Student, Staff and Admin)
export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof daysOfWeek[number];


export const TimetableEntrySchema = z.object({
  id: z.string(),
  day: z.enum(daysOfWeek),
  period: z.number(),
  timeSlot: z.string(),
  subject: z.string(),
  teacher: z.string(),
  class: z.string().optional(), 
  section: z.string().optional(), 
});
export type TimetableEntry = z.infer<typeof TimetableEntrySchema>;


// Student Payment History Types & Admin Payment History Types
export const PaymentRecordSchema = z.object({
  id: z.string(),
  paymentDate: z.string(), 
  description: z.string(),
  amountPaid: z.number(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
  receiptLink: z.string().optional(),
});
export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;


export const AdminPaymentRecordSchema = PaymentRecordSchema.extend({
  studentId: z.string(),
  studentName: z.string(),
});
export type AdminPaymentRecord = z.infer<typeof AdminPaymentRecordSchema>;


export const AdminPaymentFiltersSchema = z.object({
  studentIdOrName: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
});
export type AdminPaymentFiltersFormValues = z.infer<typeof AdminPaymentFiltersSchema>;


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

export const BulkFeeNoticeDefinitionSchema = BulkFeeNoticeFormSchema.extend({
  id: z.string(),
  generatedDate: z.string(), // Should be ISOString
  dueDate: z.date(), // Keep as Date object for consistency with form, convert on display
});
export type BulkFeeNoticeDefinition = z.infer<typeof BulkFeeNoticeDefinitionSchema>;


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
  dob: z.date({
    required_error: "Date of Birth is required.",
    invalid_type_error: "That's not a valid date!",
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
  dob: z.string(), // Stored as ISOString
});
export type StudentApplication = z.infer<typeof StudentApplicationSchema>;


// General Attendance Types
export const attendanceStatuses = ['Present', 'Absent', 'Late', 'Excused'] as const;
export type AttendanceStatus = typeof attendanceStatuses[number];

// Admin Student Attendance Types
export const StudentAttendanceRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  section: z.string(),
  date: z.string(), // Stored as ISOString
  status: z.enum(attendanceStatuses),
});
export type StudentAttendanceRecord = z.infer<typeof StudentAttendanceRecordSchema>;


export const StudentAttendanceFilterSchema = z.object({
  classFilter: z.string().optional(),
  sectionFilter: z.string().optional(),
  dateFilter: z.date().optional(),
});
export type StudentAttendanceFilterFormValues = z.infer<typeof StudentAttendanceFilterSchema>;

// Admin & Staff Attendance Types
export const StaffAttendanceRecordSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  staffName: z.string(),
  department: z.string(),
  date: z.string(), // Stored as ISOString
  status: z.enum(attendanceStatuses),
});
export type StaffAttendanceRecord = z.infer<typeof StaffAttendanceRecordSchema>;


export const StaffAttendanceFilterSchema = z.object({
  departmentFilter: z.string().optional(),
  staffNameOrIdFilter: z.string().optional(),
  dateFilter: z.date().optional(),
});
export type StaffAttendanceFilterFormValues = z.infer<typeof StaffAttendanceFilterSchema>;


// Admin Expenses Management Types
export const expenseCategories = ['Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Events', 'Transport', 'Other'] as const;
export type ExpenseCategory = typeof expenseCategories[number];

export const ExpenseFormSchema = z.object({
  date: z.date({ required_error: "Date is required."}),
  category: z.enum(expenseCategories, { errorMap: () => ({ message: "Please select a category." }) }),
  description: z.string().min(3, { message: "Description must be at least 3 characters."}),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number."}),
  paymentMethod: z.string().optional(),
});
export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;

export const ExpenseRecordSchema = ExpenseFormSchema.extend({
  id: z.string(),
  date: z.string(), // Stored as ISOString
});
export type ExpenseRecord = z.infer<typeof ExpenseRecordSchema>;


// Admin Staff Management Types
export const AdminStaffListItemSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  name: z.string(),
  role: z.string(),
  department: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  joiningDate: z.string(), // Stored as ISOString
  salary: z.number().optional(),
  qualifications: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
  assignments: z
    .array(
      z.object({
        className: z.string(),
        section: z.string(),
        subject: z.string().optional(),
        isClassTeacher: z.boolean().optional(),
      })
    )
    .optional(),
});
export type AdminStaffListItem = z.infer<typeof AdminStaffListItemSchema>;


// Admin Timetable Management Types
export const AdminTimetableFilterSchema = z.object({
  classFilter: z.string().optional(),
  sectionFilter: z.string().optional(),
  teacherFilter: z.string().optional(),
});
export type AdminTimetableFilterFormValues = z.infer<typeof AdminTimetableFilterSchema>;

// Staff Profile (for Staff Portal)
export const StaffProfileSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  name: z.string(),
  role: z.string(),
  department: z.string(),
  email: z.string(),
  phone: z.string(),
  dateOfJoining: z.string(), // Stored as ISOString
  qualifications: z.array(z.string()),
  avatarUrl: z.string().optional(),
  // Aggregated rating score (0-100)
  ratingScore: z.number().optional(),
});
export type StaffProfile = z.infer<typeof StaffProfileSchema>;

// Complaints & Ratings
export const complaintStatuses = ['open','in_progress','resolved','dismissed'] as const;
export type ComplaintStatus = typeof complaintStatuses[number];
export const complaintSeverities = ['low','medium','high','critical'] as const;
export type ComplaintSeverity = typeof complaintSeverities[number];

export const StaffComplaintSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  severity: z.enum(complaintSeverities),
  status: z.enum(complaintStatuses),
  attachments: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  resolvedBy: z.string().nullable().optional(),
});
export type StaffComplaint = z.infer<typeof StaffComplaintSchema>;

export const StaffRatingEventSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  delta: z.number(),
  reason: z.string(),
  source: z.enum(['manual','complaint_deduction','complaint_resolution'] as const),
  relatedComplaintId: z.string().nullable().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
});
export type StaffRatingEvent = z.infer<typeof StaffRatingEventSchema>;


// Admin Reports Overview
export interface ReportListItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string; 
  actionText: string;
  isImplemented: boolean;
}

// AI Assistant Chat Message Type
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

