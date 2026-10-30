import React from 'react';
import { Button } from '../ui/button';

export function EmptyState({ title = 'No tickets found', description, actionLabel, onAction }) {
  return (
    <div className="text-center py-12 px-4 rounded-lg border border-dashed border-border">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
