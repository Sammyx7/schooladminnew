"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, MoreHorizontal, AlertCircle as AlertIcon, Loader2, Search, Eye, Edit, Trash2, Upload, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Checkbox } from '@/components/ui/checkbox';
import type { StaffAssignment } from '@/lib/services/staffAssignmentsService';
import { getAssignmentsForStaff, setAssignmentsForStaff, getAssignmentOptions } from '@/lib/services/staffAssignmentsService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<AdminStaffListItem[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<AdminStaffListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const { toast } = useToast();
  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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
    const filteredData = staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(lowercasedFilter) ||
        staff.staffId.toLowerCase().includes(lowercasedFilter) ||
        staff.role.toLowerCase().includes(lowercasedFilter) ||
        staff.department.toLowerCase().includes(lowercasedFilter) ||
        staff.email.toLowerCase().includes(lowercasedFilter);
      const matchesDept = departmentFilter === 'all' || staff.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
    setFilteredStaff(filteredData);
  }, [searchTerm, departmentFilter, staffList]);

  async function handleImportCsv() {
    if (!csvFile) {
      toast({ title: 'No file selected', description: 'Choose a CSV file first.', variant: 'destructive' });
      return;
    }
    try {
      setIsImporting(true);
      const fd = new FormData();
      fd.append('file', csvFile);
      const res = await fetch('/api/staff/import', { method: 'POST', body: fd });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `Import failed with status ${res.status}`);
      toast({ title: 'Import Complete', description: `Processed ${payload.processed || 0} rows.` });
      // refresh list
      setIsLoading(true);
      const data = await listStaff();
      setStaffList(data);
      setFilteredStaff(data);
    } catch (e: any) {
      toast({ title: 'Import Failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  }

  // Dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<StaffProfile | null>(null);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSalary, setEditSalary] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  // Assignments edit state
  const [assignRows, setAssignRows] = useState<StaffAssignment[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);
  const [optClasses, setOptClasses] = useState<string[]>([]);
  const [optSections, setOptSections] = useState<string[]>([]);
  const [optSubjects, setOptSubjects] = useState<string[]>([]);
  // Subjects selection keyed by class|section
  const [selectedByKey, setSelectedByKey] = useState<Record<string, Set<string>>>({});

  const keyFor = (r: { className?: string | null; section?: string | null }) => `${(r.className || '').trim()}|${(r.section || '').trim()}`;
  const isSelected = (idx: number, subject: string) => {
    const key = keyFor(assignRows[idx] || {});
    const set = selectedByKey[key];
    return !!set && set.has(subject);
  };
  const toggleSubject = (idx: number, subject: string, checked: boolean) => {
    const row = assignRows[idx];
    const key = keyFor(row || {});
    setSelectedByKey((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      if (checked) set.add(subject); else set.delete(subject);
      next[key] = set;
      return next;
    });
  };
  const selectAllForRow = (idx: number) => {
    const row = assignRows[idx];
    const key = keyFor(row || {});
    setSelectedByKey((prev) => ({ ...prev, [key]: new Set(optSubjects) }));
  };
  const clearAllForRow = (idx: number) => {
    const row = assignRows[idx];
    const key = keyFor(row || {});
    setSelectedByKey((prev) => ({ ...prev, [key]: new Set() }));
  };

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
        qualifications: Array.isArray(staff.qualifications) ? staff.qualifications : [],
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
      // Initialize salary from list item passed in
      try {
        const listItem = staff as unknown as AdminStaffListItem;
        setEditSalary(typeof listItem.salary === 'number' ? String(listItem.salary) : '');
      } catch {}
      setEditOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load staff for editing';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleEditAssignments = async (staff: AdminStaffListItem) => {
    try {
      setIsLoadingStaff(true);
      setAssignLoading(true);
      const [profile, options, rows] = await Promise.all([
        getStaffProfileByStaffId(staff.staffId).catch(() => null),
        getAssignmentOptions().catch(() => ({ classes: [], sections: [], subjects: [] })),
        getAssignmentsForStaff(staff.staffId).catch(() => []),
      ]);
      const s: StaffProfile = (profile || {
        id: staff.id,
        staffId: staff.staffId,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        email: staff.email,
        phone: staff.phone ?? '',
        dateOfJoining: staff.joiningDate,
        qualifications: [],
      }) as StaffProfile;
      setActiveStaff(s);
      setOptClasses(options.classes || []);
      setOptSections(options.sections || []);
      setOptSubjects(options.subjects || []);
      setAssignRows(rows);
      // Build selected subjects map from existing rows (supports comma-separated subjects)
      const nextSel: Record<string, Set<string>> = {};
      for (const r of rows) {
        const k = keyFor({ className: r.className, section: r.section });
        if (!nextSel[k]) nextSel[k] = new Set();
        if (r.subject) {
          const parts = String(r.subject)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          for (const p of parts) nextSel[k].add(p);
        }
      }
      setSelectedByKey(nextSel);
      setAssignOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load assignments';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoadingStaff(false);
      setAssignLoading(false);
    }
  };

  const addAssignRow = () => {
    setAssignRows((prev) => [...prev, { className: '', section: '', subject: '', isClassTeacher: false }]);
  };
  const removeAssignRow = (idx: number) => {
    setAssignRows((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateAssignRow = (idx: number, field: keyof StaffAssignment, value: any) => {
    setAssignRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };
  const saveAssignments = async () => {
    if (!activeStaff) return;
    try {
      setAssignSaving(true);
      // Aggregate per class-section into ONE row; subject is a comma-separated list to satisfy unique(staff_id,class,section)
      const agg: Record<string, { className: string; section: string; subjects: Set<string>; isClassTeacher: boolean }> = {};
      for (const base of assignRows) {
        const className = (base.className || '').trim();
        const section = (base.section || '').trim();
        if (!className || !section) continue;
        const k = keyFor({ className, section });
        if (!agg[k]) agg[k] = { className, section, subjects: new Set<string>(), isClassTeacher: false };
        const selected = Array.from(selectedByKey[k] ?? []);
        selected.forEach((s) => agg[k].subjects.add(s));
        agg[k].isClassTeacher = agg[k].isClassTeacher || !!base.isClassTeacher;
      }
      const rows: StaffAssignment[] = Object.values(agg).map((v) => ({
        className: v.className,
        section: v.section,
        subject: Array.from(v.subjects).join(', '),
        isClassTeacher: v.isClassTeacher,
      }));
      await setAssignmentsForStaff(activeStaff.staffId, rows);
      // reflect in list UI without full refetch
      setStaffList((prev) => prev.map((s) => s.staffId === activeStaff.staffId ? { ...s, assignments: rows } as any : s));
      setFilteredStaff((prev) => prev.map((s) => s.staffId === activeStaff.staffId ? { ...s, assignments: rows } as any : s));
      setAssignOpen(false);
      toast({ title: 'Assignments saved', description: `${rows.length} assignment(s) updated.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save assignments';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setAssignSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeStaff) return;
    try {
      setIsSaving(true);
      const salaryValue = editSalary.trim() === '' ? null : Number(editSalary);
      const updated = await updateStaff(activeStaff.staffId, {
        name: editName,
        role: editRole,
        department: editDepartment,
        email: editEmail,
        phone: editPhone || null,
        salary: Number.isFinite(salaryValue as number) || salaryValue === null ? salaryValue : null,
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


  // Unique department options
  const departmentOptions = Array.from(new Set(staffList.map((s) => s.department).filter(Boolean))).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        icon={Briefcase}
        description="View, search, and manage staff profiles and details."
      />

      <Card className="border shadow-md">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              Staff List
              <Badge variant="secondary" className="rounded-full">
                {isLoading ? 'Loading…' : `${filteredStaff.length}/${staffList.length}`}
              </Badge>
            </CardTitle>
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full bg-input"
                />
              </div>
              <div className="w-56">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger aria-label="Filter by department">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile toolbar */}
          <div className="sm:hidden grid grid-cols-1 gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full bg-input"
              />
            </div>
            <div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger aria-label="Filter by department" className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* CSV Import */}
          <div className="mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex-1 cursor-pointer">
                <div className="border border-dashed rounded-lg p-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground truncate">
                      {csvFile ? `Selected: ${csvFile.name}` : 'Choose a CSV file to import staff'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Upload className="h-4 w-4" />
                      <span>Browse</span>
                    </div>
                  </div>
                </div>
                <input
                  className="sr-only"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </label>
              <Button onClick={handleImportCsv} disabled={isImporting || !csvFile} className="shrink-0">
                {isImporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Upload CSV
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              CSV columns: staff_id, name, role, department, email, [phone], [joining_date], [qualifications], [avatar_url], [salary]
            </p>
          </div>
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
            <div className="text-center py-16">
              <Briefcase className="h-14 w-14 mx-auto mb-3 text-muted-foreground" />
              <p className="text-base font-medium">No staff found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || departmentFilter !== 'all' ? 'Try adjusting search or filters.' : 'Import a CSV to get started.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredStaff.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[12ch] text-xs uppercase font-medium text-muted-foreground">Staff ID</TableHead>
                      <TableHead className="min-w-[22ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                      <TableHead className="min-w-[15ch] text-xs uppercase font-medium text-muted-foreground">Role</TableHead>
                      <TableHead className="min-w-[20ch] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Department</TableHead>
                      <TableHead className="min-w-[25ch] hidden lg:table-cell text-xs uppercase font-medium text-muted-foreground">Email</TableHead>
                      <TableHead className="min-w-[12ch] text-xs uppercase font-medium text-muted-foreground">Salary</TableHead>
                      <TableHead className="min-w-[26ch] text-xs uppercase font-medium text-muted-foreground">Assignments</TableHead>
                      <TableHead className="w-[10ch] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-mono text-sm">{staff.staffId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                              <AvatarFallback>{staff.name?.slice(0,1)?.toUpperCase() ?? '?'}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium leading-none">{staff.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell className="hidden md:table-cell">{staff.department}</TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          <span className="block max-w-[28ch] truncate" title={staff.email}>{staff.email}</span>
                        </TableCell>
                        <TableCell className="text-sm">{typeof staff.salary === 'number' ? staff.salary.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          {(staff.assignments && staff.assignments.length > 0) ? (
                            <div className="flex flex-wrap gap-1 max-w-[40ch]">
                              {staff.assignments.slice(0,4).map((a, idx) => (
                                <Badge key={idx} variant="outline" className="font-normal">
                                  {a.className}-{a.section}{a.isClassTeacher ? ' • CT' : ''}
                                </Badge>
                              ))}
                              {staff.assignments.length > 4 && (
                                <span className="text-muted-foreground text-xs">+{staff.assignments.length - 4} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
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
                                <Eye className="mr-2 h-4 w-4" /> View More
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAssignments(staff)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Assignments
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
              </div>
            </div>
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
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground">Qualifications</div>
                <div className="mt-1">
                  {Array.isArray(activeStaff.qualifications) && activeStaff.qualifications.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {activeStaff.qualifications.map((q, i) => (
                        <Badge key={i} variant="secondary">{q}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
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
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input id="salary" type="number" step="0.01" placeholder="e.g., 45000" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
              <p className="text-xs text-muted-foreground">Leave blank to clear salary.</p>
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

      {/* Edit Assignments Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Assignments</DialogTitle>
            <DialogDescription>
              {activeStaff ? `Manage assignments for ${activeStaff.name} (${activeStaff.staffId})` : 'Manage assignments'}
            </DialogDescription>
          </DialogHeader>
          {assignLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Add class/section/subject rows. Mark CT for class teacher.</div>
                <Button variant="secondary" size="sm" onClick={addAssignRow}><Plus className="h-4 w-4 mr-1"/> Add Row</Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="hidden sm:table-cell">Subject</TableHead>
                      <TableHead>Class Teacher</TableHead>
                      <TableHead className="w-[90px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignRows.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No rows. Click Add Row.</TableCell></TableRow>
                    )}
                    {assignRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Select value={row.className || ''} onValueChange={(v) => updateAssignRow(idx, 'className', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              {optClasses.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={row.section || ''} onValueChange={(v) => updateAssignRow(idx, 'section', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {optSections.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" disabled={!row.className || !row.section}>
                                {(() => {
                                  const k = keyFor(row);
                                  const count = (selectedByKey[k]?.size ?? 0);
                                  return count > 0 ? `${count} selected` : 'Select subjects';
                                })()}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 p-2">
                              <div className="flex items-center justify-between mb-2">
                                <Button variant="secondary" size="xs" onClick={() => selectAllForRow(idx)}>Select All</Button>
                                <Button variant="ghost" size="xs" onClick={() => clearAllForRow(idx)}>Clear</Button>
                              </div>
                              <div className="max-h-56 overflow-auto pr-1">
                                {optSubjects.map((s) => (
                                  <div key={s} className="flex items-center gap-2 py-1">
                                    <Checkbox id={`subj-${idx}-${s}`} checked={isSelected(idx, s)} onCheckedChange={(v) => toggleSubject(idx, s, !!v)} />
                                    <label htmlFor={`subj-${idx}-${s}`} className="text-sm leading-none cursor-pointer select-none">{s}</label>
                                  </div>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={!!row.isClassTeacher} onCheckedChange={(v) => updateAssignRow(idx, 'isClassTeacher', !!v)} />
                            <span className="text-sm">CT</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeAssignRow(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={assignSaving}>Cancel</Button>
            <Button onClick={saveAssignments} disabled={assignSaving}>
              {assignSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
