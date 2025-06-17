
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { parseAuthCode, handleAuthCallback } from '@/lib/googleAuth';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processAuth = async () => {
      const authCode = parseAuthCode();
      console.log("Auth callback received, code present:", !!authCode);
      
      if (!authCode) {
        setStatus('error');
        setErrorMessage('No authorization code found in the URL.');
        toast({
          title: "Authentication Error",
          description: "No authorization code found.",
          variant: "destructive",
        });
        return;
      }

      try {
        const result = await handleAuthCallback(authCode);
        console.log("Auth callback result:", result);
        
        if (result.success) {
          setStatus('success');
          toast({
            title: "Success!",
            description: "Successfully connected to Gmail",
          });
          
          // Wait a moment before redirecting
          setTimeout(() => navigate('/'), 2000);
        } else {
          setStatus('error');
          setErrorMessage(result.error ? result.error.toString() : 'Unknown error');
          toast({
            title: "Authentication Failed",
            description: result.error ? result.error.toString() : 'Unknown error',
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
        toast({
          title: "Authentication Error",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive",
        });
      }
    };

    processAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-xl font-semibold mt-4">Connecting to Gmail...</h2>
            <p className="text-gray-500 mt-2">Please wait while we complete the authentication process.</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-green-700 mt-4">Successfully Connected!</h2>
            <p className="text-gray-500 mt-2">Redirecting you back to the application...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-red-700 mt-4">Authentication Failed</h2>
            <p className="text-gray-600 mt-2">{errorMessage || 'There was an error connecting to Gmail.'}</p>
            <div className="mt-6">
              <Button onClick={() => navigate('/')}>Return to Home</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
