export type Role = "viewer" | "analyst" | "admin";
export type OAuthProvider = "google" | "github";

function emailsFrom(name: "LAB_ANALYST_EMAILS" | "LAB_ADMIN_EMAILS") {
  return new Set((process.env[name] ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

export function roleForEmail(email?: string | null): Role {
  const normalized = email?.toLowerCase();
  if (!normalized) return "viewer";
  if (emailsFrom("LAB_ADMIN_EMAILS").has(normalized)) return "admin";
  if (emailsFrom("LAB_ANALYST_EMAILS").has(normalized)) return "analyst";
  return "viewer";
}

export function getConfiguredProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET) providers.push("google");
  if (process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET) providers.push("github");
  return providers;
}
