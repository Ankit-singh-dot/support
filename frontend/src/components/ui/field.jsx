import * as React from "react"
import { cn } from "@/lib/utils"

export function FieldGroup({ className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props} />
}

export function Field({ className, ...props }) {
  return <div className={cn("space-y-1.5", className)} {...props} />
}

export function FieldLabel({ className, ...props }) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold text-foreground leading-tight tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-muted-foreground leading-normal", className)}
      {...props}
    />
  )
}

export function FieldSeparator({ className, children, ...props }) {
  return (
    <div
      className={cn("relative my-4 text-center select-none", className)}
      {...props}
    >
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <span className="relative z-10 bg-card px-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {children}
      </span>
    </div>
  )
}

export default Field

