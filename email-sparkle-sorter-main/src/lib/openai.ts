import type { Email } from "@/utils/emailUtils";

export interface Task {
  emailId: string;
  from: string;
  subject: string;
  due: Date | null;
  links: string[];
  details: string;
  emailRead?: boolean;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Default model for OpenRouter
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'openai/o4-mini-high';

// Use configured or default remote OpenRouter endpoint
const API_URL = import.meta.env.VITE_OPENAI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';

export const extractTasks = async (emails: Email[]): Promise<Task[]> => {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing VITE_OPENAI_API_KEY in .env");
  }
  console.log('[openai] Calling URL:', API_URL);
  const messages = [
    {
      role: "system",
      content: `You are a chain-of-thought assistant (model 'o1') that filters and extracts only actionable tasks requiring a reminder from a list of emails. For each email:
1. Internally reason step-by-step to determine if it contains a task that should be scheduled (e.g., deadlines, reminders, appointments).
2. Skip any email that is a newsletter, promotional, social notification, or contains no action.
3. For emails with tasks, return JSON objects with exactly these fields:
   - emailId: string
   - subject: string
   - from: string
   - details: concise instruction for the task
   - links: list of URLs (e.g., meeting links) or empty array
   - due: ISO 8601 date-time if mentioned, else null
Return a JSON array of these task objects only. No additional text.`
    },
    { role: "user", content: JSON.stringify(emails) }
  ];
  const payload = { model: MODEL, messages, temperature: 0.2 };
  console.log('[openai] Payload:', payload);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text();
    console.error('[openai] Error response:', response.status, response.statusText, errText);
    throw new Error(`OpenAI API error (${response.status} ${response.statusText}): ${errText}`);
  }
  const data = await response.json();
  console.log('[openai] responseData:', data);
  const rawContent = data.choices?.[0]?.message?.content;
  console.log('[openai] rawContent:', rawContent);
  if (!rawContent || !rawContent.trim()) {
    console.warn('[openai] Empty content returned, no tasks');
    return [];
  }
  let content = rawContent.trim();
  console.log('[openai] trimmedContent before stripping:', content);
  // Strip markdown fences and code language specifiers
  if (content.startsWith('```')) {
    content = content.replace(/```[\w-]*\n?/, '').replace(/```$/, '').trim();
    console.log('[openai] content after stripping fences:', content);
  }
  // Parse JSON, allowing empty arrays
  let tasks: Task[];
  try {
    tasks = JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse tasks from OpenAI response:', content);
    throw new Error(`Invalid JSON returned from OpenAI: ${content}`);
  }
  return tasks.map((t) => ({
    ...t,
    due: t.due ? new Date(t.due) : null
  }));
};
