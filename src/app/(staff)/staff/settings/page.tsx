
"use client";

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Bell, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function StaffSettingsPage() {
  const { toast } = useToast();

  // Mock settings states
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSavePreferences = async (event: FormEvent) => {
    event.preventDefault();
    setIsSavingPreferences(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
    setIsSavingPreferences(false);
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
    
    setIsChangingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast({
      title: "Password Changed (Demo)",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Settings"
        description="Manage your account settings and notification preferences."
      />

      <form onSubmit={handleSavePreferences}>
        <Card className="border shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Notification Preferences</CardTitle>
            </div>
            <CardDescription>Control how you receive updates from the school portal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="assignmentAlerts" className="flex flex-col space-y-1 cursor-pointer">
                <span>Class & Assignment Updates</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Receive notifications for new assignments or updates related to your classes.
                </span>
              </Label>
              <Switch
                id="assignmentAlerts"
                checked={assignmentAlerts}
                onCheckedChange={setAssignmentAlerts}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="eventReminders" className="flex flex-col space-y-1 cursor-pointer">
                <span>School Event Reminders</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Get reminders for important school events and staff meetings.
                </span>
              </Label>
              <Switch
                id="eventReminders"
                checked={eventReminders}
                onCheckedChange={setEventReminders}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" className="ml-auto" disabled={isSavingPreferences}>
              {isSavingPreferences ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Separator />

      <form onSubmit={handleChangePassword}>
        <Card className="border shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Account Security</CardTitle>
            </div>
            <CardDescription>Change your account password regularly to keep it secure.</CardDescription>
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
                autoComplete="current-password"
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
                autoComplete="new-password"
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
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" className="ml-auto" disabled={isChangingPassword}>
              {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Change Password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
