# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js with TypeScript and the App Router. The application uses Route Handlers for server-side integration, Auth.js for authentication, CSS modules and global CSS for styling, Docker for the production application container, and nginx as the public reverse-proxy boundary.

## Users

Security engineers and analysts inspecting the lab's research workflow and ORION investigations. Recruiters and technical peers are a secondary audience who need to understand the lab's real architecture without being presented fabricated activity.

## Product Purpose

SW4NIT LAB is the presentable application layer for a security research and detection-engineering workflow: reconnaissance with Reconix, normalized execution with Reconix Cloud, correlation in ThreatLens, investigation in ORION, and an Analyst Report. It should reveal the lab itself, not operate as a separate marketing façade or duplicate ORION's reasoning service.

## Positioning

The product makes a real, bounded investigation workflow legible from discovery through an evidence-backed ORION assessment while keeping the underlying services private.

## Operating Context

Visitors enter through the Lab Overview. Authenticated users can access protected investigation workflows. The browser talks only to Next.js; server-side handlers proxy approved requests to the private ORION upstream. ORION remains an independent remote HTTP service.

## Capabilities and Constraints

- The stack is Next.js, TypeScript, App Router, Route Handlers, and a lightweight CSS system.
- `ORION_UPSTREAM` is server-only. The browser must never receive it or directly call `http://orion:8000`.
- OAuth credentials, session secrets, and all service credentials remain server-only. GitHub OAuth is identity-only, with no repository or organization scopes.
- Roles are `viewer`, `analyst`, and `admin`; the initial default role is `viewer` until a server-side role source is configured.
- The public surface must not expose arbitrary scanning, internal Reconix/ThreatLens APIs, ORION service ports, or credentials.
- ORION response fields must be read from its real contract; no investigation metrics or records may be fabricated.

## Brand Commitments

Preserve the existing SW4NIT LAB identity: a dark technical interface with restrained orange emphasis, strong typography, thin boundaries, high information density, and an editorial research-tool character. Avoid generic SaaS dashboards, hacker/cyberpunk styling, neon, decorative charts, and excessive rounded or glassy containers.

## Evidence on Hand

The repository contains a static placeholder page describing Reconix, Reconix Cloud, ThreatLens, and the future lab. No ORION OpenAPI document, sample response, OAuth credential, live investigation data, or deployment configuration is present. Future UI must represent unavailable, empty, loading, and error states honestly.

## Product Principles

- Make the investigation chain understandable at first glance.
- Prove system state from real service responses; never simulate operational data.
- Preserve strict browser/server and public/private boundaries.
- Support disciplined analyst work before adding surface-level features.
- Make technical depth approachable without reducing it to marketing language.

## Accessibility & Inclusion

Provide accessible contrast, keyboard-operable controls, visible focus states, reduced-motion support, and responsive desktop/mobile layouts.
