# **App Name**: SchoolAdmin

## Core Features:

- Admin Overview: Displays key metrics such as fees collected, pending admissions, and attendance overview using clear, concise cards.
- Student Profile Display: Allows viewing of student details including ID, name, contact information, and parent/guardian details in a structured format. A placeholder for viewing student specific documents is present.
- Fee Notice Viewer: Provides a dedicated section for students to view fee notices and payment status.
- Staff Profile Display: Allows staff members to view their profile information including Staff ID, Role, Contact, and Date of Birth.
- Role Based Access Control: Implements role-based authentication to ensure only authorized users (Admin, Students, Staff) can access specific dashboards and functionalities.
- Summarized Notices: Utilizes a generative AI tool to generate summaries of important school notices to help parents understand important details more efficiently. LLM determines what information to include.
- Bulk Fee Notices: Module for generating fee notices for multiple students by standard/section, including auto-calculation of late fees and placeholders for sending reminders.
- Payment History: Provides payment history tracking for students and admins, with tables displaying payment details and status, along with placeholders for UPI integration.
- Admission Management: Manages student admissions through online forms with document upload, status tracking, and verification processes.
- Staff Attendance: Enables staff to record attendance by scanning a QR code generated on the admin dashboard. Includes a history table showing attendance records.
- Teacher Onboarding: Provides a form for onboarding new teachers, including fields for personal information, qualifications, and document uploads, with a placeholder for document verification.
- Staff Performance Records: Displays staff salary, attendance percentage, and performance metrics, such as feedback scores, within the staff profile.
- Staff Management: Manages all staff-related data, including details, attendance records, and performance metrics. Includes functionality for calculating salaries based on attendance.
- Student Attendance: Adds student attendance table for student ID, name, standard, section, and attendance. Filters are added for standard, section, and date, as well as a CSV export.
- Marks Entry: Adds forms in order to enter marks (subject, marks, and remarks) per standard or section; Entries are saved and displayed.
- Report Card Generation: Generates class-wise report cards as a PDF preview. Report cards include student names, subjects, marks, and remarks.
- Timetable Management: Displays weekly schedule (Standard, Section, Day, Period, Subject); Allows class teachers to edit.
- Circulars/Notices: Adds functionality to manage school circulars and notices, targetable to specific classes or staff groups, with options for SMS/WhatsApp/email notifications.
- Transport: Adds functionality for managing school transport, including bus routes, driver assignments, and student assignments, with WhatsApp notification placeholders.
- Reports: Enhances reporting capabilities with CSV exports for fees, attendance, admissions, expenses, and marks, and chart visualizations (bar for fees, pie for expenses).
- Notifications: Adds settings for managing notification preferences, such as enabling/disabling SMS/WhatsApp notifications.

## Style Guidelines:

- Soft sky blue (#87CEEB) to evoke trust, security, and knowledge, aligning with the educational context.
- Very light desaturated blue (#F0F8FF), providing a clean and calm backdrop for the interface.
- Light periwinkle (#B39DDB), an analogous color providing contrast for interactive elements and highlights without disrupting the calm and trustworthy vibe.
- Clean, readable sans-serif font to maintain readability and a professional look.
- Simple, consistent icons for navigation and key actions to enhance user experience.
- Use a clear, structured layout with a sidebar for navigation and cards for displaying information, optimized for both web and mobile.