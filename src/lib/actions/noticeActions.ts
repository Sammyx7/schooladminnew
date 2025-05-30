
"use server";

import { summarizeNotices, type SummarizeNoticesInput } from '@/ai/flows/summarize-notices';

interface SummarizeActionInput {
  noticeText: string;
}

interface SummarizeActionResult {
  summary?: string;
  error?: string;
}

export async function summarizeNoticeAction(input: SummarizeActionInput): Promise<SummarizeActionResult> {
  if (!input.noticeText || input.noticeText.trim() === "") {
    return { error: "Notice text cannot be empty." };
  }

  try {
    const genkitInput: SummarizeNoticesInput = { noticeText: input.noticeText };
    const result = await summarizeNotices(genkitInput);
    return { summary: result.summary };
  } catch (error) {
    console.error("Error in summarizeNotices flow:", error);
    // It's good practice to not expose raw error messages to the client
    // depending on the nature of the error.
    if (error instanceof Error) {
        return { error: `Failed to summarize notice: ${error.message}` };
    }
    return { error: "An unexpected error occurred during summarization." };
  }
}
