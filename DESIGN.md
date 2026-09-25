---
name: SW4NIT LAB
description: Editorial interface for evidence-led security research workflows.
colors:
  ink: "#11110f"
  ground: "#0b0b0a"
  panel: "#121210"
  line: "#2b2a26"
  soft-line: "#20201d"
  paper: "#f0ede5"
  muted: "#aaa59c"
  dim: "#89837a"
  orange: "#ff5a26"
  orange-soft: "#ff9a75"
typography:
  display:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "clamp(3.6rem, 7.4vw, 7.8rem)"
    fontWeight: 500
    lineHeight: 0.91
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3.8rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.1em"
rounded:
  hard-edge: "0"
  status-dot: "50%"
spacing:
  shell-gutter: "64px"
  section: "92px"
  mobile-shell-gutter: "40px"
  mobile-section: "68px"
components:
  sign-in-option:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.hard-edge}"
    padding: "15px 18px"
  text-link:
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.hard-edge}"
    padding: "0 0 7px"
---

# Design System: SW4NIT LAB

## Overview

**Creative North Star: "The Evidence Ledger"**

SW4NIT LAB is an Operate-mode editorial research tool. It treats each view as a calm, inspectable sequence: a strong statement of purpose, compact system labels, then evidence and service context separated by thin horizontal rules. High information density comes from alignment and type contrast rather than panels, charts, or ornamental controls.

The system is deliberately dark but not cyberpunk. Warm paper copy carries the reading surface; orange is reserved for evidence, system markers, and active state. It uses the real absence of verified service data as a first-class state rather than filling the interface with inferred records or metrics.

**Key Characteristics:**

- Near-black research surface with warm, paper-like text.
- Large, tightly tracked sans headlines against compact mono metadata.
- Hard-edged rows and frames governed by thin rules.
- Orange used as a scarce operational cue, not ambient decoration.

## Colors

The palette is a warm dark field with one evidence-colored accent and a restrained hierarchy of paper, muted, and dim text.

### Primary

- **Evidence Orange:** marks section codes, active navigation, stage indices, online confirmation, and the underlined investigation link.
- **Soft Evidence Orange:** supports online-state type, descriptive mono copy, hover/focus treatment, and the account link.

### Neutral

- **Research Ground:** the page field and base scroll surface.
- **Inset Panel:** the sign-in frame’s only tonal surface.
- **Paper:** high-emphasis reading and navigation text.
- **Muted and Dim Text:** explanatory copy and lower-priority system detail.
- **Rules:** the standard and softer separators that construct hierarchy without card elevation.

**The Evidence Scarcity Rule.** Orange is a functional system signal. Keep the large reading areas dark and paper-led; do not turn the accent into a broad surface fill or a neon glow treatment.

## Typography

**Display Font:** IBM Plex Sans
**Body Font:** IBM Plex Sans
**Label/Mono Font:** DM Mono

**Character:** IBM Plex Sans gives the interface its calm editorial voice, while DM Mono makes states, routes, stages, and small navigation feel technical and traceable. The difference in family and tracking does more hierarchy work than changes in color alone.

### Hierarchy

- **Display:** tight, balanced, large-scale IBM Plex Sans for page-level statements and workspace titles.
- **Headline:** compact IBM Plex Sans for section-level questions and empty-state assertions.
- **Body:** regular IBM Plex Sans for service explanation, policy context, and readable empty-state copy.
- **Label:** uppercase, tracked DM Mono for section codes, navigation, status text, identity metadata, and action labels.

**The Label-to-Statement Rule.** Introduce a content block with a small mono code, then let the adjacent sans headline carry the human-readable meaning.

## Layout

The shell is centered and capped at 1480px, with a 64px desktop gutter. The overview begins with a two-column statement/context composition, then proceeds through full-width ruled sections. Section headings align a compact label column with the main headline column; pipeline rows use index, stage, and detail columns to make the investigation sequence scannable.

At 760px and below, the shell shifts to a 40px gutter. Header navigation becomes its own ruled row; the introductory, signal, heading, and empty-record compositions collapse to a single column; pipeline rows retain their index but move the detail beneath the stage. Section rhythm reduces while preserving the sequence and rule structure.

## Elevation & Depth

This is a flat system. Depth comes from near-black tonal contrast, thin boundaries, and breathing room, not box shadows or floating rounded cards. The sole observed glow is the online status ring, where it reinforces confirmed service state rather than raising a surface.

**The Rule-First Depth Rule.** Use a one-pixel horizontal rule to separate stages, states, and frames before introducing a new surface. The sign-in frame is the exception: it is a bounded inset panel with a border and a subtly lighter ground.

## Shapes

Surfaces, links, buttons, rows, and frames are hard-edged. Borders are thin and squared; the only circular form is the small service-status indicator. This keeps the interface closer to an editorial research ledger than a consumer SaaS dashboard.

## Components

### Navigation

The header is a three-part grid: brand at left, centered mono navigation, and account action at right. Navigation is uppercase, tracked, and muted at rest. The active route receives a paper text shift and a one-pixel orange underline; hover uses the same paper emphasis.

### Text Links

The primary inline action is an uppercase mono link with a small directional arrow, a seven-pixel lower gap, and an orange bottom rule. Hover changes the text to soft orange without adding a filled button treatment.

### Pipeline Rows

Each research stage is a bordered row with a two-digit orange index, a sans stage name, a soft-orange mono question, and a muted right-aligned explanatory detail. This row is the signature sequencing pattern for the research flow.

### Service State

Service state is a compact mono line with an eight-pixel dot. Confirmed online state uses the accent dot with a restrained surrounding ring; unavailable and unconfigured states remain muted. This component represents actual service status and must not imply health data that was not returned.

### Empty Records

Unavailable records are two columns of muted, bounded reading copy between top and bottom rules. The pattern makes the absence explicit without a promotional illustration, fake table, or fabricated statistic.

### Sign-in Options

Provider actions are full-width, left-aligned, uppercase mono buttons with a thin rule and a transparent background. Hover shifts only the border and background slightly toward the accent; focus remains visible in soft orange.

## Do's and Don'ts

### Do:

- **Do** use the label-to-statement sequence to explain the workflow and each system boundary.
- **Do** let horizontal rules, column alignment, and tonal text hierarchy carry density.
- **Do** reserve orange for evidence, active, focus, and verified online-state cues.
- **Do** state unavailable, unconfigured, and pending data honestly.
- **Do** preserve the single-column mobile reading order and visible keyboard focus.

### Don't:

- **Don't** add generic SaaS card grids, decorative charts, fabricated metrics, or simulated investigation records.
- **Don't** introduce neon, hacker/cyberpunk motifs, glass effects, or broad orange glows.
- **Don't** soften the system with rounded containers or pill controls.
- **Don't** expose a private service boundary as if the browser directly accessed it.
