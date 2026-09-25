import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { getConfiguredProviders, roleForEmail } from "@/lib/auth-config";

const configuredProviders = getConfiguredProviders();

export const authOptions: NextAuthOptions = {
  providers: [
    ...(configuredProviders.includes("google")
      ? [GoogleProvider({ clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!, clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET! })]
      : []),
    ...(configuredProviders.includes("github")
      ? [GitHubProvider({ clientId: process.env.GITHUB_OAUTH_CLIENT_ID!, clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET!, authorization: { params: { scope: "read:user user:email" } } })]
      : [])
  ],
  secret: process.env.SESSION_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.role = roleForEmail(user.email);
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = (token.role as "viewer" | "analyst" | "admin") ?? "viewer";
      return session;
    }
  }
};
