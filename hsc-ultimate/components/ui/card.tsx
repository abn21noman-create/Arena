import * as React from "react"

import { cn } from "@/lib/utils"

// ═══════════════════════════════════════════════════════════════
// V15/V16 ডিজাইন কিট — Glassmorphism কার্ড
// ───────────────────────────────────────────────────────────────
// কিটে প্রতিটা কার্ড `.glass bento` (স্বচ্ছ + blur + ভাসমান)।
// এখানে `bg-card` এর বদলে `.glass-surface` ইউটিলিটি ব্যবহার করা
// হয়েছে (globals.css এ সংজ্ঞায়িত) — ফলে অ্যাপের **সব ৮০টা পেজের
// প্রতিটা <Card> স্বয়ংক্রিয়ভাবে glass পায়**, কোনো পেজ আলাদা করে
// এডিট করতে হয়নি।
//
// light ও dark দুই মোডেই কাজ করে: dark এ সাদা-alpha (কিটের হুবহু
// মান), light এ সাদা-ঘেঁষা অস্বচ্ছ সারফেস + নরম shadow — কারণ
// হালকা ব্যাকগ্রাউন্ডে খুব স্বচ্ছ কার্ড পড়া কঠিন করে দেয়।
// ═══════════════════════════════════════════════════════════════

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card glass-surface flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
