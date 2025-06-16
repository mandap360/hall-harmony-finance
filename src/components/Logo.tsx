
import React from 'react';
import { Building2 } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <Building2 className={`${sizeClasses[size]} text-amber-600`} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent ${textSizes[size]}`}>
          mandap360
        </span>
      )}
    </div>
  );
};
