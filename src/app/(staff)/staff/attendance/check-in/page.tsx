"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { QrCode, ShieldCheck, Camera, AlertCircle as AlertIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle as AlertMsgTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { markAttendanceViaToken } from "@/lib/services/staffAttendanceService";
import QrScanDialog from "@/components/qr/QrScanDialog";

export default function StaffAttendanceCheckInPage() {
  const search = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const initialToken = useMemo(() => search.get("token") || "", [search]);
  const initialStaffId = useMemo(() => search.get("staffId") || "", [search]);

  const [token, setToken] = useState<string>(initialToken);
  const [staffId, setStaffId] = useState<string>(initialStaffId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  useEffect(() => {
    setToken(initialToken);
    setStaffId(initialStaffId);
  }, [initialToken, initialStaffId]);

  const onSubmit = async () => {
    setError(null);
    if (!token || token.length < 10) {
      setError("Invalid or missing token. Please scan the QR again or paste the token.");
      return;
    }
    if (!staffId || staffId.length < 3) {
      setError("Please enter your Staff ID.");
      return;
    }
    setSubmitting(true);
    const res = await markAttendanceViaToken(staffId, token);
    setSubmitting(false);
    if (!res.ok) {
      toast({ title: "Check-in Failed", description: res.message, variant: "destructive" });
      setError(res.message);
      return;
    }
    toast({ title: "Check-in Successful", description: "Your attendance has been recorded." });
    // Navigate back to attendance history
    router.replace("/staff/attendance");
  };

  const handleDetected = (decodedText: string) => {
    try {
      // Try JSON first (from StaffQrDialog)
      const obj = JSON.parse(decodedText);
      if (obj && typeof obj === "object") {
        if (obj.token) setToken(String(obj.token));
        if (obj.staffId) setStaffId(String(obj.staffId));
        else if (obj.url && typeof obj.url === "string") {
          const u = new URL(obj.url);
          const t = u.searchParams.get("token");
          const s = u.searchParams.get("staffId");
          if (t) setToken(t);
          if (s) setStaffId(s);
        }
        setScanOpen(false);
        return;
      }
    } catch (_) {
      // Not JSON: continue
    }
    try {
      // Try as URL with query params
      const u = new URL(decodedText);
      const t = u.searchParams.get("token");
      const s = u.searchParams.get("staffId");
      if (t) setToken(t);
      if (s) setStaffId(s);
    } catch {
      // Fallback: treat whole text as token
      if (decodedText && decodedText.length > 10) setToken(decodedText);
    }
    setScanOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Attendance Check-in"
        icon={QrCode}
        description="Scan a QR or use your token to record today's attendance."
      />

      {error && (
        <Alert variant="destructive">
          <AlertIcon className="h-5 w-5" />
          <AlertMsgTitle>Unable to Check-in</AlertMsgTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Verify and Submit</CardTitle>
          <CardDescription>Ensure details are correct before submitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Token</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Auto-filled from QR link or paste token"
            />
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Staff ID</label>
            <Input
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. TCH102"
            />
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setScanOpen(true)}>
              <Camera className="mr-2 h-4 w-4" />
              Scan QR
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Check In"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/staff/attendance")}>Back to History</Button>
          </div>
        </CardContent>
      </Card>

      <QrScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onDetected={handleDetected}
        title="Scan Attendance QR"
        description="Align the QR inside the box"
      />
    </div>
  );
}
