import './styles.css';

const canvas = document.querySelector('#cityCanvas');
const ctx = canvas.getContext('2d');
const hourControl = document.querySelector('#hourControl');
const flowControl = document.querySelector('#flowControl');
const dimControl = document.querySelector('#dimControl');
const hourValue = document.querySelector('#hourValue');
const flowValue = document.querySelector('#flowValue');
const dimValue = document.querySelector('#dimValue');
const energySaved = document.querySelector('#energySaved');
const activityLabel = document.querySelector('#activityLabel');
const brightnessLabel = document.querySelector('#brightnessLabel');
const loadLabel = document.querySelector('#loadLabel');
const pulseButton = document.querySelector('#pulseButton');
const insightText = document.querySelector('#insightText');
const progressBar = document.querySelector('#progressBar');
const scenarioButtons = document.querySelectorAll('[data-scenario]');
const photoButtons = document.querySelectorAll('[data-photo]');
const photoSignal = document.querySelector('#photoSignal');
const photoVariable = document.querySelector('#photoVariable');
const photoExplanation = document.querySelector('#photoExplanation');
const mapButtons = document.querySelectorAll('[data-map]');
const mapZone = document.querySelector('#mapZone');
const mapFinding = document.querySelector('#mapFinding');
const mapNote = document.querySelector('#mapNote');

let width = 0;
let height = 0;
let movementPulse = 0;
let pointerX = 0.5;
let pointerY = 0.5;
let activeScenario = 'quiet';

const lamps = Array.from({ length: 9 }, (_, index) => ({
  x: 0.08 + index * 0.105,
  phase: Math.random() * Math.PI * 2,
}));

const particles = Array.from({ length: 26 }, () => ({
  x: Math.random(),
  y: 0.55 + Math.random() * 0.3,
  speed: 0.00045 + Math.random() * 0.0013,
  size: 1.5 + Math.random() * 2.5,
}));

const scenarios = {
  quiet: { hour: 2, flow: 16, dim: 22, pulse: 0.2 },
  commute: { hour: 18, flow: 64, dim: 34, pulse: 0.58 },
  event: { hour: 22, flow: 92, dim: 42, pulse: 1 },
  daylight: { hour: 13, flow: 48, dim: 14, pulse: 0.08 },
};

const photoCopy = {
  street: {
    signal: 'Observation: empty street, high fixed brightness',
    variable: 'Engineering variable: lower base dim level when activity is low',
    explanation:
      'This connects your photography directly to the EE idea: the image is not just aesthetic, it identifies a mismatch between light output and real street demand.',
    scenario: 'quiet',
  },
  motion: {
    signal: 'Observation: crosswalks and vehicles create short bursts of demand',
    variable: 'Engineering variable: motion-triggered brightness ramp',
    explanation:
      'Movement becomes a control signal. The system keeps the street calm when empty, then raises brightness when people or cars enter the frame.',
    scenario: 'commute',
  },
  windows: {
    signal: 'Observation: windows, signs, and lamps form an energy pattern',
    variable: 'Engineering variable: compare public lighting with surrounding load',
    explanation:
      'The photograph becomes a map of visible electricity use, linking SmartEnergy-style measurement to a public-space lighting decision.',
    scenario: 'event',
  },
};

const mapCopy = {
  residential: {
    zone: 'Residential street',
    finding: 'Low movement, fixed brightness',
    note:
      'Residential night photos often show quiet sidewalks with lamps still running at a steady level. This supports a lower base dim level plus motion-triggered ramping.',
    scenario: 'quiet',
  },
  transit: {
    zone: 'Transit stop',
    finding: 'Short bursts of people and vehicles',
    note:
      'Transit photography shows intermittent demand: a stop can be empty for minutes, then suddenly active. The system should brighten quickly and fade slowly.',
    scenario: 'commute',
  },
  commercial: {
    zone: 'Commercial corridor',
    finding: 'High ambient light and overlapping loads',
    note:
      'Commercial streets combine signs, windows, traffic, and public lighting. The map helps separate safety lighting from already-bright background energy use.',
    scenario: 'event',
  },
};

function resize() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  width = rect.width;
  height = rect.height;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function formatHour(value) {
  return `${String(value).padStart(2, '0')}:00`;
}

function getState() {
  const hour = Number(hourControl.value);
  const flow = Number(flowControl.value);
  const dim = Number(dimControl.value);
  const nightFactor = hour < 6 || hour > 20 ? 1 : hour < 8 || hour > 17 ? 0.72 : 0.34;
  const motionFactor = Math.min(1, flow / 100 + movementPulse * 0.52);
  const adaptiveBrightness = Math.round(dim + (100 - dim) * motionFactor * nightFactor);
  const alwaysOnBaseline = 92;
  const saved = Math.max(0, Math.round((1 - adaptiveBrightness / alwaysOnBaseline) * 100));

  return { hour, flow, dim, nightFactor, motionFactor, adaptiveBrightness, saved };
}

function updateReadings() {
  const state = getState();
  const load = (state.adaptiveBrightness / 100) * 1.05;
  hourValue.textContent = formatHour(state.hour);
  flowValue.textContent = `${state.flow}%`;
  dimValue.textContent = `${state.dim}%`;
  energySaved.textContent = `${state.saved}%`;
  brightnessLabel.textContent = `${state.adaptiveBrightness}%`;
  loadLabel.textContent = `${load.toFixed(2)} kW`;
  activityLabel.textContent =
    state.flow > 72 || movementPulse > 0.65 ? 'High' : state.flow > 28 ? 'Moderate' : 'Quiet';
  insightText.textContent = buildInsight(state, load);
}

function buildInsight(state, load) {
  if (state.hour > 7 && state.hour < 17) {
    return `Daylight mode keeps street lighting minimal. The model estimates ${load.toFixed(2)} kW because ambient light reduces the need for artificial brightness.`;
  }

  if (state.flow < 25) {
    return `Quiet street condition: the system holds brightness near the base dim level and saves about ${state.saved}% compared with an always-on baseline.`;
  }

  if (state.flow > 75) {
    return `High activity condition: the system prioritizes visibility, raising brightness to ${state.adaptiveBrightness}% while still tracking the energy tradeoff.`;
  }

  return `Moderate activity condition: brightness rises only where movement is detected, keeping the street readable without treating the whole night as peak demand.`;
}

function drawGlow(x, y, radius, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 4, x, y, radius);
  gradient.addColorStop(0, `rgba(0,0,0,${alpha * 0.52})`);
  gradient.addColorStop(0.28, `rgba(0,0,0,${alpha * 0.16})`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScene(time) {
  const state = getState();
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#f7f7f2');
  background.addColorStop(0.58, '#efefea');
  background.addColorStop(1, '#f9f9f5');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = height * (0.16 + i * 0.075);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(time * 0.0006 + i) * 10);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.035)';
  ctx.fillRect(0, height * 0.48, width, height * 0.24);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  const roadY = height * 0.73;
  ctx.strokeStyle = 'rgba(0,0,0,0.36)';
  ctx.setLineDash([width * 0.025, width * 0.04]);
  ctx.beginPath();
  ctx.moveTo(0, roadY);
  ctx.lineTo(width, roadY);
  ctx.stroke();
  ctx.setLineDash([]);

  lamps.forEach((lamp, index) => {
    const x = lamp.x * width;
    const postTop = height * 0.2 + Math.sin(time * 0.0008 + lamp.phase) * 7;
    const postBottom = height * 0.66;
    const distance = Math.abs(pointerX - lamp.x);
    const proximity = Math.max(0, 1 - distance * 6);
    const flowWave = 0.74 + Math.sin(time * 0.002 + index * 1.4) * 0.12;
    const intensity = Math.min(
      1,
      (state.adaptiveBrightness / 100) * flowWave + proximity * 0.42 + movementPulse * 0.34
    );

    ctx.strokeStyle = 'rgba(0,0,0,0.62)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, postTop);
    ctx.lineTo(x, postBottom);
    ctx.stroke();

    ctx.fillStyle = `rgba(0,0,0,${0.36 + intensity * 0.48})`;
    ctx.beginPath();
    ctx.arc(x, postTop, 4 + intensity * 2.2, 0, Math.PI * 2);
    ctx.fill();

    drawGlow(x, postTop + height * 0.12, height * (0.18 + intensity * 0.18), 0.055 + intensity * 0.18);

    ctx.fillStyle = `rgba(0,0,0,${0.06 + intensity * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(x, postBottom + 12, width * 0.045 * intensity, height * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  particles.forEach((particle) => {
    particle.x += particle.speed * (0.28 + state.flow / 55);
    if (particle.x > 1.04) particle.x = -0.04;
    const active = particle.x < state.flow / 100 || movementPulse > 0.15;
    const alpha = active ? 0.72 : 0.12;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.beginPath();
    ctx.arc(particle.x * width, particle.y * height, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });

  const cursorGlow = Math.max(0.08, movementPulse) * 0.2;
  drawGlow(pointerX * width, pointerY * height, height * 0.22, cursorGlow);

  movementPulse *= 0.965;
  updateReadings();
  requestAnimationFrame(drawScene);
}

[hourControl, flowControl, dimControl].forEach((control) => {
  control.addEventListener('input', () => {
    activeScenario = 'custom';
    updateScenarioButtons();
    updateReadings();
  });
});

pulseButton.addEventListener('click', () => {
  movementPulse = 1;
});

scenarioButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyScenario(button.dataset.scenario);
  });
});

photoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const photo = photoCopy[button.dataset.photo];
    photoButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    photoSignal.textContent = photo.signal;
    photoVariable.textContent = photo.variable;
    photoExplanation.textContent = photo.explanation;
    applyScenario(photo.scenario);
  });
});

mapButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const reading = mapCopy[button.dataset.map];
    mapButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    mapZone.textContent = reading.zone;
    mapFinding.textContent = reading.finding;
    mapNote.textContent = reading.note;
    applyScenario(reading.scenario);
  });
});

function applyScenario(name) {
  const scenario = scenarios[name];
  if (!scenario) return;
  activeScenario = name;
  hourControl.value = scenario.hour;
  flowControl.value = scenario.flow;
  dimControl.value = scenario.dim;
  movementPulse = Math.max(movementPulse, scenario.pulse);
  updateScenarioButtons();
  updateReadings();
}

function updateScenarioButtons() {
  scenarioButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.scenario === activeScenario);
  });
}

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointerX = (event.clientX - rect.left) / rect.width;
  pointerY = (event.clientY - rect.top) / rect.height;
  movementPulse = Math.max(movementPulse, 0.42);
});

window.addEventListener('resize', resize);
window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
resize();
updateReadings();
updateScenarioButtons();
requestAnimationFrame(drawScene);
