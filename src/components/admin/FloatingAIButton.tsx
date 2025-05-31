
"use client";

import { Button } from "@/components/ui/button";
import { useAISidebar } from "@/contexts/AISidebarContext";
import { Sparkles, MessageSquare } from "lucide-react";

export function FloatingAIButton() {
  const { openAIDock } = useAISidebar();

  return (
    <Button
      onClick={openAIDock}
      variant="default"
      size="lg" // Made it slightly larger
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center bg-primary hover:bg-primary/90"
      aria-label="Open AI Assistant"
    >
      <MessageSquare className="h-6 w-6 text-primary-foreground" />
    </Button>
  );
}
