# Fluid Motion Design Spec

Date: 2026-06-13

## Goal

Add more nonlinear animation and fluid scheduling behavior across the four connected project websites without making them look like generic AI-made tech demos. Motion should support the project idea: field observation becomes data, data becomes scheduling, scheduling becomes a response, and the response becomes reflection.

## Chosen Direction

Use **Field Current System** as the main direction.

The visual language should stay monochrome, grid-based, calm, and notebook-like. Motion should feel like current moving through a city system: slow line drift, responsive pulses, subtle rerouting, and useful scheduling movement. Lumen Shift can be slightly more electric because it is the prototype/testing site. SmartEnergy can be more operational because it is the dashboard. NOCTIS and Power in Practice should stay more restrained.

## Site Roles

### NOCTIS

NOCTIS is the field capture layer. Animation should support location, mapping, and attention.

Add subtle map-current behavior:
- map points breathe gently;
- active points create a small ripple;
- the field workflow line feels alive but quiet;
- cursor movement can slightly bend the visual field on the home page.

Avoid heavy explosions or bright neon because NOCTIS should feel like a serious field archive.

### Lumen Shift

Lumen Shift is the response tester. It should have the most expressive motion.

Add nonlinear response behavior:
- clicking `Trigger movement` creates a short electric pulse on the canvas;
- simulator changes should feel like brightness is being redistributed, not just changed;
- field log lux bars can animate in a staggered way;
- selected NOCTIS points can cause a small rerouting signal between map, simulator, and prompt.

The animation should be visible but still controlled. It should show adaptive lighting logic.

### SmartEnergy

SmartEnergy is the scheduling and efficiency checker.

Add fluid scheduling behavior:
- scenario changes animate load movement across time blocks;
- usage sliders update the energy bars with a smooth reroute feeling;
- the dashboard can show a small "load shift" strip that explains what moved from peak to off-peak;
- motion should help users understand cost and timing, not decorate the page.

This site should connect most strongly to Industrial Engineering and Systems Design Engineering.

### Power in Practice

Power in Practice is the synthesis and reflection layer.

Add restrained motion:
- background circuit lines drift slowly;
- section entries can feel like notes being organized;
- connected project cards can show a soft current line on hover;
- avoid adding complex controls here.

Power in Practice should feel mature and reflective.

## Interaction Rules

Motion must have meaning:
- pulse means movement or response;
- flow means data or electricity being routed;
- shift means schedule/cost redistribution;
- ripple means selected field evidence.

Motion should not block reading. Essential information must stay visible without hover. All interactive effects should have a calm default state and must not cause layout shift.

## Accessibility and Performance

Use CSS transitions, SVG stroke animation, and existing canvas where possible. Avoid adding heavy 3D or large dependencies.

Respect reduced motion:
- if `prefers-reduced-motion: reduce` is active, disable looping motion and keep only instant state changes;
- do not rely on animation alone to communicate meaning.

Keep mobile as a primary surface:
- no tiny hover-only interactions;
- tap states should be readable;
- controls must not overlap fixed nav.

## Implementation Scope

This is one focused upgrade pass, not a redesign.

In scope:
- Lumen Shift canvas pulse and field log motion;
- SmartEnergy load-shift strip or scenario motion;
- NOCTIS subtle map/workflow current;
- Power in Practice soft current hover/entry polish;
- build and screenshot verification for desktop and mobile.

Out of scope:
- paid APIs;
- Gemini account automation;
- new database schema;
- new hardware sections;
- full 3D/WebGL rewrite.

## Testing Plan

Run production builds for the React/Vite/Next sites and JavaScript syntax checks for NOCTIS.

Check:
- desktop screenshots for all four sites;
- mobile screenshots for all four sites;
- no title, nav, or panel overlap;
- reduced-motion CSS exists for new looping animation;
- project links still work;
- Vercel live pages update after push.

## Success Criteria

The finished version should feel more alive and more useful. A viewer should understand that the project is about observing real places, comparing light and energy patterns, and testing practical responses. The motion should be interesting, but the work should still feel personal, believable, and clean.
