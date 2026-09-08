import { DefaultSession } from "next-auth";

// Current role and authVersion are copied into the JWT at sign-in. Proxy/Admin
// guards compare authVersion with the live User row so stale sessions fail.
declare module "next-auth" {
  interface User {
    role?: string;
    authVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      authVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    authVersion?: number;
  }
}
