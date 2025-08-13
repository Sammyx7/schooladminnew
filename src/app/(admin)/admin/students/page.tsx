
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudentProfile } from '@/lib/types';
import { getAdminStudentList } from '@/lib/services/adminService'; 
import { useToast } from '@/hooks/use-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAdminStudentList();
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

  const handleViewDetails = (student: StudentProfile) => {
    toast({
      title: "View Details (Placeholder)",
      description: `Viewing details for ${student.name} (${student.studentId}).`,
    });
  };
  
  const handleEditStudent = (student: StudentProfile) => {
    toast({
      title: "Edit Student (Placeholder)",
      description: `Editing details for ${student.name} (${student.studentId}).`,
    });
  };


  return (
    <div className="space-y-6 w-full p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Student Management"
        icon={Users}
        description="View, search, and manage student profiles and details."
      />

      <Card className="border shadow-md w-full">
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
                  <TableHead className="w-[15%] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="w-[30%] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="w-[25%] text-xs uppercase font-medium text-muted-foreground">Class & Section</TableHead>
                  <TableHead className="w-[15%] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Contact (Demo)</TableHead>
                  <TableHead className="w-[15%] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
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
                  <TableHead className="w-[15ch] hidden md:table-cell text-xs uppercase font-medium text-muted-foreground">Contact (Demo)</TableHead>
                  <TableHead className="w-[10ch] text-right text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.classSection}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {/* Placeholder for contact info */}
                      01234 56789
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
    </div>
  );
}
