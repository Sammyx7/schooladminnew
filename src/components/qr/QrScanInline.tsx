"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

export type QrScanInlineProps = {
  onDetected: (text: string) => void;
  facingMode?: "environment" | "user";
  className?: string;
};

let html5qrcodeModulePromise: Promise<any> | null = null;

export default function QrScanInline({ onDetected, facingMode = "environment", className = "" }: QrScanInlineProps) {
  const containerId = useRef(`qr-inline-${Math.random().toString(36).slice(2)}`).current;
  const instanceRef = useRef<AnyObj | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureLib = useCallback(async () => {
    if (html5qrcodeModulePromise) return html5qrcodeModulePromise;
    html5qrcodeModulePromise = import("html5-qrcode");
    return html5qrcodeModulePromise;
  }, []);

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

  const startScanner = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        console.warn("Camera access requires a secure context (HTTPS) or localhost.");
      }
      const mod = await ensureLib();
      const Html5Qrcode = mod.Html5Qrcode as AnyObj;
      if (!Html5Qrcode) throw new Error("Scanner not available");
      instanceRef.current = new Html5Qrcode(containerId);
      await instanceRef.current.start(
        { facingMode },
        { fps: 10, qrbox: { width: 280, height: 280 } },
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
  }, [containerId, ensureLib, facingMode, onDetected, stopScanner]);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <div className={className}>
      <div id={containerId} className="w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden border" />
      {loading && (
        <div className="flex items-center justify-center mt-3 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting camera…
        </div>
      )}
      {error && (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!error && (
        <p className="mt-3 text-center text-sm text-muted-foreground">Align the QR within the frame to check in.</p>
      )}
    </div>
  );
}
