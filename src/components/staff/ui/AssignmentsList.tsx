"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { StaffAssignment } from "@/lib/services/staffAssignmentsService";

interface AssignmentsListProps {
  assignments: StaffAssignment[] | null;
  loading?: boolean;
}

export default function AssignmentsList({ assignments, loading }: AssignmentsListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const parseSubjects = (subject: string | null | undefined): string[] => {
    if (!subject) return [];
    return subject
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };
  const formatClassLabel = (value: string): string => {
    const cleaned = (value || '').toString().trim();
    const lower = cleaned.toLowerCase();
    if (lower.startsWith('class ')) return cleaned; // already prefixed
    if (/^\d+/.test(cleaned)) return `Class ${cleaned}`; // numeric class names
    return cleaned; // custom labels like 'Grade 2' or 'Nursery'
  };
  const groupAssignments = (items: StaffAssignment[]) => {
    const map = new Map<string, { className: string; section: string; subjects: string[]; isClassTeacher: boolean }>();
    for (const a of items) {
      const key = `${a.className}-${a.section}`;
      const entry = map.get(key) || {
        className: a.className,
        section: a.section,
        subjects: [],
        isClassTeacher: false,
      };
      const subs = parseSubjects(a.subject);
      for (const s of subs) if (!entry.subjects.includes(s)) entry.subjects.push(s);
      entry.isClassTeacher = entry.isClassTeacher || !!a.isClassTeacher;
      map.set(key, entry);
    }
    const numeric = (v: string) => {
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    return Array.from(map.values()).sort((x, y) => {
      const nx = numeric(x.className);
      const ny = numeric(y.className);
      if (nx !== null && ny !== null && nx !== ny) return nx - ny;
      if (nx !== null && ny === null) return -1;
      if (nx === null && ny !== null) return 1;
      const nameCmp = x.className.localeCompare(y.className);
      if (nameCmp !== 0) return nameCmp;
      return x.section.localeCompare(y.section);
    });
  };
  const renderSubjectChips = (subjects: string[], key?: string) => {
    const MAX = 3;
    const isExpanded = key ? !!expanded[key] : false;
    const list = isExpanded ? subjects : subjects.slice(0, MAX);
    const remaining = subjects.length - list.length;
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        {list.map((subj, idx) => (
          <span key={idx} className="text-[11px] leading-4 px-2 py-0.5 rounded-full border bg-card">
            {subj}
          </span>
        ))}
        {remaining > 0 && !isExpanded && (
          <button
            type="button"
            onClick={() => key && setExpanded((s) => ({ ...s, [key]: true }))}
            className="text-[11px] leading-4 px-2 py-0.5 rounded-full border bg-muted/60 text-foreground/70 hover:bg-muted transition"
            title={subjects.slice(MAX).join(", ")}
          >
            +{remaining} more
          </button>
        )}
        {isExpanded && subjects.length > MAX && (
          <button
            type="button"
            onClick={() => key && setExpanded((s) => ({ ...s, [key]: false }))}
            className="text-[11px] leading-4 px-2 py-0.5 rounded-full border bg-muted/40 text-foreground/70 hover:bg-muted transition"
          >
            Show less
          </button>
        )}
      </div>
    );
  };
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
        {/* Desktop skeleton - full width stacked cards */}
        <div className="hidden md:block space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...Array(6)].map((__, j) => (
                  <Skeleton key={j} className="h-6 w-24 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
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
          <div key={`${a.className}-${a.section}-${i}`} className="rounded-xl border p-3 bg-card/30">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{formatClassLabel(a.className)}</div>
              <div className="text-[11px] rounded-full border px-2 py-0.5 text-muted-foreground bg-background">Sec {a.section}</div>
            </div>
            <div className="mt-2">
              {parseSubjects(a.subject).length > 0 ? (
                renderSubjectChips(parseSubjects(a.subject), `${a.className}-${a.section}`)
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {a.isClassTeacher ? 'Class Teacher' : 'Subject Teacher'}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: full-width stacked cards by class-section */}
      <div className="hidden md:block space-y-3">
        {groupAssignments(assignments).map((g, i) => (
          <div key={`${g.className}-${g.section}-${i}`} className="rounded-xl border p-4 bg-card/30">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">{formatClassLabel(g.className)} • Sec {g.section}</div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/40">{g.subjects.length} subjects</span>
                <span className={"text-[11px] px-2 py-0.5 rounded-full border " + (g.isClassTeacher ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-muted text-foreground/70")}>{g.isClassTeacher ? 'Class Teacher' : 'Subject'}</span>
              </div>
            </div>
            <div className="mt-3">
              {g.subjects.length > 0 ? (
                renderSubjectChips(g.subjects, `${g.className}-${g.section}`)
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
