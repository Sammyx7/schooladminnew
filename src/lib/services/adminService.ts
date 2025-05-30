
'use client';

import type { StudentProfile, Circular, CreateCircularFormValues, BulkFeeNoticeDefinition, BulkFeeNoticeFormValues, StudentApplication, StudentApplicationFormValues, ApplicationStatus, StudentAttendanceRecord, StudentAttendanceFilterFormValues, AttendanceStatus, ExpenseRecord, ExpenseFormValues } from '@/lib/types';
import { format, parseISO, isEqual, startOfDay } from 'date-fns';

// Mock data for a list of students for the admin view
const MOCK_STUDENT_LIST: StudentProfile[] = [
  {
    studentId: "S10234",
    name: "Aisha Sharma",
    classSection: "Class 10 - Section A",
    avatarUrl: "https://placehold.co/40x40.png",
  },
  {
    studentId: "S10235",
    name: "Rohan Verma",
    classSection: "Class 9 - Section B",
    avatarUrl: "https://placehold.co/40x40.png",
  },
  {
    studentId: "S10236",
    name: "Priya Singh",
    classSection: "Class 11 - Commerce",
    avatarUrl: "https://placehold.co/40x40.png",
  },
  {
    studentId: "S10237",
    name: "Karan Mehta",
    classSection: "Class 10 - Section A",
  },
  {
    studentId: "S10238",
    name: "Sneha Patel",
    classSection: "Class 12 - Science",
  },
  {
    studentId: "S10239",
    name: "Vikram Reddy",
    classSection: "Class 9 - Section C",
  },
  {
    studentId: "S10240",
    name: "Ananya Joshi",
    classSection: "Class 11 - Arts",
  },
];

export async function getAdminStudentList(): Promise<StudentProfile[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STUDENT_LIST);
    }, 800);
  });
}

// Mock data for Admin Circulars
const MOCK_ADMIN_CIRCULARS: Circular[] = [
  { id: 'CIR_ADM_001', title: 'School Reopening Guidelines Post Summer Break', date: '2024-07-15', summary: 'Important guidelines and SOPs for students and parents regarding school reopening.', category: 'Academics', attachmentLink: 'https://placehold.co/circular.pdf' },
  { id: 'CIR_ADM_002', title: 'Upcoming Teacher Training Workshop', date: '2024-07-20', summary: 'Details about the mandatory workshop for all teaching staff on new curriculum.', category: 'Events' },
  { id: 'CIR_ADM_003', title: 'Revised Examination Schedule - Mid Terms', date: '2024-08-01', summary: 'The mid-term examination schedule has been revised. Please check the updated dates.', category: 'Urgent' },
];

export async function getAdminCirculars(): Promise<Circular[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_ADMIN_CIRCULARS]); // Return a copy to prevent direct mutation issues
    }, 700);
  });
}

export async function createAdminCircular(data: CreateCircularFormValues): Promise<Circular> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCircular: Circular = {
        id: `CIR_ADM_${Date.now()}`,
        title: data.title,
        summary: data.summary,
        category: data.category,
        attachmentLink: data.attachmentLink || undefined,
        date: new Date().toISOString(),
      };
      MOCK_ADMIN_CIRCULARS.unshift(newCircular); // Add to the beginning of the array
      resolve(newCircular);
    }, 500);
  });
}

export async function deleteAdminCircular(circularId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = MOCK_ADMIN_CIRCULARS.findIndex(c => c.id === circularId);
      if (index !== -1) {
        MOCK_ADMIN_CIRCULARS.splice(index, 1);
        resolve();
      } else {
        reject(new Error("Circular not found."));
      }
    }, 300);
  });
}

// Mock data for Admin Bulk Fee Notices
const MOCK_ADMIN_BULK_FEE_NOTICES: BulkFeeNoticeDefinition[] = [
  {
    id: 'BFN_001',
    noticeTitle: 'Term 2 Fees - Academic Year 2024-2025',
    description: 'Standard tuition and activity fees for the second term.',
    amount: 15000,
    dueDate: new Date('2024-10-15T00:00:00.000Z'),
    targetClasses: 'Class 1 - Section A\nClass 1 - Section B\nClass 2 - All Sections',
    additionalNotes: 'Late fee of ₹500 will apply after the due date.',
    generatedDate: '2024-09-01T10:00:00.000Z',
  },
  {
    id: 'BFN_002',
    noticeTitle: 'Annual Sports Day Contribution',
    description: 'Contribution towards organizing the Annual Sports Day events.',
    amount: 750,
    dueDate: new Date('2024-08-30T00:00:00.000Z'),
    targetClasses: 'All Classes (1-12)',
    generatedDate: '2024-08-01T11:30:00.000Z',
  }
];

export async function getAdminGeneratedFeeNotices(): Promise<BulkFeeNoticeDefinition[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_ADMIN_BULK_FEE_NOTICES]);
    }, 600);
  });
}

export async function createAdminBulkFeeNotice(data: BulkFeeNoticeFormValues): Promise<BulkFeeNoticeDefinition> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNoticeDefinition: BulkFeeNoticeDefinition = {
        ...data,
        id: `BFN_${Date.now()}`,
        generatedDate: new Date().toISOString(),
        // Ensure dueDate is a Date object before it's converted elsewhere if needed
        dueDate: typeof data.dueDate === 'string' ? parseISO(data.dueDate) : data.dueDate,
      };
      MOCK_ADMIN_BULK_FEE_NOTICES.unshift(newNoticeDefinition);
      resolve(newNoticeDefinition);
    }, 700);
  });
}

// Mock data for Admin Admissions Management
const MOCK_STUDENT_APPLICATIONS: StudentApplication[] = [
  {
    id: `APP_${Date.now() - 100000}`,
    applicantName: 'Riya Sharma',
    classAppliedFor: 'Class 1',
    applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    status: 'Pending Review',
    parentName: 'Mr. Anil Sharma',
    parentEmail: 'anil.sharma@example.com',
    parentPhone: '9876543210',
  },
  {
    id: `APP_${Date.now() - 200000}`,
    applicantName: 'Aarav Patel',
    classAppliedFor: 'Class 5',
    applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'Approved',
    parentName: 'Ms. Sunita Patel',
    parentEmail: 'sunita.p@example.com',
  },
  {
    id: `APP_${Date.now() - 300000}`,
    applicantName: 'Zara Khan',
    classAppliedFor: 'Nursery',
    applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'Interview Scheduled',
    parentName: 'Mr. Imran Khan',
    parentPhone: '9988776655',
  },
];

export async function getAdminStudentApplications(): Promise<StudentApplication[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_STUDENT_APPLICATIONS]);
    }, 750);
  });
}

export async function createAdminStudentApplication(data: StudentApplicationFormValues): Promise<StudentApplication> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newApplication: StudentApplication = {
        ...data,
        id: `APP_${Date.now()}`,
        applicationDate: data.applicationDate.toISOString(), // Convert Date to ISO string
        status: 'Pending Review', // Default status
      };
      MOCK_STUDENT_APPLICATIONS.unshift(newApplication);
      resolve(newApplication);
    }, 500);
  });
}

export async function updateAdminStudentApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<StudentApplication> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const applicationIndex = MOCK_STUDENT_APPLICATIONS.findIndex(app => app.id === applicationId);
      if (applicationIndex !== -1) {
        MOCK_STUDENT_APPLICATIONS[applicationIndex].status = status;
        resolve(MOCK_STUDENT_APPLICATIONS[applicationIndex]);
      } else {
        reject(new Error("Application not found."));
      }
    }, 400);
  });
}

// Admin Student Attendance Management
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const MOCK_STUDENT_ATTENDANCE_RECORDS: StudentAttendanceRecord[] = [
  { id: 'ATT001', studentId: 'S10234', studentName: 'Aisha Sharma', class: '10', section: 'A', date: today.toISOString(), status: 'Present' },
  { id: 'ATT002', studentId: 'S10237', studentName: 'Karan Mehta', class: '10', section: 'A', date: today.toISOString(), status: 'Absent' },
  { id: 'ATT003', studentId: 'S10235', studentName: 'Rohan Verma', class: '9', section: 'B', date: today.toISOString(), status: 'Present' },
  { id: 'ATT004', studentId: 'S10234', studentName: 'Aisha Sharma', class: '10', section: 'A', date: yesterday.toISOString(), status: 'Late' },
  { id: 'ATT005', studentId: 'S10237', studentName: 'Karan Mehta', class: '10', section: 'A', date: yesterday.toISOString(), status: 'Excused' },
  { id: 'ATT006', studentId: 'S10239', studentName: 'Vikram Reddy', class: '9', section: 'C', date: today.toISOString(), status: 'Present' },
];

export async function getAdminStudentAttendanceRecords(filters?: StudentAttendanceFilterFormValues): Promise<StudentAttendanceRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRecords = [...MOCK_STUDENT_ATTENDANCE_RECORDS];
      if (filters) {
        if (filters.classFilter) {
          filteredRecords = filteredRecords.filter(r => r.class.toLowerCase().includes(filters.classFilter!.toLowerCase()));
        }
        if (filters.sectionFilter) {
          filteredRecords = filteredRecords.filter(r => r.section.toLowerCase().includes(filters.sectionFilter!.toLowerCase()));
        }
        if (filters.dateFilter) {
          const filterDate = startOfDay(filters.dateFilter);
          filteredRecords = filteredRecords.filter(r => isEqual(startOfDay(parseISO(r.date)), filterDate));
        }
      }
      resolve(filteredRecords);
    }, 600);
  });
}


// Admin Expenses Management
const MOCK_EXPENSE_RECORDS: ExpenseRecord[] = [
  { id: 'EXP001', date: new Date('2024-07-15').toISOString(), category: 'Utilities', description: 'Electricity Bill - June', amount: 12500, paymentMethod: 'Online Transfer' },
  { id: 'EXP002', date: new Date('2024-07-10').toISOString(), category: 'Supplies', description: 'Stationery Purchase', amount: 3500, paymentMethod: 'Cash' },
  { id: 'EXP003', date: new Date('2024-07-01').toISOString(), category: 'Salaries', description: 'Teaching Staff Salaries - June', amount: 350000, paymentMethod: 'Bank Transfer' },
  { id: 'EXP004', date: new Date('2024-06-25').toISOString(), category: 'Maintenance', description: 'Classroom Projector Repair', amount: 8000, paymentMethod: 'Vendor Cheque' },
];

export async function getAdminExpenseRecords(): Promise<ExpenseRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_EXPENSE_RECORDS]);
    }, 500);
  });
}

export async function createAdminExpenseRecord(data: ExpenseFormValues): Promise<ExpenseRecord> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newExpense: ExpenseRecord = {
        ...data,
        id: `EXP_${Date.now()}`,
        date: data.date.toISOString(), // Store date as ISO string
      };
      MOCK_EXPENSE_RECORDS.unshift(newExpense);
      resolve(newExpense);
    }, 400);
  });
}
