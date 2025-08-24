"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listStudents } from "@/lib/services/studentsDbService";
import { getSchoolSettings, listClasses, sectionsForClass, type SchoolSettings } from "@/lib/services/settingsService";
import IdCardPreviewGrid from "@/components/idcards/IdCardPreviewGrid";
import type { CardOptions, SchoolBrand, StudentLite } from "@/components/idcards/IdCardTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function useData() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentLite[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [sList, sSettings] = await Promise.all([
          listStudents(),
          getSchoolSettings().catch(() => null),
        ]);
        if (!mounted) return;
        setStudents(
          (sList || []).map(s => ({
            student_id: s.studentId,
            name: s.name,
            class_section: s.classSection,
            avatar_url: s.avatarUrl,
          }))
        );
        setSettings(sSettings);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return { loading, students, settings };
}

export default function AdminStudentIdCardsPage() {
  const { loading, students, settings } = useData();

  const [q, setQ] = useState("");
  const [cls, setCls] = useState<string | undefined>(undefined);
  const [sec, setSec] = useState<string | undefined>(undefined);
  const [showQR, setShowQR] = useState(true);
  const [showAddr, setShowAddr] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const classes = useMemo(() => listClasses(settings), [settings]);
  const sections = useMemo(() => sectionsForClass(settings, cls), [settings, cls]);

  const filtered = useMemo(() => {
    let list = students;
    if (cls) list = list.filter(s => (s.class_section || "").toLowerCase().startsWith(cls.toLowerCase()));
    if (sec) list = list.filter(s => (s.class_section || "").toLowerCase().includes(sec.toLowerCase()));
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(t) || s.student_id.toLowerCase().includes(t));
    }
    // If user has chosen some items, show only selected
    const selectedIds = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    if (selectedIds.length > 0) list = list.filter(s => selectedIds.includes(s.student_id));
    return list;
  }, [students, cls, sec, q, selected]);

  const brand: SchoolBrand = useMemo(() => ({
    name: settings?.schoolName || "Your School",
    logoUrl: settings?.logoUrl,
    addressLine1: settings?.address,
    phone: settings?.phone,
    website: undefined,
    themeColor: "#1e293b", // slate-800 default
  }), [settings]);

  const options: CardOptions = useMemo(() => ({
    showQRCode: showQR,
    showClass: true,
    showSchoolAddress: showAddr,
    qrDataBuilder: (s) => s.student_id,
  }), [showQR, showAddr]);

  function toggleAllVisible(on: boolean) {
    const next = { ...selected };
    filtered.forEach(s => { next[s.student_id] = on; });
    setSelected(next);
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-7 w-60 bg-muted rounded" />
        <div className="grid md:grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Student ID Cards</h1>
          <p className="text-sm text-muted-foreground">Filter, select, and generate printable student ID cards with QR codes.</p>
        </div>
        <div className="hidden md:block">
          <Button onClick={() => window.print()}>Print / Save as PDF</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <Label className="mb-1 block">Search</Label>
          <Input placeholder="Search by name or ID" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Class</Label>
          <Select value={cls ?? "all"} onValueChange={(v) => { const next = v === 'all' ? undefined : v; setCls(next); setSec(undefined); }}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {classes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Section</Label>
          <Select value={sec ?? "all"} onValueChange={(v) => setSec(v === 'all' ? undefined : v)}>
            <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {sections.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="showqr" checked={showQR} onCheckedChange={(v) => setShowQR(Boolean(v))} />
          <Label htmlFor="showqr">Show QR</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="showaddr" checked={showAddr} onCheckedChange={(v) => setShowAddr(Boolean(v))} />
          <Label htmlFor="showaddr">Show address</Label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Showing {filtered.length} of {students.length} students</div>
        <div className="no-print flex items-center gap-2">
          <Button variant="secondary" onClick={() => toggleAllVisible(true)}>Select visible</Button>
          <Button variant="secondary" onClick={() => toggleAllVisible(false)}>Clear selection</Button>
          <Button onClick={() => window.print()} className="md:hidden">Print</Button>
        </div>
      </div>

      <Separator />

      {/* Selection checklist for visible students */}
      <div className="no-print grid md:grid-cols-3 gap-2">
        {filtered.map(s => (
          <label key={s.student_id} className="flex items-center gap-2 p-2 rounded border hover:bg-muted cursor-pointer">
            <Checkbox checked={!!selected[s.student_id]} onCheckedChange={(v) => setSelected(prev => ({ ...prev, [s.student_id]: Boolean(v) }))} />
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.avatar_url || undefined} alt="avatar" className="w-8 h-8 rounded object-cover bg-gray-200" />
              <div className="leading-tight">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.class_section || ""} • {s.student_id}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <Separator />

      {/* Preview grid (prints exactly sized cards) */}
      <IdCardPreviewGrid
        students={filtered}
        brand={brand}
        options={options}
      />
    </div>
  );
}
