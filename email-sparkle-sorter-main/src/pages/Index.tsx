import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  fetchEmailsFromLast7Days, 
  Email, 
  Category,
  getAllCategories
} from '@/utils/emailUtils';
import { getCategoryDistribution } from '@/utils/categoryService';
import EmailList from '@/components/EmailList';
import Header from '@/components/Header';
import CategoryBadge from '@/components/CategoryBadge';
import CategoryStats from '@/components/CategoryStats';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { parseAuthCode, handleAuthCallback, isAuthenticated, initiateGoogleLogin } from '@/lib/googleAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [categoryDistribution, setCategoryDistribution] = useState<Record<Category, number>>({} as Record<Category, number>);
  const navigate = useNavigate();

  // Handle authentication callback when the page loads
  useEffect(() => {
    const authCode = parseAuthCode();
    if (authCode) {
      handleAuthInit(authCode);
    } else {
      fetchEmails();
    }
  }, []);

  const handleAuthInit = async (code: string) => {
    const result = await handleAuthCallback(code);
    if (result.success) {
      toast({
        title: "Success!",
        description: "Successfully connected to Gmail",
      });
      // Remove the code from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchEmails();
    } else {
      toast({
        title: "Authentication failed",
        description: "Failed to connect to Gmail",
        variant: "destructive",
      });
    }
  };

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const fetchedEmails = await fetchEmailsFromLast7Days();
      setEmails(fetchedEmails);
      setCategories(getAllCategories(fetchedEmails));
      
      // Calculate category distribution for statistics
      const distribution = getCategoryDistribution(fetchedEmails);
      setCategoryDistribution(distribution);
      toast({
        title: "Emails Updated",
        description: `Loaded ${fetchedEmails.length} emails from the last 7 days`,
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load emails. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmails();
  };

  const handleConnectGmail = () => {
    initiateGoogleLogin();
  };

  const handleCategorySelect = (category: Category | undefined) => {
    setSelectedCategory(category);
  };

  const getEmailCountByCategory = (category: Category) => {
    return emails.filter(email => email.category === category).length;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoading={isLoading} onRefresh={handleRefresh} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center md:justify-start"> 
            <div>
              <h2 className="text-3xl font-bold mb-2 animate-fade-in">
                Your Emails <span className="text-primary">Sparkled</span> & Sorted
              </h2>
              <p className="text-gray-600 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Viewing emails from the last 7 days, magically organized by category.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="animate-fade-in md:ml-4"
              style={{ animationDelay: '0.3s' }}
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </Button>
          </div>
          
          {/* Search and filter section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search emails..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategorySelect(undefined)}
                className="animate-slide-in"
                style={{ animationDelay: '0.1s' }}
              >
                All
              </Button>
              
              {categories.map((category, index) => (
                <div key={category} className="animate-slide-in" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                  <CategoryBadge
                    category={category}
                    count={getEmailCountByCategory(category)}
                    selected={selectedCategory === category}
                    onClick={() => handleCategorySelect(category)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Category Statistics */}
          {showStats && !isLoading && emails.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <CategoryStats distribution={categoryDistribution} />
            </div>
          )}
          
          {/* Email list */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-2 text-gray-600">Loading emails...</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-amber-800">No Emails Found</h3>
              <p className="text-amber-600 mt-2">
                {isAuthenticated() 
                  ? "We couldn't find any emails from the last 7 days. Try refreshing or checking your connection."
                  : "Connect your Gmail account to see your emails sorted by category."}
              </p>
              {!isAuthenticated() && (
                <Button 
                  className="mt-4" 
                  onClick={handleConnectGmail}
                >
                  Connect Gmail
                </Button>
              )}
            </div>
          ) : (
            <EmailList 
              emails={emails} 
              category={selectedCategory} 
              searchTerm={searchTerm}
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t py-4">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Email Sparkle Sorter • Viewing last 7 days of emails</p>
        </div>
      </footer>
      <div className="fixed bottom-6 right-6 md:right-12">
        <Button
          className="bg-red-600 text-white animate-glow-red"
          onClick={() => navigate('/important-updates')}
        >
          Important Updates
        </Button>
      </div>
    </div>
  );
};

export default Index;
