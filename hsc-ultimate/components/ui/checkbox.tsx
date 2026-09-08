"use client"

// ===================================================================
// Checkbox — shadcn/ui স্টাইল, base-ui Checkbox primitive দিয়ে
// -------------------------------------------------------------------
// Content Report Bulk Actions ফিচারের জন্য নতুন যোগ করা হলো (আগে এই
// প্রজেক্টে কোনো Checkbox কম্পোনেন্ট ছিল না) — বাকি সব `components/ui/*`
// ফাইলের একই প্যাটার্ন অনুসরণ করে (base-ui primitive + `cn()` দিয়ে
// Tailwind ক্লাস মার্জ, `data-slot` attribute)।
// ===================================================================
import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
