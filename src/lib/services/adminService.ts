
'use client';

import type { StudentProfile, Circular, CreateCircularFormValues, BulkFeeNoticeDefinition, BulkFeeNoticeFormValues, StudentApplication, StudentApplicationFormValues, ApplicationStatus } from '@/lib/types';
import { format, parseISO } from 'date-fns';

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
