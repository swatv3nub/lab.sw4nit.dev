"use client";

import { signIn } from "next-auth/react";

type Provider = "google" | "github";

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg className="provider-mark provider-mark--google" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.5-4.1H3.2v2.6A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.5 13.9a6 6 0 0 1 0-3.8V7.5H3.2A10 10 0 0 0 3.2 16l3.3-2.1Z" />
        <path fill="#EA4335" d="M12 6.1c1.6 0 3 .5 4.1 1.6l3-3A10 10 0 0 0 3.2 7.5l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1Z" />
      </svg>
    );
  }

  return (
    <svg className="provider-mark provider-mark--github" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1.2a10.8 10.8 0 0 0-3.4 21.1c.5.1.7-.2.7-.5v-2.1c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10.8 10.8 0 0 0 12 1.2Z" />
    </svg>
  );
}

export function SignInOptions({ providers, callbackUrl }: { providers: Provider[]; callbackUrl: string }) {
  if (providers.length === 0) {
    return <p className="auth-notice">Sign-in is not configured in this environment. Add a Google or GitHub OAuth client configuration on the server.</p>;
  }

  return (
    <div className="sign-in-options">
      {providers.map((provider) => (
        <button key={provider} type="button" onClick={() => signIn(provider, { callbackUrl })}>
          <ProviderMark provider={provider} />
          Continue with {provider === "google" ? "Google" : "GitHub"}
        </button>
      ))}
    </div>
  );
}
