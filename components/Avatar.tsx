import React from 'react';
import { User, Building2 } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface CompanyImageProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: 'none' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
};

const companySizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-full h-full',
};

const companyIconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const roundedClasses = {
  none: 'rounded-none',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

// Avatar component for users
export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md',
  className = '' 
}) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`${sizeClasses[size]} rounded-full object-cover bg-gray-200 ${className}`}
      />
    );
  }

  // Placeholder with user icon
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
      <User className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
};

// Company image component
export const CompanyImage: React.FC<CompanyImageProps> = ({ 
  src, 
  alt = 'Company', 
  size = 'md',
  className = '',
  rounded = 'lg'
}) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`${companySizeClasses[size]} ${roundedClasses[rounded]} object-cover bg-gray-200 ${className}`}
      />
    );
  }

  // Placeholder with building icon
  return (
    <div className={`${companySizeClasses[size]} ${roundedClasses[rounded]} bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
      <Building2 className={`${companyIconSizes[size]} text-gray-400`} />
    </div>
  );
};

// Full-size company image for cards (with aspect ratio)
export const CompanyCardImage: React.FC<{ src?: string | null; alt?: string; className?: string }> = ({ 
  src, 
  alt = 'Company',
  className = '' 
}) => {
  if (src) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  // Placeholder with building icon
  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
      <Building2 className="w-16 h-16 text-gray-300" />
    </div>
  );
};
