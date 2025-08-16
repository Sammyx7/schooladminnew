
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Edit, Trash2, UserPlus, GraduationCap, FileArchive, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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


interface StaffListClientProps {
  initialStaff: AdminStaffListItem[];
}

export default function StaffListClient({ initialStaff }: StaffListClientProps) {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>(initialStaff);
  const [filteredStaff, setFilteredStaff] = useState<AdminStaffListItem[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<AdminStaffListItem | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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
    <>
      <div className="flex justify-end mb-4">
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
      </div>
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
    </>
  );
}
