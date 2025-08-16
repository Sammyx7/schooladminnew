
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, AlertCircle as AlertIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { StudentProfile } from '@/lib/types';
import { getAdminStudentList } from '@/lib/services/adminService'; 
import StudentListClient from './StudentListClient';

export default async function AdminStudentsPage() {
  let students: StudentProfile[] = [];
  let error: string | null = null;

  try {
    students = await getAdminStudentList();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred fetching student data.";
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Student Management"
        icon={Users}
        description="View, search, and manage student profiles and details."
      />

      <Card className="w-full border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Students</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && <StudentListClient initialStudents={students} />}
        </CardContent>
      </Card>
    </div>
  );
}
