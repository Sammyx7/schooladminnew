"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle as AlertIcon, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from "@/components/ui/alert";
import { getStudentsByClassSection, getMarksForFilters, upsertMarksBatch } from "@/lib/services/marksService";
import { getSchoolSettings, listClasses, sectionsForClass, subjectsForClass, type SchoolSettings } from "@/lib/services/settingsService";
import { useToast } from "@/hooks/use-toast";

// Options are sourced from Admin Settings

const TERMS = ["Unit Test 1", "Mid-Term", "Term 1", "Unit Test 2", "Annual Exam"];

const FiltersSchema = z.object({
  class: z.string().min(1, "Please select a class."),
  section: z.string().min(1, "Please select a section."),
  subject: z.string().min(1, "Please select a subject."),
  term: z.string().min(1, "Please select a term."),
  maxMarks: z.coerce.number().positive().max(1000).default(100),
});

export type MarksEntryFilters = z.infer<typeof FiltersSchema>;

interface MarksRow {
  studentId: string;
  name: string;
  marks?: number;
  remarks?: string;
}

export default function MarksEntry() {
  const { toast } = useToast();
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rows, setRows] = useState<MarksRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [classOptions, setClassOptions] = useState<string[]>([]);

  const form = useForm<MarksEntryFilters>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      class: "",
      section: "",
      subject: "",
      term: "",
      maxMarks: 100,
    },
  });

  const selectedClass = form.watch("class");
  const subjectOptions = useMemo(() => subjectsForClass(settings, selectedClass), [settings, selectedClass]);
  const sectionOptions = useMemo(() => sectionsForClass(settings, selectedClass), [settings, selectedClass]);

  useEffect(() => {
    // Load Admin Settings once
    getSchoolSettings()
      .then((s) => {
        setSettings(s);
        setClassOptions(listClasses(s));
      })
      .catch((e) => {
        console.warn("Failed to load school settings", e);
        setSettings(null);
        setClassOptions([]);
      });
  }, []);

  useEffect(() => {
    // Reset subject when class changes if subject not in list
    const currentSubject = form.getValues("subject");
    if (currentSubject && !subjectOptions.includes(currentSubject)) {
      form.setValue("subject", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptions]);

  const handleFetchStudents = async (values: MarksEntryFilters) => {
    setIsLoadingStudents(true);
    setIsSearched(true);
    setLoadError(null);
    try {
      // Fetch students for class/section
      const studentList = await getStudentsByClassSection(values.class, values.section);
      // Fetch existing marks for selected filters
      const existingMarks = await getMarksForFilters({
        class: values.class,
        section: values.section,
        subject: values.subject,
        term: values.term,
      });

      const marksByStudent = new Map<string, { marks: number | undefined; remarks: string | undefined; max: number | undefined }>();
      for (const m of existingMarks) {
        marksByStudent.set(m.student_id, {
          marks: m.marks ?? undefined,
          remarks: m.remarks ?? undefined,
          max: m.max_marks ?? undefined,
        });
      }

      // Prefill max marks if present in existing records
      const nonNullMax = existingMarks.map(m => m.max_marks).filter((v): v is number => v != null);
      if (nonNullMax.length > 0) {
        // If multiple values, pick the most frequent to avoid accidental mismatch
        const freq = new Map<number, number>();
        for (const v of nonNullMax) freq.set(v, (freq.get(v) ?? 0) + 1);
        let best = nonNullMax[0];
        let bestCnt = 0;
        for (const [v, c] of freq.entries()) {
          if (c > bestCnt) { best = v; bestCnt = c; }
        }
        form.setValue('maxMarks', best, { shouldDirty: true });
      }

      // Prefill rows with any existing marks
      const initialRows: MarksRow[] = studentList.map((s) => {
        const found = marksByStudent.get(s.studentId);
        return {
          studentId: s.studentId,
          name: s.name,
          marks: found?.marks,
          remarks: found?.remarks,
        };
      });

      setRows(initialRows);
      if (initialRows.length === 0) {
        const key = `${values.class} - ${values.section}`;
        toast({ title: "No Students Found", description: `No students for ${key}.`, variant: "destructive" });
      } else {
        const prefilledCount = initialRows.filter(r => r.marks != null).length;
        toast({ title: "Loaded Students", description: `${initialRows.length} students loaded${prefilledCount ? `, ${prefilledCount} prefilled` : ''}.` });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load students.";
      setLoadError(msg);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const updateRow = (studentId: string, patch: Partial<MarksRow>) => {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)));
  };

  const handleSaveDraft = async () => {
    toast({ title: "Draft Saved (Local)", description: "Marks draft saved in memory for this session." });
  };

  const handleSubmitMarks = async () => {
    const { maxMarks, class: klass, section, subject, term } = form.getValues();
    // Basic validation: marks within range
    const invalid = rows.filter((r) => r.marks != null && (r.marks < 0 || r.marks > maxMarks));
    if (invalid.length > 0) {
      toast({ title: "Invalid Marks", description: `Some marks are out of 0-${maxMarks}. Please correct.`, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await upsertMarksBatch({
        class: klass,
        section,
        subject,
        term,
        maxMarks,
        rows: rows.map(r => ({ studentId: r.studentId, marks: r.marks, remarks: r.remarks })),
      });
      const filledCount = rows.filter((r) => r.marks != null).length;
      toast({
        title: "Marks Submitted",
        description: `Submitted ${filledCount}/${rows.length} entries for ${klass} - ${section}, ${subject} (${term}).`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit marks.";
      toast({ title: "Submit Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Card className="rounded-2xl border shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select Class, Section, Subject, Term and Max Marks, then fetch students.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFetchStudents)}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={(v) => form.setValue("class", v)} value={form.watch("class") || ""}>
                      <SelectTrigger className="h-10 rounded-full px-4 border-2 bg-background ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-lg">
                        {classOptions.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section/Stream</FormLabel>
                    <Select onValueChange={(v) => form.setValue("section", v)} value={form.watch("section") || ""}>
                      <SelectTrigger className="h-10 rounded-full px-4 border-2 bg-background ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary">
                        <SelectValue placeholder="Select a section" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-lg">
                        {sectionOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={(v) => form.setValue("subject", v)} value={form.watch("subject") || ""}>
                      <SelectTrigger className="h-10 rounded-full px-4 border-2 bg-background ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border shadow-lg">
                        {subjectOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term/Assessment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 rounded-full px-4 border-2 bg-background ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary">
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border shadow-lg">
                        {TERMS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Marks</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={1000} {...field} className="h-10 rounded-full px-4 border-2 ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-5 flex gap-3">
                <Button type="submit" disabled={isLoadingStudents} className="shadow-lg hover:shadow-xl transition">
                  {isLoadingStudents ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Fetch Students
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoadingStudents} className="shadow-md hover:shadow-lg transition">
                  Reset Filters
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-lg">
        <CardHeader>
          <CardTitle>Marks Entry</CardTitle>
          <CardDescription>Enter marks for the loaded students. Save as draft or submit.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStudents && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15ch] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                  <TableHead className="min-w-[24ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="w-[12ch] text-xs uppercase font-medium text-muted-foreground">Marks</TableHead>
                  <TableHead className="text-xs uppercase font-medium text-muted-foreground">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-56" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoadingStudents && loadError && (
            <Alert variant="destructive" className="mt-2">
              <AlertIcon className="h-5 w-5" />
              <AlertMsgTitle>Failed to Load Students</AlertMsgTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          )}

          {!isLoadingStudents && rows.length === 0 && isSearched && !loadError && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Students Loaded</p>
              <p>Use the filters above and click "Fetch Students".</p>
            </div>
          )}

          {!isLoadingStudents && rows.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15ch] text-xs uppercase font-medium text-muted-foreground">Student ID</TableHead>
                    <TableHead className="min-w-[24ch] text-xs uppercase font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="w-[12ch] text-xs uppercase font-medium text-muted-foreground">Marks</TableHead>
                    <TableHead className="text-xs uppercase font-medium text-muted-foreground">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.studentId}>
                      <TableCell className="font-mono text-sm">{r.studentId}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          placeholder="0"
                          value={r.marks ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateRow(r.studentId, { marks: val === "" ? undefined : Number(val) });
                          }}
                          className="w-28 h-10 rounded-full px-3 border-2 ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary"
                          />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Optional remarks"
                          value={r.remarks ?? ""}
                          onChange={(e) => updateRow(r.studentId, { remarks: e.target.value })}
                          className="h-10 rounded-full px-4 border-2 ring-1 ring-inset ring-muted/30 shadow-md hover:shadow-lg transition focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="shadow-sm">
                  Save Draft
                </Button>
                <Button type="button" onClick={handleSubmitMarks} disabled={isSubmitting} className="shadow">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting
                    </>
                  ) : (
                    "Submit Marks"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
