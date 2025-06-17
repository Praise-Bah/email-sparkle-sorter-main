
import React from 'react';
import { Category } from '../utils/emailUtils';

interface CategoryBadgeProps {
  category: Category;
  count?: number;
  selected?: boolean;
  onClick?: () => void;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  count, 
  selected = false,
  onClick
}) => {
  return (
    <div 
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-sm font-medium 
        transition-all duration-200 shadow-sm 
        category-${category.toLowerCase()}
        ${selected ? 'ring-2 ring-white/50' : 'opacity-85 hover:opacity-100'} 
        ${onClick ? 'cursor-pointer' : ''}
        animate-fade-in
      `}
      style={{ animationDelay: '0.1s' }}
      onClick={onClick}
    >
      <span className="text-white">
        {category}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
};

export default CategoryBadge;
