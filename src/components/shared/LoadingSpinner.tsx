import React from 'react';
import { Loader2Icon } from 'lucide-react';
export function LoadingSpinner({
  size = 24,
  className = ''



}: {size?: number;className?: string;}) {
  return <div className={`flex justify-center items-center ${className}`}>
      <Loader2Icon size={size} className="animate-spin text-primary-600 dark:text-primary-400" />
    </div>;
}