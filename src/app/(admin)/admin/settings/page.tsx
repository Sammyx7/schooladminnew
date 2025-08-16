
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
import { Settings, Save, Loader2, School, BellRing, MessageSquare, Mail } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();

  // Mock settings - in a real app, these would be fetched and updated via a service
  const [schoolName, setSchoolName] = useState("Elite Minds International");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Notification settings
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Saving Settings:", {
      schoolName,
      academicYear,
      maintenanceMode,
      notifications: {
        sms: smsNotifications,
        whatsapp: whatsappNotifications,
        email: emailNotifications,
      }
    });

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
        description="Manage general school settings, notifications, and preferences."
      />

      <form onSubmit={handleSaveChanges}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><School className="h-5 w-5 text-primary"/> General Information</CardTitle>
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

            <Card className="border shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5 text-primary"/> Notification Settings</CardTitle>
                <CardDescription>Enable or disable different notification channels. (This is a demo setup)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
                  <Label htmlFor="smsNotifications" className="flex items-center gap-3 cursor-pointer">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span>SMS Notifications</span>
                  </Label>
                  <Switch id="smsNotifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
                <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
                   <Label htmlFor="whatsappNotifications" className="flex items-center gap-3 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="m16 2-3 3h5v5l3-3Z"></path></svg>
                    <span>WhatsApp Notifications</span>
                  </Label>
                  <Switch id="whatsappNotifications" checked={whatsappNotifications} onCheckedChange={setWhatsappNotifications} />
                </div>
                 <div className="flex items-center justify-between space-x-2 p-3 rounded-md border">
                   <Label htmlFor="emailNotifications" className="flex items-center gap-3 cursor-pointer">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>Email Notifications</span>
                  </Label>
                  <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
             <Card className="border shadow-md">
              <CardHeader>
                <CardTitle>System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between space-x-2 p-3 rounded-md border bg-destructive/5">
                  <Label htmlFor="maintenanceMode" className="flex flex-col space-y-1 cursor-pointer">
                    <span className="text-destructive font-medium">Maintenance Mode</span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                      Disables student/staff portal access.
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
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
