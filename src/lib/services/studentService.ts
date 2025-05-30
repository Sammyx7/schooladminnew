
// This service simulates fetching data for the student dashboard.
// In a real application, this would involve API calls to a backend.
'use client'; // Can be 'use server' if it were a real backend call used by server components.

import type { StudentDashboardData } from '@/lib/types';

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
