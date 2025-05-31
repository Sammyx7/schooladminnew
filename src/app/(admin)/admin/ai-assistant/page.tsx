
"use client";
// This page is no longer used directly for the UI.
// The AI Assistant UI is now handled by AISidebar.tsx and FloatingAIButton.tsx via AdminLayout.tsx.
// This file can be removed or kept empty if the route needs to exist for some reason (e.g. direct linking if that's a feature).
// For now, returning a simple message.

import { PageHeader } from '@/components/layout/PageHeader';
import { MessageSquare } from 'lucide-react';

export default function AiAssistantPageRedirect() {
  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.28))] items-center justify-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-semibold text-muted-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">The AI Assistant is now available via the floating button.</p>
    </div>
  );
}
