
"use server";

import { querySchoolData, type AdminDataQueryInput } from '@/ai/flows/admin-data-query-flow';

interface AIResponseActionInput {
  question: string;
}

interface AIResponseActionResult {
  answer?: string;
  error?: string;
}

export async function getAIResponseForAdminQuery(input: AIResponseActionInput): Promise<AIResponseActionResult> {
  if (!input.question || input.question.trim() === "") {
    return { error: "Question cannot be empty." };
  }

  try {
    const genkitInput: AdminDataQueryInput = { question: input.question };
    const result = await querySchoolData(genkitInput);
    return { answer: result.answer };
  } catch (error)
    console.error("Error in querySchoolData flow:", error);
    if (error instanceof Error) {
        return { error: `AI assistant failed to respond: ${error.message}` };
    }
    return { error: "An unexpected error occurred with the AI assistant." };
  }
}
