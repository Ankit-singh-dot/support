import React from 'react';
import { Card as ShadcnCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { cn } from '@/lib/utils';

export function Card({ children, title, subtitle, action, className = '', noPadding = false }) {
  return (
    <ShadcnCard className={cn('overflow-hidden', className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border">
          <div className="space-y-1">
            {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
            {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </CardHeader>
      )}
      <CardContent className={noPadding ? 'p-0' : 'p-6'}>{children}</CardContent>
    </ShadcnCard>
  );
}

export { ShadcnCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
