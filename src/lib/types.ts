
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

export type StudentProfile = {
  name: string;
  avatarUrl?: string;
  studentId: string;
  classSection: string;
};

// Circulars Types (Used by both Student and Admin)
export const circularCategories = ["Academics", "Events", "Holidays", "Urgent", "General"] as const;
export type CircularCategory = typeof circularCategories[number];

export type Circular = {
  id: string;
  title: string;
  date: string; // Should be ISOString
  summary: string;
  category?: CircularCategory;
  attachmentLink?: string;
};

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

export type TimetableEntry = {
    id: string;
    day: DayOfWeek;
    period: number;
    timeSlot: string;
    subject: string;
    teacher: string;
    class?: string; // Optional for staff view
    section?: string; // Optional for staff view
};

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

export type BulkFeeNoticeDefinition = BulkFeeNoticeFormValues & {
  id: string;
  generatedDate: string; // Should be ISOString
};

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
  parentName: z.string().optional(),
  parentEmail: z.string().email({ message: "Invalid email address."}).optional().or(z.literal('')),
  parentPhone: z.string().optional(),
});

export type StudentApplicationFormValues = z.infer<typeof StudentApplicationFormSchema>;

export type StudentApplication = StudentApplicationFormValues & {
  id: string;
  status: ApplicationStatus;
  applicationDate: string; // Stored as ISOString
};

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
