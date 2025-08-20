"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Briefcase, CalendarDays, User, BookOpenCheck, GraduationCap, IdCard } from "lucide-react";
import { getStaffProfileByStaffId, getStaffProfileByEmail } from "@/lib/services/staffDbService";
import { getAssignmentsForStaff, type StaffAssignment } from "@/lib/services/staffAssignmentsService";
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
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
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
    <div className="w-full min-w-0 overflow-x-hidden space-y-3 sm:space-y-6">
      {/* Header card with gradient */}
      <Card className="border shadow-md relative overflow-hidden rounded-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-28 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent" />
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-primary/20">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback>{initials || <User className="h-6 w-6" />}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl truncate">{profile.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 truncate">
                <IdCard className="h-3.5 w-3.5" />
                {profile.staffId}
              </CardDescription>
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

      {/* Metrics */}
      <SectionCard title="Overview" description="Your current teaching stats">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <MetricCard icon={<Briefcase className="h-4 w-4" />} label="Total Assignments" value={assignmentsLoading || !assignments ? '—' : String(assignments.length)} />
          <MetricCard icon={<BookOpenCheck className="h-4 w-4" />} label="Unique Classes" value={assignmentsLoading || !assignments ? '—' : String(new Set(assignments.map(a => `${a.className}-${a.section}`)).size)} />
          <MetricCard icon={<Briefcase className="h-4 w-4" />} label="Class Teacher Of" value={assignmentsLoading || !assignments ? '—' : String(assignments.filter(a => a.isClassTeacher).length)} />
        </div>
      </SectionCard>

      {/* Qualifications */}
      <SectionCard title="Qualifications" description="Your professional qualifications">
        {profile.qualifications && profile.qualifications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.qualifications.map((q, idx) => (
              <span key={idx} className="rounded-full border px-3 py-1 text-xs bg-card">
                {q}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No qualifications listed.</div>
        )}
      </SectionCard>

      {/* Assignments */}
      <SectionCard title="Assignments" description="Your current class and subject assignments">
        <AssignmentsList assignments={assignments} loading={assignmentsLoading} />
      </SectionCard>
    </div>
  );
}

