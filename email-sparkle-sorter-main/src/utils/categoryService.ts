import { Category } from './emailUtils';
import { KEYWORDS_BY_CATEGORY, GMAIL_CATEGORY_MAPPING, CATEGORY_THRESHOLD, WEIGHTS } from './categoryConfig';

// Interface for email data needed for categorization
interface EmailData {
  subject: string;
  snippet: string;
  from: string;
  labelIds?: string[];
}

// Interface for category scores
interface CategoryScore {
  category: Category;
  score: number;
}

/**
 * Check if an email contains keywords from a specific category
 * @param email The email to check
 * @param keywords Array of keywords to check against
 * @returns Score based on keyword matches
 */
const calculateKeywordScore = (email: EmailData, keywords: string[]): number => {
  let score = 0;
  
  // Convert to lowercase for case-insensitive matching
  const subject = email.subject.toLowerCase();
  const snippet = email.snippet.toLowerCase();
  const from = email.from.toLowerCase();
  
  // Check subject (weighted higher)
  keywords.forEach(keyword => {
    if (subject.includes(keyword.toLowerCase())) {
      score += WEIGHTS.SUBJECT;
    }
  });
  
  // Check snippet
  keywords.forEach(keyword => {
    if (snippet.includes(keyword.toLowerCase())) {
      score += WEIGHTS.SNIPPET;
    }
  });
  
  // Check sender domain for relevant indicators
  keywords.forEach(keyword => {
    if (from.includes(keyword.toLowerCase())) {
      score += WEIGHTS.SENDER;
    }
  });
  
  return score;
};

/**
 * Check if Gmail has already categorized this email
 * @param email The email to check
 * @returns The mapped category if found, null otherwise
 */
const checkGmailCategory = (email: EmailData): Category | null => {
  if (!email.labelIds || email.labelIds.length === 0) {
    return null;
  }
  
  // Check if any Gmail category labels are present
  for (const labelId of email.labelIds) {
    if (labelId in GMAIL_CATEGORY_MAPPING) {
      return GMAIL_CATEGORY_MAPPING[labelId];
    }
  }
  
  return null;
};

/**
 * Load user category corrections from localStorage
 * @returns Record of email IDs and their corrected categories
 */
export const loadUserCategoryCorrections = (): Record<string, Category> => {
  const stored = localStorage.getItem('userCategoryCorrections');
  return stored ? JSON.parse(stored) : {};
};

/**
 * Save a user category correction to localStorage
 * @param emailId The email ID
 * @param category The corrected category
 */
export const saveUserCategoryCorrection = (emailId: string, category: Category): void => {
  const corrections = loadUserCategoryCorrections();
  corrections[emailId] = category;
  localStorage.setItem('userCategoryCorrections', JSON.stringify(corrections));
};

/**
 * Categorize an email based on its content and metadata
 * @param email The email to categorize
 * @param emailId Optional email ID to check for user corrections
 * @returns The assigned category
 */
export const categorizeEmail = (email: EmailData, emailId?: string): Category => {
  // Step 1: Check for user corrections if emailId is provided
  if (emailId) {
    const userCorrections = loadUserCategoryCorrections();
    if (emailId in userCorrections) {
      return userCorrections[emailId];
    }
  }
  
  // Step 2: Check if Gmail has already categorized this email
  const gmailCategory = checkGmailCategory(email);
  if (gmailCategory) {
    return gmailCategory;
  }
  
  // Step 3: Calculate scores for each category
  const scores: CategoryScore[] = Object.entries(KEYWORDS_BY_CATEGORY).map(([category, keywords]) => ({
    category: category as Category,
    score: calculateKeywordScore(email, keywords)
  }));
  
  // Sort scores in descending order
  scores.sort((a, b) => b.score - a.score);
  
  // If the highest score meets the threshold, return that category
  if (scores[0].score >= CATEGORY_THRESHOLD) {
    return scores[0].category;
  }
  
  // Default to 'Other' if no clear category is found
  return 'Other';
};

/**
 * Get the distribution of emails across categories
 * @param emails Array of emails
 * @returns Record with counts by category
 */
export const getCategoryDistribution = (emails: EmailData[]): Record<Category, number> => {
  const distribution: Record<Category, number> = {
    'Sports': 0,
    'Entertainment': 0,
    'Tech': 0,
    'Finance': 0,
    'Travel': 0,
    'Other': 0
  };
  
  emails.forEach(email => {
    const category = categorizeEmail(email);
    distribution[category]++;
  });
  
  return distribution;
};
