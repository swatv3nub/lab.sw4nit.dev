import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SW4NIT LAB — Security Research",
  description: "Security research and detection-engineering lab for evidence-backed investigation.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
