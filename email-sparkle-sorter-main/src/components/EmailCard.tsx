import React, { useState } from 'react';
import { Email, formatEmailDate, Category } from '../utils/emailUtils';
import CategoryBadge from './CategoryBadge';
import CategoryCorrection from './CategoryCorrection';
import { Star, StarOff, Clock, Mail as LucideMail } from 'lucide-react';

interface EmailCardProps {
  email: Email;
  index: number;
  onEmailClick?: (emailId: string) => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, index, onEmailClick }) => {
  const [category, setCategory] = useState<Category>(email.category);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
  };

  const handleClick = () => {
    if (onEmailClick) {
      onEmailClick(email.id);
    }
  };
  return (
    <div 
      className={`${isHovered ? 'bg-white/80 backdrop-blur-sm shadow-lg' : 'bg-white'} rounded-lg shadow-md overflow-hidden transition-all duration-300 animate-fade-in cursor-pointer`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-lg font-medium ${!email.read ? 'font-semibold' : ''}`}>
            {email.subject}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {email.important ? (
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-300" />
            )}
            <CategoryBadge category={category} />
            <CategoryCorrection 
              emailId={email.id}
            />
          </div>
        </div>
        
        <p className="text-gray-600 mb-3 line-clamp-2">{email.snippet}</p>
        
        <div className="flex flex-wrap justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">{email.from}</span>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{formatEmailDate(email.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
