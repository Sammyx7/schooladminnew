
"use server";

import { performAdminTask } from '@/lib/actions/aiTaskActions';

// Gemini server SDK
// Ensure dependency installed: npm i @google/generative-ai
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSchoolSettings } from '@/lib/services/settingsService';

type ChatTurn = { role: 'user' | 'ai'; text: string };
interface AIResponseActionInput { question: string; history?: ChatTurn[] }
interface AIResponseActionResult { answer?: string; error?: string }

function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
  if (envUrl) return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

// Extract the first top-level JSON object from arbitrary text (e.g., if model wrapped in code fences)
function extractFirstJsonObject(s: string): string | null {
  // strip common code fences
  const stripped = s.replace(/^```[a-zA-Z]*\n?/m, '').replace(/\n?```$/m, '').trim();
  // quick path
  if (stripped.trim().startsWith('{') && stripped.trim().endsWith('}')) return stripped.trim();
  let depth = 0, start = -1;
  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        return stripped.slice(start, i + 1);
      }
    }
  }
  return null;
}

const SYSTEM_PROMPT = `You are the SchoolAdmin AI assistant.
Rules:
- Answer questions concisely.
- For create/update tasks, use slot-filling across multiple turns, but ONLY ask for fields truly required for that task type.
  1) Staff creation requires: name, role, email. Department optional (default: General). Do not ask for unrelated fields.
  2) Student creation requires: name, classSection.
  3) Update Staff ID requires: either (currentId) OR (name), and newStaffId. Do NOT ask for email or other fields for this task.
  4) When ALL required fields are collected, respond ONLY with a single JSON object:
     { "tool": "performAdminTask", "args": { "command": "<a clear, concise natural-language command>" } }
     - The value of args.command MUST be plain English text (NO JSON). Example: "Update staff Shayan Ahmed id to TCH101".

- Absolutely NO markdown or code fences when emitting a tool call. Output a SINGLE RAW JSON object and nothing else.
- For general Q&A, reply in plain text.

Available tools you may call by returning RAW JSON:
{ "tool": "getSchoolSettingsSummary", "args": {} }
{ "tool": "listStaffLite", "args": { "q": "optional name contains", "limit": 10 } }
{ "tool": "findStaffByName", "args": { "name": "John" } }
{ "tool": "performAdminTask", "args": { "command": "..." } }

Guidance:
- Prefer calling read tools to gather missing fields BEFORE asking the user. Only ask when tools cannot resolve.
- For Update Staff ID, first try to resolve the current staff via name using listStaffLite/findStaffByName, then emit performAdminTask with args.command as plain English, e.g.:
  "Update staff Shayan Ahmed id to TCH101" OR "Update staff ST-1755605966895 id to TCH101".
- After receiving tool results, continue reasoning and if ready, emit the performAdminTask tool call as a SINGLE RAW JSON object.
`;

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const genai = new GoogleGenerativeAI(apiKey);
  // Allow override to avoid per-model quota; default to a lightweight model
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-8b';
  return genai.getGenerativeModel({ model: modelName });
}

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

async function generateWithRetry(model: ReturnType<typeof getGeminiModel>, contents: any[], attempts = 3) {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await model.generateContent({ contents });
    } catch (e: any) {
      lastErr = e;
      const msg = String(e?.message || '');
      const is429 = msg.includes('429') || msg.toLowerCase().includes('too many requests') || msg.toLowerCase().includes('quota');
      let delayMs = 1500 * (i + 1);
      // Try parse RetryInfo from message (e.g., "retryDelay":"14s")
      const m = msg.match(/retrydelay\":"(\d+)s/i);
      if (m) delayMs = Number(m[1]) * 1000;
      if (is429 && i < attempts - 1) {
        await sleep(delayMs);
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

async function toolGetSchoolSettingsSummary() {
  const s = await getSchoolSettings();
  const classes = Array.isArray((s as any)?.classes) ? (s as any).classes as string[] : [];
  const subjects = Array.isArray((s as any)?.subjects) ? (s as any).subjects as string[] : [];
  const schoolName = (s as any)?.schoolName || 'N/A';
  const summary = [
    `School: ${schoolName}`,
    classes.length ? `Classes (${classes.length}): ${classes.slice(0, 20).join(', ')}` : 'Classes: N/A',
    subjects.length ? `Subjects (${subjects.length}): ${subjects.slice(0, 20).join(', ')}` : 'Subjects: N/A',
  ].join('\n');
  return summary;
}

type StaffLite = { staffId: string; name: string; role?: string; department?: string; emailMasked?: string };
async function toolListStaffLite({ q, limit }: { q?: string; limit: number }) {
  const res = await fetch(`${getBaseUrl()}/api/staff/list`, { method: 'GET', cache: 'no-store' });
  const payload = await res.json().catch(() => ([]));
  if (!res.ok || !Array.isArray(payload)) return 'Failed to read staff list.';
  let items: StaffLite[] = payload.map((r: any) => ({
    staffId: r.staffId || r.staff_id,
    name: r.name,
    role: r.role,
    department: r.department,
    emailMasked: maskEmail(r.email),
  }));
  if (q) {
    const qq = String(q).toLowerCase();
    items = items.filter(i => (i.name || '').toLowerCase().includes(qq));
  }
  items = items.slice(0, Math.max(1, Math.min(50, Number(limit || 10))));
  if (items.length === 0) return 'No staff found.';
  const lines = items.map(i => `${i.staffId || ''} – ${i.name}${i.role ? ' ('+i.role+')' : ''}${i.department ? ' – '+i.department : ''}${i.emailMasked ? ' – '+i.emailMasked : ''}`);
  return lines.join('\n');
}

async function toolFindStaffByName(name: string) {
  const ans = await toolListStaffLite({ q: name, limit: 5 });
  if (ans.startsWith('Failed') || ans.startsWith('No staff')) return ans;
  return `Matches for "${name}":\n${ans}`;
}

function maskEmail(email?: string): string | undefined {
  if (!email || typeof email !== 'string') return undefined;
  const at = email.indexOf('@');
  if (at <= 1) return '***';
  return `${email[0]}***${email.slice(at)}`;
}

export async function getAIResponseForAdminQuery(input: AIResponseActionInput): Promise<AIResponseActionResult> {
  const question = input?.question?.trim();
  if (!question) return { error: 'Question cannot be empty.' };

  try {
    // Fast path: if this looks like a direct admin command, try performing it without the LLM to save quota
    if (/\b(add|create|update|change|set)\b/i.test(question) && /\b(staff|student|class)\b/i.test(question)) {
      const immediate = await performAdminTask({ command: question });
      // If it looks handled (either ok or a concrete failure message), return it; else fall through to LLM
      if (immediate.ok || !/couldn't understand/i.test(immediate.message)) {
        const summary = immediate.ok ? `OK: ${immediate.message}` : `FAILED: ${immediate.message}`;
        return { answer: summary };
      }
    }

    const model = getGeminiModel();
    // Build conversation with system + history + current user
    const baseHistory: any[] = [];
    baseHistory.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT }] });
    if (input.history && Array.isArray(input.history)) {
      for (const t of input.history.slice(-12)) {
        baseHistory.push({ role: t.role === 'ai' ? 'model' : 'user', parts: [{ text: t.text }] });
      }
    }
    baseHistory.push({ role: 'user', parts: [{ text: question }] });

    // Up to 3 tool iterations: read tool -> feed result -> continue
    let contents: any[] = [...baseHistory];
    for (let step = 0; step < 3; step++) {
      const resp = await generateWithRetry(model, contents, 3);
      let text = resp?.response?.text?.() || resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) return { error: 'Empty response from AI.' };

      // Try parse as a tool call
      let toolHandled = false;
      try {
        const jsonStr = extractFirstJsonObject(text) || text;
        const maybe = JSON.parse(jsonStr);
        if (maybe && typeof maybe === 'object' && maybe.tool) {
          if (maybe.tool === 'performAdminTask' && maybe.args?.command !== undefined) {
            const cmd = typeof maybe.args.command === 'string' ? maybe.args.command : JSON.stringify(maybe.args.command);
            const result = await performAdminTask({ command: cmd });
            const summary = result.ok ? `OK: ${result.message}` : `FAILED: ${result.message}`;
            return { answer: summary };
          }
          if (maybe.tool === 'getSchoolSettingsSummary') {
            const ans = await toolGetSchoolSettingsSummary();
            contents = [...contents, { role: 'user', parts: [{ text: `TOOL_RESULT:getSchoolSettingsSummary\n${ans}` }] }];
            toolHandled = true;
          }
          if (maybe.tool === 'listStaffLite') {
            const q = maybe.args?.q ? String(maybe.args.q) : undefined;
            const limit = maybe.args?.limit ? Math.max(1, Math.min(50, Number(maybe.args.limit))) : 10;
            const ans = await toolListStaffLite({ q, limit });
            contents = [...contents, { role: 'user', parts: [{ text: `TOOL_RESULT:listStaffLite\n${ans}` }] }];
            toolHandled = true;
          }
          if (maybe.tool === 'findStaffByName') {
            const name = String(maybe.args?.name || '');
            const ans = await toolFindStaffByName(name);
            contents = [...contents, { role: 'user', parts: [{ text: `TOOL_RESULT:findStaffByName\n${ans}` }] }];
            toolHandled = true;
          }
        }
      } catch (_) {
        // not a JSON tool call
      }

      if (!toolHandled) {
        // Plain answer or no tool: return response
        return { answer: text };
      }
      // Loop to allow the model to use the tool result and continue
    }
    return { answer: 'I reached the tool-use limit. Please try again with more details.' };
  } catch (error) {
    console.error('Gemini chat error:', error);
    // Fallback: try local execution if this was a direct admin command
    try {
      if (/\b(add|create|update|change|set)\b/i.test(question)) {
        const fallback = await performAdminTask({ command: question });
        const summary = fallback.ok ? `OK: ${fallback.message}` : `FAILED: ${fallback.message}`;
        return { answer: summary };
      }
    } catch (_) {}
    if (error instanceof Error) return { error: `AI assistant failed: ${error.message}` };
    return { error: 'An unexpected error occurred with the AI assistant.' };
  }
}

