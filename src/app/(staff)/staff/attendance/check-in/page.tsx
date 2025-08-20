"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSupabase } from "@/lib/supabaseClient";
import { markAttendanceViaToken } from "@/lib/services/staffAttendanceService";
import QrScanInline from "@/components/qr/QrScanInline";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function StaffAttendanceCheckInPage() {
  const search = useSearchParams();
  const router = useRouter();

  const initialToken = useMemo(() => search.get("token") || "", [search]);

  const [staffId, setStaffId] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  // Emit page title for TopHeader on mobile
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('page-title-change', { detail: { title: 'Check In' } }));
      }
    } catch {}
  }, []);

  // If token present in URL, auto-submit once identity is ready
  useEffect(() => {
    if (!initialToken) return;
    if (!identityReady || !staffId) return;
    void onSubmit(initialToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken, identityReady, staffId]);

  // Resolve current staffId from Supabase session email (prefix) or localStorage fallback
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const supabase = getSupabase();
        let resolved: string | null = null;
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          const email = data.user?.email || null;
          if (email && email.includes("@")) {
            resolved = email.split("@")[0];
          }
        }
        if (!resolved) {
          try {
            const stored = localStorage.getItem("staffId");
            if (stored) resolved = stored;
          } catch {}
        }
        if (mounted) {
          if (resolved) {
            setStaffId(resolved);
            try { localStorage.setItem("staffId", resolved); } catch {}
          } else {
            setStaffId(null);
          }
        }
      } catch {
        if (mounted) setStaffId(null);
      } finally {
        if (mounted) setIdentityReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (token: string) => {
    setError(null);
    if (!token || token.length < 10) {
      setError("Invalid QR. Please try again.");
      setScanKey((k) => k + 1); // restart scanner
      return;
    }
    if (!staffId) {
      setError("Sign in required. Unable to resolve Staff ID.");
      return;
    }
    setSubmitting(true);
    const res = await markAttendanceViaToken(staffId, token);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message || "Check-in failed. Please try again.");
      setScanKey((k) => k + 1);
      return;
    }
    setSuccess(true);
    // Auto-redirect after short delay
    setTimeout(() => router.replace("/staff/attendance"), 1500);
  };

  const handleDetected = (decodedText: string) => {
    let token = "";
    // 1) JSON with { token } or { url }
    try {
      const obj = JSON.parse(decodedText);
      if (obj && typeof obj === "object") {
        if (obj.token) token = String(obj.token);
        else if (obj.url && typeof obj.url === "string") {
          const u = new URL(obj.url);
          token = u.searchParams.get("token") || "";
        }
      }
    } catch (_) {
      // ignore
    }
    // 2) URL with ?token=
    if (!token) {
      try {
        const u = new URL(decodedText);
        token = u.searchParams.get("token") || "";
      } catch {
        // 3) raw token
        if (decodedText && decodedText.length > 10) token = decodedText;
      }
    }
    if (token) void onSubmit(token);
    else setScanKey((k) => k + 1);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] p-4 flex flex-col items-center justify-start gap-4">
      {!identityReady ? (
        <div className="w-full sm:max-w-sm text-center text-sm text-muted-foreground mt-8">Resolving your staff identity…</div>
      ) : !staffId ? (
        <Alert variant="destructive" className="w-full sm:max-w-sm mt-8">
          <AlertDescription>Sign in required. Unable to resolve your Staff ID.</AlertDescription>
        </Alert>
      ) : success ? (
        <div className="w-full sm:max-w-sm mt-10 flex flex-col items-center text-center">
          <CheckCircle2 className="h-20 w-20 text-green-600" />
          <h1 className="mt-4 text-2xl font-semibold">Checked in successfully</h1>
          <p className="mt-2 text-muted-foreground">You're all set for today.</p>
        </div>
      ) : (
        <div className="w-full sm:max-w-sm mt-2">
          <h1 className="text-xl font-semibold mb-4">Scan to Check In</h1>
          <QrScanInline key={scanKey} onDetected={handleDetected} className="w-full" />
          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {submitting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background rounded-xl px-6 py-4 shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Recording your attendance…</span>
          </div>
        </div>
      )}
    </div>
  );
}
