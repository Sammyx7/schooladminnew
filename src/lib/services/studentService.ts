
// This service simulates fetching data for the student dashboard.
// In a real application, this would involve API calls to a backend.
'use client'; // Can be 'use server' if it were a real backend call used by server components.

import type { StudentDashboardData, FeeNotice } from '@/lib/types';

const MOCK_STUDENT_DATA: StudentDashboardData = {
  profile: {
    name: "Aisha Sharma",
    avatarUrl: "https://placehold.co/100x100.png",
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
    time: "11:00 AM",
    teacher: "Ms. Kaur",
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
    avatarUrl: "https://placehold.co/100x100.png",
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
    teacher: "Mr. Gupta",
  },
  notifications: [
    { id: 1, type: "circular", title: "School picnic details announced", date: "2 days ago", href: "/student/circulars", read: false },
  ],
};


export async function getStudentDashboardData(studentId: string): Promise<StudentDashboardData> {
  // Simulate student-specific data or different scenarios
  // For this example, we'll return different data for a specific ID to show variation.
  const dataToReturn = studentId === "S10235" ? MOCK_STUDENT_DATA_NO_FEES : MOCK_STUDENT_DATA;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataToReturn);
    }, 1200); // Simulate network delay
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
  { id: 'FN001', title: 'Term 1 Fees', description: 'Tuition and activity fees for Term 1 2024-2025.', amount: 15000, dueDate: '2024-07-15', status: 'Paid', paymentLink: '#' },
  { id: 'FN002', title: 'Term 2 Fees', description: 'Tuition and activity fees for Term 2 2024-2025.', amount: 12500, dueDate: '2024-10-15', status: 'Pending', paymentLink: '#' },
  { id: 'FN003', title: 'Annual Sports Day Contribution', description: 'Contribution towards Annual Sports Day events.', amount: 500, dueDate: '2024-08-30', status: 'Pending', paymentLink: '#' },
  { id: 'FN004', title: 'Library Late Fee', description: 'Late return fee for "Adventures of Tom Sawyer".', amount: 50, dueDate: '2024-06-01', status: 'Overdue', paymentLink: '#' },
  { id: 'FN005', title: 'Bus Fees - Q1', description: 'Quarterly bus transportation charges.', amount: 3000, dueDate: '2024-07-10', status: 'Paid', paymentLink: '#' },
];

const MOCK_FEE_NOTICES_ALT: FeeNotice[] = [
    { id: 'FN101', title: 'Term 1 Fees', description: 'Tuition and activity fees for Term 1 2024-2025.', amount: 14000, dueDate: '2024-07-20', status: 'Paid', paymentLink: '#' },
    { id: 'FN102', title: 'Science Lab Contribution', description: 'Contribution for new lab equipment.', amount: 750, dueDate: '2024-09-10', status: 'Pending', paymentLink: '#' },
];


export async function getStudentFeeNotices(studentId: string): Promise<FeeNotice[]> {
  // Simulate different data based on studentId if needed
  const notices = studentId === "S10235" ? MOCK_FEE_NOTICES_ALT : MOCK_FEE_NOTICES;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(notices);
    }, 1000); // Simulate network delay
  });
}
