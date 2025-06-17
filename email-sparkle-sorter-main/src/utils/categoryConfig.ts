import { Category } from './emailUtils';

/**
 * Keywords associated with each category for email classification
 * Each keyword is weighted by its relevance to the category
 */
export const KEYWORDS_BY_CATEGORY: Record<Category, string[]> = {
  'Sports': [
    'sport', 'team', 'league', 'game', 'match', 'nba', 'nfl', 'mlb', 'football', 
    'soccer', 'basketball', 'tennis', 'golf', 'championship', 'tournament', 'score',
    'player', 'coach', 'athlete', 'stadium', 'olympics', 'world cup', 'formula',
    'racing', 'fitness', 'workout', 'marathon', 'competition', 'sports'
  ],
  'Entertainment': [
    'movie', 'film', 'series', 'show', 'actor', 'actress', 'director', 'entertainment',
    'music', 'band', 'concert', 'album', 'netflix', 'streaming', 'theater', 'cinema',
    'premiere', 'trailer', 'episode', 'season', 'tv', 'television', 'celebrity',
    'festival', 'award', 'grammy', 'oscar', 'performance', 'ticket', 'broadway',
    'comedy', 'drama', 'documentary', 'podcast', 'playlist', 'song', 'artist'
  ],
  'Tech': [
    'tech', 'computer', 'software', 'apple', 'google', 'microsoft', 'app', 'device',
    'smartphone', 'iphone', 'android', 'code', 'programming', 'ai', 'artificial intelligence',
    'machine learning', 'data', 'cloud', 'server', 'update', 'release', 'version',
    'hardware', 'gadget', 'technology', 'digital', 'startup', 'innovation', 'developer',
    'github', 'coding', 'algorithm', 'cybersecurity', 'hack', 'security', 'privacy',
    'blockchain', 'crypto', 'web3', 'vr', 'ar', 'virtual reality', 'augmented reality'
  ],
  'Finance': [
    'finance', 'investment', 'stock', 'market', 'fund', 'bank', 'financial', 'money',
    'budget', 'tax', 'accounting', 'expense', 'income', 'revenue', 'profit', 'loss',
    'dividend', 'portfolio', 'asset', 'liability', 'credit', 'debit', 'loan', 'mortgage',
    'interest', 'rate', 'economy', 'economic', 'recession', 'inflation', 'deflation',
    'currency', 'forex', 'trading', 'investor', 'wealth', 'retirement', 'savings',
    'insurance', 'payment', 'transaction', 'invoice', 'bill', 'subscription'
  ],
  'Travel': [
    'travel', 'trip', 'vacation', 'holiday', 'flight', 'hotel', 'resort', 'booking',
    'reservation', 'destination', 'tourism', 'tourist', 'tour', 'guide', 'itinerary',
    'passport', 'visa', 'luggage', 'suitcase', 'backpack', 'adventure', 'explore',
    'journey', 'cruise', 'beach', 'mountain', 'hiking', 'camping', 'road trip',
    'airbnb', 'accommodation', 'airline', 'airport', 'departure', 'arrival', 'ticket',
    'miles', 'points', 'reward', 'discount', 'deal', 'package', 'all-inclusive'
  ],
  'Other': [
    'newsletter', 'update', 'announcement', 'notification', 'reminder', 'invitation',
    'rsvp', 'confirm', 'confirmation', 'verify', 'verification', 'welcome', 'thank you',
    'appreciation', 'feedback', 'survey', 'questionnaire', 'form', 'application',
    'registration', 'subscription', 'unsubscribe', 'opt-out', 'opt-in', 'promotion',
    'discount', 'sale', 'offer', 'deal', 'limited time', 'exclusive', 'membership'
  ]
};

/**
 * Gmail's built-in categories mapped to our custom categories
 */
export const GMAIL_CATEGORY_MAPPING: Record<string, Category> = {
  'CATEGORY_PERSONAL': 'Other',
  'CATEGORY_SOCIAL': 'Entertainment',
  'CATEGORY_UPDATES': 'Tech',
  'CATEGORY_FORUMS': 'Other',
  'CATEGORY_PROMOTIONS': 'Other'
};

/**
 * Minimum score threshold for a category to be assigned
 * If no category meets this threshold, 'Other' is assigned
 */
export const CATEGORY_THRESHOLD = 2;

/**
 * Weight multipliers for different parts of the email
 */
export const WEIGHTS = {
  SUBJECT: 2,  // Subject matches are more important
  SNIPPET: 1,  // Content/snippet matches
  SENDER: 1.5  // Sender domain can be a good indicator
};
