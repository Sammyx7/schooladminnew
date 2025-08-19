"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Briefcase, CalendarDays, User } from "lucide-react";
import { getStaffProfileByStaffId } from "@/lib/services/staffDbService";
import type { StaffProfile } from "@/lib/types";

interface Props {
  staffId?: string;
}

export default function StaffProfileView({ staffId = "TCH102" }: Props) {
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getStaffProfileByStaffId(staffId)
      .then((p) => {
        if (!mounted) return;
        setProfile(p);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [staffId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading profile...</CardTitle>
          <CardDescription>Please wait</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>No profile found</CardTitle>
          <CardDescription>Unable to load staff profile.</CardDescription>
        </CardHeader>
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
    <Card className="border shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 shrink-0">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{initials || <User className="h-6 w-6" />}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl truncate">{profile.name}</CardTitle>
            <CardDescription className="truncate">{profile.staffId}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Role" value={profile.role} />
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Department" value={profile.department} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={profile.email} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={profile.phone} />
          <InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Date of Joining" value={new Date(profile.dateOfJoining).toLocaleDateString()} />
        </div>
        <Separator />
        <div>
          <div className="font-medium mb-2">Qualifications</div>
          {profile.qualifications && profile.qualifications.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {profile.qualifications.map((q, idx) => (
                <li key={idx} className="break-words">{q}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-muted-foreground">No qualifications listed.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="text-sm min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium break-words">{value || "-"}</div>
      </div>
    </div>
  );
}
