
'use client';

import type { StudentProfile, Circular, CreateCircularFormValues, BulkFeeNoticeDefinition, BulkFeeNoticeFormValues, StudentApplication, StudentApplicationFormValues, ApplicationStatus, StudentAttendanceRecord, StudentAttendanceFilterFormValues, AttendanceStatus, ExpenseRecord, ExpenseFormValues, AdminStaffListItem, TimetableEntry, DayOfWeek, AdminTimetableFilterFormValues, StaffAttendanceRecord, StaffAttendanceFilterFormValues, AdminPaymentRecord, AdminPaymentFiltersFormValues, PaymentRecord } from '@/lib/types';
import { format, parseISO, isEqual, startOfDay, isWithinInterval, endOfDay } from 'date-fns';

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
        dueDate: typeof data.dueDate === 'string' ? parseISO(data.dueDate) : data.dueDate,
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

// Admin Student Attendance Management
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const dayBeforeYesterday = new Date(today);
dayBeforeYesterday.setDate(today.getDate() - 2);


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
let MOCK_EXPENSE_RECORDS: ExpenseRecord[] = [
  { id: 'EXP001', date: new Date('2024-07-15').toISOString(), category: 'Utilities', description: 'Electricity Bill - June', amount: 12500, paymentMethod: 'Online Transfer' },
  { id: 'EXP002', date: new Date('2024-07-10').toISOString(), category: 'Supplies', description: 'Stationery Purchase', amount: 3500, paymentMethod: 'Cash' },
  { id: 'EXP003', date: new Date('2024-07-01').toISOString(), category: 'Salaries', description: 'Teaching Staff Salaries - June', amount: 350000, paymentMethod: 'Bank Transfer' },
  { id: 'EXP004', date: new Date('2024-06-25').toISOString(), category: 'Maintenance', description: 'Classroom Projector Repair', amount: 8000, paymentMethod: 'Vendor Cheque' },
];

export async function getAdminExpenseRecords(): Promise<ExpenseRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_EXPENSE_RECORDS].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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


// Admin Staff Management
const MOCK_ADMIN_STAFF_LIST: AdminStaffListItem[] = [
  { id: 'STF001', staffId: 'TCH101', name: 'Dr. Anjali Sharma', role: 'Principal', department: 'Administration', email: 'anjali.sharma@example.com', phone: '9876543210', joiningDate: '2010-05-15' },
  { id: 'STF002', staffId: 'TCH102', name: 'Mr. Vikram Singh', role: 'Mathematics Teacher', department: 'Academics - Senior Secondary', email: 'vikram.singh@example.com', phone: '9876543211', joiningDate: '2015-08-01' },
  { id: 'STF003', staffId: 'TCH103', name: 'Ms. Priya Patel', role: 'Science Coordinator', department: 'Academics - Middle School', email: 'priya.patel@example.com', phone: '9876543212', joiningDate: '2018-06-20' },
  { id: 'STF004', staffId: 'ADM001', name: 'Mr. Rajesh Kumar', role: 'Accountant', department: 'Administration', email: 'rajesh.kumar@example.com', phone: '9876543213', joiningDate: '2019-01-10' },
  { id: 'STF005', staffId: 'SUP001', name: 'Mrs. Sunita Devi', role: 'Librarian', department: 'Support Staff', email: 'sunita.devi@example.com', phone: '9876543214', joiningDate: '2012-03-01' },
];

export async function getAdminStaffList(): Promise<AdminStaffListItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_ADMIN_STAFF_LIST]);
    }, 700);
  });
}

// Admin Timetable Management
const MOCK_ADMIN_TIMETABLE_ENTRIES: TimetableEntry[] = [
  // Class 10A
  { id: 'ATT001', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '10', section: 'A' },
  { id: 'ATT002', day: 'Monday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Physics', teacher: 'Ms. Priya Patel', class: '10', section: 'A' },
  { id: 'ATT003', day: 'Tuesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'English', teacher: 'Mrs. S. Iyer', class: '10', section: 'A' },
  // Class 9B
  { id: 'ATT004', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'History', teacher: 'Mr. R. Khan', class: '9', section: 'B' },
  { id: 'ATT005', day: 'Monday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Geography', teacher: 'Ms. A. Desai', class: '9', section: 'B' },
  { id: 'ATT006', day: 'Tuesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Biology', teacher: 'Dr. N. Reddy', class: '9', section: 'B' },
  // Shared Teacher
  { id: 'ATT007', day: 'Wednesday', period: 3, timeSlot: '10:45 - 11:30', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '9', section: 'B' },
  { id: 'ATT008', day: 'Wednesday', period: 4, timeSlot: '11:30 - 12:15', subject: 'Computer Science', teacher: 'Ms. Priya Patel', class: '10', section: 'A' },
];

export async function getAdminTimetable(filters?: AdminTimetableFilterFormValues): Promise<TimetableEntry[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            let filteredEntries = [...MOCK_ADMIN_TIMETABLE_ENTRIES];
            if (filters) {
                if (filters.classFilter) {
                    filteredEntries = filteredEntries.filter(e => e.class?.toLowerCase().includes(filters.classFilter!.toLowerCase()));
                }
                if (filters.sectionFilter) {
                    filteredEntries = filteredEntries.filter(e => e.section?.toLowerCase().includes(filters.sectionFilter!.toLowerCase()));
                }
                if (filters.teacherFilter) {
                    filteredEntries = filteredEntries.filter(e => e.teacher.toLowerCase().includes(filters.teacherFilter!.toLowerCase()));
                }
            }
            resolve(filteredEntries);
        }, 600);
    });
}

// Admin Staff Attendance Management
const MOCK_STAFF_ATTENDANCE_RECORDS: StaffAttendanceRecord[] = [
  { id: 'S_ATT001', staffId: 'TCH101', staffName: 'Dr. Anjali Sharma', department: 'Administration', date: today.toISOString(), status: 'Present' },
  { id: 'S_ATT002', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: today.toISOString(), status: 'Absent' },
  { id: 'S_ATT003', staffId: 'ADM001', staffName: 'Mr. Rajesh Kumar', department: 'Administration', date: today.toISOString(), status: 'Late' },
  { id: 'S_ATT004', staffId: 'TCH101', staffName: 'Dr. Anjali Sharma', department: 'Administration', date: yesterday.toISOString(), status: 'Present' },
  { id: 'S_ATT005', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: yesterday.toISOString(), status: 'Present' },
  { id: 'S_ATT006', staffId: 'TCH103', staffName: 'Ms. Priya Patel', department: 'Academics - Middle School', date: today.toISOString(), status: 'Excused' },
];

export async function getAdminStaffAttendanceRecords(filters?: StaffAttendanceFilterFormValues): Promise<StaffAttendanceRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRecords = [...MOCK_STAFF_ATTENDANCE_RECORDS];
      if (filters) {
        if (filters.departmentFilter) {
          filteredRecords = filteredRecords.filter(r => r.department.toLowerCase().includes(filters.departmentFilter!.toLowerCase()));
        }
        if (filters.staffNameOrIdFilter) {
          const searchTerm = filters.staffNameOrIdFilter.toLowerCase();
          filteredRecords = filteredRecords.filter(r => 
            r.staffName.toLowerCase().includes(searchTerm) || 
            r.staffId.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.dateFilter) {
          const filterDate = startOfDay(filters.dateFilter);
          filteredRecords = filteredRecords.filter(r => isEqual(startOfDay(parseISO(r.date)), filterDate));
        }
      }
      resolve(filteredRecords);
    }, 650);
  });
}


// Admin Payment History
const MOCK_ADMIN_PAYMENT_HISTORY: AdminPaymentRecord[] = [
  { id: 'PAY_ADM_001', studentId: 'S10234', studentName: 'Aisha Sharma', paymentDate: '2024-07-10T10:00:00Z', description: 'Term 1 Fees - 2024-2025', amountPaid: 15000, paymentMethod: 'Net Banking', transactionId: 'TXN734589201' },
  { id: 'PAY_ADM_002', studentId: 'S10235', studentName: 'Rohan Verma', paymentDate: '2024-07-11T11:30:00Z', description: 'Term 1 Fees - 2024-2025', amountPaid: 14000, paymentMethod: 'Credit Card', transactionId: 'CCPAY_ROHVER001' },
  { id: 'PAY_ADM_003', studentId: 'S10234', studentName: 'Aisha Sharma', paymentDate: '2024-04-05T09:15:00Z', description: 'Term 4 Fees - 2023-2024', amountPaid: 14500, paymentMethod: 'UPI', transactionId: 'UPIPAY_AISHA002' },
  { id: 'PAY_ADM_004', studentId: 'S10236', studentName: 'Priya Singh', paymentDate: '2024-07-12T14:00:00Z', description: 'Term 1 Fees & Bus Fees', amountPaid: 18500, paymentMethod: 'Cheque', transactionId: 'CHQ123456' },
  { id: 'PAY_ADM_005', studentId: 'S10238', studentName: 'Sneha Patel', paymentDate: dayBeforeYesterday.toISOString(), description: 'Admission Fee', amountPaid: 25000, paymentMethod: 'Online Transfer', transactionId: 'NEFT00SPATEL' },
  { id: 'PAY_ADM_006', studentId: 'S10239', studentName: 'Vikram Reddy', paymentDate: yesterday.toISOString(), description: 'Term 1 Fees - 2024-25', amountPaid: 16000, paymentMethod: 'Net Banking', transactionId: 'TXNVRREDDY001' },
];

export async function getAdminPaymentHistory(filters?: AdminPaymentFiltersFormValues): Promise<AdminPaymentRecord[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredRecords = [...MOCK_ADMIN_PAYMENT_HISTORY];
      if (filters) {
        if (filters.studentIdOrName) {
          const searchTerm = filters.studentIdOrName.toLowerCase();
          filteredRecords = filteredRecords.filter(r =>
            r.studentName.toLowerCase().includes(searchTerm) ||
            r.studentId.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.dateFrom && filters.dateTo) {
          const startDate = startOfDay(filters.dateFrom);
          const endDate = endOfDay(filters.dateTo);
          filteredRecords = filteredRecords.filter(r => {
            const paymentDate = parseISO(r.paymentDate);
            return isWithinInterval(paymentDate, { start: startDate, end: endDate });
          });
        } else if (filters.dateFrom) {
          const startDate = startOfDay(filters.dateFrom);
          filteredRecords = filteredRecords.filter(r => {
            const paymentDate = parseISO(r.paymentDate);
            return paymentDate >= startDate;
          });
        } else if (filters.dateTo) {
          const endDate = endOfDay(filters.dateTo);
          filteredRecords = filteredRecords.filter(r => {
            const paymentDate = parseISO(r.paymentDate);
            return paymentDate <= endDate;
          });
        }
      }
      resolve(filteredRecords.sort((a, b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime()));
    }, 700);
  });
}

