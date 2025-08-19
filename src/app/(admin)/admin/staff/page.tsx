"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, MoreHorizontal, AlertCircle as AlertIcon, Loader2, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdminStaffListItem, StaffProfile } from '@/lib/types';
import { listStaff, getStaffProfileByStaffId, updateStaff, deleteStaff } from '@/lib/services/staffDbService';
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
        const data = await listStaff();
        setStaffList(data);
        setFilteredStaff(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : (typeof err === 'string' ? err : (err && (err as any).message ? String((err as any).message) : JSON.stringify(err)));
        setError(errorMessage);
        console.warn('Error fetching staff list:', err);
        toast({ title: "Error Fetching Staff", description: errorMessage || "Failed to load staff.", variant: "destructive" });
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

  // Dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffProfile | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleViewDetails = async (staff: AdminStaffListItem) => {
    try {
      setIsLoadingStaff(true);
      const profile = await getStaffProfileByStaffId(staff.staffId);
      setActiveStaff(profile ? profile : {
        id: staff.id,
        staffId: staff.staffId,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        email: staff.email,
        phone: staff.phone ?? '',
        dateOfJoining: staff.joiningDate,
        qualifications: [],
      });
      setViewOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load staff details';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleEditStaff = async (staff: AdminStaffListItem) => {
    try {
      setIsLoadingStaff(true);
      const profile = await getStaffProfileByStaffId(staff.staffId);
      const s = profile ? profile : {
        id: staff.id,
        staffId: staff.staffId,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        email: staff.email,
        phone: staff.phone ?? '',
        dateOfJoining: staff.joiningDate,
        qualifications: [],
      } as StaffProfile;
      setActiveStaff(s);
      setEditName(s.name);
      setEditRole(s.role);
      setEditDepartment(s.department);
      setEditEmail(s.email);
      setEditPhone(s.phone ?? '');
      setEditOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load staff for editing';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeStaff) return;
    try {
      setIsSaving(true);
      const updated = await updateStaff(activeStaff.staffId, {
        name: editName,
        role: editRole,
        department: editDepartment,
        email: editEmail,
        phone: editPhone || null,
      });
      setStaffList((prev) => prev.map((s) => (s.staffId === updated.staffId ? updated : s)));
      setFilteredStaff((prev) => prev.map((s) => (s.staffId === updated.staffId ? updated : s)));
      setEditOpen(false);
      toast({ title: 'Staff updated', description: `${updated.name} saved successfully.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update staff';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (staff: AdminStaffListItem) => {
    try {
      // simple confirm
      if (!confirm(`Delete ${staff.name} (${staff.staffId})?`)) return;
      await deleteStaff(staff.id);
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
      setFilteredStaff((prev) => prev.filter((s) => s.id !== staff.id));
      toast({ title: 'Staff deleted', description: `${staff.name} removed.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete staff';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        icon={Briefcase}
        description="View, search, and manage staff profiles and details."
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
      {/* View Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>View the staff profile.</DialogDescription>
          </DialogHeader>
          {isLoadingStaff && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
          {activeStaff && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Staff ID</div>
                <div className="font-mono text-sm">{activeStaff.staffId}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="font-medium">{activeStaff.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Role</div>
                <div>{activeStaff.role}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Department</div>
                <div>{activeStaff.department}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="break-all">{activeStaff.email}</div>
              </div>
              {activeStaff.phone && (
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div>{activeStaff.phone}</div>
                </div>
              )}
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Date of Joining</div>
                <div>{format(new Date(activeStaff.dateOfJoining), 'dd MMM yyyy')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
            <DialogDescription>Update staff information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={editRole} onChange={(e) => setEditRole(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
