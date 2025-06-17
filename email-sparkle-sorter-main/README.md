# Email Sparkle Sorter

A modern web application that helps you organize and categorize your Gmail emails from the last 7 days. The app automatically sorts your emails into categories and provides an intuitive interface to search and filter through them.

## Features

- **Gmail Integration**: Securely connect to your Gmail account
- **7-Day Email View**: Automatically fetches and displays emails from the last 7 days
- **Smart Categorization**: Organizes emails into meaningful categories
- **Real-time Search**: Search through your categorized emails instantly
- **Category Filtering**: Filter emails by their assigned categories
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Important Updates**: Dedicated section for viewing critical email updates

## How It Works

### 1. Initial Setup
- Connect your Gmail account using OAuth 2.0 authentication
- The app securely stores your access token for future use

### 2. Email Fetching Process
- The app fetches emails from your Gmail account every 7 days
- Emails are fetched using the Gmail API with proper authentication
- Only emails from the last 7 days are considered

### 3. Email Processing Pipeline
1. **Email Collection**:
   - Fetches emails using Gmail API
   - Extracts essential metadata (sender, subject, date)
   - Categorizes emails based on content

2. **Task Extraction**:
   - Uses OpenAI's API to analyze email content
   - Identifies actionable tasks and deadlines
   - Extracts relevant details and links
   - Creates structured task objects with:
     - Email ID
     - Sender information
     - Subject line
     - Due dates (if mentioned)
     - Relevant links
     - Detailed task description

3. **Smart Categorization**:
   - Automatically categorizes emails into meaningful groups
   - Uses content analysis to determine category
   - Helps users quickly find related emails

### 4. User Interface Features
- **Real-time Search**:
  - Instant search across all emails
  - Filters results as you type
  - Shows matches in real-time

- **Category Filtering**:
  - Filter emails by category
  - View counts per category
  - Easy switching between categories

- **Important Updates**:
  - Dedicated page for critical tasks
  - Shows extracted tasks from emails
  - Allows adding tasks to Google Calendar
  - Automatically hides completed tasks

### 5. Task Management
- **Calendar Integration**:
  - One-click integration with Google Calendar
  - Creates events with proper timing
  - Adds relevant details and links
  - Tracks added tasks to prevent duplicates

- **Task Tracking**:
  - Once a task is added to calendar, it's marked as complete
  - The original email is automatically marked as read in Gmail
  - Completed tasks are hidden from the Important Updates page
  - Persists across sessions using local storage

### 6. Security Features
- Uses OAuth 2.0 for secure Gmail authentication
- Access tokens are stored securely
- No sensitive data is stored on servers
- All processing happens client-side

## Tech Stack

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router v7
- **Authentication**: Google OAuth
- **Toast Notifications**: Sonner
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Google Cloud Project with Gmail API enabled
- OAuth 2.0 credentials configured for Google authentication

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd email-sparkle-sorter

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_REDIRECT_URI=your_oauth_redirect_uri
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/           # Core functionality and utilities
├── pages/         # Page components
├── types/         # TypeScript type definitions
├── utils/         # Helper functions
└── App.tsx        # Main application component
```

## Building for Production

```sh
# Create production build
npm run build

# Preview production build
npm run preview
```

## Deployment

The application can be deployed to any static hosting service that supports single-page applications (SPA). Some recommended options:

- Netlify
- Vercel
- GitHub Pages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
