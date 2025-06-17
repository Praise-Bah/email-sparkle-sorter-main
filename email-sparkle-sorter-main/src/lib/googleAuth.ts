// Google OAuth2 client credentials
const CLIENT_ID     = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string;
export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

// Define base URL based on environment
const BASE_URL = window.location.origin; // This will automatically use the correct domain
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${BASE_URL}/auth/callback`;

// Auth scopes needed for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Function to initiate Google OAuth login
export const initiateGoogleLogin = () => {
  console.log("Initiating Google login...");
  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', SCOPES.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  console.log("Redirecting to:", authUrl.toString());
  window.location.href = authUrl.toString();
};

// Function to exchange the authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  console.log("Exchanging code for tokens...");
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('grant_type', 'authorization_code');

  try {
    console.log("Token request params:", params.toString());
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    console.log("Token response status:", response.status);
    console.log("Token response:", responseText);

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${responseText}`);
    }

    const tokens = JSON.parse(responseText);
    
    // Store tokens in localStorage
    localStorage.setItem('gmail_access_token', tokens.access_token);
    localStorage.setItem('gmail_refresh_token', tokens.refresh_token || '');
    localStorage.setItem('gmail_token_expiry', (Date.now() + (tokens.expires_in * 1000)).toString());
    
    return { success: true, tokens };
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return { success: false, error };
  }
};

// Function to handle the OAuth callback
export const handleAuthCallback = async (code: string) => {
  try {
    console.log("Handling auth callback with code:", code ? "present" : "missing");
    const result = await exchangeCodeForTokens(code);
    return result;
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return { success: false, error };
  }
};

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
  const accessToken = localStorage.getItem('gmail_access_token');
  const tokenExpiry = localStorage.getItem('gmail_token_expiry');
  
  if (!accessToken || !tokenExpiry) {
    return false;
  }
  
  // Check if token is expired
  const now = Date.now();
  const expiryTime = parseInt(tokenExpiry, 10);
  
  if (now >= expiryTime) {
    // Token is expired, attempt to refresh it
    // In a real app, you would implement token refresh here
    return false;
  }
  
  return true;
};

// Function to get the access token
export const getAccessToken = (): string | null => {
  if (!isAuthenticated()) {
    return null;
  }
  
  return localStorage.getItem('gmail_access_token');
};

// Function to logout
export const logout = () => {
  localStorage.removeItem('gmail_access_token');
  localStorage.removeItem('gmail_refresh_token');
  localStorage.removeItem('gmail_token_expiry');
  window.location.href = '/';
};

// Parse the URL for auth code on page load
export const parseAuthCode = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

// Function to mark an email as read in Gmail
export const markEmailAsRead = async (emailId: string): Promise<boolean> => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.error('No access token available to mark email as read');
    return false;
  }
  
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD']
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to mark email as read: ${errorText}`);
      return false;
    }
    
    console.log(`Successfully marked email ${emailId} as read`);
    return true;
  } catch (error) {
    console.error('Error marking email as read:', error);
    return false;
  }
};
