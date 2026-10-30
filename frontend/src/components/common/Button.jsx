import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button as ShadcnButton, buttonVariants } from '../ui/button';
import { cn } from '@/lib/utils';

export function Button({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  // Map older variant names to shadcn variants
  const variantMap = {
    primary: 'default',
    secondary: 'outline',
    danger: 'destructive',
    ghost: 'ghost',
    success: 'default',
  };

  const resolvedVariant = variantMap[variant] || variant;

  return (
    <ShadcnButton
      variant={resolvedVariant}
      size={size === 'md' ? 'default' : size}
      disabled={disabled || isLoading}
      className={cn('gap-2', className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </ShadcnButton>
  );
}

export { buttonVariants };
export default Button;
