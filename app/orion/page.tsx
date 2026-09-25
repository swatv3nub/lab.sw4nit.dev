import { redirect } from "next/navigation";
import { LabShell } from "@/components/lab-shell";
import { getServerSession } from "@/lib/session";
import { getOrionHealth } from "@/lib/orion";

export const dynamic = "force-dynamic";

export default async function OrionWorkspacePage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/orion");
  }

  const health = await getOrionHealth();

  return (
    <LabShell active="orion" user={session.user}>
      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="section-code">ORION / INVESTIGATION WORKSPACE</p>
            <h1>Investigation queue</h1>
          </div>
          <p className="identity">Signed in as {session.user.email ?? session.user.name ?? "analyst"}<br /><span>{session.user.role}</span></p>
        </header>

        <section className="workspace-status" aria-label="ORION connection status">
          <p className={`service-state service-state--${health.state}`}><span aria-hidden="true" /> {health.label}</p>
          <p>{health.detail}</p>
        </section>

        <section className="workspace-empty" aria-labelledby="workspace-empty-title">
          <p className="section-code">SCHEMA-AWARE VIEW PENDING</p>
          <h2 id="workspace-empty-title">No investigation fields are rendered from an assumed contract.</h2>
          <p>
            The authenticated server-side proxy is ready for the documented ORION endpoints. Add ORION’s OpenAPI document or a verified response sample to map investigations, evidence, hypotheses, unresolved questions, and analyst reports without reinterpretation.
          </p>
        </section>
      </main>
    </LabShell>
  );
}
