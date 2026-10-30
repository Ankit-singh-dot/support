import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading…', fullPage = false }) {
  return (
    <div
      className={
        fullPage
          ? 'min-h-[50vh] flex items-center justify-center gap-2 text-muted-foreground'
          : 'flex items-center justify-center p-8 gap-2 text-muted-foreground'
      }
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export default LoadingSpinner;
