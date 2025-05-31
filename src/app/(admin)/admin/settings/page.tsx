
"use client";

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2, School, CalendarClock, BellRing } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Mock settings - in a real app, these would be fetched and updated via a service
  const [schoolName, setSchoolName] = useState("Greenwood International School");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [adminNotifications, setAdminNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Settings Saved",
      description: "Your school settings have been updated successfully.",
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        icon={Settings}
        description="Manage general school settings and preferences."
      />

      <form onSubmit={handleSaveChanges}>
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary"/> General School Information</CardTitle>
            <CardDescription>Basic details about the institution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="schoolName">School Name</Label>
              <Input 
                id="schoolName" 
                value={schoolName} 
                onChange={(e) => setSchoolName(e.target.value)} 
                placeholder="e.g., Greenwood High"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="academicYear">Current Academic Year</Label>
              <Input 
                id="academicYear" 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2024-2025"
              />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-primary"/> Notification & System Preferences</CardTitle>
            <CardDescription>Control system-wide notifications and operational modes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="adminNotifications" className="flex flex-col space-y-1 cursor-pointer">
                <span>Admin Action Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Receive email notifications for critical admin actions (e.g., bulk fee generation).
                </span>
              </Label>
              <Switch
                id="adminNotifications"
                checked={adminNotifications}
                onCheckedChange={setAdminNotifications}
              />
            </div>
            <div className="flex items-center justify-between space-x-2 p-4 rounded-md border hover:bg-muted/50 transition-colors">
              <Label htmlFor="maintenanceMode" className="flex flex-col space-y-1 cursor-pointer">
                <span>Enable Maintenance Mode</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Temporarily disable student/staff portal access for system updates.
                </span>
              </Label>
              <Switch
                id="maintenanceMode"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
                className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input"
              />
            </div>
          </CardContent>
        </Card>
        
        <CardFooter className="mt-6 px-0">
          <Button type="submit" disabled={isSaving} className="ml-auto">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
