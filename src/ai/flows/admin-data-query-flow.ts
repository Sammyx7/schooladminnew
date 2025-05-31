
'use server';
/**
 * @fileOverview A Genkit flow for answering admin questions about school data using tools.
 *
 * - querySchoolData - A function that handles querying school data.
 * - AdminDataQueryInput - The input type for the querySchoolData function.
 * - AdminDataQueryOutput - The return type for the querySchoolData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  getAdminStudentList,
  getAdminStaffList,
  getAdminPaymentHistory,
  getAdminCirculars,
  getAdminStudentAttendanceRecords,
  getAdminStaffAttendanceRecords,
  getAdminExpenseRecords,
  getAdminStudentApplications,
} from '@/lib/services/adminService';
import type { AdminPaymentFiltersFormValues } from '@/lib/types';

import {
  StudentProfileSchema,
  AdminStaffListItemSchema,
  AdminPaymentRecordSchema,
  CircularSchema,
  circularCategories, // Added import
  StudentAttendanceRecordSchema,
  StaffAttendanceRecordSchema,
  ExpenseRecordSchema,
  expenseCategories, // Added import
  StudentApplicationSchema,
  applicationStatuses // Added import
} from '@/lib/types';


// Input/Output Schemas for the main flow
const AdminDataQueryInputSchema = z.object({
  question: z.string().describe('The natural language question from the admin.'),
});
export type AdminDataQueryInput = z.infer<typeof AdminDataQueryInputSchema>;

const AdminDataQueryOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the admin\'s question.'),
});
export type AdminDataQueryOutput = z.infer<typeof AdminDataQueryOutputSchema>;

// Tool: Get Student List
const getStudentsTool = ai.defineTool(
  {
    name: 'getStudentList',
    description: 'Fetches a list of all student profiles, including their ID, name, and class section. Use this to answer questions about students.',
    inputSchema: z.object({
        nameFilter: z.string().optional().describe("Optional: Filter students whose name contains this string."),
        idFilter: z.string().optional().describe("Optional: Filter students whose ID contains this string."),
        classFilter: z.string().optional().describe("Optional: Filter students whose class/section contains this string."),
    }),
    outputSchema: z.array(StudentProfileSchema),
  },
  async (input) => {
    const allStudents = await getAdminStudentList();
    let filteredStudents = allStudents;
    if (input?.nameFilter) {
        filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(input.nameFilter!.toLowerCase()));
    }
    if (input?.idFilter) {
        filteredStudents = filteredStudents.filter(s => s.studentId.toLowerCase().includes(input.idFilter!.toLowerCase()));
    }
    if (input?.classFilter) {
        filteredStudents = filteredStudents.filter(s => s.classSection.toLowerCase().includes(input.classFilter!.toLowerCase()));
    }
    return filteredStudents;
  }
);

// Tool: Get Staff List
const getStaffTool = ai.defineTool(
  {
    name: 'getStaffList',
    description: 'Fetches a list of all staff members, including their ID, name, role, department, and email. Use this for questions about school staff.',
    inputSchema: z.object({
        nameFilter: z.string().optional().describe("Optional: Filter staff whose name contains this string."),
        roleFilter: z.string().optional().describe("Optional: Filter staff whose role contains this string."),
        departmentFilter: z.string().optional().describe("Optional: Filter staff whose department contains this string."),
    }),
    outputSchema: z.array(AdminStaffListItemSchema),
  },
  async (input) => {
    const allStaff = await getAdminStaffList();
    let filteredStaff = allStaff;
     if (input?.nameFilter) {
        filteredStaff = filteredStaff.filter(s => s.name.toLowerCase().includes(input.nameFilter!.toLowerCase()));
    }
    if (input?.roleFilter) {
        filteredStaff = filteredStaff.filter(s => s.role.toLowerCase().includes(input.roleFilter!.toLowerCase()));
    }
    if (input?.departmentFilter) {
        filteredStaff = filteredStaff.filter(s => s.department.toLowerCase().includes(input.departmentFilter!.toLowerCase()));
    }
    return filteredStaff;
  }
);

// Tool: Get Payment History
const PaymentHistoryFilterSchema = z.object({
  studentIdOrName: z.string().optional().describe("Optional: Filter by student ID or name."),
  dateFrom: z.string().optional().describe("Optional: Start date for payments (YYYY-MM-DD)."),
  dateTo: z.string().optional().describe("Optional: End date for payments (YYYY-MM-DD)."),
});
const getPaymentHistoryTool = ai.defineTool(
  {
    name: 'getPaymentHistory',
    description: 'Fetches student payment records. Can be filtered by student ID/name and date range. Use this for questions about payments.',
    inputSchema: PaymentHistoryFilterSchema,
    outputSchema: z.array(AdminPaymentRecordSchema),
  },
  async (input) => {
    const filters: AdminPaymentFiltersFormValues = {
        studentIdOrName: input?.studentIdOrName,
        dateFrom: input?.dateFrom ? new Date(input.dateFrom) : undefined,
        dateTo: input?.dateTo ? new Date(input.dateTo) : undefined,
    };
    return getAdminPaymentHistory(filters);
  }
);

// Tool: Get Circulars
const getCircularsTool = ai.defineTool(
  {
    name: 'getCircularsList',
    description: 'Fetches a list of all school circulars, including title, date, summary, and category. Use this for questions about school notices or circulars.',
    inputSchema: z.object({
        categoryFilter: z.enum(circularCategories).optional().describe("Optional: Filter circulars by category."),
        titleContains: z.string().optional().describe("Optional: Filter circulars where title contains this string."),
    }),
    outputSchema: z.array(CircularSchema),
  },
  async (input) => {
    const allCirculars = await getAdminCirculars();
    let filteredCirculars = allCirculars;
    if (input?.categoryFilter) {
        filteredCirculars = filteredCirculars.filter(c => c.category === input.categoryFilter);
    }
    if (input?.titleContains) {
        filteredCirculars = filteredCirculars.filter(c => c.title.toLowerCase().includes(input.titleContains!.toLowerCase()));
    }
    return filteredCirculars;
  }
);

// Tool: Get Student Attendance
const StudentAttendanceFilterToolSchema = z.object({
  classFilter: z.string().optional().describe("Optional: Filter by class (e.g., '10')."),
  sectionFilter: z.string().optional().describe("Optional: Filter by section (e.g., 'A')."),
  dateFilter: z.string().optional().describe("Optional: Filter by specific date (YYYY-MM-DD)."),
});
const getStudentAttendanceTool = ai.defineTool(
  {
    name: 'getStudentAttendance',
    description: 'Fetches student attendance records. Can be filtered by class, section, and date. Use this for questions about student attendance.',
    inputSchema: StudentAttendanceFilterToolSchema,
    outputSchema: z.array(StudentAttendanceRecordSchema),
  },
  async (input) => {
    return getAdminStudentAttendanceRecords({
      classFilter: input?.classFilter,
      sectionFilter: input?.sectionFilter,
      dateFilter: input?.dateFilter ? new Date(input.dateFilter) : undefined,
    });
  }
);

// Tool: Get Staff Attendance
const StaffAttendanceFilterToolSchema = z.object({
  departmentFilter: z.string().optional().describe("Optional: Filter by department."),
  staffNameOrIdFilter: z.string().optional().describe("Optional: Filter by staff name or ID."),
  dateFilter: z.string().optional().describe("Optional: Filter by specific date (YYYY-MM-DD)."),
});
const getStaffAttendanceTool = ai.defineTool(
  {
    name: 'getStaffAttendance',
    description: 'Fetches staff attendance records. Can be filtered by department, staff name/ID, and date. Use this for questions about staff attendance.',
    inputSchema: StaffAttendanceFilterToolSchema,
    outputSchema: z.array(StaffAttendanceRecordSchema),
  },
  async (input) => {
    return getAdminStaffAttendanceRecords({
      departmentFilter: input?.departmentFilter,
      staffNameOrIdFilter: input?.staffNameOrIdFilter,
      dateFilter: input?.dateFilter ? new Date(input.dateFilter) : undefined,
    });
  }
);

// Tool: Get Expense Records
const getExpenseRecordsTool = ai.defineTool(
  {
    name: 'getExpenseRecords',
    description: 'Fetches school expense records, including date, category, description, and amount. Use this for questions about school expenses.',
    inputSchema: z.object({
        categoryFilter: z.enum(expenseCategories).optional().describe("Optional: Filter expenses by category."),
        descriptionContains: z.string().optional().describe("Optional: Filter expenses where description contains this string."),
    }),
    outputSchema: z.array(ExpenseRecordSchema),
  },
  async (input) => {
    const allExpenses = await getAdminExpenseRecords();
    let filteredExpenses = allExpenses;
    if (input?.categoryFilter) {
        filteredExpenses = filteredExpenses.filter(e => e.category === input.categoryFilter);
    }
    if (input?.descriptionContains) {
        filteredExpenses = filteredExpenses.filter(e => e.description.toLowerCase().includes(input.descriptionContains!.toLowerCase()));
    }
    return filteredExpenses;
  }
);

// Tool: Get Admission Applications
const AdmissionApplicationFilterToolSchema = z.object({
    statusFilter: z.enum(applicationStatuses).optional().describe("Optional: Filter applications by status."),
    classAppliedForFilter: z.string().optional().describe("Optional: Filter applications by class applied for."),
});
const getAdmissionApplicationsTool = ai.defineTool(
  {
    name: 'getAdmissionApplications',
    description: 'Fetches student admission applications, including applicant name, class applied for, date, and status. Use this for questions about admissions.',
    inputSchema: AdmissionApplicationFilterToolSchema,
    outputSchema: z.array(StudentApplicationSchema),
  },
  async (input) => {
    const allApplications = await getAdminStudentApplications();
    let filteredApplications = allApplications;
    if (input?.statusFilter) {
        filteredApplications = filteredApplications.filter(app => app.status === input.statusFilter);
    }
    if (input?.classAppliedForFilter) {
        filteredApplications = filteredApplications.filter(app => app.classAppliedFor.toLowerCase().includes(input.classAppliedForFilter!.toLowerCase()));
    }
    return filteredApplications;
  }
);


// Main Prompt
const dataQueryPrompt = ai.definePrompt({
  name: 'adminDataQueryPrompt',
  system: `You are a helpful AI assistant for a school administrator. Your role is to answer questions based on the school's data.
Use the available tools to fetch information about students, staff, payments, circulars, attendance, expenses, and admissions.
If a question is ambiguous or requires data you don't have a tool for, you can say so.
Be concise and clear in your answers. If a tool returns a list of items, summarize it or highlight key information relevant to the question. Don't just dump raw JSON.
If a tool returns an empty list, state that no relevant data was found based on the criteria.
When providing dates, use a clear, human-readable format.
Example: If asked "How many students are in Class 10?", you should use the getStudentList tool, possibly with a classFilter, count the results, and then state the number.
Example: If asked "List all pending payments", use getPaymentHistory tool, filter for pending status (if possible, or process results), and list them or summarize. The payment history tool does not directly filter by status, so you'll need to infer or summarize from the general payment data if the user asks for something specific like 'pending' or 'overdue'.
Example: If asked "Who is the principal?", use the getStaffList tool, look for a role like 'Principal', and state their name.
If you use a tool and get multiple results, try to summarize or list them clearly. For instance, "There are X students in Class 10: Name1 (ID1), Name2 (ID2)..." or "Found X payments: Payment1 details, Payment2 details...".
If a question can be answered without a tool based on the conversation history or general knowledge, do so.
When referring to data from tools, make it sound natural, e.g., "Looking at the student records, I found..." or "According to the payment history...".
`,
  input: { schema: AdminDataQueryInputSchema },
  output: { schema: AdminDataQueryOutputSchema },
  tools: [
    getStudentsTool,
    getStaffTool,
    getPaymentHistoryTool,
    getCircularsTool,
    getStudentAttendanceTool,
    getStaffAttendanceTool,
    getExpenseRecordsTool,
    getAdmissionApplicationsTool,
  ],
  config: {
    // Lower temperature for more factual, less creative responses based on tool output
    temperature: 0.2, 
  }
});

// Flow Definition
const adminDataQueryFlow = ai.defineFlow(
  {
    name: 'adminDataQueryFlow',
    inputSchema: AdminDataQueryInputSchema,
    outputSchema: AdminDataQueryOutputSchema,
  },
  async (input) => {
    const llmResponse = await dataQueryPrompt(input); // Pass the whole input object
    const output = llmResponse.output();
    if (!output) {
        // Fallback or error handling if output is null
        return { answer: "I couldn't generate a response. Please try again." };
    }
    return output;
  }
);

// Exported wrapper function
export async function querySchoolData(input: AdminDataQueryInput): Promise<AdminDataQueryOutput> {
  return adminDataQueryFlow(input);
}

