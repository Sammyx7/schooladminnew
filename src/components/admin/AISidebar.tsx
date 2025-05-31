
"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, User, Send, Loader2, X, MessageSquare } from 'lucide-react';
import { getAIResponseForAdminQuery } from '@/lib/actions/aiAssistantActions';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAISidebar } from '@/contexts/AISidebarContext';

export function AISidebar() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { closeAIDock } = useAISidebar();

  const handleSendMessage = async (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await getAIResponseForAdminQuery({ question: userMessage.text });
      if (result.error) {
        toast({ title: "AI Error", description: result.error, variant: "destructive" });
        const aiErrorMessage: ChatMessage = {
          id: `ai-error-${Date.now()}`,
          text: `Sorry, I encountered an error: ${result.error}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiErrorMessage]);
      } else if (result.answer) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: result.answer,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Failed to get AI response", description: errMessage, variant: "destructive" });
      const aiErrorMessage: ChatMessage = {
          id: `ai-error-${Date.now()}`,
          text: `Sorry, I couldn't connect to the AI assistant. Please try again later. (${errMessage})`,
          sender: 'ai',
          timestamp: new Date(),
        };
      setMessages((prev) => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div > div');
      if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
        {
            id: `ai-greeting-${Date.now()}`,
            text: "Hello! I'm your school administration AI assistant. How can I help you today?",
            sender: 'ai',
            timestamp: new Date(),
        }
        ]);
    }
  }, [messages.length]);

  return (
    <div className="fixed top-0 right-0 h-screen w-[var(--ai-sidebar-width)] bg-card border-l border-border shadow-xl flex flex-col z-50 transition-transform duration-300 ease-in-out">
      <CardHeader className="border-b flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Assistant</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={closeAIDock} className="h-8 w-8">
          <X className="h-4 w-4" />
          <span className="sr-only">Close AI Assistant</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8 border bg-primary/20 text-primary">
                    <AvatarFallback><Sparkles className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm",
                    msg.sender === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      msg.sender === 'user' ? "text-primary-foreground/70 text-right" : "text-muted-foreground/80 text-left"
                  )}>
                      {format(msg.timestamp, "p")}
                  </p>
                </div>
                {msg.sender === 'user' && (
                   <Avatar className="h-8 w-8 border">
                      <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
               <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 border bg-primary/20 text-primary">
                    <AvatarFallback><Sparkles className="h-4 w-4"/></AvatarFallback>
                  </Avatar>
                  <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm shadow-sm bg-muted text-foreground rounded-bl-none border">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask the AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm"
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </div>
  );
}
