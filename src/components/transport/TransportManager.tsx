"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Users, Bus, Trash2, Search } from "lucide-react";
import {
  listRoutes,
  createRoute,
  deleteRoute,
  listStudentsLite,
  getAssignmentsForRoute,
  setAssignmentsForRoute,
  type TransportRoute,
  type StudentLite,
} from "@/lib/services/transportService";

export default function TransportManager() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState<Partial<TransportRoute>>({ name: "", busNumber: "", driverName: "", capacity: 40 });
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saving, setSaving] = useState(false);

  const [students, setStudents] = useState<StudentLite[]>([]);
  const [search, setSearch] = useState("");
  const [classSectionFilter, setClassSectionFilter] = useState<string>("");

  // assignments[routeId] = array of studentIds
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;
    // Load students and routes
    listStudentsLite()
      .then((list) => {
        if (!mounted) return;
        setStudents(list);
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Failed to load students", description: String(err.message ?? err), variant: "destructive" });
      });

    setLoadingRoutes(true);
    listRoutes()
      .then((rs) => {
        if (!mounted) return;
        setRoutes(rs);
        if (!selectedRouteId && rs[0]?.id) setSelectedRouteId(String(rs[0].id));
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Failed to load routes", description: String(err.message ?? err), variant: "destructive" });
      })
      .finally(() => {
        if (mounted) setLoadingRoutes(false);
      });
    return () => {
      mounted = false;
    };
  }, [toast, selectedRouteId]);

  // Load assignments when route changes
  useEffect(() => {
    if (!selectedRouteId) return;
    let mounted = true;
    setLoadingAssignments(true);
    getAssignmentsForRoute(selectedRouteId)
      .then((sids) => {
        if (!mounted) return;
        setAssignments((prev) => ({ ...prev, [selectedRouteId]: sids }));
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Failed to load assignments", description: String(err.message ?? err), variant: "destructive" });
      })
      .finally(() => {
        if (mounted) setLoadingAssignments(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedRouteId, toast]);

  const classSectionOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.classSection && set.add(s.classSection));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q);
      const matchesClass = !classSectionFilter || (s.classSection || "") === classSectionFilter;
      return matchesSearch && matchesClass;
    });
  }, [students, search, classSectionFilter]);

  const selectedAssignments = assignments[selectedRouteId || ""] || [];

  const toggleAssign = (sid: string) => {
    if (!selectedRouteId) return;
    setAssignments((prev) => {
      const current = new Set(prev[selectedRouteId] || []);
      if (current.has(sid)) current.delete(sid); else current.add(sid);
      return { ...prev, [selectedRouteId]: Array.from(current) };
    });
  };

  const assignedCount = (routeId: string) => (assignments[routeId]?.length || 0);

  const handleAddRoute = async () => {
    const name = (newRoute.name || "").trim();
    if (!name) {
      toast({ title: "Route name required", variant: "destructive" });
      return;
    }
    try {
      const created = await createRoute({
        name,
        busNumber: newRoute.busNumber?.trim() || undefined,
        driverName: newRoute.driverName?.trim() || undefined,
        capacity: newRoute.capacity ?? 40,
      });
      setRoutes((r) => [...r, created]);
      setAssignments((a) => ({ ...a, [created.id]: [] }));
      setSelectedRouteId(created.id);
      setNewRoute({ name: "", busNumber: "", driverName: "", capacity: 40 });
      toast({ title: "Route added", description: created.name });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to add route", description: String(err.message ?? err), variant: "destructive" });
    }
  };

  const handleRemoveRoute = async (id: string) => {
    try {
      await deleteRoute(id);
      setRoutes((r) => r.filter((x) => x.id !== id));
      setAssignments((a) => {
        const { [id]: _, ...rest } = a;
        return rest;
      });
      if (selectedRouteId === id) setSelectedRouteId((prev) => {
        const remaining = routes.filter((r) => r.id !== id);
        return remaining[0]?.id || null;
      });
      toast({ title: "Route removed" });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to remove route", description: String(err.message ?? err), variant: "destructive" });
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedRouteId) return;
    setSaving(true);
    try {
      await setAssignmentsForRoute(selectedRouteId, selectedAssignments);
      const route = routes.find((r) => r.id === selectedRouteId);
      toast({
        title: "Assignments saved",
        description: `${assignedCount(selectedRouteId)} students assigned to ${route?.name}`,
      });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Failed to save assignments", description: String(err.message ?? err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bus className="h-5 w-5" />Routes</CardTitle>
            <CardDescription>Manage routes and select one to assign students.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rname">Route Name</Label>
              <Input id="rname" value={newRoute.name || ""} onChange={(e) => setNewRoute((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Route 3 - West Zone" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="busno">Bus Number</Label>
                  <Input id="busno" value={newRoute.busNumber || ""} onChange={(e) => setNewRoute((p) => ({ ...p, busNumber: e.target.value }))} placeholder="DL 03 EF 9012" />
                </div>
                <div>
                  <Label htmlFor="cap">Capacity</Label>
                  <Input id="cap" type="number" value={newRoute.capacity ?? 40} onChange={(e) => setNewRoute((p) => ({ ...p, capacity: Number(e.target.value) }))} />
                </div>
              </div>
              <Label htmlFor="driver">Driver Name</Label>
              <Input id="driver" value={newRoute.driverName || ""} onChange={(e) => setNewRoute((p) => ({ ...p, driverName: e.target.value }))} placeholder="Driver full name" />
              <Button className="mt-2 w-full" onClick={handleAddRoute}><Plus className="h-4 w-4 mr-2" />Add Route</Button>
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
              {routes.map((r) => (
                <div key={r.id} className={`border rounded-md p-3 flex items-center justify-between ${selectedRouteId === r.id ? "border-primary" : ""}`}>
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-sm text-muted-foreground">Bus {r.busNumber || "N/A"} • Driver {r.driverName || "N/A"} • Cap {r.capacity ?? 0} • Assigned {assignedCount(r.id)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={selectedRouteId === r.id ? "default" : "outline"} size="sm" onClick={() => setSelectedRouteId(r.id)}>Select</Button>
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveRoute(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Assign Students</CardTitle>
            <CardDescription>Select students and assign to the chosen route.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative md:w-1/2">
                <Input placeholder="Search by name or ID" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="md:w-1/2">
                <Input placeholder="Filter by Class - Section (exact)" value={classSectionFilter} onChange={(e) => setClassSectionFilter(e.target.value)} list="classSectionOpts" />
                <datalist id="classSectionOpts">
                  {classSectionOptions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Asg</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class-Section</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => {
                    const checked = selectedAssignments.includes(s.studentId);
                    return (
                      <TableRow key={s.studentId}>
                        <TableCell>
                          <Checkbox checked={checked} onCheckedChange={() => toggleAssign(s.studentId)} />
                        </TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.classSection || "-"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{s.studentId}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Selected Route: <span className="font-medium">{routes.find(r => r.id === selectedRouteId)?.name || "None"}</span> • Assigned: {selectedAssignments.length}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setAssignments((a) => ({ ...a, [selectedRouteId || ""]: [] }))}>Clear</Button>
                <Button onClick={handleSaveDraft}><Save className="h-4 w-4 mr-2" />Save Draft</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
