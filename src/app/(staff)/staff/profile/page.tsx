
import { PageHeader } from '@/components/layout/PageHeader';
import { Briefcase, User, Mail, Phone, Calendar, Award, GraduationCap, Building, AlertCircle as AlertIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';
import type { StaffProfile } from '@/lib/types';
import { getStaffProfileData } from '@/lib/services/staffService';
import { format, parseISO } from 'date-fns';

const ProfileDetail = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
  <div className="flex items-center text-sm">
    <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
    <span className="font-medium text-muted-foreground w-32">{label}:</span>
    <span className="text-foreground">{value || 'N/A'}</span>
  </div>
);

export default async function StaffProfilePage() {
    let profile: StaffProfile | null = null;
    let error: string | null = null;
    
    // In a real app, staffId would come from auth context
    const MOCK_STAFF_ID = "TCH102"; 

    try {
        profile = await getStaffProfileData(MOCK_STAFF_ID);
    } catch (err) {
        error = err instanceof Error ? err.message : "An unknown error occurred.";
    }

    if (error || !profile) {
         return (
             <Alert variant="destructive">
                <AlertIcon className="h-5 w-5" />
                <AlertMsgTitle>Failed to load profile</AlertMsgTitle>
                <AlertDescription>{error || "Could not find profile data."}</AlertDescription>
            </Alert>
         );
    }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        icon={Briefcase}
        description="View your staff information, role, and contact details."
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
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Information</CardTitle>
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
            <ProfileDetail icon={Briefcase} label="Department" value={profile.department} />
            <ProfileDetail icon={Calendar} label="Date of Joining" value={format(parseISO(profile.dateOfJoining), 'do MMMM, yyyy')} />
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
