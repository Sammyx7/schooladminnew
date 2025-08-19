"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type StaffQrDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: override TTL in seconds
  ttlSeconds?: number;
  // Optional: include staffId in QR payload/URL to support kiosk scanning
  staffId?: string;
};

function generateToken(): string {
  // Browser-safe unique token: UUID + timestamp (base36)
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as Crypto).randomUUID()
    : `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  return `${uuid}.${Date.now().toString(36)}`;
}

export function StaffQrDialog({ open, onOpenChange, ttlSeconds = 60, staffId }: StaffQrDialogProps) {
  const [token, setToken] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());

  // Keep ticking for countdown
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [open]);

  // Create fresh token on open
  useEffect(() => {
    if (open) regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const regenerate = () => {
    const t = generateToken();
    setToken(t);
    setExpiresAt(Date.now() + ttlSeconds * 1000);
  };

  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const isExpired = secondsLeft === 0;

  const qrValue = useMemo(() => {
    // Encode a future-proof payload. Replace url with a real check-in endpoint later.
    const origin = typeof window !== "undefined" ? window.location.origin : "https://schooladmin.local";
    const payload = {
      v: 1,
      type: "staff_attendance",
      token,
      exp: expiresAt,
      staffId,
      url: `${origin}/staff/attendance/check-in?token=${encodeURIComponent(token)}${staffId ? `&staffId=${encodeURIComponent(staffId)}` : ""}`,
    };
    return JSON.stringify(payload);
  }, [token, expiresAt, staffId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Staff Check-in QR</DialogTitle>
          <DialogDescription>
            Scan this QR to mark attendance. It auto-expires for security.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className={cn("p-3 rounded-lg border bg-background", isExpired && "opacity-50")}
               data-ai-hint="staff attendance qr">
            {token ? (
              <QRCode value={qrValue} size={220} />
            ) : (
              <Skeleton className="h-[220px] w-[220px] rounded" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              {isExpired ? "Expired" : "Active"}
            </Badge>
            <span className="text-muted-foreground">Expires in</span>
            <span className={cn("font-medium", isExpired && "line-through")}>{secondsLeft}s</span>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Each QR is unique to this session and cannot be reused after expiry.</p>
          <p>You can regenerate a new QR at any time.</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={regenerate}>Regenerate</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StaffQrDialog;
