import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Duolingo-স্টাইল "3D tactile press" মাইক্রো-ইন্টারঅ্যাকশন — নিচে একটা
// ঠোঁটের মতো (ledge) box-shadow থাকে, ক্লিক/ট্যাপ করলে বাটন সেই ledge এর
// দিকে "sink" করে (translateY + shadow height কমে যায় + সামান্য brightness
// কমে) — bottom edge স্থির থাকে, শুধু উপরের ফেস নড়ে (গাণিতিকভাবে
// pre-verify করা হয়েছে: shadow height - 1px = translate distance, যাতে
// pressed অবস্থায় ১px shadow অবশিষ্ট থাকে, bottom edge না নড়ে)।
//
// একটামাত্র CSS variable (--button-tactile-h, ডিফল্ট 4px, ছোট বাটনে 3px)
// দিয়ে shadow height ও translate distance দুটোই derive করা হয় (calc()
// দিয়ে) — এতে conflicting Tailwind arbitrary-value utility class তৈরি
// হয় না (একটাই box-shadow/translate declaration, শুধু variable value
// বদলায়)। link/ghost variant এ shadow transparent রাখা হয়েছে (flat
// button, tactile effect অপ্রাসঙ্গিক)। prefers-reduced-motion/
// reduced-motion accessibility সেটিংস transition-duration কমিয়ে দেয়
// (globals.css এ বিদ্যমান নিয়ম), যা এই effect এও স্বয়ংক্রিয়ভাবে প্রযোজ্য।
const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none [--button-tactile-h:4px] [--button-tactile-on:1] [box-shadow:0_calc(var(--button-tactile-h)_*_var(--button-tactile-on))_0_0_var(--button-tactile-shadow)] active:not-aria-[haspopup]:not-disabled:translate-y-[calc((var(--button-tactile-h)_-_1px)_*_var(--button-tactile-on))] active:not-aria-[haspopup]:not-disabled:[box-shadow:0_calc(1px_*_var(--button-tactile-on))_0_0_var(--button-tactile-shadow)] active:not-aria-[haspopup]:not-disabled:brightness-[0.92] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // ⚠️ variant ও size দুটোই --button-tactile-h সেট করলে tailwind-merge
      // একটাকে override করে ফেলবে (দুটোই একই CSS property, শেষেরটা জেতে) —
      // তাই variant শুধু --button-tactile-on (0/1 চালু/বন্ধ) নিয়ন্ত্রণ করে,
      // size শুধু --button-tactile-h (উচ্চতা) নিয়ন্ত্রণ করে — সম্পূর্ণ আলাদা
      // variable, কোনো conflict/override সম্ভাবনা নেই কম্বিনেশনেও
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 [--button-tactile-shadow:color-mix(in_oklch,var(--primary),#000_25%)]",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [--button-tactile-shadow:var(--border)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground [--button-tactile-shadow:color-mix(in_oklch,var(--secondary),#000_18%)]",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 [--button-tactile-on:0] [--button-tactile-shadow:transparent]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40 [--button-tactile-shadow:color-mix(in_oklch,var(--destructive),#000_20%)]",
        link: "text-primary underline-offset-4 hover:underline [--button-tactile-on:0] [--button-tactile-shadow:transparent]",
      },

      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 [--button-tactile-h:3px]",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5 [--button-tactile-h:3px]",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3 [--button-tactile-h:3px]",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg [--button-tactile-h:3px]",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  // When a custom `render` element is provided (e.g. Next.js <Link> or <a>),
  // default `nativeButton` to `false` to satisfy Base UI's semantic requirements
  // and prevent console warnings.
  const resolvedNativeButton =
    nativeButton !== undefined
      ? nativeButton
      : props.render !== undefined
        ? false
        : undefined;

  return (
    <ButtonPrimitive
      data-slot="button"
      nativeButton={resolvedNativeButton}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
