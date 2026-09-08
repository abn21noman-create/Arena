"use client";

// ===================================================================
// User Menu — Avatar ক্লিক করলে Dropdown এ Settings/Admin/Logout
// -------------------------------------------------------------------
// Dashboard ও অন্যান্য প্রধান পেজের হেডারে ব্যবহার হয়। Theme Toggle
// এর পাশে বসানো হয় যাতে একটা জায়গা থেকে সব অ্যাকাউন্ট-সম্পর্কিত
// অ্যাকশন করা যায়।
// ===================================================================
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ShieldCheck, LogOut, User } from "lucide-react";

interface UserMenuProps {
  name: string;
  email: string;
  isAdmin?: boolean;
}

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none rounded-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <Avatar className="cursor-pointer border">
          <AvatarFallback className="bg-linear-to-br from-violet-600 to-violet-800 text-white font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate">{name}</span>
            <span className="text-xs text-muted-foreground truncate font-normal">
              {email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <User className="h-4 w-4" />
          প্রোফাইল ও সেটিংস
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem render={<Link href="/admin" />}>
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ redirectTo: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          লগআউট
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
