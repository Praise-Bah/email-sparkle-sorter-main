import React, { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Send, Image, FileText, Upload, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchEmailBody, sendEmailReply } from '@/utils/emailUtils';
import { useToast } from '@/hooks/use-toast';
import { getAccessToken, API_KEY } from '@/lib/googleAuth';

// Ensure gapi and google picker API types are available
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface EmailViewerModalProps {
  emailId: string | null;
  onClose: () => void;
}

const EmailViewerModal: React.FC<EmailViewerModalProps> = ({ emailId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [emailContent, setEmailContent] = useState<{
    html: string;
    plainText: string;
    threadId: string;
    subject: string;
    from: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!emailId) return;

    const fetchEmail = async () => {
      setLoading(true);
      try {
        const content = await fetchEmailBody(emailId);
        setEmailContent(content);
      } catch (error) {
        console.error('Error fetching email:', error);
        toast({
          title: 'Error',
          description: 'Failed to load email content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [emailId, toast]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  // Close Google Picker when modal is closed
  useEffect(() => {
    return () => {
      // Close any open Google Picker when the modal is unmounted
      if (window.google && window.google.picker) {
        const pickerElements = document.querySelectorAll('.picker-dialog');
        pickerElements.forEach(element => {
          element.parentNode?.removeChild(element);
        });
        
        // Also remove any backdrop elements
        const backdropElements = document.querySelectorAll('.picker-dialog-bg');
        backdropElements.forEach(element => {
          element.parentNode?.removeChild(element);
        });
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const openGoogleDrivePicker = () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      toast({
        title: 'Google Drive',
        description: 'Please connect your account to use Drive picker',
        variant: 'destructive',
      });
      return;
    }

    if (!API_KEY) {
      toast({
        title: 'Configuration Error',
        description: 'Google API Key is missing. Please add it to your .env file as VITE_GOOGLE_API_KEY',
        variant: 'destructive',
      });
      return;
    }

    const loadGooglePickerAPI = () => {
      // Load the Google Picker API
      const script1 = document.createElement('script');
      script1.src = 'https://apis.google.com/js/api.js';
      script1.onload = () => {
        window.gapi.load('picker', () => {
          // Load the Google Client API
          const script2 = document.createElement('script');
          script2.src = 'https://apis.google.com/js/client.js';
          script2.onload = () => {
            launchPicker();
          };
          document.body.appendChild(script2);
        });
      };
      document.body.appendChild(script1);
    };

    const launchPicker = () => {
      try {
        // Create a document view
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(true);

        // Create an image view
        const imageView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES);
        
        // Create the picker
        const picker = new window.google.picker.PickerBuilder()
          .addView(view) // General Docs View (folders included)
          .addView(imageView) // Images View
          .addView(window.google.picker.ViewId.DOCUMENTS) // Google Docs
          .addView(window.google.picker.ViewId.SPREADSHEETS) // Google Sheets
          .addView(window.google.picker.ViewId.PRESENTATIONS) // Google Slides
          .addView(window.google.picker.ViewId.PDFS) // PDFs
          .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
          .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
          .setTitle('Select a file from Google Drive')
          .setDeveloperKey(API_KEY)
          .setOAuthToken(accessToken)
          .setCallback((data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              // Handle multiple file selection
              const files = data.docs;
              files.forEach((file: any) => {
                const fileName = file.name;
                const fileUrl = file.url || file.embedUrl;
                const fileType = file.mimeType || 'text/plain';
                const fileInfo = `Google Drive File: ${fileName} - ${fileUrl}`;
                
                // Create a blob with file info
                const blob = new Blob([fileInfo], { type: fileType });
                const driveFile = new File([blob], fileName, { type: fileType });
                
                // Add to attachments
                setAttachments(prev => [...prev, driveFile]);
              });
              
              // Show success toast
              toast({
                title: 'Files Added',
                description: `Added ${files.length} file(s) from Google Drive`,
              });
            } else if (data.action === window.google.picker.Action.CANCEL) {
              console.log('User canceled file picking');
            }
          })
          .build();
          
        picker.setVisible(true);
      } catch (error) {
        console.error('Error launching Google Drive Picker:', error);
        toast({
          title: 'Google Drive Error',
          description: 'Failed to open Google Drive picker. Please check your API key and permissions.',
          variant: 'destructive',
        });
      }
    };

    // Check if the Google API is already loaded
    if (!window.gapi) {
      loadGooglePickerAPI();
    } else {
      // If gapi is loaded but picker isn't, load picker
      if (!window.google || !window.google.picker) {
        window.gapi.load('picker', () => {
          launchPicker();
        });
      } else {
        // Both are loaded, launch picker directly
        launchPicker();
      }
    }
  };

  const handleSendReply = async () => {
    if (!emailContent || !replyText.trim()) return;

    setSending(true);
    try {
      const success = await sendEmailReply(
        emailContent.threadId, // First parameter: threadId
        emailContent.from, // Second parameter: to address
        `Re: ${emailContent.subject}`, // Third parameter: subject
        replyText, // Fourth parameter: body
        attachments, // Fifth parameter: attachments
        ccEmail // Sixth parameter: optional ccEmail
      );

      if (success) {
        toast({
          title: 'Success',
          description: 'Reply sent successfully',
        });
        onClose();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (!emailId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {loading ? 'Loading...' : emailContent?.subject || 'Email Viewer'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Email content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="mb-4 text-sm text-gray-500">
                <p><strong>From:</strong> {emailContent?.from}</p>
                <p><strong>Subject:</strong> {emailContent?.subject}</p>
              </div>
              {emailContent?.html ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailContent.html }} 
                />
              ) : (
                <pre className="whitespace-pre-wrap">{emailContent?.plainText}</pre>
              )}
            </div>
          )}
        </div>

        {/* Reply section */}
        <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
          <Textarea
            id="reply-text"
            placeholder="Write your reply here..."
            className="w-full mb-4 min-h-[100px]"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={loading || sending}
          />
          
          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm"
                  >
                    {file.type.startsWith('image/') ? (
                      <Image className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button 
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Cc email input */}
          <div className="mt-4 max-w-md">
            <Label htmlFor="cc-email" className="text-xs text-gray-500">Cc this reply to (optional):</Label>
            <Input
              id="cc-email"
              type="email"
              placeholder="another@example.com"
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              className="mt-1 text-sm"
              disabled={loading || sending}
            />
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap justify-between items-center mt-4 md:flex-nowrap">
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || sending}
                title="Attach files from your device"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach Files
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Create a new file input for images only
                  const imageInput = document.createElement('input');
                  imageInput.type = 'file';
                  imageInput.multiple = true;
                  imageInput.accept = 'image/*';
                  imageInput.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      const imageFiles = Array.from(files);
                      setAttachments(prev => [...prev, ...imageFiles]);
                    }
                  };
                  imageInput.click();
                }}
                disabled={loading || sending}
                title="Upload images"
              >
                <Image className="h-4 w-4 mr-1" />
                Images
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Create a new file input for documents
                  const docInput = document.createElement('input');
                  docInput.type = 'file';
                  docInput.multiple = true;
                  docInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
                  docInput.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      const docFiles = Array.from(files);
                      setAttachments(prev => [...prev, ...docFiles]);
                    }
                  };
                  docInput.click();
                }}
                disabled={loading || sending}
                title="Upload documents"
              >
                <FileIcon className="h-4 w-4 mr-1" />
                Documents
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={openGoogleDrivePicker}
                disabled={loading || sending}
                title="Attach files from Google Drive"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.433 22l-1.767-3.043L12 6.935l3.044 5.254L4.433 22zm15.135 0h-9.18l4.576-7.935h9.123L19.568 22zm-4.615-8l-4.557-7.935h9.123L19.568 14h-4.615zM7.48 6.065L12 6.935 7.48 14 3 14l4.48-7.935z" />
                </svg>
                Google Drive
              </Button>
            </div>
            <Button 
              onClick={handleSendReply}
              disabled={loading || sending || !replyText.trim()}
              className="mt-4 sm:mt-0 w-full sm:w-auto"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailViewerModal;
