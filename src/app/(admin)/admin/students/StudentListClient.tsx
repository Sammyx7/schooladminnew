
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
import type { StudentProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// import { app } from '@/lib/firebase'; // Example of how to import

interface StudentListClientProps {
  initialStudents: StudentProfile[];
}

export default function StudentListClient({ initialStudents }: StudentListClientProps) {
  const [students, setStudents] = useState<StudentProfile[]>(initialStudents);
  const router = useRouter();
  const { toast } = useToast();
  
  const handleViewDetails = (student: StudentProfile) => {
    toast({ title: "View Details (Placeholder)", description: `Viewing details for ${student.name} (${student.studentId}).` });
  };
  
  const handleEditStudent = (student: StudentProfile) => {
    toast({ title: "Edit Student (Placeholder)", description: `Editing details for ${student.name} (${student.studentId}).` });
  };
  
  const handleDeleteStudent = (student: StudentProfile) => {
    toast({ title: "Delete Student (Placeholder)", description: `Deleting ${student.name} (${student.studentId}).`, variant: "destructive" });
  };

  const handlePromoteStudent = (student: StudentProfile) => {
     toast({ title: "Promote Student (Placeholder)", description: `Promoting ${student.name} to the next class.` });
  };

  const handleIssueCertificate = (student: StudentProfile) => {
     toast({ title: "Issue Certificate (Placeholder)", description: `Issuing leaving certificate for ${student.name}.` });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[15ch]">Student ID</TableHead>
          <TableHead className="min-w-[20ch]">Name</TableHead>
          <TableHead className="min-w-[20ch]">Class & Section</TableHead>
          <TableHead className="w-[15ch] hidden md:table-cell">Contact (Demo)</TableHead>
          <TableHead className="w-[10ch] text-right">Actions</TableHead>
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
                   <DropdownMenuItem onClick={() => handlePromoteStudent(student)}>
                    <GraduationCap className="mr-2 h-4 w-4" /> Promote Student
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleIssueCertificate(student)}>
                    <FileArchive className="mr-2 h-4 w-4" /> Issue Certificate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteStudent(student)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
