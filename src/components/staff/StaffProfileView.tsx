"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase, CalendarDays, User, BookOpenCheck, GraduationCap, IdCard, Star, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { getStaffProfileByStaffId, getStaffProfileByEmail } from "@/lib/services/staffDbService";
import { getAssignmentsForStaff, type StaffAssignment } from "@/lib/services/staffAssignmentsService";
import { listRatingEvents } from "@/lib/services/staffRatingsService";
import type { StaffRatingEvent } from "@/lib/types";
import { getSupabase } from "@/lib/supabaseClient";
import type { StaffProfile } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SectionCard from "@/components/staff/ui/SectionCard";
import MetricCard from "@/components/staff/ui/MetricCard";
import InfoItem from "@/components/staff/ui/InfoItem";
import AssignmentsList from "@/components/staff/ui/AssignmentsList";

export default function StaffProfileView() {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<StaffAssignment[] | null>(null);
  const [ratingEvents, setRatingEvents] = useState<StaffRatingEvent[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [linkingStaffId, setLinkingStaffId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);

  useEffect(() => {
    // Resolve current staffId from Supabase session email or localStorage fallback
    let mounted = true;
    (async () => {
      try {
        const supabase = getSupabase();
        let resolved: string | null = null;
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          const email = data.user?.email || null;
          if (mounted) setUserEmail(email);
          if (email && email.includes("@")) {
            resolved = email.split("@")[0];
          }
        }
        if (!resolved) {
          try {
            const stored = localStorage.getItem("staffId");
            if (stored) resolved = stored;
          } catch {}
        }
        if (mounted) {
          if (resolved) {
            try { localStorage.setItem("staffId", resolved); } catch {}
          }
          setStaffId(resolved);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setStaffId(null);
      } finally {
        if (mounted) setIdentityReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!identityReady) return () => { mounted = false; };
    if (!staffId && !userEmail) {
      setLoading(false);
      setAssignmentsLoading(false);
      return () => { mounted = false; };
    }
    setLoading(true);
    setAssignmentsLoading(true);
    (async () => {
      try {
        let resolvedStaffId = staffId || null;
        let p: StaffProfile | null = null;
        if (resolvedStaffId) {
          p = await getStaffProfileByStaffId(resolvedStaffId);
        }
        // Fallback by email if staffId lookup returned null
        if (!p && userEmail) {
          p = await getStaffProfileByEmail(userEmail);
          if (p && p.staffId && p.staffId !== resolvedStaffId) {
            resolvedStaffId = p.staffId;
            // Update state so future effects use the canonical staffId
            setStaffId(p.staffId);
            try { localStorage.setItem("staffId", p.staffId); } catch {}
          }
        }
        if (mounted) {
          setProfile(p);
          setLoading(false);
        }
        if (p && resolvedStaffId) {
          const a = await getAssignmentsForStaff(resolvedStaffId);
          if (mounted) {
            setAssignments(a);
            setAssignmentsLoading(false);
          }
          // Load rating events (reputation panel)
          try {
            setEventsLoading(true);
            const ev = await listRatingEvents(resolvedStaffId, 6);
            if (mounted) setRatingEvents(ev);
          } catch (e) {
            if (mounted) setRatingEvents([]);
          } finally {
            if (mounted) setEventsLoading(false);
          }
        } else {
          if (mounted) setAssignmentsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setLoading(false);
          setAssignmentsLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [staffId, userEmail, identityReady]);

  if (loading) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Loading profile…</CardTitle>
          <CardDescription>Please wait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="h-20 sm:h-24 rounded-xl bg-muted animate-pulse" />
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
            <div className="h-32 rounded-xl bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !staffId) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>No profile found</CardTitle>
          <CardDescription>Unable to load staff profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              If you are a staff member, enter your Staff ID to link your account.
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter your Staff ID"
                value={linkingStaffId}
                onChange={(e) => setLinkingStaffId(e.target.value.trim())}
              />
              <Button
                onClick={async () => {
                  setLinkError(null);
                  if (!linkingStaffId) {
                    setLinkError("Please enter a Staff ID.");
                    return;
                  }
                  try {
                    setIsLinking(true);
                    const p = await getStaffProfileByStaffId(linkingStaffId);
                    if (!p) {
                      setLinkError("No staff found for this Staff ID.");
                    } else {
                      // Persist and trigger reload via effect
                      try { localStorage.setItem("staffId", linkingStaffId); } catch {}
                      setStaffId(linkingStaffId);
                      setProfile(p);
                      // Preload assignments (optional optimization)
                      try {
                        const a = await getAssignmentsForStaff(linkingStaffId);
                        setAssignments(a);
                      } catch {}
                    }
                  } catch (err: any) {
                    setLinkError(err?.message || "Failed to link Staff ID.");
                  } finally {
                    setIsLinking(false);
                  }
                }}
                disabled={isLinking}
              >
                {isLinking ? "Linking..." : "Link Account"}
              </Button>
            </div>
            {linkError && <div className="text-sm text-destructive">{linkError}</div>}
            <div className="text-xs text-muted-foreground">
              Tip: Your Staff ID is usually the part before "@" in your school email.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full min-w-0 overflow-x-hidden space-y-3 sm:space-y-6 p-4 sm:p-6">
      {/* Header card with enhanced gradient and depth */}
      <Card className="relative overflow-hidden rounded-2xl border shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <CardHeader className="relative p-4 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-primary/20 shadow-sm">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{initials || <User className="h-6 w-6" />}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl truncate">{profile.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 truncate">
                <IdCard className="h-3.5 w-3.5" />
                {profile.staffId}
              </CardDescription>
              {typeof profile.ratingScore === 'number' && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const stars = Math.max(0, Math.min(5, Math.floor(((profile.ratingScore || 0) / 100) * 5 + 1e-6)));
                      const filled = i < stars;
                      return (
                        <Star
                          key={i}
                          className={
                            "h-5 w-5 sm:h-6 sm:w-6 drop-shadow-[0_1px_0_rgba(0,0,0,0.1)] " +
                            (filled ? "fill-amber-400 stroke-amber-500" : "stroke-muted-foreground/40")
                          }
                        />
                      );
                    })}
                    <span className="text-xs sm:text-sm font-medium text-foreground/80">
                      {Math.max(0, Math.min(5, Math.floor(((profile.ratingScore || 0) / 100) * 5 + 1e-6)))}/5
                    </span>
                  </div>
                  {/* Progress bar removed to avoid 0–100 visualization */}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {profile.role && <Badge variant="secondary" className="text-xs">{profile.role}</Badge>}
                {profile.department && <Badge variant="outline" className="text-xs">{profile.department}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info */}
      <SectionCard title="About" description="Contact and joining details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
          <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Role" value={profile.role} />
          <InfoItem icon={<Briefcase className="h-4 w-4" />} label="Department" value={profile.department} />
          <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Date of Joining" value={new Date(profile.dateOfJoining).toLocaleDateString()} />
        </div>
      </SectionCard>

      {/* Overview & Reputation two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <SectionCard title="Overview" description="Your current teaching stats" className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard icon={<Briefcase className="h-4 w-4" />} label="Total Assignments" value={assignmentsLoading || !assignments ? '—' : String(assignments.length)} />
            <MetricCard icon={<BookOpenCheck className="h-4 w-4" />} label="Unique Classes" value={assignmentsLoading || !assignments ? '—' : String(new Set(assignments.map(a => `${a.className}-${a.section}`)).size)} />
            <MetricCard icon={<Briefcase className="h-4 w-4" />} label="Class Teacher Of" value={assignmentsLoading || !assignments ? '—' : String(assignments.filter(a => a.isClassTeacher).length)} />
          </div>
          <div className="mt-3">
            <a href={`/admin/complaints?staffId=${encodeURIComponent(profile.staffId)}`} className="inline-flex items-center text-xs font-medium text-primary hover:underline">
              View Complaints <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </div>
        </SectionCard>

        <SectionCard title="Reputation" description="Recent rating changes and notes">
          {eventsLoading ? (
            <div className="text-sm text-muted-foreground">Loading events…</div>
          ) : !ratingEvents || ratingEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent rating events.</div>
          ) : (
            <div className="space-y-2">
              {ratingEvents.map((ev) => (
                <div key={ev.id} className="flex items-start justify-between gap-3 rounded-md border p-2">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString()}</div>
                    <div className="text-sm truncate" title={ev.reason}>{ev.reason}</div>
                  </div>
                  <div className={(ev.delta >= 0 ? 'text-green-600' : 'text-red-600') + ' shrink-0 inline-flex items-center gap-1 text-sm font-medium'}>
                    {ev.delta >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {ev.delta}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Assignments */}
        <SectionCard title="Assignments" description="Your current class and subject assignments" className="lg:col-span-3">
          <AssignmentsList assignments={assignments} loading={assignmentsLoading} />
        </SectionCard>
      </div>
    </div>
  );
}

