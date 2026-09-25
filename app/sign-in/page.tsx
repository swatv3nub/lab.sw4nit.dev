import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInOptions } from "@/components/sign-in-options";
import { getConfiguredProviders } from "@/lib/auth-config";
import { getServerSession } from "@/lib/session";

type SignInPageProps = { searchParams: Promise<{ callbackUrl?: string }> };

// OAuth credentials are runtime-only container configuration, never build-time page data.
export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ callbackUrl }, session] = await Promise.all([searchParams, getServerSession()]);
  const safeCallbackUrl = callbackUrl?.startsWith("/") ? callbackUrl : "/orion";

  if (session?.user) {
    redirect(safeCallbackUrl);
  }

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
