"use client";

import React from "react";
import QRCode from "react-qr-code";

export type StudentLite = {
  student_id: string;
  name: string;
  class_section?: string | null;
  avatar_url?: string | null;
};

export type SchoolBrand = {
  name: string;
  logoUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  phone?: string;
  website?: string;
  themeColor?: string; // hex
};

export type CardOptions = {
  showQRCode?: boolean;
  showClass?: boolean;
  showSchoolAddress?: boolean;
  qrDataBuilder?: (s: StudentLite) => string;
};

const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);

// ISO/IEC 7810 ID-1 size (credit card): 85.60 × 53.98 mm
export const CARD_WIDTH_PX = mmToPx(85.6);
export const CARD_HEIGHT_PX = mmToPx(54);

function SafeAvatar({ src, alt }: { src?: string | null; alt: string }) {
  // Square avatar with cover
  return (
    <div
      className="bg-gray-200 overflow-hidden rounded"
      style={{ width: 64, height: 64 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No Photo</div>
      )}
    </div>
  );
}

function HeaderBrand({ brand }: { brand: SchoolBrand }) {
  return (
    <div className="flex items-center gap-2">
      {brand.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt="logo" className="w-8 h-8 object-contain" />
      )}
      <div className="leading-tight">
        <div className="text-[11px] font-semibold">{brand.name}</div>
        {brand.website && <div className="text-[9px] text-gray-600">{brand.website}</div>}
      </div>
    </div>
  );
}

export function ClassicTemplate({ student, brand, options }: { student: StudentLite; brand: SchoolBrand; options: CardOptions; }) {
  const c = brand.themeColor || "#2563eb"; // blue-600
  const qrValue = options.qrDataBuilder ? options.qrDataBuilder(student) : student.student_id;
  return (
    <div
      className="rounded-md shadow-sm border bg-white"
      style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}
    >
      <div className="h-6" style={{ backgroundColor: c }} />
      <div className="p-2 flex gap-2">
        <SafeAvatar src={student.avatar_url || undefined} alt={student.name} />
        <div className="min-w-0 flex-1">
          <HeaderBrand brand={brand} />
          <div className="mt-1 text-[12px] font-semibold truncate">{student.name}</div>
          <div className="text-[10px] text-gray-700">ID: {student.student_id}</div>
          {options.showClass !== false && (
            <div className="text-[10px] text-gray-700">{student.class_section || ""}</div>
          )}
        </div>
        {options.showQRCode !== false && (
          <div className="shrink-0 flex items-start justify-end">
            <div className="bg-white p-1 rounded border">
              <QRCode value={qrValue} size={48} level="M" />
            </div>
          </div>
        )}
      </div>
      {options.showSchoolAddress && (brand.addressLine1 || brand.addressLine2) && (
        <div className="px-2 pb-2">
          <div className="text-[8.5px] text-gray-600 leading-snug">
            {[brand.addressLine1, brand.addressLine2].filter(Boolean).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}

export function MinimalTemplate({ student, brand, options }: { student: StudentLite; brand: SchoolBrand; options: CardOptions; }) {
  const c = brand.themeColor || "#111827"; // neutral-900
  const qrValue = options.qrDataBuilder ? options.qrDataBuilder(student) : student.student_id;
  return (
    <div className="rounded-md border bg-white" style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}>
      <div className="p-2 h-full flex flex-col">
        <div className="flex items-center justify-between">
          <HeaderBrand brand={brand} />
          {options.showQRCode !== false && (
            <div className="bg-white p-1 rounded border">
              <QRCode value={qrValue} size={40} fgColor={c} level="M" />
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <SafeAvatar src={student.avatar_url || undefined} alt={student.name} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{student.name}</div>
            <div className="text-[10px] text-gray-700">ID: {student.student_id}</div>
            {options.showClass !== false && (
              <div className="text-[10px] text-gray-700">{student.class_section || ""}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PhotoLeftTemplate({ student, brand, options }: { student: StudentLite; brand: SchoolBrand; options: CardOptions; }) {
  const c = brand.themeColor || "#0ea5e9"; // sky-500
  const qrValue = options.qrDataBuilder ? options.qrDataBuilder(student) : student.student_id;
  return (
    <div className="rounded-md border bg-white" style={{ width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX }}>
      <div className="h-4" style={{ backgroundColor: c }} />
      <div className="p-2 flex gap-2">
        <SafeAvatar src={student.avatar_url || undefined} alt={student.name} />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold truncate">{student.name}</div>
          <div className="text-[10px] text-gray-700">{student.class_section || ""}</div>
          <div className="text-[10px] text-gray-700">ID: {student.student_id}</div>
          {(options.showSchoolAddress && (brand.addressLine1 || brand.addressLine2)) && (
            <div className="text-[8.5px] text-gray-600 mt-1 leading-snug">
              {[brand.addressLine1, brand.addressLine2].filter(Boolean).join(", ")}
            </div>
          )}
        </div>
        {options.showQRCode !== false && (
          <div className="shrink-0 flex items-start justify-end">
            <div className="bg-white p-1 rounded border">
              <QRCode value={qrValue} size={48} level="M" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PrintStyles() {
  // Inject print styles for page breaks and exact size
  return (
    <style>{`
      @media print {
        @page { margin: 10mm; }
        .no-print { display: none !important; }
        .print-grid { break-inside: avoid; }
      }
    `}</style>
  );
}
