import axios from "axios";
import type { Email } from "@/utils/emailUtils";

export interface Task {
  emailId: string;
  from: string;
  subject: string;
  due: Date;
  links: string[];
  details: string;
}

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
// Use Vite proxy in development to avoid CORS; in prod, hit Deepseek directly
const API_BASE = import.meta.env.DEV ? '/deepseek' : 'https://api.deepseek.ai';

export const extractTasks = async (emails: Email[]): Promise<Task[]> => {
  try {
    const resp = await axios.post(
      `${API_BASE}/extract`,
      { emails },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    return resp.data.tasks as Task[];
  } catch (error: any) {
    // Detailed logging for debugging
    console.error('Deepseek API error:', {
      status: error.response?.status,
      data: error.response?.data,
    });
    const message = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
    throw new Error(`Deepseek error (${error.response?.status}): ${message}`);
  }
};
