
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, MoreHorizontal, AlertCircle as AlertIcon, Search, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { AdminStaffListItem } from '@/lib/types';
import { getAdminStaffList } from '@/lib/services/adminService';
import { useToast } from '@/hooks/use-toast';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<AdminStaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<AdminStaffListItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminStaffList();
        setStaffList(data);
        setFilteredStaff(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred fetching staff data.";
        setError(errorMessage);
        toast({ title: "Error Fetching Staff", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = staffList.filter(staff =>
      staff.name.toLowerCase().includes(lowercasedFilter) ||
      staff.staffId.toLowerCase().includes(lowercasedFilter) ||
      staff.role.toLowerCase().includes(lowercasedFilter) ||
      staff.department.toLowerCase().includes(lowercasedFilter) ||
      staff.email.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredStaff(filteredData);
  }, [searchTerm, staffList]);

  const handleViewDetails = (staffId: string) => {
    router.push(`/admin/staff/view/${staffId}`);
  };

  const handleEditStaff = (staffId: string) => {
    router.push(`/admin/staff/edit/${staffId}`);
  };

  const handleDeleteStaff = () => {
    if (!staffToDelete) return;
    
    // Simulate API call for deletion - for now, just remove from local state
    setStaffList(prevList => prevList.filter(s => s.id !== staffToDelete.id));

    toast({
      title: "Staff Deleted",
      description: `Successfully removed ${staffToDelete.name} (${staffToDelete.staffId}).`,
      variant: "destructive"
    });
    setStaffToDelete(null);
  };

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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">Staff List</CardTitle>
           <div className="relative w-full sm:w-auto sm:max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full bg-input"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10%] text-xs uppercase font-medium text-muted-foreground">Staff ID</TableHead>
                  <TableHead className="w-[20%] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Role</TableHead>
                  <TableHead className="w-[20%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Department</TableHead>
                  <TableHead className="w-[20%] hidden lg:table-cell text-xs uppercase font-medium text-muted-foreground">Email</TableHead>
                  <TableHead className="w-[15%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Staff List</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredStaff.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Staff Found</p>
              <p>{searchTerm ? "No staff members match your search criteria." : "There are no staff records to display."}</p>
            </div>
          )}

          {!isLoading && !error && filteredStaff.length > 0 && (
            <Table>
              <TableHeader>
                 <TableRow>
                  <TableHead className="w-[12ch] text-xs uppercase font-medium text-muted-foreground">Staff ID</TableHead>
                  <TableHead className="min-w-[20ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="min-w-[15ch] text-xs uppercase font-medium text-muted-foreground">Role</TableHead>
                  <TableHead className="min-w-[20ch] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Department</TableHead>
                  <TableHead className="min-w-[25ch] hidden lg:table-cell text-xs uppercase font-medium text-muted-foreground">Email</TableHead>
                  <TableHead className="w-[10ch] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-mono text-sm">{staff.staffId}</TableCell>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell className="hidden md:table-cell">{staff.department}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{staff.email}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(staff.id)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(staff.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Staff
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setStaffToDelete(staff)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                             <Trash2 className="mr-2 h-4 w-4" /> Delete Staff
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
       <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member's record for "{staffToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
