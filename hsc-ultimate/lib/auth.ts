// ===================================================================
// NextAuth.js v5 কনফিগারেশন
// -------------------------------------------------------------------
// Credentials Provider (Email + Password) ব্যবহার করা হয়েছে — সহজ,
// কোনো বাইরের OAuth সেটআপ ছাড়াই কাজ করে। ভবিষ্যতে চাইলে Google
// Provider যোগ করা যাবে (client id/secret লাগবে)।
// ===================================================================
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Always trust host in preview/cloud/local environments to prevent UntrustedHost errors
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "hsc-ultimate-auth-jwt-secret-key-32-chars-long-min-2026",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;

          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          // Admin Panel Power-up — Ban করা ইউজার login করতে পারবে না।
          if (user.isBanned) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            authVersion: user.authVersion,
          };
        } catch (err) {
          console.error("Auth authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Ignore URL parse error
      }
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.authVersion = (user as { authVersion?: number }).authVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "STUDENT";
        session.user.authVersion = Number(token.authVersion ?? 0);
      }
      return session;
    },
  },
});
