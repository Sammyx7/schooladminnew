
"use client";

import { useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { summarizeNoticeAction } from '@/lib/actions/noticeActions';
import { useToast } from '@/hooks/use-toast';

export default function SummarizeNoticesPage() {
  const [noticeText, setNoticeText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!noticeText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text for the notice.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeNoticeAction({ noticeText });
      if (result.error) {
        toast({
          title: "Error Summarizing",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.summary) {
        setSummary(result.summary);
        toast({
          title: "Summary Generated",
          description: "The notice has been summarized successfully.",
        });
      }
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "Summarization Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Summarize Notices (AI)"
        icon={Sparkles}
        description="Generate concise summaries of school notices for parents."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border"> {/* Added border, shadow-md from base Card */}
          <CardHeader>
            <CardTitle>Enter Notice Text</CardTitle>
            <CardDescription>Paste the full text of the school notice below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Enter the full notice text here..."
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                rows={15}
                className="resize-none"
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border"> {/* Added border, shadow-md from base Card */}
          <CardHeader>
            <CardTitle>Generated Summary</CardTitle>
            <CardDescription>The AI-generated summary will appear below.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !summary && (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {summary && (
              <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 min-h-[200px]">
                <p>{summary}</p>
              </div>
            )}
            {!summary && !isLoading && (
              <div className="text-center text-muted-foreground min-h-[200px] flex items-center justify-center">
                <p>Summary will be displayed here once generated.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
