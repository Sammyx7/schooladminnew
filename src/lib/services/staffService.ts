
'use client';

import type { StaffProfile, Circular, TimetableEntry, StaffAttendanceRecord, AttendanceStatus, DayOfWeek } from '@/lib/types';
import { format, parseISO, isEqual, startOfDay } from 'date-fns';


const MOCK_STAFF_PROFILE_DATA: StaffProfile = {
  id: 'STF002',
  staffId: 'TCH102',
  name: 'Mr. Vikram Singh',
  role: 'Mathematics Teacher',
  department: 'Academics - Senior Secondary',
  email: 'vikram.singh@example.com',
  phone: '9876543211',
  dateOfJoining: '2015-08-01',
  qualifications: ['M.Sc. Mathematics', 'B.Ed.'],
  avatarUrl: 'https://placehold.co/100x100.png',
};

export async function getStaffProfileData(staffId: string): Promise<StaffProfile> {
  // In a real app, you'd fetch data based on staffId
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STAFF_PROFILE_DATA);
    }, 800);
  });
}

const MOCK_STAFF_CIRCULARS: Circular[] = [
  { id: 'CIR_STF_001', title: 'Mandatory Training Session: New Assessment Policies', date: '2024-08-10', summary: 'All teaching staff are required to attend a training session on the updated assessment policies.', category: 'Academics', attachmentLink: '#' },
  { id: 'CIR_STF_002', title: 'Staff Meeting Schedule - August 2024', date: '2024-07-28', summary: 'The schedule for upcoming staff meetings in August is now available.', category: 'General' },
  { id: 'CIR_STF_003', title: 'Professional Development Workshop Opportunity', date: '2024-07-20', summary: 'Opportunity to enroll in an advanced workshop on "Digital Tools in Education". Limited seats.', category: 'Events', attachmentLink: '#' },
];

export async function getStaffCirculars(staffId: string): Promise<Circular[]> {
  // In a real app, filter circulars relevant to the staff member or their department
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_STAFF_CIRCULARS]);
    }, 700);
  });
}

const MOCK_STAFF_TIMETABLE_VIKRAM: TimetableEntry[] = [
  { id: 'STT_VS_M1', day: 'Monday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '10', section: 'A' },
  { id: 'STT_VS_M3', day: 'Monday', period: 3, timeSlot: '10:45 - 11:30', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '10', section: 'B' },
  { id: 'STT_VS_TU2', day: 'Tuesday', period: 2, timeSlot: '09:45 - 10:30', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '9', section: 'A' },
  { id: 'STT_VS_W4', day: 'Wednesday', period: 4, timeSlot: '11:30 - 12:15', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '10', section: 'A' },
  { id: 'STT_VS_TH1', day: 'Thursday', period: 1, timeSlot: '09:00 - 09:45', subject: 'Mathematics', teacher: 'Mr. Vikram Singh', class: '9', section: 'B' },
  { id: 'STT_VS_F3', day: 'Friday', period: 3, timeSlot: '10:45 - 11:30', subject: 'Remedial Mathematics', teacher: 'Mr. Vikram Singh', class: 'Combined', section: 'NA' },
];

export async function getStaffTimetable(staffId: string): Promise<TimetableEntry[]> {
  // For now, only return timetable for Mr. Vikram Singh (TCH102)
  if (staffId === 'TCH102') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_STAFF_TIMETABLE_VIKRAM]);
      }, 900);
    });
  }
  return Promise.resolve([]); // Return empty for other staff for now
}

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const dayBefore = new Date(today);
dayBefore.setDate(today.getDate() - 2);

const MOCK_STAFF_OWN_ATTENDANCE_VIKRAM: StaffAttendanceRecord[] = [
    { id: 'S_ATT_VS_1', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: today.toISOString(), status: 'Present' },
    { id: 'S_ATT_VS_2', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: yesterday.toISOString(), status: 'Present' },
    { id: 'S_ATT_VS_3', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: dayBefore.toISOString(), status: 'Late' },
    { id: 'S_ATT_VS_4', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: new Date(today.setDate(today.getDate() - 3)).toISOString(), status: 'Present' },
    { id: 'S_ATT_VS_5', staffId: 'TCH102', staffName: 'Mr. Vikram Singh', department: 'Academics - Senior Secondary', date: new Date(today.setDate(today.getDate() - 4)).toISOString(), status: 'Absent' },
];


export async function getStaffOwnAttendanceHistory(staffId: string): Promise<StaffAttendanceRecord[]> {
    if (staffId === 'TCH102') { // Assuming Mr. Vikram Singh's ID
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...MOCK_STAFF_OWN_ATTENDANCE_VIKRAM].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
            }, 600);
        });
    }
    return Promise.resolve([]);
}
