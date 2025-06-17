
import React, { useState } from 'react';
import { Email, Category } from '../utils/emailUtils';
import EmailCard from './EmailCard';
import EmailViewerModal from './EmailViewerModal';

interface EmailListProps {
  emails: Email[];
  category?: Category;
  searchTerm?: string;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  category,
  searchTerm = '' 
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const handleEmailClick = (emailId: string) => {
    setSelectedEmailId(emailId);
  };

  const handleCloseModal = () => {
    setSelectedEmailId(null);
  };
  // Filter emails by category and search term
  const filteredEmails = emails.filter(email => {
    const matchesCategory = !category || email.category === category;
    const matchesSearch = searchTerm === '' || 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      email.snippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  if (filteredEmails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <p className="text-gray-500 text-lg">No emails found.</p>
        {(category || searchTerm) && (
          <p className="text-gray-400 mt-2">
            Try changing your filters or search term.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmails.map((email, index) => (
          <EmailCard 
            key={email.id} 
            email={email} 
            index={index}
            onEmailClick={handleEmailClick}
          />
        ))}
      </div>

      {/* Email Viewer Modal */}
      {selectedEmailId && (
        <EmailViewerModal
          emailId={selectedEmailId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default EmailList;
