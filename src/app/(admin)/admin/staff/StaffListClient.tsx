
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, GraduationCap, FileArchive } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdminStaffListItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
// Note: Real-time functionality is commented out as we are using mock data.
// It can be re-enabled if Supabase is integrated.
// import { app } from '@/lib/firebase'; // Example of how to import

interface StaffListClientProps {
  initialStaff: AdminStaffListItem[];
}

export default function StaffListClient({ initialStaff }: StaffListClientProps) {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>(initialStaff);
  const [staffToDelete, setStaffToDelete] = useState<AdminStaffListItem | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  /*
  // Example of real-time subscription logic for Supabase
  useEffect(() => {
    // Ensure you have a Supabase client initialized, e.g., in '@/lib/supabaseClient'
    const channel = supabase
      .channel('staff-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        (payload) => {
          console.log('Change received!', payload);
          // Simple refetch for demonstration. You could also update state directly.
          // In a real app, you would call your service function to get the latest list.
          // e.g., getAdminStaffList().then(setStaffList);
          toast({ title: "Staff Data Updated", description: "The staff list has been updated in real-time."});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  */

  const handleViewDetails = (staff: AdminStaffListItem) => {
    // Navigate to a dedicated view page (currently a placeholder)
    router.push(`/admin/staff/${staff.id}`);
  };

  const handleEditStaff = (staff: AdminStaffListItem) => {
    router.push(`/admin/staff/edit/${staff.id}`);
  };
  
  const handleDeleteStaff = () => {
    if (!staffToDelete) return;
    
    // Simulate API call for deletion
    toast({
      title: "Staff Deleted (Demo)",
      description: `Successfully deleted ${staffToDelete.name} (${staffToDelete.staffId}).`,
      variant: "destructive"
    });
    setStaffList(prevList => prevList.filter(s => s.id !== staffToDelete.id));
    setStaffToDelete(null);
  };
  
  const handleAddNewStaff = () => {
    router.push('/admin/staff/add');
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[12ch]">Staff ID</TableHead>
            <TableHead className="min-w-[20ch]">Name</TableHead>
            <TableHead className="min-w-[15ch]">Role</TableHead>
            <TableHead className="min-w-[20ch] hidden md:table-cell">Department</TableHead>
            <TableHead className="min-w-[25ch] hidden lg:table-cell">Email</TableHead>
            <TableHead className="w-[10ch] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => (
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
      
      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member's record.
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
    </>
  );
}
