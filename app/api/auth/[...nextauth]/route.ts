import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const authHandler = NextAuth(authOptions);
const sessionCookie = /^(?:__Secure-)?next-auth\.session-token(?:\.\d+)?=.+/;

function isActiveSessionCookie(cookie: string) {
  return sessionCookie.test(cookie.split(";", 1)[0]);
}

function asBrowserSession(response: Response) {
  const cookies = response.headers.getSetCookie();
  if (!cookies.some(isActiveSessionCookie)) return response;

  const headers = new Headers(response.headers);
  headers.delete("set-cookie");

  for (const cookie of cookies) {
    // Auth.js v4 otherwise sets an Expires value for JWT sessions. Retain every
    // security attribute, but make active session-token cookies browser-scoped.
    const browserScopedCookie = isActiveSessionCookie(cookie)
      ? cookie.replace(/;\s*(?:Expires=[^;]*|Max-Age=[^;]*)/gi, "")
      : cookie;
    headers.append("set-cookie", browserScopedCookie);
  }

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText
  });
}

async function handler(...args: Parameters<typeof authHandler>) {
  return asBrowserSession(await authHandler(...args));
}

export { handler as GET, handler as POST };
