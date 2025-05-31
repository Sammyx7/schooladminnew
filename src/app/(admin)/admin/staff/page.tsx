
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, MoreHorizontal, AlertCircle as AlertIcon, Loader2, Search, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import type { AdminStaffListItem } from '@/lib/types';
import { getAdminStaffList } from '@/lib/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<AdminStaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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

  const handleViewDetails = (staff: AdminStaffListItem) => {
    toast({ title: "View Details (Placeholder)", description: `Viewing details for ${staff.name} (${staff.staffId}).` });
  };

  const handleEditStaff = (staff: AdminStaffListItem) => {
    toast({ title: "Edit Staff (Placeholder)", description: `Editing details for ${staff.name} (${staff.staffId}).` });
  };
  
  const handleDeleteStaff = (staff: AdminStaffListItem) => {
     toast({ title: "Delete Staff (Placeholder)", description: `Deleting ${staff.name} (${staff.staffId}).`, variant: "destructive" });
  };

  const handleAddNewStaff = () => {
    toast({ title: "Add New Staff (Placeholder)", description: "This would open a form to add a new staff member." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        icon={Briefcase}
        description="View, search, and manage staff profiles and details."
        actions={
          <Button onClick={handleAddNewStaff}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Staff
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
                          <DropdownMenuItem onClick={() => handleViewDetails(staff)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Staff
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteStaff(staff)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
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
    </div>
  );
}
