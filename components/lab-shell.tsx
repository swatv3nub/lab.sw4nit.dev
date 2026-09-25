import Link from "next/link";
import type { Session } from "next-auth";

type LabShellProps = {
  active: "overview" | "orion";
  children: React.ReactNode;
  user?: Session["user"];
};

export function LabShell({ active, children, user }: LabShellProps) {
  return (
    <div className="lab-shell">
      <header className="site-header">
        <Link className="brand" href="/">SW4NIT <span>LAB</span></Link>
        <nav aria-label="Lab navigation">
          <Link className={active === "overview" ? "is-active" : ""} href="/">Overview</Link>
          <Link href="/#pipeline">Research flow</Link>
          <Link className={active === "orion" ? "is-active" : ""} href="/orion">ORION</Link>
        </nav>
        <Link className="account-link" href={user ? "/orion" : "/sign-in"}>{user ? user.role ?? "viewer" : "Sign in"}</Link>
      </header>
      {children}
      <footer className="site-footer">
        <span>SW4NIT LAB / RESEARCH SYSTEMS</span>
        <span>PUBLIC LAYER · PRIVATE SERVICES</span>
      </footer>
    </div>
  );
}
