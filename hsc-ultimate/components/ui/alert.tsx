import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 🎨 shadcn base Alert শুধু default/destructive variant দেয় — আমাদের
// প্রজেক্টে বিদ্যমান callout box গুলোতে warning (amber), success
// (emerald), info (blue) — এই ৩টা অতিরিক্ত সিমান্টিক color state দরকার
// ছিল (৩৫টা+ ইনলাইন-স্টাইল callout div এর Alert Component Migration
// এর অংশ হিসেবে যোগ করা হয়েছে)। light+dark উভয় মোডেই readable রাখতে
// dark: override সহ।
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 *:data-[slot=alert-description]:text-amber-700 dark:*:data-[slot=alert-description]:text-amber-400 *:[svg]:text-current",
        success:
          "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300 *:data-[slot=alert-description]:text-violet-700 dark:*:data-[slot=alert-description]:text-violet-400 *:[svg]:text-current",
        info: "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300 *:data-[slot=alert-description]:text-blue-700 dark:*:data-[slot=alert-description]:text-blue-400 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
