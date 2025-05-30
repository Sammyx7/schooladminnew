
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Settings, UserCircle, Bell, ShieldCheck, Save, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getStudentDashboardData } from '@/lib/services/studentService';
import type { StudentProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from '@/components/ui/alert';

interface ProfileData extends StudentProfile {
  email: string; // Adding email for display
}

const ProfileInfoSkeleton = () => (
  <Card className="border">
    <CardHeader>
      <div className="flex items-center gap-3">
        <UserCircle className="h-6 w-6 text-primary" />
        <CardTitle>Profile Information</CardTitle>
      </div>
      <CardDescription>Your personal details. Some fields may not be editable.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);


export default function StudentSettingsPage() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Notification preferences state
  const [newCirculars, setNewCirculars] = useState(true);
  const [reportCardUpdates, setReportCardUpdates] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    async function fetchProfile() {
      setIsLoadingProfile(true);
      setProfileError(null);
      try {
        const data = await getStudentDashboardData("S10234"); // Using a default studentId
        setProfileData({
          ...data.profile,
          email: `${data.profile.name.toLowerCase().replace(' ', '.')}@example.com` // Mock email
        });
      } catch (err) {
        if (err instanceof Error) {
          setProfileError(err.message);
        } else {
          setProfileError("An unknown error occurred while fetching profile data.");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);


  const handleSaveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
    setIsSaving(false);
  };

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }
    if (!currentPassword || !newPassword) {
        toast({
            title: "Fields Required",
            description: "Please fill in all password fields.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Password Changed (Demo)",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsSaving(false);
  };


  return (
    <div className="space-y-8">
      <PageHeader
        title="My Settings"
        icon={Settings}
        description="Manage your account details, notification preferences, and security."
      />

      {isLoadingProfile && <ProfileInfoSkeleton />}
      {profileError && !isLoadingProfile && (
         <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-5 w-5" />
          <AlertMsgTitle>Error Fetching Profile</AlertMsgTitle>
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      )}

      {profileData && !isLoadingProfile && (
        <Card className="border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Your personal details. Some fields may not be editable directly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="studentName">Full Name</Label>
              <Input id="studentName" value={profileData.name} readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentEmail">Email Address</Label>
              <Input id="studentEmail" type="email" value={profileData.email} readOnly className="bg-muted/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" value={profileData.studentId} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studentClass">Class & Section</Label>
                <Input id="studentClass" value={profileData.classSection} readOnly className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSaveSettings}>
        <Card className="border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>Choose what updates you want to receive.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="newCirculars" className="flex flex-col space-y-1">
                <span>New Circulars & Announcements</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Get notified when new school circulars or important announcements are published.
                </span>
              </Label>
              <Switch
                id="newCirculars"
                checked={newCirculars}
                onCheckedChange={setNewCirculars}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="reportCardUpdates" className="flex flex-col space-y-1">
                <span>Report Card Updates</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Be informed when your report cards are available for viewing.
                </span>
              </Label>
              <Switch
                id="reportCardUpdates"
                checked={reportCardUpdates}
                onCheckedChange={setReportCardUpdates}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && !currentPassword && !newPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </div>
      </form>

      <Separator />

      <form onSubmit={handleChangePassword}>
        <Card className="border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>Account Security</CardTitle>
            </div>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                placeholder="••••••••" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input 
                id="confirmNewPassword" 
                type="password" 
                placeholder="••••••••" 
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" className="ml-auto" disabled={isSaving && (currentPassword || newPassword)}>
              {isSaving && (currentPassword || newPassword) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
