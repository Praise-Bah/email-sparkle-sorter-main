import React from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initiateGoogleLogin, isAuthenticated, logout } from '@/lib/googleAuth';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoading, onRefresh }) => {
  const { toast } = useToast();

  const handleGoogleLogin = () => {
    console.log("Google login button clicked");
    try {
      toast({
        title: "Connecting to Gmail",
        description: "Redirecting to Google authentication...",
      });
      initiateGoogleLogin();
    } catch (error) {
      console.error("Error initiating Google login:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    toast({
      title: "Signing Out",
      description: "You have been signed out successfully.",
    });
    logout();
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mail className="h-8 w-8 text-primary animate-pulse-shadow" />
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Email Sparkle Sorter
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 sm:mr-2 md:h-5 md:w-5" />
            <span className="hidden sm:inline-block">{isLoading ? 'Refreshing...' : 'Refresh Emails'}</span>
          </Button>
          
          {isAuthenticated() ? (
            <Button variant="ghost" onClick={handleLogout}>
              Sign Out
            </Button>
          ) : (
            <Button onClick={handleGoogleLogin}>
              Connect Gmail
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
