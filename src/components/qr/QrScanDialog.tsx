"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// Minimal TS declarations for html5-qrcode loaded via script tag
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { Html5Qrcode?: any; Html5QrcodeScanner?: any }
}

export type QrScanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDetected: (text: string) => void;
  title?: string;
  description?: string;
  facingMode?: "environment" | "user";
};

const SCRIPT_SRCS = [
  "https://unpkg.com/html5-qrcode@2.3.10/minified/html5-qrcode.min.js",
  "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.10/minified/html5-qrcode.min.js",
  "https://unpkg.com/html5-qrcode@2.3.10/html5-qrcode.min.js",
];

let html5qrcodeLoadPromise: Promise<void> | null = null;

export default function QrScanDialog({ open, onOpenChange, onDetected, title = "Scan QR Code", description = "Point your camera at the QR", facingMode = "environment" }: QrScanDialogProps) {
  const containerId = useRef(`qr-scan-${Math.random().toString(36).slice(2)}`).current;
  const instanceRef = useRef<AnyObj | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureScript = useCallback(async () => {
    if (window.Html5Qrcode) return;
    if (html5qrcodeLoadPromise) return html5qrcodeLoadPromise;

    const tryLoad = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.crossOrigin = "anonymous";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(s);
      });

    html5qrcodeLoadPromise = (async () => {
      let lastErr: unknown = null;
      for (const src of SCRIPT_SRCS) {
        try {
          await tryLoad(src);
          return;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr ?? new Error("Failed to load QR scanner library");
    })();

    return html5qrcodeLoadPromise;
  }, []);

  const startScanner = useCallback(async () => {
    if (!open) return;
    setError(null);
    setLoading(true);
    try {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        // Most browsers require HTTPS or localhost to access camera
        console.warn("Camera access requires a secure context (HTTPS) or localhost.");
      }
      await ensureScript();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Html5Qrcode: any = window.Html5Qrcode;
      if (!Html5Qrcode) throw new Error("Scanner not available");
      instanceRef.current = new Html5Qrcode(containerId);
      await instanceRef.current.start(
        { facingMode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          stopScanner().finally(() => onDetected(decodedText));
        },
        () => {}
      );
    } catch (e: any) {
      const insecure = typeof window !== "undefined" && !window.isSecureContext;
      const hint = insecure
        ? " Camera permissions may be blocked. Use HTTPS or run on localhost."
        : " Check your network/CSP and allow camera permissions.";
      setError((e?.message || "Could not start camera.") + hint);
    } finally {
      setLoading(false);
    }
  }, [containerId, ensureScript, facingMode, onDetected, open]);

  const stopScanner = useCallback(async () => {
    try {
      if (instanceRef.current) {
        await instanceRef.current.stop();
        await instanceRef.current.clear();
      }
    } catch (_) {
      // ignore
    } finally {
      instanceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (open) startScanner();
    return () => {
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) stopScanner(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          <div id={containerId} className="w-full max-w-xs aspect-square rounded-md overflow-hidden border" />
          {loading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Starting camera…</div>}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { stopScanner(); onOpenChange(false); }}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
