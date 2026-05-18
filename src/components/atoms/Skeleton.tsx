import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => {
  if (children) {
    return (
      <div className={cn("animate-pulse rounded-md bg-slate-200/50 dark:bg-slate-700/50", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200/50 dark:bg-slate-700/50", className)} />
  );
};