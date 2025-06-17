import { getAccessToken } from '@/lib/googleAuth';
import { categorizeEmail } from './categoryService';

// Types for our application
export interface Email {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  date: Date;
  category: Category;
  read: boolean;
  important: boolean;
}

export type Category = 'Sports' | 'Entertainment' | 'Tech' | 'Finance' | 'Travel' | 'Other';

// Mock data for demonstration
export const mockEmails: Email[] = [
  {
    id: '1',
    subject: 'Your NBA Weekly Newsletter',
    snippet: 'Check out the latest scores and highlights from this week in basketball...',
    from: 'nba-updates@example.com',
    date: new Date(Date.now() - 10 * 3600000), // 10 hours ago
    category: 'Sports',
    read: false,
    important: true,
  },
  {
    id: '2',
    subject: 'New Movie Releases This Weekend',
    snippet: 'Discover the hottest new films hitting theaters this weekend...',
    from: 'cinema-alerts@example.com',
    date: new Date(Date.now() - 15 * 3600000), // 15 hours ago
    category: 'Entertainment',
    read: true,
    important: false,
  },
  {
    id: '3',
    subject: 'Tech News: Latest iPhone Rumors',
    snippet: 'Industry insiders are reporting that the next iPhone will feature...',
    from: 'tech-insider@example.com',
    date: new Date(Date.now() - 20 * 3600000), // 20 hours ago
    category: 'Tech',
    read: false,
    important: true,
  },
  {
    id: '4',
    subject: 'Your Investment Portfolio Update',
    snippet: 'The quarterly performance of your investments shows growth in...',
    from: 'financial-advisor@example.com',
    date: new Date(Date.now() - 25 * 3600000), // 25 hours ago
    category: 'Finance',
    read: true,
    important: true,
  },
  {
    id: '5',
    subject: 'Special Travel Deals - Expires Soon!',
    snippet: 'Book your summer vacation with our limited-time discounts on flights to...',
    from: 'travel-deals@example.com',
    date: new Date(Date.now() - 30 * 3600000), // 30 hours ago
    category: 'Travel',
    read: false,
    important: false,
  },
  {
    id: '6',
    subject: 'Formula 1 Race Results',
    snippet: 'Complete coverage of this weekend\'s exciting Grand Prix race...',
    from: 'f1-updates@example.com',
    date: new Date(Date.now() - 5 * 3600000), // 5 hours ago
    category: 'Sports',
    read: false,
    important: false,
  },
  {
    id: '7',
    subject: 'Streaming Now: New Series Launch',
    snippet: 'The highly anticipated new drama series is now available to stream...',
    from: 'streaming-service@example.com',
    date: new Date(Date.now() - 8 * 3600000), // 8 hours ago
    category: 'Entertainment',
    read: true,
    important: false,
  },
  {
    id: '8',
    subject: 'Breaking: Major Tech Acquisition',
    snippet: 'Silicon Valley shocked by the surprise acquisition of...',
    from: 'tech-news@example.com',
    date: new Date(Date.now() - 12 * 3600000), // 12 hours ago
    category: 'Tech',
    read: false,
    important: true,
  },
];

// Function to classify an email based on content
export const classifyEmail = (email: any): Category => {
  // Use the new categorization service
  return categorizeEmail({
    subject: email.subject || '',
    snippet: email.snippet || '',
    from: email.from || '',
    labelIds: email.labelIds || []
  }, email.id);
};

// Helper function to decode base64 URL safe strings
const decodeBase64Url = (input: string) => {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  
  // Pad with = if needed
  const pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64 string');
    }
    input += new Array(5-pad).join('=');
  }
  
  return decodeURIComponent(escape(atob(input)));
};

// Helper function to read file as Base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result includes 'data:mime/type;base64,' prefix, remove it
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Fetch the full email body content
export const fetchEmailBody = async (emailId: string): Promise<{ html: string; plainText: string; threadId: string; subject: string; from: string }> => {
  try {
    const accessToken = getAccessToken();
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch email: ${response.statusText}`);
    }

    const data = await response.json();
    let htmlContent = '';
    let plainTextContent = '';
    let threadId = data.threadId || '';
    
    // Extract headers
    const headers = data.payload.headers || [];
    let subject = '';
    let from = '';
    
    headers.forEach((header: any) => {
      if (header.name.toLowerCase() === 'subject') {
        subject = header.value;
      } else if (header.name.toLowerCase() === 'from') {
        from = header.value;
      }
    });

    // Process the payload to find HTML and plain text parts
    const processParts = (parts: any[]) => {
      if (!parts) return;

      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body.data) {
          htmlContent = decodeBase64Url(part.body.data);
        } else if (part.mimeType === 'text/plain' && part.body.data) {
          plainTextContent = decodeBase64Url(part.body.data);
        }

        if (part.parts) {
          processParts(part.parts);
        }
      }
    };

    // Check if the payload has parts
    if (data.payload.parts) {
      processParts(data.payload.parts);
    } else if (data.payload.body && data.payload.body.data) {
      // If no parts, check the body directly
      if (data.payload.mimeType === 'text/html') {
        htmlContent = decodeBase64Url(data.payload.body.data);
      } else if (data.payload.mimeType === 'text/plain') {
        plainTextContent = decodeBase64Url(data.payload.body.data);
      }
    }

    return {
      html: htmlContent,
      plainText: plainTextContent,
      threadId,
      subject,
      from
    };
  } catch (error) {
    console.error('Error fetching email body:', error);
    throw error;
  }
};

// Send a reply to an email
export const sendEmailReply = async (
  threadId: string,
  to: string, // Original recipient
  subject: string,
  body: string,
  attachments: File[] = [],
  ccEmail?: string // Add optional ccEmail parameter
): Promise<boolean> => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    console.error('Access token not found');
    return false;
  }

  try {
    // Fetch original message details for threading headers
    const originalMessageResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${threadId}?format=metadata&metadataHeaders=Message-ID&metadataHeaders=References`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    let messageIdHeader = '';
    let referencesHeader = '';
    if (originalMessageResponse.ok) {
      const messageData = await originalMessageResponse.json();
      messageIdHeader = messageData.payload?.headers?.find((h: any) => h.name === 'Message-ID')?.value || `<${threadId}@mail.gmail.com>`;
      referencesHeader = messageData.payload?.headers?.find((h: any) => h.name === 'References')?.value || `<${threadId}@mail.gmail.com>`;
    } else {
      // Fallback if fetching original message fails
      messageIdHeader = `<${threadId}@mail.gmail.com>`;
      referencesHeader = `<${threadId}@mail.gmail.com>`;
    }

    // Build the raw email message (RFC 2822 format)
    const boundary = `----=_Part_${Math.random().toString(36).substring(2)}`;
    let rawMessage = `To: ${to}\n`;
    if (ccEmail && ccEmail.trim() !== '') {
      rawMessage += `Cc: ${ccEmail.trim()}\n`;
    }
    rawMessage += `Subject: ${subject}\n`;
    rawMessage += `In-Reply-To: ${messageIdHeader}\n`;
    rawMessage += `References: ${referencesHeader}\n`;
    rawMessage += `MIME-Version: 1.0\n`;
    rawMessage += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;

    // Message body part (HTML)
    rawMessage += `--${boundary}\n`;
    rawMessage += `Content-Type: text/html; charset=UTF-8\n`;
    rawMessage += `Content-Transfer-Encoding: base64\n\n`;
    rawMessage += `${btoa(unescape(encodeURIComponent(body)))}\n\n`; // Encode body as base64

    // Add attachments
    if (attachments.length > 0) {
      for (const file of attachments) {
        const base64Data = await readFileAsBase64(file);
        rawMessage += `--${boundary}\n`;
        rawMessage += `Content-Type: ${file.type}; name="${file.name}"\n`;
        rawMessage += `Content-Transfer-Encoding: base64\n`;
        rawMessage += `Content-Disposition: attachment; filename="${file.name}"\n\n`;
        rawMessage += `${base64Data}\n\n`;
      }
    }

    // End boundary
    rawMessage += `--${boundary}--`;

    // Encode the entire raw message for Gmail API (URL-safe Base64)
    const encodedMessage = btoa(rawMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage, threadId: threadId })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email reply:', error);
    return false;
  }
};

// Parse email headers to extract specific information
const parseEmailHeaders = (headers: any[]) => {
  let from = '';
  let subject = '';
  let date: Date | null = null;
  
  headers.forEach(header => {
    if (header.name.toLowerCase() === 'from') {
      from = header.value;
      // Extract email from format: "Name <email@example.com>"
      const emailMatch = from.match(/<([^>]*)>/);
      if (emailMatch && emailMatch[1]) {
        from = emailMatch[1];
      }
    } else if (header.name.toLowerCase() === 'subject') {
      subject = header.value;
    } else if (header.name.toLowerCase() === 'date') {
      date = new Date(header.value);
    }
  });
  
  return { from, subject, date: date || new Date() };
};

// Function to fetch emails from Gmail API
export const fetchEmailsFromLast7Days = async (): Promise<Email[]> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.log('No access token available, using mock data');
    return Promise.resolve(mockEmails);
  }
  
  try {
    // Calculate date 7 days ago
    const date7DaysAgo = new Date();
    date7DaysAgo.setDate(date7DaysAgo.getDate() - 7);
    const formattedDate = date7DaysAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // List unread messages from the last 7 days
    const query = `after:${formattedDate} is:unread`;
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=30`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch messages: ${await listResponse.text()}`);
    }
    
    const listData = await listResponse.json();
    
    if (!listData.messages || listData.messages.length === 0) {
      console.log('No unread emails found in the last 7 days');
      return [];
    }
    
    // Fetch details for each message
    const emailPromises = listData.messages.map(async (message: { id: string }) => {
      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!messageResponse.ok) {
        throw new Error(`Failed to fetch message ${message.id}: ${await messageResponse.text()}`);
      }
      
      const messageData = await messageResponse.json();
      const { from, subject, date } = parseEmailHeaders(messageData.payload.headers);
      
      const email: Email = {
        id: messageData.id,
        subject: subject || 'No Subject',
        snippet: messageData.snippet || '',
        from: from || 'unknown@example.com',
        date: date,
        category: classifyEmail({ subject, snippet: messageData.snippet }),
        read: !messageData.labelIds.includes('UNREAD'),
        important: messageData.labelIds.includes('IMPORTANT'),
      };
      
      return email;
    });
    
    return await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error fetching emails from Gmail API:', error);
    // Fallback to mock data if there's an error
    return mockEmails;
  }
};

// Function to get emails by category
export const getEmailsByCategory = (emails: Email[], category: Category): Email[] => {
  return emails.filter(email => email.category === category);
};

// Function to get all unique categories from emails
export const getAllCategories = (emails: Email[]): Category[] => {
  const categories = new Set(emails.map(email => email.category));
  return Array.from(categories) as Category[];
};

// Function to format date for display
export const formatEmailDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHrs < 1) {
    return 'Just now';
  } else if (diffHrs === 1) {
    return '1 hour ago';
  } else if (diffHrs < 24) {
    return `${diffHrs} hours ago`;
  } else if (diffHrs < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};
