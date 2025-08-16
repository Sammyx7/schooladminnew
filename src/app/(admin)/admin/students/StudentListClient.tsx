
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Edit, Trash2, GraduationCap, FileArchive } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
import type { StudentProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface StudentListClientProps {
  initialStudents: StudentProfile[];
}

export default function StudentListClient({ initialStudents }: StudentListClientProps) {
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleViewDetails = (student: StudentProfile) => {
    toast({ title: "View Details (Placeholder)", description: `Viewing details for ${student.name} (${student.studentId}).` });
  };
  
  const handleEditStudent = (student: StudentProfile) => {
    toast({ title: "Edit Student (Placeholder)", description: `Editing details for ${student.name} (${student.studentId}).` });
  };
  
  const handleDeleteStudent = () => {
    if (!studentToDelete) return;

    // Simulate API call for deletion - for now, just remove from local state
    setStudents(prevList => prevList.filter(s => s.studentId !== studentToDelete.studentId));

    toast({
      title: "Student Deleted",
      description: `Successfully removed ${studentToDelete.name} (${studentToDelete.studentId}).`,
      variant: "destructive"
    });
    setStudentToDelete(null);
  };

  const handlePromoteStudent = (student: StudentProfile) => {
     toast({ title: "Promote Student (Placeholder)", description: `Promoting ${student.name} to the next class.` });
  };

  const handleIssueCertificate = (student: StudentProfile) => {
     toast({ title: "Issue Certificate (Placeholder)", description: `Issuing leaving certificate for ${student.name}.` });
  };

  return (
    <>
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
          {students.map((student) => (
            <TableRow key={student.studentId}>
              <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.classSection}</TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
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
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditStudent(student)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Student
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePromoteStudent(student)}>
                      <GraduationCap className="mr-2 h-4 w-4" /> Promote Student
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleIssueCertificate(student)}>
                      <FileArchive className="mr-2 h-4 w-4" /> Issue Certificate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStudentToDelete(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record for student "{studentToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStudent} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
