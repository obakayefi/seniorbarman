import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-sm border border-input bg-background/50 px-3 py-2 text-sm shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500/25 dark:focus-visible:border-orange-500 dark:focus-visible:ring-orange-500/25",
        "dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
