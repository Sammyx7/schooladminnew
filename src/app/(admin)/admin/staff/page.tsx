
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { AdminStaffListItem } from '@/lib/types';
import { getAdminStaffList } from '@/lib/services/adminService';
import StaffListClient from './StaffListClient';


export default async function AdminStaffPage() {
  
  let staffList: AdminStaffListItem[] = [];
  let error: string | null = null;

  try {
    staffList = await getAdminStaffList();
  } catch (err) {
    error = err instanceof Error ? err.message : "An unknown error occurred fetching staff data.";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        icon={Briefcase}
        description="View, search, and manage staff profiles and details."
        actions={
          <Button asChild>
            <Link href="/admin/staff/onboard">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Link>
          </Button>
        }
      />

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Staff List</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error Fetching Staff List</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && (
            <StaffListClient initialStaff={staffList} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
