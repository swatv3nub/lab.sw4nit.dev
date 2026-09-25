import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { role: "viewer" | "analyst" | "admin" };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "viewer" | "analyst" | "admin";
  }
}
