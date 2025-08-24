"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";

import type { AdminStaffListItem, ComplaintSeverity, ComplaintStatus, StaffComplaint, StaffRatingEvent } from "@/lib/types";
import { complaintSeverities, complaintStatuses } from "@/lib/types";
import { listStaff } from "@/lib/services/staffDbService";
import { createComplaint, listComplaints, updateComplaint } from "@/lib/services/staffComplaintsService";
import { adjustRating, listRatingEvents } from "@/lib/services/staffRatingsService";

export default function AdminComplaintsPage() {
  const { toast } = useToast();

  // Staff loading
  const [staff, setStaff] = useState<AdminStaffListItem[]>([]);
  const staffMap = useMemo(() => new Map(staff.map(s => [s.staffId, s.name])), [staff]);

  // Filters
  const [filters, setFilters] = useState<{ staffId?: string; status?: ComplaintStatus; severity?: ComplaintSeverity; q?: string }>({});

  // List complaints
  const [items, setItems] = useState<StaffComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [openCreate, setOpenCreate] = useState(false);
  const [createValues, setCreateValues] = useState<{ staffId?: string; title: string; description?: string; severity: ComplaintSeverity; initialDeduction?: number }>({ title: "", description: "", severity: "low" as ComplaintSeverity });

  // Detail sheet
  const [openDetail, setOpenDetail] = useState(false);
  const [selected, setSelected] = useState<StaffComplaint | null>(null);

  // Rating events
  const [events, setEvents] = useState<StaffRatingEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Load staff once
  useEffect(() => {
    (async () => {
      try {
        const s = await listStaff();
        setStaff(s);
      } catch (e: any) {
        toast({ title: "Failed to load staff", description: e?.message });
      }
    })();
  }, [toast]);

  // Load complaints whenever filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await listComplaints(filters);
        setItems(list);
      } catch (e: any) {
        toast({ title: "Failed to load complaints", description: e?.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [filters, toast]);

  async function fetchEvents(staffId: string) {
    setEventsLoading(true);
    try {
      const ev = await listRatingEvents(staffId, 10);
      setEvents(ev);
    } catch (e: any) {
      toast({ title: "Failed to load rating events", description: e?.message });
    } finally {
      setEventsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Teacher Complaints</h1>
        <div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <Button onClick={() => setOpenCreate(true)}>New Complaint</Button>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Complaint</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (!createValues.staffId || !createValues.title) {
                      toast({ title: "Please pick staff and enter title" });
                      return;
                    }
                    const created = await createComplaint({
                      staffId: createValues.staffId,
                      title: createValues.title,
                      description: createValues.description || undefined,
                      severity: createValues.severity,
                      initialDeduction: createValues.initialDeduction ? Number(createValues.initialDeduction) : undefined,
                    });
                    toast({ title: "Complaint created" });
                    setOpenCreate(false);
                    setCreateValues({ title: "", description: "", severity: "low" as ComplaintSeverity });
                    setFilters((f) => ({ ...f })); // refresh list
                  } catch (e: any) {
                    toast({ title: "Create failed", description: e?.message });
                  }
                }}
              >
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium">Staff</label>
                    <Select value={createValues.staffId ?? undefined} onValueChange={(v) => setCreateValues(cv => ({ ...cv, staffId: v }))}>
                      <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {staff.map(s => (
                          <SelectItem key={s.staffId} value={s.staffId}>{s.staffId} — {s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input className="mt-1" placeholder="Complaint title" value={createValues.title} onChange={(e) => setCreateValues(cv => ({ ...cv, title: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea className="mt-1" placeholder="Describe the complaint (optional)" value={createValues.description ?? ""} onChange={(e) => setCreateValues(cv => ({ ...cv, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Severity</label>
                      <Select value={createValues.severity} onValueChange={(v) => setCreateValues(cv => ({ ...cv, severity: v as ComplaintSeverity }))}>
                        <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select severity" /></SelectTrigger>
                        <SelectContent>
                          {complaintSeverities.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Initial Deduction</label>
                      <Input className="mt-1" type="number" placeholder="e.g. 5" value={createValues.initialDeduction as any || ""} onChange={(e) => setCreateValues(cv => ({ ...cv, initialDeduction: e.target.value === "" ? undefined : Number(e.target.value) }))} />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Staff</label>
              <Select value={filters.staffId ?? "__all__"} onValueChange={(v) => setFilters((f) => ({ ...f, staffId: v === "__all__" ? undefined : v }))}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="All staff" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem key="__all" value="__all__">All staff</SelectItem>
                  {staff.map(s => (
                    <SelectItem key={s.staffId} value={s.staffId}>{s.staffId} — {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status ?? "__any__"} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === "__any__" ? undefined : (v as ComplaintStatus) }))}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any</SelectItem>
                  {complaintStatuses.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select value={filters.severity ?? "__any__"} onValueChange={(v) => setFilters((f) => ({ ...f, severity: v === "__any__" ? undefined : (v as ComplaintSeverity) }))}>
                <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any</SelectItem>
                  {complaintSeverities.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input className="mt-1" placeholder="Title contains..." value={filters.q || ""} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" variant="secondary" onClick={() => setFilters({})}>
                <Filter className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground">{loading ? 'Loading...' : 'No complaints found.'}</TableCell></TableRow>
                )}
                {items.map((c) => (
                  <TableRow key={c.id} className="hover:bg-muted/50">
                    <TableCell className="whitespace-nowrap">{c.staffId} — {staffMap.get(c.staffId) || 'Unknown'}</TableCell>
                    <TableCell className="min-w-[240px]">{c.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{c.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(c.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(c); setOpenDetail(true); fetchEvents(c.staffId); }}>View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={openDetail} onOpenChange={setOpenDetail}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Complaint Details</SheetTitle>
          </SheetHeader>
          {!selected ? (
            <div className="py-6 text-sm text-muted-foreground">No complaint selected.</div>
          ) : (
            <div className="py-2 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground">Staff</div>
                <div className="text-sm font-medium">{selected.staffId} — {staffMap.get(selected.staffId) || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Title</div>
                <div className="text-sm font-medium">{selected.title}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Severity</div>
                <Badge variant="outline" className="capitalize">{selected.severity}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <Badge className="capitalize">{selected.status}</Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Description</div>
                <div className="text-sm whitespace-pre-wrap">{selected.description || '—'}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Update Status</div>
                <div className="grid grid-cols-1 gap-3">
                  <Select defaultValue={selected.status} onValueChange={(v) => setSelected({ ...selected, status: v as ComplaintStatus })}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      {complaintStatuses.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Resolution notes (optional)" value={selected.resolutionNotes || ''} onChange={(e) => setSelected({ ...selected, resolutionNotes: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={async () => {
                        if (!selected) return;
                        try {
                          const upd = await updateComplaint(selected.id, { status: selected.status as ComplaintStatus, resolutionNotes: selected.resolutionNotes ?? null });
                          setSelected(upd);
                          toast({ title: 'Updated complaint' });
                          setFilters((f) => ({ ...f }));
                        } catch (e: any) {
                          toast({ title: 'Update failed', description: e.message });
                        }
                      }}
                    >Save</Button>
                    <Button variant="outline" onClick={() => setOpenDetail(false)}>Close</Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Reward/Deduct Stars</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={async () => {
                    if (!selected) return;
                    const stars = Number(prompt('Add stars (0-5):', '1'));
                    if (!Number.isFinite(stars)) return;
                    const starInt = Math.max(0, Math.floor(Math.abs(stars)));
                    if (starInt === 0) return;
                    try {
                      await adjustRating({ staffId: selected.staffId, delta: starInt * 20, reason: `+${starInt}★ for complaint ${selected.title}` });
                      toast({ title: `Added ${starInt}★` });
                      fetchEvents(selected.staffId);
                    } catch (e: any) {
                      toast({ title: 'Failed', description: e.message });
                    }
                  }}>Add Stars</Button>
                  <Button variant="destructive" onClick={async () => {
                    if (!selected) return;
                    const stars = Number(prompt('Deduct stars (0-5):', '1'));
                    if (!Number.isFinite(stars)) return;
                    const starInt = Math.max(0, Math.floor(Math.abs(stars)));
                    if (starInt === 0) return;
                    try {
                      await adjustRating({ staffId: selected.staffId, delta: -(starInt * 20), reason: `-${starInt}★ for complaint ${selected.title}` });
                      toast({ title: `Deducted ${starInt}★` });
                      fetchEvents(selected.staffId);
                    } catch (e: any) {
                      toast({ title: 'Failed', description: e.message });
                    }
                  }}>Deduct Stars</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm font-medium">Recent Rating Events</div>
                <div className="space-y-2">
                  {eventsLoading ? (
                    <div className="text-xs text-muted-foreground">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="text-xs text-muted-foreground">No events.</div>
                  ) : (
                    events.slice(0, 5).map(ev => {
                      const stars = ev.delta / 20;
                      const label = `${stars > 0 ? '+' : ''}${stars}\u2605`;
                      return (
                        <div key={ev.id} className="flex items-center justify-between text-sm border rounded px-2 py-1">
                          <div className="truncate max-w-[70%]" title={ev.reason}>{ev.reason}</div>
                          <div className={"ml-2 inline-flex items-center gap-1 " + (ev.delta >= 0 ? 'text-green-600' : 'text-red-600')}>
                            {ev.delta >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            {label}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
