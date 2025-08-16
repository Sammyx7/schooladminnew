
'use client';

import type { StudentDashboardData, FeeNotice, PaymentRecord, ReportCardData, TimetableEntry, Circular, StudentProfile } from '@/lib/types';
import { format, parseISO, isBefore, startOfToday } from 'date-fns';

// MOCK DATA for a specific student (Aisha Sharma, S10234)

const MOCK_STUDENT_PROFILE: StudentProfile = {
  studentId: "S10234",
  name: "Aisha Sharma",
  classSection: "Class 10 - Section A",
  avatarUrl: "https://placehold.co/100x100.png",
};

const MOCK_RECENT_CIRCULARS: Circular[] = [
    { id: 'CIR_ADM_003', title: 'Revised Examination Schedule - Mid Terms (Classes 9-12)', date: '2024-08-01T00:00:00.000Z', summary: 'The mid-term examination schedule for senior classes has been revised due to unforeseen circumstances. Please check the updated dates and timings.', category: 'Urgent', attachmentLink: 'https://placehold.co/circular2.pdf' },
    { id: 'CIR_ADM_004', title: 'Annual Day Celebration Invitations', date: '2024-09-10T00:00:00.000Z', summary: 'We are pleased to invite all parents and guardians to our Annual Day celebrations. Event details and RSVP information are attached.', category: 'Events' },
];

export async function getStudentDashboardData(studentId: string): Promise<StudentDashboardData> {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (studentId === "S10234") {
                resolve({
                    profile: MOCK_STUDENT_PROFILE,
                    attendancePercentage: 92,
                    feesDue: 2500,
                    recentCirculars: MOCK_RECENT_CIRCULARS,
                });
            }
        }, 800);
    });
}

const MOCK_FEE_NOTICES: FeeNotice[] = [
    { id: 'FN001', title: 'Term 2 Tuition Fees', amount: 15000, dueDate: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(), status: 'Paid', paidDate: new Date(new Date().setDate(new Date().getDate() - 22)).toISOString() },
    { id: 'FN002', title: 'Annual Sports Day Contribution', amount: 750, dueDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), status: 'Overdue' },
    { id: 'FN003', title: 'Bus Fees - Quarter 3', amount: 2500, dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), status: 'Due' },
];

export async function getStudentFeeNotices(studentId: string): Promise<FeeNotice[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Recalculate status based on current date for dynamism
            const today = startOfToday();
            const updatedNotices = MOCK_FEE_NOTICES.map(n => {
                if (n.status !== 'Paid') {
                    return { ...n, status: isBefore(parseISO(n.dueDate), today) ? 'Overdue' : 'Due' };
                }
                return n;
            });
            resolve(updatedNotices.sort((a,b) => parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime()));
        }, 600);
    });
}


const MOCK_PAYMENT_HISTORY: PaymentRecord[] = [
    { id: 'SPAY_001', date: new Date(new Date().setDate(new Date().getDate() - 22)).toISOString(), description: 'Term 2 Tuition Fees', amount: 15000, transactionId: 'TXN_STU_123' },
    { id: 'SPAY_002', date: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString(), description: 'Bus Fees - Quarter 2', amount: 2500, transactionId: 'TXN_STU_456' },
    { id: 'SPAY_003', date: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(), description: 'Term 1 Tuition Fees', amount: 15000, transactionId: 'TXN_STU_789' },
];

export async function getStudentPaymentHistory(studentId: string): Promise<PaymentRecord[]> {
     return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_PAYMENT_HISTORY);
        }, 700);
    });
}

const MOCK_REPORT_CARD: ReportCardData = {
    examName: 'Mid-Term Examination (2024-25)',
    subjects: [
        { name: 'Mathematics', marksObtained: 88, maxMarks: 100, grade: 'A+' },
        { name: 'Science', marksObtained: 92, maxMarks: 100, grade: 'A+' },
        { name: 'English', marksObtained: 85, maxMarks: 100, grade: 'A' },
        { name: 'Social Studies', marksObtained: 78, maxMarks: 100, grade: 'B+' },
        { name: 'Computer Science', marksObtained: 45, maxMarks: 50, grade: 'A+' },
    ],
    totalMarks: 388,
    maxTotalMarks: 450,
    percentage: (388 / 450) * 100,
    overallGrade: 'A',
    teacherRemarks: 'Aisha has shown excellent progress this term, especially in Science. Consistent effort in Social Studies will yield even better results. Keep up the great work!',
};

export async function getStudentReportCard(studentId: string): Promise<ReportCardData> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_REPORT_CARD);
        }, 1000);
    });
}

const MOCK_STUDENT_TIMETABLE: TimetableEntry[] = [
  { id: 'TT_ADM_1', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Mr. Vikram Singh' },
  { id: 'TT_STU_M2', day: 'Monday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Science', teacher: 'Ms. Geeta Rao' },
  { id: 'TT_STU_M3', day: 'Monday', period: 3, timeSlot: '10:45 - 11:30', subject: 'English', teacher: 'Ms. Sunita Lal' },
  { id: 'TT_STU_T1', day: 'Tuesday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Social Studies', teacher: 'Mr. Ashok Kumar' },
  { id: 'TT_STU_T2', day: 'Tuesday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Mr. Vikram Singh' },
  // ... more entries
];

export async function getStudentTimetable(studentId: string): Promise<TimetableEntry[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_STUDENT_TIMETABLE);
        }, 800);
    });
}

const MOCK_ALL_CIRCULARS_FOR_STUDENT: Circular[] = [
  { id: 'CIR_ADM_001', title: 'School Reopening Guidelines Post Summer Break', date: '2024-07-15T00:00:00.000Z', summary: 'Important guidelines and SOPs for students and parents regarding school reopening after the long summer vacation. Please ensure all protocols are followed strictly.', category: 'Academics', attachmentLink: 'https://placehold.co/circular1.pdf' },
  ...MOCK_RECENT_CIRCULARS,
  { id: 'CIR_ADM_005', title: 'Holiday Notice: School Closed for Local Festival', date: '2024-09-25T00:00:00.000Z', summary: 'The school will remain closed on the specified date in observance of a local festival. Classes will resume as normal the following day.', category: 'Holidays' },
];

export async function getStudentCirculars(studentId: string): Promise<Circular[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_ALL_CIRCULARS_FOR_STUDENT.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
        }, 700);
    });
}
