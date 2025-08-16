
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { User, Mail, Phone, Calendar, Award, GraduationCap, Building, AlertCircle as AlertIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { AdminStaffListItem } from '@/lib/types'; // Using a more detailed type
import { getAdminStaffMemberById } from '@/lib/services/adminService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

const ProfileDetail = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => (
  <div className="flex items-center text-sm">
    <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
    <span className="font-medium text-muted-foreground w-32">{label}:</span>
    <span className="text-foreground">{value || 'N/A'}</span>
  </div>
);

const ProfileSkeleton = () => (
    <div className="space-y-6">
        <Card className="border shadow-md">
            <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border shadow-md">
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4 pt-2">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                </CardContent>
            </Card>
            <Card className="border shadow-md">
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4 pt-2">
                    {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function ViewStaffPage() {
    const [profile, setProfile] = useState<AdminStaffListItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const params = useParams();
    const staffId = params.id as string;

    useEffect(() => {
        if (!staffId) return;
        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getAdminStaffMemberById(staffId);
                if (data) {
                    setProfile(data);
                } else {
                    setError("Staff member not found.");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(errorMessage);
                toast({ title: "Error Fetching Profile", description: errorMessage, variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [staffId, toast]);

    if (isLoading) {
        return (
            <div>
                <PageHeader
                    title="Staff Profile"
                    icon={User}
                    description="Loading staff member's information..."
                />
                <ProfileSkeleton />
            </div>
        );
    }

    if (error) {
         return (
             <Alert variant="destructive">
                <AlertIcon className="h-5 w-5" />
                <AlertMsgTitle>Failed to load profile</AlertMsgTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
         );
    }
    
    if (!profile) {
        return <p>No profile data found.</p>;
    }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Profile"
        icon={User}
        description={`Viewing full profile for ${profile.name}.`}
      />

        <Card className="border shadow-md">
            <CardContent className="pt-6">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="user avatar" />
                        <AvatarFallback className="text-3xl">{profile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">{profile.name}</h2>
                        <p className="text-lg text-muted-foreground">{profile.role}</p>
                        <Badge className="mt-2 text-xs" variant="outline">{profile.staffId}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
     

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail icon={Mail} label="Email" value={profile.email} />
            <ProfileDetail icon={Phone} label="Phone" value={profile.phone} />
          </CardContent>
        </Card>

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileDetail icon={Building} label="Department" value={profile.department} />
            {profile.dateOfJoining && <ProfileDetail icon={Calendar} label="Date of Joining" value={format(parseISO(profile.dateOfJoining), 'do MMMM, yyyy')} />}
          </CardContent>
        </Card>
      </div>

       {profile.qualifications && profile.qualifications.length > 0 && (
            <Card className="border shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {profile.qualifications.map((qual, index) => (
                            <li key={index} className="flex items-center text-sm">
                                <Award className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span className="text-foreground">{qual}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
       )}
    </div>
  );
}
