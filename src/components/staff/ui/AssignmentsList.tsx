"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { StaffAssignment } from "@/lib/services/staffAssignmentsService";

interface AssignmentsListProps {
  assignments: StaffAssignment[] | null;
  loading?: boolean;
}

export default function AssignmentsList({ assignments, loading }: AssignmentsListProps) {
  if (loading) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <Table className="hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">Section</TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
              <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class Teacher</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    );
  }

  if (!assignments || assignments.length === 0) {
    return <div className="text-sm text-muted-foreground">No assignments yet.</div>;
  }

  return (
    <>
      {/* Mobile list */}
      <div className="md:hidden space-y-2">
        {assignments.map((a, i) => (
          <div key={`${a.className}-${a.section}-${i}`} className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Class {a.className}</div>
              <div className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">Sec {a.section}</div>
            </div>
            <div className="mt-1 text-sm">
              <div className="font-medium">{a.subject || '-'}</div>
              <div className="text-muted-foreground">{a.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%] text-left text-xs uppercase font-medium text-muted-foreground">Class</TableHead>
            <TableHead className="w-[15%] text-left text-xs uppercase font-medium text-muted-foreground">Section</TableHead>
            <TableHead className="w-[40%] text-left text-xs uppercase font-medium text-muted-foreground">Subject</TableHead>
            <TableHead className="w-[20%] text-left text-xs uppercase font-medium text-muted-foreground">Class Teacher</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((a, i) => (
            <TableRow key={`${a.className}-${a.section}-${i}`}>
              <TableCell className="font-medium">{a.className}</TableCell>
              <TableCell>{a.section}</TableCell>
              <TableCell>{a.subject || '-'}</TableCell>
              <TableCell>{a.isClassTeacher ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
