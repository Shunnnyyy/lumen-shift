# Fluid Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add meaningful nonlinear motion and fluid scheduling across the four connected urban light and energy sites.

**Architecture:** Keep the current four independent repos and add small, scoped motion layers inside each site. Use existing canvas/SVG/CSS/Framer Motion patterns instead of new heavy dependencies. Each animation must encode a project action: field ripple, light response, load shifting, or synthesis current.

**Tech Stack:** Vanilla JS + CSS in Lumen Shift and NOCTIS; React/Vite + Framer Motion/Recharts in SmartEnergy; Next.js + Framer Motion/Tailwind/CSS in Power in Practice.

---

### Task 1: Lumen Shift Nonlinear Response

**Files:**
- Modify: `/Users/yashi/Documents/New project 4/src/main.js`
- Modify: `/Users/yashi/Documents/New project 4/src/styles.css`

- [ ] **Step 1: Add a canvas pulse field**

Add an array of response pulses near the existing `sparks` array:

```js
const responsePulses = [];
```

Add a helper after `createBurst`:

```js
function createResponsePulse(x = pointerX, y = pointerY, strength = 1) {
  responsePulses.push({
    x,
    y,
    age: 0,
    life: 90,
    strength,
  });
}
```

- [ ] **Step 2: Draw nonlinear pulse rings**

Inside `drawScene`, after the street/particle drawing but before the final `requestAnimationFrame`, draw each pulse:

```js
for (let index = responsePulses.length - 1; index >= 0; index -= 1) {
  const pulse = responsePulses[index];
  pulse.age += 1;
  const progress = pulse.age / pulse.life;
  const eased = 1 - Math.pow(1 - progress, 3);
  const radius = eased * Math.min(width, height) * 0.42 * pulse.strength;
  const alpha = Math.max(0, 1 - progress);
  ctx.save();
  ctx.strokeStyle = `rgba(247, 247, 242, ${0.42 * alpha})`;
  ctx.lineWidth = 1 + 2 * alpha;
  ctx.beginPath();
  ctx.arc(pulse.x * width, pulse.y * height, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(216, 255, 106, ${0.28 * alpha})`;
  ctx.beginPath();
  ctx.arc(pulse.x * width, pulse.y * height, radius * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  if (pulse.age >= pulse.life) responsePulses.splice(index, 1);
}
```

- [ ] **Step 3: Trigger pulses from meaningful actions**

Call `createResponsePulse` inside the `pulseButton` click handler and `selectMapRecord`:

```js
createResponsePulse(pointerX, pointerY, 1.1);
```

For map selection:

```js
createResponsePulse(parseFloat(reading.x) / 100 || 0.5, parseFloat(reading.y) / 100 || 0.5, 0.85);
```

- [ ] **Step 4: Animate field log bars with staggered current**

Add CSS animation to `.lux-pattern__track i` and respect reduced motion:

```css
.lux-pattern__track i {
  animation: lux-current 3.8s ease-in-out infinite;
  animation-delay: calc(var(--row-index, 0) * 120ms);
}

@keyframes lux-current {
  0%, 100% { filter: none; }
  50% { filter: drop-shadow(0 0 8px rgba(8, 8, 8, 0.22)); }
}

@media (prefers-reduced-motion: reduce) {
  .lux-pattern__track i {
    animation: none;
  }
}
```

Set `--row-index` in the lux row template.

- [ ] **Step 5: Verify Lumen**

Run:

```bash
cd "/Users/yashi/Documents/New project 4"
npm run build
```

Expected: Vite build completes successfully.

---

### Task 2: SmartEnergy Fluid Scheduling Strip

**Files:**
- Modify: `/Users/yashi/Documents/New project 2/src/main.jsx`
- Modify: `/Users/yashi/Documents/New project 2/src/style.css`

- [ ] **Step 1: Add a scheduling strip component**

Create `LoadShiftStrip` in `src/main.jsx` near `ScenarioPresets`:

```jsx
function LoadShiftStrip({ model }) {
  const segments = [
    ['Off-Peak', model.offPeakPercent, '#16A34A'],
    ['Mid-Peak', model.midPeakPercent, '#F59E0B'],
    ['On-Peak', model.onPeakPercent, '#EF4444'],
  ];

  return (
    <section className="load-shift-strip" aria-label="Fluid load scheduling">
      <div>
        <p className="label blue-text">Fluid scheduling</p>
        <h3>Load moves across time, not just cost.</h3>
      </div>
      <div className="load-flow" aria-hidden="true">
        {segments.map(([label, value, color]) => (
          <span key={label} style={{ '--flow-size': `${Math.max(8, value)}%`, '--flow-color': color }}>
            <i />
            <b>{label}</b>
            <em>{value}%</em>
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Render it in Dashboard**

Place it after `ScenarioPresets`:

```jsx
<LoadShiftStrip model={model} />
```

- [ ] **Step 3: Style fluid load segments**

Add CSS:

```css
.load-shift-strip {
  display: grid;
  grid-template-columns: minmax(220px, .45fr) minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  margin-bottom: 18px;
  padding: 16px 0;
  border-top: 1px dashed rgba(15,23,42,.16);
  border-bottom: 1px solid rgba(15,23,42,.08);
}

.load-shift-strip h3 {
  margin: 6px 0 0;
  font-size: 18px;
}

.load-flow {
  display: flex;
  min-height: 54px;
  overflow: hidden;
  border: 1px solid rgba(15,23,42,.08);
  border-radius: 8px;
  background: rgba(255,255,255,.64);
}

.load-flow span {
  position: relative;
  flex: 0 0 var(--flow-size);
  min-width: 72px;
  display: grid;
  align-content: center;
  gap: 2px;
  padding: 10px 12px;
  border-right: 1px solid rgba(15,23,42,.08);
  transition: flex-basis 520ms cubic-bezier(.22, 1, .36, 1);
}

.load-flow span:last-child {
  border-right: 0;
}

.load-flow i {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--flow-color), transparent);
  opacity: .14;
  transform: translateX(-60%);
  animation: load-current 4.8s ease-in-out infinite;
}

.load-flow b,
.load-flow em {
  position: relative;
}

.load-flow b {
  font-size: 11px;
  font-weight: 850;
}

.load-flow em {
  color: #64748B;
  font-style: normal;
  font-size: 12px;
}

@keyframes load-current {
  0%, 100% { transform: translateX(-65%); }
  50% { transform: translateX(65%); }
}

@media (max-width: 900px) {
  .load-shift-strip {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .load-flow span,
  .load-flow i {
    transition: none;
    animation: none;
  }
}
```

- [ ] **Step 4: Verify SmartEnergy**

Run:

```bash
cd "/Users/yashi/Documents/New project 2"
npm run build
```

Expected: Vite build completes successfully.

---

### Task 3: NOCTIS Field Current

**Files:**
- Modify: `/Users/yashi/Coding/noctis/style.css`

- [ ] **Step 1: Add breathing map points and workflow current**

Add CSS:

```css
.workflow-strip i {
  position: relative;
  overflow: hidden;
}

.workflow-strip i::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  transform: translateX(-100%);
  animation: noctis-workflow-current 4.2s ease-in-out infinite;
}

.map-marker,
.leaflet-marker-icon {
  animation: noctis-point-breathe 3.6s ease-in-out infinite;
}

@keyframes noctis-workflow-current {
  0%, 100% { transform: translateX(-100%); opacity: .2; }
  50% { transform: translateX(100%); opacity: .75; }
}

@keyframes noctis-point-breathe {
  0%, 100% { filter: none; }
  50% { filter: drop-shadow(0 0 12px rgba(216, 255, 106, .32)); }
}

@media (prefers-reduced-motion: reduce) {
  .workflow-strip i::after,
  .map-marker,
  .leaflet-marker-icon {
    animation: none;
  }
}
```

- [ ] **Step 2: Verify NOCTIS**

Run:

```bash
cd "/Users/yashi/Coding/noctis"
node --check map.js && node --check script.js
```

Expected: no syntax output or errors.

---

### Task 4: Power in Practice Synthesis Current

**Files:**
- Modify: `/Users/yashi/Coding/power-in-practice/app/globals.css`
- Modify: `/Users/yashi/Coding/power-in-practice/app/page.tsx`

- [ ] **Step 1: Add a current overlay class**

In `app/globals.css`, add:

```css
.pip-current-line {
  position: relative;
  overflow: hidden;
}

.pip-current-line::after {
  content: "";
  position: absolute;
  left: -40%;
  right: -40%;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(246, 220, 166, .86), transparent);
  transform: translateX(-45%);
  opacity: 0;
  transition: opacity 180ms ease;
}

.pip-current-line:hover::after,
.pip-current-line:focus-visible::after {
  opacity: 1;
  animation: pip-card-current 1.9s ease-in-out infinite;
}

@keyframes pip-card-current {
  0%, 100% { transform: translateX(-45%); }
  50% { transform: translateX(45%); }
}

@media (prefers-reduced-motion: reduce) {
  .pip-current-line:hover::after,
  .pip-current-line:focus-visible::after {
    animation: none;
  }
}
```

- [ ] **Step 2: Apply class to connected project cards**

Find the connected project card class in `app/page.tsx` and add `pip-current-line` to the anchor class list:

```tsx
className="pip-link-card pip-current-line group relative min-h-72 overflow-hidden border border-stone-800 bg-[#11100d] p-6"
```

- [ ] **Step 3: Verify Power**

Run:

```bash
cd "/Users/yashi/Coding/power-in-practice"
npm run build
```

Expected: Next build completes successfully.

---

### Task 5: Visual Verification, Git, and Deployment

**Files:**
- No source changes unless screenshots reveal overlap.

- [ ] **Step 1: Capture desktop and mobile screenshots**

Use local dev servers or static servers and check:
- Lumen simulator and field log;
- NOCTIS map;
- SmartEnergy dashboard;
- Power homepage and connected project cards.

- [ ] **Step 2: Fix any overlap**

If any title, nav, fixed panel, or button overlaps, adjust spacing in the relevant CSS and rerun the related build.

- [ ] **Step 3: Commit and push changed repos**

Use one clear commit per repo:

```bash
git add <changed files>
git commit -m "feat: add fluid current motion"
git push origin main
```

- [ ] **Step 4: Verify live pages**

Use `curl` or browser checks to confirm live deployments contain new text/classes:
- Lumen: `lux-current` or response pulse code;
- SmartEnergy: `Fluid scheduling`;
- NOCTIS: `noctis-workflow-current`;
- Power: `pip-current-line`.

Expected: all live checks pass after Vercel deployment.
