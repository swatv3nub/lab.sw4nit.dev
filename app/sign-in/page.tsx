import Link from "next/link";
import { SignInOptions } from "@/components/sign-in-options";
import { getConfiguredProviders } from "@/lib/auth-config";

type SignInPageProps = { searchParams: Promise<{ callbackUrl?: string }> };

// OAuth credentials are runtime-only container configuration, never build-time page data.
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = callbackUrl?.startsWith("/") ? callbackUrl : "/orion";

  return (
    <main className="sign-in-page">
      <div className="sign-in-frame">
        <Link className="brand" href="/">SW4NIT <span>LAB</span></Link>
        <h1>Enter workspace.</h1>
        <p className="sign-in-copy">Choose a sign-in method.</p>
        <SignInOptions providers={getConfiguredProviders()} callbackUrl={safeCallbackUrl} />
      </div>
    </main>
  );
}
