"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClassicTemplate, MinimalTemplate, PhotoLeftTemplate, PrintStyles, CARD_HEIGHT_PX, CARD_WIDTH_PX, type CardOptions, type SchoolBrand, type StudentLite } from "./IdCardTemplates";

export type TemplateKind = "classic" | "minimal" | "photo-left";

const templateOptions: { value: TemplateKind; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "photo-left", label: "Photo Left" },
];

export default function IdCardPreviewGrid({
  students,
  brand,
  options,
  initialTemplate = "classic",
}: {
  students: StudentLite[];
  brand: SchoolBrand;
  options: CardOptions;
  initialTemplate?: TemplateKind;
}) {
  const [template, setTemplate] = useState<TemplateKind>(initialTemplate);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const Template = useMemo(() => {
    switch (template) {
      case "minimal":
        return MinimalTemplate;
      case "photo-left":
        return PhotoLeftTemplate;
      case "classic":
      default:
        return ClassicTemplate;
    }
  }, [template]);

  async function exportPng() {
    // Dynamically import to avoid SSR issues and optional dep until installed
    try {
      const htmlToImage = await import("html-to-image");
      const node = containerRef.current;
      if (!node) return;
      const cards = Array.from(node.querySelectorAll("[data-card-item='1']")) as HTMLElement[];
      for (const [idx, card] of cards.entries()) {
        const dataUrl = await htmlToImage.toPng(card, { pixelRatio: 2, cacheBust: true, width: CARD_WIDTH_PX, height: CARD_HEIGHT_PX });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `id-card-${idx + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("PNG export requires 'html-to-image' package. Please install it.");
      console.error(e);
    }
  }

  function handlePrint() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return (
    <div className="space-y-3">
      <PrintStyles />
      <div className="no-print flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Template</span>
          <Select value={template} onValueChange={(v) => setTemplate(v as TemplateKind)}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              {templateOptions.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportPng}>Export PNG</Button>
          <Button onClick={handlePrint}>Print / Save as PDF</Button>
        </div>
      </div>

      <div ref={containerRef} className="grid print-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH_PX}px, 1fr))`, gap: 12 }}>
        {students.map((s) => (
          <div key={s.student_id} data-card-item="1" className="flex items-center justify-center">
            <Template student={s} brand={brand} options={options} />
          </div>
        ))}
      </div>
    </div>
  );
}
