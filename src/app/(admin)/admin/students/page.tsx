
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, MoreHorizontal, AlertCircle as AlertIcon, Loader2, Search, Upload, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
} from "@/components/ui/dropdown-menu";
import type { StudentProfile } from '@/lib/types';
import { listStudents, getStudentByStudentId, updateStudent } from '@/lib/services/studentsDbService';
import { useToast } from '@/hooks/use-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const { toast } = useToast();
  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editClassSection, setEditClassSection] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listStudents();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred fetching student data.";
        setError(errorMessage);
        toast({ title: "Error Fetching Students", description: errorMessage, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(lowercasedFilter) ||
        student.studentId.toLowerCase().includes(lowercasedFilter) ||
        (student.classSection && student.classSection.toLowerCase().includes(lowercasedFilter));
      const matchesClass = classFilter === 'all' || (student.classSection ?? '') === classFilter;
      return matchesSearch && matchesClass;
    });
    setFilteredStudents(filteredData);
  }, [searchTerm, classFilter, students]);

  async function handleImportCsv() {
    if (!csvFile) {
      toast({ title: 'No file selected', description: 'Choose a CSV file first.', variant: 'destructive' });
      return;
    }
    try {
      setIsImporting(true);
      const fd = new FormData();
      fd.append('file', csvFile);
      const res = await fetch('/api/students/import', { method: 'POST', body: fd });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || `Import failed with status ${res.status}`);
      toast({ title: 'Import Complete', description: `Processed ${payload.processed || payload.insertedOrUpdated || 0} rows.` });
      // refresh list
      setIsLoading(true);
      const data = await listStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (e: any) {
      toast({ title: 'Import Failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  }

  const handleViewDetails = async (student: StudentProfile) => {
    try {
      setIsFetchingStudent(true);
      const fresh = await getStudentByStudentId(student.studentId);
      setActiveStudent(fresh ?? student);
      setViewOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load student details';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsFetchingStudent(false);
    }
  };
  
  const handleEditStudent = async (student: StudentProfile) => {
    try {
      setIsFetchingStudent(true);
      const fresh = await getStudentByStudentId(student.studentId);
      const s = fresh ?? student;
      setActiveStudent(s);
      setEditName(s.name);
      setEditClassSection(s.classSection ?? '');
      setEditAvatarUrl(s.avatarUrl ?? '');
      setEditOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load student for editing';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsFetchingStudent(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeStudent) return;
    try {
      setIsSaving(true);
      const updated = await updateStudent(activeStudent.studentId, {
        name: editName,
        classSection: editClassSection,
        avatarUrl: editAvatarUrl || null,
      });
      // Update local lists
      setStudents((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));
      setFilteredStudents((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));
      setActiveStudent(updated);
      setEditOpen(false);
      toast({ title: 'Student updated', description: `${updated.name} saved successfully.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update student';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };


  // Unique class/sections for filter
  const classOptions = Array.from(
    new Set(students.map((s) => s.classSection).filter(Boolean) as string[])
  ).sort();

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Student Management"
        icon={Users}
        description="View, search, and manage student profiles and details."
      />

      <Card className="w-full border shadow-md">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="flex items-center gap-2">
                Students
                <Badge variant="secondary" className="rounded-full">
                  {isLoading ? 'Loading…' : `${filteredStudents.length}/${students.length}`}
                </Badge>
              </CardTitle>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search by name, ID, or class"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-48">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger aria-label="Filter by class">
                    <SelectValue placeholder="Class/Section" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">
                      All Classes
                    </SelectItem>
                    {classOptions.map((cs) => (
                      <SelectItem key={cs} value={cs}>{cs}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Mobile toolbar */}
          <div className="sm:hidden grid grid-cols-1 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search by name, ID, or class"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger aria-label="Filter by class" className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Class/Section" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map((cs) => (
                    <SelectItem key={cs} value={cs}>{cs}</SelectItem>
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
                      {csvFile ? `Selected: ${csvFile.name}` : 'Choose a CSV file to import students'}
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
              CSV columns: student_id, name, (class_section or class_name + section), [roll_no], [avatar_url], [parent_name], [parent_contact], [admission_number], [address], [father_name], [mother_name], [emergency_contact]
            </p>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, idx) => (
                <Skeleton key={idx} className="h-9 w-full" />
              ))}
            </div>
          ) : null}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Students</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredStudents.length === 0 && (
            <div className="text-center py-16">
              <Users className="h-14 w-14 mx-auto mb-3 text-muted-foreground" />
              <p className="text-base font-medium">No students found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || classFilter !== 'all'
                  ? 'Try adjusting search or filters.'
                  : 'Import a CSV to get started.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredStudents.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[15ch] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                      <TableHead className="min-w-[24ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                      <TableHead className="min-w-[18ch] text-xs uppercase font-medium text-muted-foreground">Class & Section</TableHead>
                      <TableHead className="w-[10ch] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={student.avatarUrl ?? undefined} alt={student.name} />
                              <AvatarFallback>{student.name?.slice(0,1)?.toUpperCase() ?? '?'}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium leading-none">{student.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.classSection}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                                Edit Student
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
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>View basic information for this student.</DialogDescription>
          </DialogHeader>
          {isFetchingStudent && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          )}
          {activeStudent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Student ID</div>
                  <div className="font-mono text-sm">{activeStudent.studentId}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium">{activeStudent.name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Class & Section</div>
                  <div>{activeStudent.classSection || '-'}</div>
                </div>
                {activeStudent.avatarUrl && (
                  <div>
                    <div className="text-xs text-muted-foreground">Avatar URL</div>
                    <a className="text-primary underline break-all" href={activeStudent.avatarUrl} target="_blank" rel="noreferrer">
                      {activeStudent.avatarUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update the student details below.</DialogDescription>
          </DialogHeader>
          {activeStudent && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classSection">Class & Section</Label>
                <Input id="classSection" value={editClassSection} onChange={(e) => setEditClassSection(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" value={editAvatarUrl} onChange={(e) => setEditAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          )}
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
