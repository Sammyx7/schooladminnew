"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { listStaff, createStaff, deleteStaff } from "@/lib/services/staffDbService";
import type { AdminStaffListItem } from "@/lib/types";
import { Plus, Trash2, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSchoolSettings } from "@/lib/services/settingsService";

const OnboardSchema = z.object({
  staffId: z.string().min(2, "Staff ID is required"),
  name: z.string().min(3, "Name is required"),
  role: z.string().min(2, "Role is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  joiningDate: z.string().min(4, "Joining date is required"),
  qualificationsCsv: z.string().optional(),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  subject: z.string().optional(),
});

type OnboardFormValues = z.infer<typeof OnboardSchema>;

export default function StaffOnboardingForm() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<AdminStaffListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  // No separate assignments UI; captured in main form

  const form = useForm<OnboardFormValues>({
    resolver: zodResolver(OnboardSchema),
    defaultValues: {
      staffId: "",
      name: "",
      role: "",
      department: "",
      email: "",
      phone: "",
      joiningDate: new Date().toISOString().slice(0, 10),
      qualificationsCsv: "B.Ed, M.Sc",
      className: "",
      section: "",
      subject: "",
    },
  });

  // Settings-powered class/section options
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, string[]>>({});
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classSubjectsMap, setClassSubjectsMap] = useState<Record<string, string[]>>({});
  const selectedClass = form.watch("className");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Load staff and settings in parallel
    Promise.all([
      listStaff(),
      (async () => {
        try {
          const s = await getSchoolSettings();
          if (!s) return;
          const fallbackSections = Array.isArray(s.sections) ? s.sections.filter(Boolean).map(x => x.trim()) : ['A','B','C'];
          let classes: string[];
          const byClass: Record<string,string[]> = {};
          if (Array.isArray(s.classes) && s.classes.length > 0) {
            classes = s.classes.slice(); // preserve order
            const map = s.classSections || {};
            for (const c of classes) {
              const secs = Array.isArray(map[c]) && map[c]!.length > 0 ? map[c]!.filter(Boolean).map(x=>x.trim()) : fallbackSections;
              byClass[c] = secs;
            }
          } else {
            // fallback ordering: common early years then numbered
            const common = ['Nursery','LKG','UKG'];
            const rangeMin = 1;
            const rangeMax = 12;
            const numbered = Array.from({length: Math.max(0, rangeMax - rangeMin + 1)}, (_,i)=>`Class ${i+rangeMin}`);
            classes = [...common, ...numbered];
            for (const c of classes) byClass[c] = fallbackSections;
          }
          if (!mounted) return;
          setClassOptions(classes);
          setSectionsByClass(byClass);
          const globalSubjects = Array.isArray(s.subjects) && s.subjects.length > 0
            ? s.subjects
            : ['english','hindi','urdu','sanskrit','arabic','maths','science','social science','general knowledge'];
          const classSubs = s.classSubjects || {};
          setClassSubjectsMap(classSubs);
          // derive current options based on selected class if any
          const curClass = selectedClass;
          const opts = curClass && Array.isArray(classSubs[curClass]) && classSubs[curClass]!.length > 0
            ? classSubs[curClass]!
            : globalSubjects;
          setSubjectOptions(opts);
        } catch (e) {
          console.warn('Failed to load school settings for class/sections', e);
        }
      })()
    ])
      .then((list) => {
        if (!mounted) return;
        // list is an array from Promise.all: [staffList, void]
        setStaff(Array.isArray(list[0]) ? (list[0] as AdminStaffListItem[]) : []);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
        console.warn('Failed to load staff', err);
        toast({ title: "Failed to load staff", description: msg, variant: "destructive" });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [toast]);

  // Update subject options when selected class changes or map changes
  useEffect(() => {
    const globalFallback = subjectOptions.length > 0 ? subjectOptions : ['english','hindi','urdu','sanskrit','arabic','maths','science','social science','general knowledge'];
    if (!selectedClass) {
      setSubjectOptions(globalFallback);
      return;
    }
    const opts = Array.isArray(classSubjectsMap[selectedClass]) && classSubjectsMap[selectedClass]!.length > 0
      ? classSubjectsMap[selectedClass]!
      : globalFallback;
    setSubjectOptions(opts);
  }, [selectedClass, classSubjectsMap]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.staffId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
    );
  }, [staff, search]);

  const onSubmit = async (values: OnboardFormValues) => {
    try {
      const created = await createStaff({
        staffId: values.staffId.trim(),
        name: values.name.trim(),
        role: values.role.trim(),
        department: values.department.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        joiningDate: new Date(values.joiningDate).toISOString(),
        qualifications: (values.qualificationsCsv || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        assignments: [
          {
            className: values.className.trim(),
            section: values.section.trim(),
            subject: values.subject?.trim() || undefined,
          },
        ],
      });
      setStaff((prev) => [created, ...prev]);
      toast({ title: "Staff onboarded", description: `${created.name} (${created.staffId})` });
      form.reset({ ...form.getValues(), staffId: "", name: "", role: "", email: "", className: "", section: "", subject: "" });
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
      console.warn('Failed to onboard staff', err);
      toast({ title: "Failed to onboard", description: msg, variant: "destructive" });
    }
  };

  const removeStaff = async (id: string) => {
    try {
      await deleteStaff(id);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Removed staff", description: `ID ${id}` });
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : JSON.stringify(err));
      console.warn('Failed to remove staff', err);
      toast({ title: "Failed to remove", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboard New Staff</CardTitle>
          <CardDescription>Add new staff members to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="staffId">Staff ID</Label>
              <Input id="staffId" {...form.register("staffId")} placeholder="TCH105" />
              {form.formState.errors.staffId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.staffId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Jane Doe" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...form.register("role")} placeholder="Mathematics Teacher" />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} placeholder="Academics - Senior Secondary" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="jane@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} placeholder="98765 43210" />
            </div>
            <div>
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input id="joiningDate" type="date" {...form.register("joiningDate")} />
            </div>
            <div>
              <Label htmlFor="className">Class</Label>
              <Select
                value={form.watch('className')}
                onValueChange={(val) => {
                  form.setValue('className', val, { shouldDirty: true, shouldValidate: true });
                  // Reset section on class change
                  form.setValue('section', '', { shouldDirty: true, shouldValidate: true });
                  // Reset subject on class change
                  form.setValue('subject', '', { shouldDirty: true, shouldValidate: true });
                }}
              >
                <SelectTrigger id="className">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.className && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.className.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Select
                value={form.watch('section')}
                onValueChange={(val) => form.setValue('section', val, { shouldDirty: true, shouldValidate: true })}
                disabled={!selectedClass}
              >
                <SelectTrigger id="section">
                  <SelectValue placeholder={selectedClass ? 'Select section' : 'Select class first'} />
                </SelectTrigger>
                <SelectContent>
                  {(sectionsByClass[selectedClass || ''] || []).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.section && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.section.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="subject">Subject (optional)</Label>
              <Select
                value={form.watch('subject') || ''}
                onValueChange={(val) => form.setValue('subject', val, { shouldDirty: true, shouldValidate: true })}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map((subj) => (
                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="qualificationsCsv">Qualifications (comma-separated)</Label>
              <Input id="qualificationsCsv" {...form.register("qualificationsCsv")} placeholder="B.Ed, M.A." />
            </div>
            <div className="md:col-span-3 flex items-center justify-end">
              <Button type="submit"><Plus className="h-4 w-4 mr-2" />Add Teacher</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Staff</CardTitle>
          <CardDescription>Search and manage onboarded staff records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, role, department" className="pl-8" />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.staffId}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>{s.department}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="icon" onClick={() => removeStaff(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
