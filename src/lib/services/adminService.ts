
'use client';

import type { StudentProfile, Circular, CreateCircularFormValues, BulkFeeNoticeDefinition, BulkFeeNoticeFormValues, StudentApplication, StudentApplicationFormValues, ApplicationStatus, AdminPaymentRecord, AdminPaymentFiltersFormValues, StudentAttendanceRecord, StudentAttendanceFilterFormValues, StaffAttendanceRecord, StaffAttendanceFilterFormValues, ExpenseRecord, ExpenseFormValues } from '@/lib/types';
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
let MOCK_ADMIN_CIRCULARS: Circular[] = [
  { id: 'CIR_ADM_001', title: 'School Reopening Guidelines Post Summer Break', date: '2024-07-15T00:00:00.000Z', summary: 'Important guidelines and SOPs for students and parents regarding school reopening after the long summer vacation. Please ensure all protocols are followed strictly.', category: 'Academics', attachmentLink: 'https://placehold.co/circular1.pdf' },
  { id: 'CIR_ADM_002', title: 'Upcoming Teacher Training Workshop on AI Tools', date: '2024-07-20T00:00:00.000Z', summary: 'Details about the mandatory workshop for all teaching staff on integrating new AI-based educational tools into the curriculum.', category: 'Events' },
  { id: 'CIR_ADM_003', title: 'Revised Examination Schedule - Mid Terms (Classes 9-12)', date: '2024-08-01T00:00:00.000Z', summary: 'The mid-term examination schedule for senior classes has been revised due to unforeseen circumstances. Please check the updated dates and timings.', category: 'Urgent', attachmentLink: 'https://placehold.co/circular2.pdf' },
  { id: 'CIR_ADM_004', title: 'Annual Day Celebration Invitations', date: '2024-09-10T00:00:00.000Z', summary: 'We are pleased to invite all parents and guardians to our Annual Day celebrations. Event details and RSVP information are attached.', category: 'Events' },
  { id: 'CIR_ADM_005', title: 'Holiday Notice: School Closed for Local Festival', date: '2024-09-25T00:00:00.000Z', summary: 'The school will remain closed on the specified date in observance of a local festival. Classes will resume as normal the following day.', category: 'Holidays' },
];


export async function getAdminCirculars(): Promise<Circular[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_ADMIN_CIRCULARS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
      MOCK_ADMIN_CIRCULARS.unshift(newCircular);
      resolve(newCircular);
    }, 500);
  });
}

export async function deleteAdminCircular(circularId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const initialLength = MOCK_ADMIN_CIRCULARS.length;
      MOCK_ADMIN_CIRCULARS = MOCK_ADMIN_CIRCULARS.filter(c => c.id !== circularId);
      if (MOCK_ADMIN_CIRCULARS.length < initialLength) {
        resolve();
      } else {
        reject(new Error("Circular not found."));
      }
    }, 300);
  });
}

// Mock data for Admin Bulk Fee Notices
let MOCK_ADMIN_BULK_FEE_NOTICES: BulkFeeNoticeDefinition[] = [
  {
    id: 'BFN_001',
    noticeTitle: 'Term 2 Fees - Academic Year 2024-2025',
    description: 'Standard tuition and activity fees for the second term.',
    amount: 15000,
    dueDate: new Date('2024-10-15T00:00:00.000Z'),
    targetClasses: 'Class 1 - Section A\nClass 1 - Section B\nClass 2 - All Sections',
    additionalNotes: 'Late fee of ₹500 will apply after the due date.',
    generatedDate: new Date('2024-09-01T10:00:00.000Z').toISOString(),
  },
  {
    id: 'BFN_002',
    noticeTitle: 'Annual Sports Day Contribution',
    description: 'Contribution towards organizing the Annual Sports Day events.',
    amount: 750,
    dueDate: new Date('2024-08-30T00:00:00.000Z'),
    targetClasses: 'All Classes (1-12)',
    generatedDate: new Date('2024-08-01T11:30:00.000Z').toISOString(),
  }
];

export async function getAdminGeneratedFeeNotices(): Promise<BulkFeeNoticeDefinition[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_ADMIN_BULK_FEE_NOTICES].sort((a,b) => parseISO(b.generatedDate).getTime() - parseISO(a.generatedDate).getTime()));
    }, 600);
  });
}

export async function createAdminBulkFeeNotice(data: BulkFeeNoticeFormValues): Promise<BulkFeeNoticeDefinition> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newNoticeDefinition: BulkFeeNoticeDefinition = {
        ...data,
        amount: Number(data.amount), // Ensure amount is number
        id: `BFN_${Date.now()}`,
        generatedDate: new Date().toISOString(),
        // dueDate remains Date object from form
      };
      MOCK_ADMIN_BULK_FEE_NOTICES.unshift(newNoticeDefinition);
      resolve(newNoticeDefinition);
    }, 700);
  });
}

// Mock data for Admin Admissions Management
let MOCK_STUDENT_APPLICATIONS: StudentApplication[] = [
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
      resolve([...MOCK_STUDENT_APPLICATIONS].sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()));
    }, 750);
  });
}

export async function createAdminStudentApplication(data: StudentApplicationFormValues): Promise<StudentApplication> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newApplication: StudentApplication = {
        ...data,
        id: `APP_${Date.now()}`,
        applicationDate: data.applicationDate.toISOString(), 
        status: 'Pending Review', 
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


// Mock Data for Payment History
const MOCK_PAYMENT_HISTORY: AdminPaymentRecord[] = [
    { id: 'PAY_001', studentId: 'S10234', studentName: 'Aisha Sharma', paymentDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), amountPaid: 15000, description: 'Term 1 Fees', paymentMethod: 'Credit Card', transactionId: 'TXN12345678' },
    { id: 'PAY_002', studentId: 'S10235', studentName: 'Rohan Verma', paymentDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), amountPaid: 12500, description: 'Term 1 Fees', paymentMethod: 'Net Banking' },
    { id: 'PAY_003', studentId: 'S10238', studentName: 'Sneha Patel', paymentDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(), amountPaid: 2000, description: 'Bus Fees - Q1', paymentMethod: 'UPI', transactionId: 'TXN91011121' },
];

export async function getAdminPaymentHistory(filters?: AdminPaymentFiltersFormValues): Promise<AdminPaymentRecord[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filteredData = MOCK_PAYMENT_HISTORY;
            if (filters) {
                if (filters.studentIdOrName) {
                    const searchTerm = filters.studentIdOrName.toLowerCase();
                    filteredData = filteredData.filter(p => p.studentId.toLowerCase().includes(searchTerm) || p.studentName.toLowerCase().includes(searchTerm));
                }
                if (filters.dateFrom) {
                    const from = startOfDay(filters.dateFrom);
                    filteredData = filteredData.filter(p => new Date(p.paymentDate) >= from);
                }
                if (filters.dateTo) {
                    const to = startOfDay(filters.dateTo);
                    filteredData = filteredData.filter(p => new Date(p.paymentDate) <= to);
                }
            }
            resolve(filteredData.sort((a,b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime()));
        }, 800);
    });
}

// Mock Data for Attendance
const MOCK_STUDENT_ATTENDANCE: StudentAttendanceRecord[] = [
    { id: 'S_ATT_1', studentId: 'S10234', studentName: 'Aisha Sharma', class: '10', section: 'A', date: new Date().toISOString(), status: 'Present' },
    { id: 'S_ATT_2', studentId: 'S10237', studentName: 'Karan Mehta', class: '10', section: 'A', date: new Date().toISOString(), status: 'Absent' },
    { id: 'S_ATT_3', studentId: 'S10235', studentName: 'Rohan Verma', class: '9', section: 'B', date: new Date().toISOString(), status: 'Present' },
    { id: 'S_ATT_4', studentId: 'S10234', studentName: 'Aisha Sharma', class: '10', section: 'A', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'Late' },
];
export async function getAdminStudentAttendanceRecords(filters?: StudentAttendanceFilterFormValues): Promise<StudentAttendanceRecord[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let records = MOCK_STUDENT_ATTENDANCE;
            if (filters) {
                if (filters.classFilter) records = records.filter(r => r.class.includes(filters.classFilter!));
                if (filters.sectionFilter) records = records.filter(r => r.section.includes(filters.sectionFilter!));
                if (filters.dateFilter) records = records.filter(r => isEqual(startOfDay(new Date(r.date)), startOfDay(filters.dateFilter!)));
            }
            resolve(records.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
        }, 700);
    });
}


const MOCK_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [
    { id: 'T_ATT_1', staffId: 'TCH101', staffName: 'Dr. Priya Nair', department: 'Administration', date: new Date().toISOString(), status: 'Present' },
    { id: 'T_ATT_2', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: new Date().toISOString(), status: 'Present' },
    { id: 'T_ATT_3', staffId: 'TCH103', staffName: 'Ms. Anjali Sharma', department: 'Academics - Primary', date: new Date().toISOString(), status: 'Absent' },
    { id: 'T_ATT_4', staffId: 'ADM001', staffName: 'Mr. Rajesh Kumar', department: 'Accounts', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), status: 'Late' },
];

export async function getAdminStaffAttendanceRecords(filters?: StaffAttendanceFilterFormValues): Promise<StaffAttendanceRecord[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let records = MOCK_STAFF_ATTENDANCE;
            if (filters) {
                if(filters.departmentFilter) records = records.filter(r => r.department.toLowerCase().includes(filters.departmentFilter!.toLowerCase()));
                if(filters.staffNameOrIdFilter) {
                    const term = filters.staffNameOrIdFilter.toLowerCase();
                    records = records.filter(r => r.staffName.toLowerCase().includes(term) || r.staffId.toLowerCase().includes(term));
                }
                if (filters.dateFilter) records = records.filter(r => isEqual(startOfDay(new Date(r.date)), startOfDay(filters.dateFilter!)));
            }
            resolve(records.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
        }, 700);
    });
}


// Mock Data for Expenses
let MOCK_EXPENSE_RECORDS: ExpenseRecord[] = [
    { id: 'EXP_1', date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), category: 'Utilities', description: 'Monthly Electricity Bill', amount: 25000, paymentMethod: 'Bank Transfer' },
    { id: 'EXP_2', date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), category: 'Supplies', description: 'Purchase of whiteboard markers and dusters', amount: 3500, paymentMethod: 'Cash' },
    { id: 'EXP_3', date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), category: 'Maintenance', description: 'Repair of water cooler on 2nd floor', amount: 2000 },
];
export async function getAdminExpenseRecords(): Promise<ExpenseRecord[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_EXPENSE_RECORDS.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
        }, 600);
    });
}
export async function createAdminExpenseRecord(data: ExpenseFormValues): Promise<ExpenseRecord> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newRecord: ExpenseRecord = {
                ...data,
                id: `EXP_${Date.now()}`,
                date: data.date.toISOString(),
                amount: Number(data.amount),
            };
            MOCK_EXPENSE_RECORDS.unshift(newRecord);
            resolve(newRecord);
        }, 500);
    });
}
