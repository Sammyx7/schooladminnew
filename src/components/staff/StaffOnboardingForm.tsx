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

const OnboardSchema = z.object({
  staffId: z.string().min(2, "Staff ID is required"),
  name: z.string().min(3, "Name is required"),
  role: z.string().min(2, "Role is required"),
  department: z.string().min(2, "Department is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  joiningDate: z.string().min(4, "Joining date is required"),
  qualificationsCsv: z.string().optional(),
});

type OnboardFormValues = z.infer<typeof OnboardSchema>;

export default function StaffOnboardingForm() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<AdminStaffListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

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
    },
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listStaff()
      .then((list) => {
        if (!mounted) return;
        setStaff(list);
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
      });
      setStaff((prev) => [created, ...prev]);
      toast({ title: "Staff onboarded", description: `${created.name} (${created.staffId})` });
      form.reset({ ...form.getValues(), staffId: "", name: "", role: "", email: "" });
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
          <CardTitle>Onboard New Teacher</CardTitle>
          <CardDescription>Capture teacher details. Data is stored in Supabase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
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
          <CardDescription>Search and manage onboarded staff records (mock).</CardDescription>
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
