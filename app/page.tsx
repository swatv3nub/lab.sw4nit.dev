import Link from "next/link";
import { LabShell } from "@/components/lab-shell";
import { Pipeline } from "@/components/pipeline";
import { getOrionHealth } from "@/lib/orion";
import { getServerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [health, session] = await Promise.all([getOrionHealth(), getServerSession()]);
  const workspaceNote = health.state === "online"
    ? "Authenticated workspace · live service state confirmed"
    : "Authenticated workspace · service availability shown on entry";

  return (
    <LabShell active="overview" user={session?.user}>
      <main className="overview">
        <section className="intro" aria-labelledby="overview-title">
          <p className="section-code">LAB / OVERVIEW</p>
          <div className="intro-grid">
            <h1 id="overview-title">Security research,<br />connected to evidence.</h1>
            <div className="intro-context">
              <p>
                SW4NIT LAB is the application layer for reconnaissance, correlation, and investigation.
                The workflow is presented here; ORION remains the independent reasoning service behind it.
              </p>
              <Link className="text-link" href="/orion">Open investigation workspace <span aria-hidden="true">→</span></Link>
              <p className="workspace-note">{workspaceNote}</p>
            </div>
          </div>
        </section>

        <Pipeline />

        <section className="signal-section" aria-labelledby="orion-signal-title">
          <div className="section-heading">
            <p className="section-code">ORION / SERVICE SIGNAL</p>
            <h2 id="orion-signal-title">Investigation readiness</h2>
          </div>
          <div className="signal-row">
            <div>
              <p className={`service-state service-state--${health.state}`}>
                <span aria-hidden="true" /> {health.label}
              </p>
              <p className="signal-copy">{health.detail}</p>
            </div>
            <div className="signal-note">
              <span>DATA BOUNDARY</span>
              <p>ORION is contacted only from the Next.js server. No upstream address or credential enters the browser bundle.</p>
            </div>
          </div>
        </section>

        <section className="records-section" aria-labelledby="records-title">
          <div className="section-heading">
            <p className="section-code">ORION / INVESTIGATIONS</p>
            <h2 id="records-title">Recent investigation record</h2>
          </div>
          <div className="empty-records" role="status">
            <p>No live investigation records are displayed on this public overview until ORION’s response contract is available to the application.</p>
            <p>Analysts can use the authenticated workspace once access and the verified contract are configured. No investigation fields or activity are being inferred here.</p>
          </div>
        </section>
      </main>
    </LabShell>
  );
}
