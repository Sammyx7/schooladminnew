
"use client";

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UserRole } from '@/lib/types';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!email || !password || !role) {
      setError('All fields are required.');
      return;
    }
    // Using fixed credentials as per original setup
    if (email === "test@example.com" && password === "password") {
      login(role as UserRole);
    } else {
      setError('Invalid credentials. Use test@example.com and password.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border shadow-xl bg-card"> {/* Added bg-card */}
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <span className="font-bold text-xl">LOGO</span> 
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">School Management System</CardTitle>
          <CardDescription className="text-muted-foreground px-4">
            A comprehensive portal for admins, students, and staff. Sign in to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm bg-input text-foreground border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm bg-input text-foreground border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Select onValueChange={(value) => setRole(value as UserRole)} value={role}>
                <SelectTrigger id="role" className="text-sm bg-input text-foreground border-border focus:border-primary">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full text-base py-2.5 mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground pt-4">
          <p>Use test@example.com & 'password' for demo.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
