# Cosmic Origins — Redesign Brief for Claude Fable 5

## ROLE
You are a senior front-end engineer and UI/UX designer specializing in data-dense, sci-fi themed dashboards. You are redesigning **"Cosmic Origins"** — a unified data hub of the known universe for astronomy enthusiasts and researchers.

## THE PAGE'S SINGLE JOB
Build an immersive, seamless single-page dashboard where a user can fluidly **filter, search, browse, and read deep telemetry** on cosmic objects (galaxies, nebulae, exoplanets, clusters, stars, solar system bodies, exotic objects).

## REFERENCE ANALYSIS (from provided screenshots)
Carry over the *structure*, discard the *skin*:
- **Keep:** fixed left sidebar (brand logo, nav: Home / Gallery / Login / Register, a theme toggle, a menu trigger), a header search bar with pill-style category filters (All, Galaxies, Nebulae, Clusters, Stars, Exoplanets, Solar System, Exotic), a multi-column image card grid (image + title + type tag + favorite/star counter), and an expandable hero/detail viewer for deep-dive reading with a slide-out secondary panel (related object thumbnails).
- **Discard:** the handwritten/comic-style typography, the flat "stamp" menu icon, the plain charcoal card boxes, and the disconnected collapse control.

## KNOWN BUGS TO FIX (do not repeat these)
- **B:** The sidebar's "collapse" button is non-functional (doesn't collapse anything) and visually orphaned — it needs a real purpose, a docked position, and a control that clearly belongs to the sidebar it operates on.
- **C:** The "MENU" trigger currently opens a slide-out panel that feels like a foreign overlay bolted onto the design, not a native part of it. The redesigned menu/nav system must feel like one continuous interface, sharing the same visual language (materials, motion, corner treatment, iconography) as the rest of the shell.

## VISUAL DIRECTION
"Authentic digital cockpit / astronomical telemetry system" — not generic AI dashboard defaults.
- Deep-space dark canvas retained, but avoid flat charcoal boxes and avoid blinding flat neon-on-black. Build depth with layered gradients, subtle vignettes, glass/panel materials, and restrained glow (borders, focus states, active pills) rather than oversaturated neon everywhere.
- Typography: replace handwritten/comic fonts entirely with a crisp, geometric or monospace sans-serif hierarchy that reads like scientific/telemetry readouts (e.g., think mission-control HUD labels, coordinate readouts, data tags).
- Cards, panels, and pills should feel like instrument modules — with corner brackets, thin hairline borders, subtle scan-line or grid textures, and glow that responds to state (hover/active/selected), not just decoration.
- **Signature element requirement:** propose one unique, memorable visual/interactive signature for this specific redesign (not a generic dashboard cliché) that ties the whole experience together.

## MOTION & ATMOSPHERE (constraint A)
The app should feel alive and spatial, not static — but restrained, not distracting:
- Use subtle ambient motion to evoke depth of space: e.g., a slow drifting starfield, faint parallax on background layers, or a light WebGL/three.js canvas backdrop (twinkling stars, slow nebula drift, gentle particle field) sitting behind the UI at low opacity.
- Motion should support immersion, not compete with data legibility — favor slow, low-amplitude, ambient loops over anything fast or attention-grabbing.
- Interactive transitions (opening a detail view, switching filters, expanding the sidebar) should feel smooth and physical — not abrupt swaps.
- If using three.js/WebGL, keep it performant and gracefully degradable (a CSS-only starfield fallback is acceptable if it keeps the deliverable clean).

## TECHNICAL CONSTRAINTS
- Stack: pure HTML, CSS, JavaScript, and Bootstrap 5 (no build tooling/frameworks beyond that; three.js/WebGL may be included via CDN script tag if used for the ambient background).
- Imagery: since no real image assets are provided, render elegant placeholder frames/blocks designed to *host* high-resolution space photography (e.g., labeled aspect-ratio containers with a subtle loading/placeholder treatment) rather than broken image tags.
- Interactivity to implement:
  - Working filter pills with clear active/inactive states (multi-select, "All" toggling the rest).
  - A functional, smoothly animated sidebar collapse/expand (fixing bug B) with the trigger docked sensibly to the sidebar itself.
  - A redesigned menu system (fixing bug C) that opens/closes using the same visual language as the shell (materials, corner treatment, motion curve) — not a mismatched overlay.
  - Smooth transition into an expandable hero/detail viewer for reading full object telemetry, with a related-items panel.
  - Custom-styled data metrics (favorite/star counts, object type tags, classification badges).

## REQUIRED WORKFLOW — DO NOT SKIP STEPS
This is a staged process. Complete each step and **stop** to wait for my go-ahead before proceeding to the next.

**Step 1 — Design Plan (no code yet).**
Present:
1. Color palette (with hex values and their role: background layers, glow/accent, text hierarchy, state colors).
2. Typography system (font choices/stacks, and where each weight/size is used).
3. An ASCII wireframe of the full layout (sidebar + header/filter bar + card grid + expanded detail view state).
4. Your proposed **signature element** — the one distinctive visual/interactive idea that makes this redesign memorable, explained in a few sentences.
5. Your specific plan for fixing bug B (collapse) and bug C (menu), and your approach to the ambient space motion (constraint A).

**Step 2 — Self-Critique Against Generic Defaults.**
Cross-check your own plan honestly: identify anything that risks looking like a generic AI-generated dashboard template (default Bootstrap card look, stock neon-on-black cliché, cookie-cutter sidebar, overused icon set, etc.), and revise those specific points. Show the "before" (generic risk) and "after" (your fix) briefly.

**Step 3 — Wait for Green Light.**
Explicitly stop after Steps 1–2 and ask me to confirm before writing any code. Do not generate the HTML/CSS/JS until I respond with approval.

**Step 4 — Production Code (only after approval).**
Deliver complete, clean, production-ready HTML/CSS/JS (Bootstrap 5 + optional three.js CDN), fully commented in the CSS for the design-system values (colors, spacing, motion timing), with the sidebar collapse and menu system fully functional.

Begin with **Step 1** now.