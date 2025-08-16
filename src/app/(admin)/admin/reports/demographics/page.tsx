
"use client";

import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import type { StudentProfile } from '@/lib/types';
import { MOCK_STUDENT_LIST_FOR_REPORTS as MOCK_STUDENT_LIST } from '@/lib/services/adminService'; // Using a larger mock list for better data

// This would typically come from a service, but for this demo, we use the mock list directly.
const studentData: StudentProfile[] = MOCK_STUDENT_LIST;

export default function StudentDemographicsPage() {
  const demographicsData = useMemo(() => {
    const classCounts: { [key: string]: number } = {};
    studentData.forEach(student => {
      // Extract just the class name (e.g., "Class 10")
      const className = student.classSection.split(' - ')[0];
      if (classCounts[className]) {
        classCounts[className]++;
      } else {
        classCounts[className] = 1;
      }
    });

    return Object.entries(classCounts)
      .map(([name, students]) => ({ name, students }))
      .sort((a, b) => {
        const numA = parseInt(a.name.replace('Class ', ''), 10);
        const numB = parseInt(b.name.replace('Class ', ''), 10);
        return numA - numB;
      });
  }, []);

  const detailedClassData = useMemo(() => {
    const classSectionCounts: { [key: string]: number } = {};
    studentData.forEach(student => {
        if(classSectionCounts[student.classSection]) {
            classSectionCounts[student.classSection]++;
        } else {
            classSectionCounts[student.classSection] = 1;
        }
    });
     return Object.entries(classSectionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => a.name.localeCompare(b.name));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Demographics Report"
        icon={Users}
        description="View statistics on student enrollment and class distribution."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3 border shadow-md">
          <CardHeader>
            <CardTitle>Student Distribution by Class</CardTitle>
            <CardDescription>Total number of students enrolled in each class.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={demographicsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--accent))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border shadow-md">
          <CardHeader>
            <CardTitle>Enrollment Summary</CardTitle>
            <CardDescription>Detailed breakdown of students per class and section.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Class & Section</TableHead>
                  <TableHead className="text-right text-xs uppercase font-medium text-muted-foreground">Student Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedClassData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-medium">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
