"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { UserRole } from '@/lib/types';
import { LogIn } from 'lucide-react';

export default function StaffLoginPage() {
  const { login } = useAuth();
  const role: UserRole = 'staff';

  // Tabs state
  const [tab, setTab] = useState<'login' | 'verify'>('login');

  // Login state
  const [loginStaffId, setLoginStaffId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Verify state
  const [verifyStaffId, setVerifyStaffId] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyInfo, setVerifyInfo] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Set password dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const staffEmail = (id: string) => {
    const domain = process.env.NEXT_PUBLIC_STAFF_LOGIN_DOMAIN || 'staff.local';
    return `${id}@${domain}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      if (!loginStaffId || !loginPassword) {
        setLoginError('Staff ID and password are required.');
        return;
      }
      const supabase = getSupabase();
      if (!supabase) {
        console.warn('Supabase not configured; falling back to demo login.');
        login(role);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: staffEmail(loginStaffId.trim()),
        password: loginPassword,
      });
      if (error) {
        setLoginError(error.message || 'Login failed');
        return;
      }
      // Touch last login (best-effort)
      fetch('/api/auth/staff/touch-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: loginStaffId.trim() }),
      }).catch(() => {});
      login(role);
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyInfo('');
    setVerifyLoading(true);
    try {
      if (!verifyStaffId || !verifyName) {
        setVerifyError('Staff ID and full name are required.');
        return;
      }
      const res = await fetch('/api/auth/staff/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: verifyStaffId.trim(), name: verifyName.trim() }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setVerifyError(payload.error || `Verification failed (${res.status})`);
        return;
      }
      if (payload.canRegister) {
        setDialogOpen(true);
      } else {
        setVerifyInfo('Already registered. Please login with your password.');
        setTab('login');
        setLoginStaffId(verifyStaffId.trim());
      }
    } catch (err: any) {
      setVerifyError(err?.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    if (!newPassword || newPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await fetch('/api/auth/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId: verifyStaffId.trim(), name: verifyName.trim(), password: newPassword }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegisterError(payload.error || `Registration failed (${res.status})`);
        return;
      }
      // Auto login after registration
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: staffEmail(verifyStaffId.trim()),
          password: newPassword,
        });
        if (error) {
          setRegisterError(error.message || 'Auto-login failed. Please try logging in manually.');
          return;
        }
        // Touch last login best-effort
        fetch('/api/auth/staff/touch-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ staffId: verifyStaffId.trim() }),
        }).catch(() => {});
      }
      setDialogOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      setTab('login');
      setLoginStaffId(verifyStaffId.trim());
      setLoginPassword('');
      login(role);
    } catch (err: any) {
      setRegisterError(err?.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border shadow-xl bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <span className="font-bold text-xl">LOGO</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Staff Access</CardTitle>
          <CardDescription className="text-muted-foreground px-4">
            Verify yourself or login using your Staff ID and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'verify')}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="verify">Verify & Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="loginStaffId" className="text-foreground">Staff ID</Label>
                  <Input
                    id="loginStaffId"
                    placeholder="TCH105"
                    value={loginStaffId}
                    onChange={(e) => setLoginStaffId(e.target.value)}
                    className="text-sm bg-input text-foreground border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="loginPassword" className="text-foreground">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="text-sm bg-input text-foreground border-border focus:border-primary"
                  />
                </div>
                {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                <Button disabled={loginLoading} type="submit" className="w-full text-base py-2.5 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <LogIn className="mr-2 h-4 w-4" /> {loginLoading ? 'Signing in…' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="verify" className="mt-4">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="verifyStaffId" className="text-foreground">Staff ID</Label>
                  <Input
                    id="verifyStaffId"
                    placeholder="TCH105"
                    value={verifyStaffId}
                    onChange={(e) => setVerifyStaffId(e.target.value)}
                    className="text-sm bg-input text-foreground border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="verifyName" className="text-foreground">Full Name</Label>
                  <Input
                    id="verifyName"
                    placeholder="Jane Doe"
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                    className="text-sm bg-input text-foreground border-border focus:border-primary"
                  />
                </div>
                {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}
                {verifyInfo && <p className="text-sm text-foreground">{verifyInfo}</p>}
                <Button disabled={verifyLoading} type="submit" className="w-full text-base py-2.5 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Verify
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set your password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {registerError && <p className="text-sm text-destructive">{registerError}</p>}
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button disabled={registerLoading} type="submit">{registerLoading ? 'Saving…' : 'Save & Continue'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground pt-4">
          <p>New staff? Use Verify & Register. Existing staff? Login with your ID and password.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
