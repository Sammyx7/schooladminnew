
// This service simulates fetching data for the student dashboard.
// In a real application, this would involve API calls to a backend.
'use client'; // Can be 'use server' if it were a real backend call used by server components.

import type { StudentDashboardData, FeeNotice, ReportCardData, Circular, TimetableEntry, PaymentRecord, FeeNoticeStatus } from '@/lib/types';
import { Atom } from 'lucide-react'; // Using Atom for Physics

const MOCK_STUDENT_DATA: StudentDashboardData = {
  profile: {
    name: "Aisha Sharma",
    avatarUrl: "https://placehold.co/100x100.png", // data-ai-hint="student avatar" should be on the <img> tag
    studentId: "S10234",
    classSection: "Class 10 - Section A",
  },
  pendingFees: {
    amount: "2,500",
    dueDate: "15th August 2024",
    status: "pending",
  },
  nextClass: {
    subject: "Physics",
    time: "11:00 AM", // For countdown, this should ideally be a full timestamp
    teacher: "Ms. B. Kaur",
    subjectIcon: Atom,
  },
  notifications: [
    { id: 1, type: "circular", title: "Annual Sports Day registration open", date: "1 day ago", href: "/student/circulars", read: false },
    { id: 2, type: "fee", title: "Gentle reminder: Term 2 fee due soon", date: "Yesterday", href: "/student/fee-notices", read: true },
    { id: 3, type: "report", title: "Unit Test 1 report card now available", date: "3 days ago", href: "/student/report-card", read: false },
    { id: 4, type: "event", title: "Inter-School Debate Competition sign-up", date: "4 days ago", href: "/student/circulars", read: true },
    { id: 5, type: "general", title: "Library closure for maintenance on Friday", date: "1 week ago", href: "/student/circulars", read: false },
  ],
};

const MOCK_STUDENT_DATA_NO_FEES: StudentDashboardData = {
  profile: {
    name: "Rohan Verma",
    avatarUrl: "https://placehold.co/100x100.png", // data-ai-hint="student avatar"
    studentId: "S10235",
    classSection: "Class 9 - Section B",
  },
  pendingFees: {
    amount: "0",
    dueDate: "",
    status: "none",
  },
  nextClass: {
    subject: "Chemistry",
    time: "09:00 AM",
    teacher: "Mr. D. Gupta",
    // subjectIcon: BeakerIcon, // Example
  },
  notifications: [
    { id: 1, type: "circular", title: "School picnic details announced", date: "2 days ago", href: "/student/circulars", read: false },
  ],
};

const MOCK_STUDENT_DATA_OVERDUE: StudentDashboardData = {
  profile: {
    name: "Priya Singh",
    avatarUrl: "https://placehold.co/100x100.png", // data-ai-hint="student avatar"
    studentId: "S10236",
    classSection: "Class 11 - Commerce",
  },
  pendingFees: {
    amount: "5,750",
    dueDate: "1st July 2024", // Past due date
    status: "overdue",
  },
  nextClass: {
    subject: "Accountancy",
    time: "14:30 PM",
    teacher: "Mr. K. Mehta",
  },
  notifications: [
    { id: 1, type: "fee", title: "Urgent: Fee payment overdue!", date: "5 days ago", href: "/student/fee-notices", read: false },
  ],
};


export async function getStudentDashboardData(studentId: string): Promise<StudentDashboardData> {
  let dataToReturn = MOCK_STUDENT_DATA;
  if (studentId === "S10235") {
    dataToReturn = MOCK_STUDENT_DATA_NO_FEES;
  } else if (studentId === "S10236") {
    dataToReturn = MOCK_STUDENT_DATA_OVERDUE;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataToReturn);
    }, 1200); 
  });
}

export async function getStudentDashboardDataWithError(): Promise<StudentDashboardData> {
    return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Failed to fetch student dashboard data. Please try again later."));
    }, 1200);
  });
}


// Mock Fee Notices Data
const MOCK_FEE_NOTICES: FeeNotice[] = [
  { id: 'FN001', title: 'Term 1 Fees', description: 'Tuition and activity fees for Term 1 2024-2025.', amount: 15000, dueDate: new Date('2024-07-15').toISOString(), status: 'Paid', paymentLink: '#' },
  { id: 'FN002', title: 'Term 2 Fees', description: 'Tuition and activity fees for Term 2 2024-2025.', amount: 12500, dueDate: new Date('2024-10-15').toISOString(), status: 'Pending', paymentLink: '#' },
  { id: 'FN003', title: 'Annual Sports Day Contribution', description: 'Contribution towards Annual Sports Day events.', amount: 500, dueDate: new Date('2024-08-30').toISOString(), status: 'Pending', paymentLink: '#' },
  { id: 'FN004', title: 'Library Late Fee', description: 'Late return fee for "Adventures of Tom Sawyer".', amount: 50, dueDate: new Date('2024-06-01').toISOString(), status: 'Overdue', paymentLink: '#' },
  { id: 'FN005', title: 'Bus Fees - Q1', description: 'Quarterly bus transportation charges.', amount: 3000, dueDate: new Date('2024-07-10').toISOString(), status: 'Paid', paymentLink: '#' },
];

const MOCK_FEE_NOTICES_ALT: FeeNotice[] = [
    { id: 'FN101', title: 'Term 1 Fees', description: 'Tuition and activity fees for Term 1 2024-2025.', amount: 14000, dueDate: new Date('2024-07-20').toISOString(), status: 'Paid', paymentLink: '#' },
    { id: 'FN102', title: 'Science Lab Contribution', description: 'Contribution for new lab equipment.', amount: 750, dueDate: new Date('2024-09-10').toISOString(), status: 'Pending', paymentLink: '#' },
];


export async function getStudentFeeNotices(studentId: string): Promise<FeeNotice[]> {
  // Simulate different data based on studentId if needed
  const notices = studentId === "S10235" ? MOCK_FEE_NOTICES_ALT : MOCK_FEE_NOTICES;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(notices))); // Return a deep copy
    }, 1000); // Simulate network delay
  });
}

// Mock Report Card Data
const MOCK_REPORT_CARDS_S10234: ReportCardData[] = [
  {
    id: 'RC001_T1',
    termName: 'Term 1 Examination - 2024',
    issueDate: '2024-08-15',
    subjects: [
      { id: 'SUB01', subjectName: 'English Literature', grade: 'A+', marks: 92, maxMarks: 100, remarks: 'Excellent understanding' },
      { id: 'SUB02', subjectName: 'Mathematics', grade: 'A', marks: 85, maxMarks: 100, remarks: 'Good problem-solving skills' },
      { id: 'SUB03', subjectName: 'Physics', grade: 'A', marks: 88, maxMarks: 100, remarks: 'Strong grasp of concepts' },
      { id: 'SUB04', subjectName: 'Chemistry', grade: 'B+', marks: 78, maxMarks: 100, remarks: 'Needs to focus on reactions' },
      { id: 'SUB05', subjectName: 'Biology', grade: 'A+', marks: 90, maxMarks: 100, remarks: 'Very detailed diagrams' },
      { id: 'SUB06', subjectName: 'History', grade: 'A', marks: 82, maxMarks: 100, remarks: 'Good analytical answers' },
    ],
    overallPercentage: '85.83%',
    overallGrade: 'A',
    classRank: '3rd',
    teacherComments: 'Aisha has shown excellent progress this term. Consistent effort will yield even better results. Keep up the good work!',
    downloadLink: '#',
  },
  {
    id: 'RC001_MT',
    termName: 'Mid-Term Assessment - 2024',
    issueDate: '2024-05-10',
    subjects: [
      { id: 'SUB01_MT', subjectName: 'English Literature', grade: 'A', marks: 88, maxMarks: 100 },
      { id: 'SUB02_MT', subjectName: 'Mathematics', grade: 'B+', marks: 75, maxMarks: 100 },
      { id: 'SUB03_MT', subjectName: 'Physics', grade: 'A-', marks: 80, maxMarks: 100 },
    ],
    overallPercentage: '81.00%',
    overallGrade: 'A-',
    teacherComments: 'Good performance. Focus on consistent revision.',
    downloadLink: '#',
  }
];

const MOCK_REPORT_CARDS_S10235: ReportCardData[] = [
 {
    id: 'RC002_T1',
    termName: 'Term 1 Examination - 2024',
    issueDate: '2024-08-16',
    subjects: [
      { id: 'SUB07', subjectName: 'English Language', grade: 'A', marks: 85, maxMarks: 100 },
      { id: 'SUB08', subjectName: 'Mathematics', grade: 'A-', marks: 80, maxMarks: 100 },
      { id: 'SUB09', subjectName: 'General Science', grade: 'B+', marks: 77, maxMarks: 100 },
    ],
    overallPercentage: '80.67%',
    overallGrade: 'A-',
    teacherComments: 'Rohan is a dedicated student. Improvement seen in Science.',
    downloadLink: '#',
  }
];

export async function getStudentReportCards(studentId: string): Promise<ReportCardData[]> {
  const reports = studentId === "S10235" ? MOCK_REPORT_CARDS_S10235 : MOCK_REPORT_CARDS_S10234;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(reports);
    }, 1300); // Simulate network delay
  });
}

// Mock Circulars Data
const MOCK_CIRCULARS_S10234: Circular[] = [
  { id: 'CIR001', title: 'Annual Sports Day - Schedule & Guidelines', date: new Date('2024-08-05').toISOString(), summary: 'Details about the upcoming Annual Sports Day, including event schedules, participation guidelines, and venue information.', category: 'Events', attachmentLink: 'https://placehold.co/sports_day_schedule.pdf' },
  { id: 'CIR002', title: 'Holiday Declared: Independence Day', date: new Date('2024-08-01').toISOString(), summary: 'The school will remain closed on August 15th, 2024, on account of Independence Day.', category: 'Holidays' },
  { id: 'CIR003', title: 'Parent-Teacher Meeting for Class 10', date: new Date('2024-07-28').toISOString(), summary: 'A parent-teacher meeting is scheduled for all students of Class 10 to discuss academic progress and upcoming board examinations.', category: 'Academics' },
  { id: 'CIR004', title: 'Library Books Return Reminder', date: new Date('2024-07-25').toISOString(), summary: 'All students are reminded to return any overdue library books by July 30th to avoid late fees.', category: 'General', attachmentLink: 'https://placehold.co/library_rules.pdf' },
  { id: 'CIR005', title: 'Urgent: School Timings Change for Friday', date: new Date('2024-07-18').toISOString(), summary: 'Due to unavoidable circumstances, school will disperse at 12:00 PM on Friday, July 19th.', category: 'Urgent'},
];

const MOCK_CIRCULARS_S10235: Circular[] = [
  { id: 'CIR101', title: 'Science Fair Participation Announcement', date: new Date('2024-08-02').toISOString(), summary: 'Students interested in participating in the Inter-School Science Fair are requested to register by August 10th.', category: 'Academics', attachmentLink: 'https://placehold.co/science_fair_details.pdf' },
  { id: 'CIR102', title: 'Art Competition for Classes 6-9', date: new Date('2024-07-29').toISOString(), summary: 'An art competition will be held on August 5th. Theme: "Our Environment".', category: 'Events' },
];

export async function getStudentCirculars(studentId: string): Promise<Circular[]> {
  const circulars = studentId === "S10235" ? MOCK_CIRCULARS_S10235 : MOCK_CIRCULARS_S10234;
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by date descending before resolving
      const sortedCirculars = circulars.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      resolve(sortedCirculars);
    }, 900); // Simulate network delay
  });
}

// Mock Timetable Data
const MOCK_TIMETABLE_S10234: TimetableEntry[] = [
  { id: 'TT001', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Mr. A. Sharma' },
  { id: 'TT002', day: 'Monday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Physics', teacher: 'Ms. B. Kaur' },
  { id: 'TT003', day: 'Monday', period: 3, timeSlot: '10:45 - 11:30', subject: 'English', teacher: 'Mrs. C. Davis' },
  { id: 'TT004', day: 'Monday', period: 4, timeSlot: '11:30 - 12:15', subject: 'Chemistry', teacher: 'Mr. D. Gupta' },
  { id: 'TT005', day: 'Tuesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Biology', teacher: 'Dr. E. Singh' },
  { id: 'TT006', day: 'Tuesday', period: 2, timeSlot: '09:45 - 10:30', subject: 'History', teacher: 'Ms. F. Roy' },
  { id: 'TT007', day: 'Wednesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Geography', teacher: 'Mr. G. Khan' },
  { id: 'TT008', day: 'Wednesday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Mr. A. Sharma' },
  { id: 'TT009', day: 'Thursday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Physics', teacher: 'Ms. B. Kaur' },
  { id: 'TT010', day: 'Friday', period: 1, timeSlot: '09:00 - 09:45', subject: 'English', teacher: 'Mrs. C. Davis' },
  { id: 'TT011', day: 'Friday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Physical Education', teacher: 'Mr. H. Kumar' },
  { id: 'TT012', day: 'Saturday', period: 1, timeSlot: '10:00 - 11:30', subject: 'Activity Club', teacher: 'Coordinator' },
];

const MOCK_TIMETABLE_S10235: TimetableEntry[] = [
  { id: 'TT101', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Art & Craft', teacher: 'Ms. I. Reddy' },
  { id: 'TT102', day: 'Monday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Music', teacher: 'Mr. J. Lobo' },
  { id: 'TT103', day: 'Wednesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Computer Science', teacher: 'Ms. K. Iyer' },
  // This student has fewer classes to test empty day tabs
];

export async function getStudentTimetable(studentId: string): Promise<TimetableEntry[]> {
  const timetable = studentId === "S10235" ? MOCK_TIMETABLE_S10235 : MOCK_TIMETABLE_S10234;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(timetable);
    }, 1100); // Simulate network delay
  });
}

// Mock Payment History Data
const MOCK_PAYMENT_HISTORY_S10234: PaymentRecord[] = [
  { id: 'PAY001', paymentDate: new Date('2024-07-10T10:00:00Z').toISOString(), description: 'Term 1 Fees - 2024-2025', amountPaid: 15000, paymentMethod: 'Net Banking - HDFC000123', transactionId: 'TXN734589201' },
  { id: 'PAY002', paymentDate: new Date('2024-07-08T11:30:00Z').toISOString(), description: 'Bus Fees - Q1 2024', amountPaid: 3000, paymentMethod: 'UPI - studentparent@okhdfc', transactionId: 'UPI987654321' },
  { id: 'PAY003', paymentDate: new Date('2024-04-05T09:15:00Z').toISOString(), description: 'Term 4 Fees - 2023-2024', amountPaid: 14500, paymentMethod: 'Credit Card **** 5678', transactionId: 'CC408723456' },
  { id: 'PAY004', paymentDate: new Date('2024-03-15T14:00:00Z').toISOString(), description: 'Annual Day Costume Contribution', amountPaid: 350, paymentMethod: 'Cash', transactionId: 'CASH00123' },
];

const MOCK_PAYMENT_HISTORY_S10235: PaymentRecord[] = [
  { id: 'PAY101', paymentDate: new Date('2024-07-15T10:00:00Z').toISOString(), description: 'Term 1 Fees - 2024-2025', amountPaid: 14000, paymentMethod: 'Credit Card **** 1122', transactionId: 'TXN982345001' },
  { id: 'PAY102', paymentDate: new Date('2024-04-10T11:30:00Z').toISOString(), description: 'Term 4 Fees - 2023-2024', amountPaid: 13500, paymentMethod: 'Net Banking - ICICI000456', transactionId: 'NB500239871' },
];

export async function getStudentPaymentHistory(studentId: string): Promise<PaymentRecord[]> {
  const history = studentId === "S10235" ? MOCK_PAYMENT_HISTORY_S10235 : MOCK_PAYMENT_HISTORY_S10234;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(history);
    }, 800); // Simulate network delay
  });
}

