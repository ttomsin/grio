import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "amber"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-zinc-800 text-zinc-50": variant === "default",
          "border-transparent bg-zinc-800 text-zinc-400": variant === "secondary",
          "text-zinc-50 border-zinc-800": variant === "outline",
          "border-transparent bg-amber-500/20 text-amber-500": variant === "amber",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
