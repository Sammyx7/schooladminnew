
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Users, MoreHorizontal, AlertCircle as AlertIcon, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { toast } = useToast();

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
    const filteredData = students.filter(student =>
      student.name.toLowerCase().includes(lowercasedFilter) ||
      student.studentId.toLowerCase().includes(lowercasedFilter) ||
      (student.classSection && student.classSection.toLowerCase().includes(lowercasedFilter))
    );
    setFilteredStudents(filteredData);
  }, [searchTerm, students]);

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


  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Student Management"
        icon={Users}
        description="View, search, and manage student profiles and details."
      />

      <Card className="w-full border shadow-md">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">Student List</CardTitle>
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
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
                  <TableHead className="w-[15ch] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class & Section</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && error && (
            <Alert variant="destructive" className="mt-4">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Error Fetching Students</AlertMsgTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && filteredStudents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Students Found</p>
              <p>{searchTerm ? "No students match your search criteria." : "There are no student records to display."}</p>
            </div>
          )}

          {!isLoading && !error && filteredStudents.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15ch] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="min-w-[20ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="min-w-[20ch] text-xs uppercase font-medium text-muted-foreground">Class & Section</TableHead>
                  <TableHead className="w-[10ch] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
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
