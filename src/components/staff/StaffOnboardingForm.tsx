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
import { Plus, Trash2, Search, Filter, CalendarDays, Mail, Phone, X, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSchoolSettings } from "@/lib/services/settingsService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

const OnboardSchema = z.object({
  staffId: z.string().optional(),
  name: z.string().min(3, "Name is required"),
  role: z.string().min(2, "Role is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  joiningDate: z.string().min(4, "Joining date is required"),
  qualificationsCsv: z.string().optional(),
  className: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  subjects: z.array(z.string()).optional(),
});

type OnboardFormValues = z.infer<typeof OnboardSchema>;

export default function StaffOnboardingForm() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<AdminStaffListItem[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  // No separate assignments UI; captured in main form

  const form = useForm<OnboardFormValues>({
    resolver: zodResolver(OnboardSchema),
    mode: 'onChange',
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
      subjects: [],
    },
  });

  // Settings-powered class/section options
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [sectionsByClass, setSectionsByClass] = useState<Record<string, string[]>>({});
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [classSubjectsMap, setClassSubjectsMap] = useState<Record<string, string[]>>({});
  const selectedClass = form.watch("className");
  const joiningDateStr = form.watch('joiningDate');
  const joiningDateObj = joiningDateStr ? new Date(joiningDateStr) : undefined;

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

  // Department options for filter
  const departmentOptions = useMemo(() => Array.from(new Set(staff.map(s => s.department).filter(Boolean))).sort(), [staff]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.staffId.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);
      const matchesDept = deptFilter === 'all' || s.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [staff, search, deptFilter]);

  const roleOptions = useMemo(() => Array.from(new Set(staff.map(s => s.role).filter(Boolean))).sort(), [staff]);

  const onSubmit = async (values: OnboardFormValues) => {
    try {
      const created = await createStaff({
        staffId: values.staffId?.trim() || undefined,
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
        assignments: (() => {
          const base = { className: values.className, section: values.section };
          const subs = Array.isArray(values.subjects) && values.subjects.length > 0 ? values.subjects : ['General'];
          if (subs.length === 0) {
            // No specific subject chosen; create one assignment without subject
            return [{ ...base }];
          }
          return subs.map((subject) => ({ ...base, subject }));
        })(),
      });
      setStaff((prev) => [created, ...prev]);
      toast({ title: "Staff onboarded", description: `${created.name} (${created.staffId})` });
      form.reset({ ...form.getValues(), staffId: "", name: "", role: "", email: "", className: "", section: "", subjects: [] });
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
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Onboard New Staff</CardTitle>
          <CardDescription className="text-muted-foreground">Add new staff members to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Personal Details */}
            <div className="md:col-span-2 xl:col-span-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Personal Details</h3>
                <div className="h-px flex-1 ml-4 bg-border" />
              </div>
            </div>
            <div>
              <Label htmlFor="staffId">Staff ID <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="staffId" {...form.register("staffId")} placeholder="Leave blank to auto-generate (e.g., TCH001)" />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to auto-generate sequentially (TCH001, TCH002, …).</p>
              {form.formState.errors.staffId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.staffId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...form.register("name")} placeholder="Jane Doe" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" {...form.register("email")} placeholder="jane@example.com" className="pl-8" />
              </div>
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" {...form.register("phone")} placeholder="98765 43210" className="pl-8" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Optional. Include country code if applicable.</p>
            </div>

            {/* Employment Details */}
            <div className="md:col-span-2 xl:col-span-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Employment Details</h3>
                <div className="h-px flex-1 ml-4 bg-border" />
              </div>
            </div>
            <div>
              <Label htmlFor="role">Role <span className="text-destructive">*</span></Label>
              <Input id="role" list="role-options" {...form.register("role")} placeholder="Mathematics Teacher" />
              <datalist id="role-options">
                {roleOptions.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
              <Input id="department" list="dept-options" {...form.register("department")} placeholder="Academics — Senior Secondary" />
              <datalist id="dept-options">
                {departmentOptions.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="joiningDate">Joining Date <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="joiningDate"
                    variant="outline"
                    type="button"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {joiningDateObj ? format(joiningDateObj, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joiningDateObj}
                    onSelect={(date) => {
                      if (!date) return;
                      form.setValue('joiningDate', format(date, 'yyyy-MM-dd'), { shouldDirty: true, shouldValidate: true });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.joiningDate && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.joiningDate.message}</p>
              )}
            </div>

            {/* Teaching Assignment */}
            <div className="md:col-span-2 xl:col-span-3 mt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Teaching Assignment</h3>
                <div className="h-px flex-1 ml-4 bg-border" />
              </div>
            </div>
            <div>
              <Label htmlFor="className">Class <span className="text-destructive">*</span></Label>
              <Select
                value={form.watch('className')}
                onValueChange={(val) => {
                  form.setValue('className', val, { shouldDirty: true, shouldValidate: true });
                  // Reset section on class change
                  form.setValue('section', '', { shouldDirty: true, shouldValidate: true });
                  // Reset subjects on class change
                  form.setValue('subjects', [], { shouldDirty: true, shouldValidate: true });
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
              <Label htmlFor="section">Section <span className="text-destructive">*</span></Label>
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
              <div className="flex items-center justify-between">
                <Label>Subjects (choose one or more)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>Select multiple subjects if this teacher teaches more than one.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {subjectOptions.map((subj) => {
                  const selected = (form.watch('subjects') || []).includes(subj);
                  return (
                    <label key={subj} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={(v) => {
                          const curr = form.getValues('subjects') || [];
                          const next = (v ? true : false)
                            ? Array.from(new Set([...curr, subj]))
                            : curr.filter((s) => s !== subj);
                          form.setValue('subjects', next, { shouldDirty: true, shouldValidate: true });
                        }}
                      />
                      <span>{subj}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue('subjects', subjectOptions.slice(), { shouldDirty: true, shouldValidate: true })}>Select all</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => form.setValue('subjects', [], { shouldDirty: true, shouldValidate: true })}>Clear</Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="qualificationsCsv">Qualifications (comma-separated)</Label>
              <Input id="qualificationsCsv" {...form.register("qualificationsCsv")} placeholder="B.Ed, M.A." />
              {(() => {
                const tokens = (form.watch('qualificationsCsv') || '').split(',').map(t => t.trim()).filter(Boolean);
                if (tokens.length === 0) return null;
                const removeToken = (tok: string) => {
                  const next = tokens.filter(t => t.toLowerCase() !== tok.toLowerCase());
                  form.setValue('qualificationsCsv', next.join(', '), { shouldDirty: true, shouldValidate: true });
                };
                return (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tokens.map(tok => (
                      <span key={tok} className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs">
                        {tok}
                        <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => removeToken(tok)} aria-label={`Remove ${tok}`}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="md:col-span-2 xl:col-span-3 flex items-center justify-end">
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
                  </>
                )}
              </Button>
            </div>

            {/* Live Preview */}
            <div className="md:col-span-2 xl:col-span-3">
              <div className="mt-2 rounded-lg border bg-card">
                <div className="p-4 flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage alt={form.watch('name') || 'Avatar'} />
                    <AvatarFallback>
                      {(form.watch('name') || '?').slice(0,1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold truncate max-w-[32ch]">{form.watch('name') || 'Full Name'}</h4>
                      {form.watch('role') && <Badge variant="secondary">{form.watch('role')}</Badge>}
                      {form.watch('department') && <Badge variant="outline">{form.watch('department')}</Badge>}
                      {joiningDateObj && (
                        <Badge variant="secondary" className="ml-auto">Joining {format(joiningDateObj, 'dd MMM yyyy')}</Badge>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 truncate"><Mail className="h-4 w-4" /><span title={form.watch('email') || ''}>{form.watch('email') || 'email@example.com'}</span></div>
                      {form.watch('phone') && <div className="flex items-center gap-2 truncate"><Phone className="h-4 w-4" /><span>{form.watch('phone')}</span></div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              Current Staff
              <Badge variant="secondary" className="rounded-full">{filtered.length}/{staff.length}</Badge>
            </CardTitle>
          </div>
          {/* Toolbar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative w-80">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, role, department" className="pl-8" />
            </div>
            <div className="w-64">
              <Select value={deptFilter} onValueChange={setDeptFilter}>
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
          {/* Mobile toolbar */}
          <div className="md:hidden grid grid-cols-1 gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, ID, role, department" className="pl-8" />
            </div>
            <div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
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
        <CardContent className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">{search || deptFilter !== 'all' ? 'No staff match your search/filters.' : 'No staff onboarded yet.'}</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="min-w-[20ch]">Name</TableHead>
                      <TableHead className="w-[12ch]">Staff ID</TableHead>
                      <TableHead className="min-w-[16ch]">Role</TableHead>
                      <TableHead className="min-w-[20ch]">Department</TableHead>
                      <TableHead className="min-w-[24ch]">Email</TableHead>
                      <TableHead className="min-w-[16ch]">Phone</TableHead>
                      <TableHead className="min-w-[24ch]">Assignments</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={s.avatarUrl} alt={s.name} />
                              <AvatarFallback>{s.name?.slice(0,1)?.toUpperCase() ?? '?'}</AvatarFallback>
                            </Avatar>
                            <span>{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{s.staffId}</TableCell>
                        <TableCell>{s.role}</TableCell>
                        <TableCell>{s.department}</TableCell>
                        <TableCell className="text-muted-foreground text-sm truncate max-w-[28ch]" title={s.email}>{s.email}</TableCell>
                        <TableCell className="text-sm">{s.phone || '-'}</TableCell>
                        <TableCell className="text-sm">
                          {(s.assignments && s.assignments.length > 0) ? (
                            <div className="flex flex-wrap gap-1 max-w-[36ch]">
                              {s.assignments.slice(0,4).map((a, idx) => (
                                <Badge key={idx} variant="outline" className="font-normal">
                                  {a.className}-{a.section}{a.isClassTeacher ? ' • CT' : ''}
                                </Badge>
                              ))}
                              {s.assignments.length > 4 && (
                                <span className="text-muted-foreground text-xs">+{s.assignments.length - 4} more</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm">View More</Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-72">
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="font-medium">Joining:</span>{' '}
                                    {s.joiningDate ? (() => { try { return format(new Date(s.joiningDate), 'dd MMM yyyy'); } catch { return s.joiningDate; } })() : '-'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Qualifications:</span>
                                    <div className="mt-1">
                                      {Array.isArray(s.qualifications) && s.qualifications.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {s.qualifications.map((q, i) => (
                                            <Badge key={i} variant="secondary">{q}</Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button variant="destructive" size="icon" onClick={() => removeStaff(s.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
    </div>
  );
}
