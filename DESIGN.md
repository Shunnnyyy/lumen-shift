# Urban Field Instrument Design System

## 01. Reference Direction

This project uses a practical field-instrument style inspired by IBM Carbon Design System, Figma dashboard templates, and monochrome grid editorial layouts. The goal is not to look like a generic SaaS site. It should feel like a personal urban observation tool: measured, quiet, technical, and visual.

Reference links:

- IBM Carbon Design System Figma kits: https://carbondesignsystem.com/designing/kits/figma/
- Figma dashboard templates: https://www.figma.com/templates/dashboard-designs/
- Maps UI kits reference: https://figmaelements.com/ui-kits/maps/

## 02. Palette

- Paper: `#f7f7f2`
- Ink: `#080808`
- Muted ink: `rgba(8, 8, 8, 0.62)`
- Rule line: `rgba(8, 8, 8, 0.22)`
- Warning / decision accent: `#5f1518`
- Night accent for linked projects: `#d8ff6a`

Use black, off-white, and thin rules as the base. Accent colors should appear only where a state, warning, current, or decision needs attention.

## 03. Typography

- Primary: IBM Plex Sans
- Technical labels: IBM Plex Mono
- Headings: heavy, compact, left-aligned
- Body: 1.55 to 1.75 line-height
- Labels: small uppercase mono, but only for short metadata

Avoid centered paragraphs and long all-caps text.

## 04. Components

- Navigation: thin bordered tabs, horizontally scrollable on mobile.
- Buttons: square edges, clear primary/secondary contrast, visible focus ring.
- Data rows: left-aligned, hover should reveal a current or decision state.
- Panels: use borders and spacing before shadows.
- Cards: only for clickable project links, repeated records, or tool panels.

## 05. Motion

Motion should explain flow:

- Field current: slow line movement connecting related parts.
- Response pulse: click or movement-triggered feedback.
- Load shift: horizontal motion showing timing changes.

Do not animate every object. Respect `prefers-reduced-motion`.

## 06. UX Rule

Each page should answer one practical question:

- NOCTIS: What did I observe?
- Lumen Shift: What response could fit this place?
- SmartEnergy: What timing/cost pattern does this suggest?
- Power in Practice: What did the whole study teach me?
