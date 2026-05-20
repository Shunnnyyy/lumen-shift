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
const photoLux = document.querySelector('#photoLux');
const photoVariable = document.querySelector('#photoVariable');
const photoExplanation = document.querySelector('#photoExplanation');
const mapPins = document.querySelector('#mapPins');
const mapZone = document.querySelector('#mapZone');
const mapFinding = document.querySelector('#mapFinding');
const mapLux = document.querySelector('#mapLux');
const mapTime = document.querySelector('#mapTime');
const mapActivity = document.querySelector('#mapActivity');
const mapNote = document.querySelector('#mapNote');
const fieldDataRows = document.querySelector('#fieldDataRows');
const noctisSupabaseUrl = 'https://szmcjrgtecwzxvsszeib.supabase.co';
const noctisSupabaseKey = 'sb_publishable_glEsWFXGRqG1c4OU51YlyA_uh7_fojn';
const noctisColumns = 'id,title,lat,lng,area,condition,time,intensity,img,note,analysis,created_at';
const metaStart = '[NOCTIS_FIELD_META]';
const metaEnd = '[/NOCTIS_FIELD_META]';

let width = 0;
let height = 0;
let movementPulse = 0;
let pointerX = 0.5;
let pointerY = 0.5;
let activeScenario = 'quiet';
let burstId = 0;

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

const sparks = [];

const scenarios = {
  quiet: { hour: 2, flow: 16, dim: 22, pulse: 0.2 },
  commute: { hour: 18, flow: 64, dim: 34, pulse: 0.58 },
  event: { hour: 22, flow: 92, dim: 42, pulse: 1 },
  daylight: { hour: 13, flow: 48, dim: 14, pulse: 0.08 },
};

const photoCopy = {
  street: {
    signal: 'Observation: empty street, high fixed brightness',
    lux: 'Starter sample: 18 lux / low activity',
    variable: 'Question: could the base brightness be lower when activity is low?',
    explanation:
      'The photograph becomes a prompt instead of proof. It asks whether a quiet block needs the same brightness as an active one.',
    scenario: 'quiet',
  },
  motion: {
    signal: 'Observation: crosswalks and vehicles create short bursts of demand',
    lux: 'Starter sample: 42 lux / moderate activity',
    variable: 'Question: what should light do when motion enters the frame?',
    explanation:
      'Movement becomes a control signal. The system keeps the street calm when empty, then raises brightness when people or cars enter the frame.',
    scenario: 'commute',
  },
  windows: {
    signal: 'Observation: windows, signs, and lamps form an energy pattern',
    lux: 'Starter sample: 96 lux / high ambient light',
    variable: 'Question: where does public light overlap with private light?',
    explanation:
      'The photograph becomes a map of visible electricity use, connecting the dashboard-style numbers with a real public street.',
    scenario: 'event',
  },
};

const starterFieldRecords = [
  {
    id: 'residential',
    zone: 'Residential street',
    date: 'Sample',
    location: 'Residential side street',
    time: '21:40',
    lux: 18,
    activity: 'Low',
    weather: 'Clear / dry',
    photo: 'Starter frame',
    finding: 'Low movement, fixed brightness',
    note:
      'Quiet sidewalk with steady streetlight brightness. Good example of a place to compare low activity against fixed illumination.',
    scenario: 'quiet',
    x: '24%',
    y: '42%',
  },
  {
    id: 'transit',
    zone: 'Transit stop',
    date: 'Sample',
    location: 'Transit stop / crosswalk',
    time: '22:10',
    lux: 42,
    activity: 'Medium',
    weather: 'Cloudy / dry',
    photo: 'Starter frame',
    finding: 'Short bursts of people and vehicles',
    note:
      'Intermittent movement: the stop can be quiet, then briefly active when people, buses, or cars arrive.',
    scenario: 'commute',
    x: '58%',
    y: '58%',
  },
  {
    id: 'commercial',
    zone: 'Commercial corridor',
    date: 'Sample',
    location: 'Commercial corridor',
    time: '20:55',
    lux: 96,
    activity: 'High',
    weather: 'Clear / reflections',
    photo: 'Starter frame',
    finding: 'High ambient light and overlapping loads',
    note:
      'Signs, windows, storefront lighting, cars, and public lamps overlap. This is useful for comparing ambient light with street activity.',
    scenario: 'event',
    x: '72%',
    y: '28%',
  },
];

let fieldRecords = [...starterFieldRecords];

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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[char]);
}

function parseFieldMeta(value) {
  const text = String(value || '');
  const start = text.indexOf(metaStart);
  const end = text.indexOf(metaEnd);
  if (start === -1 || end === -1 || end < start) return {};
  try {
    return JSON.parse(text.slice(start + metaStart.length, end).trim());
  } catch {
    return {};
  }
}

function getScenarioFromActivity(activity, lux) {
  if (activity === 'High' || Number(lux) >= 80) return 'event';
  if (activity === 'Medium' || Number(lux) >= 35) return 'commute';
  return 'quiet';
}

function getMapPosition(lat, lng) {
  const minLat = 43.62;
  const maxLat = 43.72;
  const minLng = -79.43;
  const maxLng = -79.34;
  const x = ((Number(lng) - minLng) / (maxLng - minLng)) * 76 + 12;
  const y = (1 - (Number(lat) - minLat) / (maxLat - minLat)) * 70 + 12;
  return {
    x: `${Math.min(88, Math.max(12, x)).toFixed(1)}%`,
    y: `${Math.min(82, Math.max(12, y)).toFixed(1)}%`,
  };
}

function noctisPointToRecord(point) {
  const meta = parseFieldMeta(point.analysis);
  const lux = meta.lux === '' || meta.lux == null ? null : Number(meta.lux);
  if (!Number.isFinite(lux)) return null;
  const activity = meta.activity || 'Unknown';
  const position = getMapPosition(point.lat, point.lng);
  return {
    id: point.id,
    zone: point.title || 'NOCTIS photo point',
    date: meta.date || (point.created_at ? point.created_at.slice(0, 10) : 'Field'),
    location: point.title || `${Number(point.lat).toFixed(4)}, ${Number(point.lng).toFixed(4)}`,
    time: point.time || '',
    lux,
    activity,
    weather: meta.weather || 'Not recorded',
    photo: point.img ? 'NOCTIS photo' : 'No photo yet',
    finding: `${activity} activity / ${point.condition || 'Unknown'} light`,
    note: point.note || 'Imported from NOCTIS field studio.',
    scenario: getScenarioFromActivity(activity, lux),
    x: position.x,
    y: position.y,
  };
}

async function loadNoctisFieldRecords() {
  try {
    const response = await fetch(`${noctisSupabaseUrl}/rest/v1/light_points?select=${noctisColumns}&order=created_at.desc`, {
      headers: {
        apikey: noctisSupabaseKey,
        Authorization: `Bearer ${noctisSupabaseKey}`,
      },
    });
    if (!response.ok) throw new Error(`NOCTIS fetch failed: ${response.status}`);
    const rows = await response.json();
    const imported = rows.map(noctisPointToRecord).filter(Boolean);
    if (imported.length) {
      fieldRecords = imported;
      renderMapPins();
      renderFieldData();
      bindMapPins();
      selectMapRecord(fieldRecords[0].id);
    }
  } catch (error) {
    console.warn('Using starter field records because NOCTIS data could not be loaded.', error);
  }
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

function createSparkBurst(x, y) {
  const count = 20;
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.24;
    sparks.push({
      id: burstId,
      x,
      y,
      vx: Math.cos(angle) * (1.8 + Math.random() * 3.8),
      vy: Math.sin(angle) * (1.8 + Math.random() * 3.8),
      life: 1,
      bend: Math.random() * 0.8 - 0.4,
    });
  }
  burstId += 1;
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

  for (let index = sparks.length - 1; index >= 0; index -= 1) {
    const spark = sparks[index];
    const nextX = spark.x + spark.vx;
    const nextY = spark.y + spark.vy + Math.sin(time * 0.014 + spark.id) * spark.bend;
    ctx.strokeStyle = `rgba(0,0,0,${spark.life * 0.72})`;
    ctx.lineWidth = 1 + spark.life * 1.8;
    ctx.beginPath();
    ctx.moveTo(spark.x, spark.y);
    ctx.lineTo(nextX, nextY);
    ctx.stroke();
    spark.x = nextX;
    spark.y = nextY;
    spark.life *= 0.91;
    if (spark.life < 0.05) sparks.splice(index, 1);
  }

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
  createSparkBurst(pointerX * width, pointerY * height);
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
    photoLux.textContent = photo.lux;
    photoVariable.textContent = photo.variable;
    photoExplanation.textContent = photo.explanation;
    applyScenario(photo.scenario);
  });
});

function renderMapPins() {
  mapPins.innerHTML = fieldRecords
    .map(
      (record, index) => `
        <button class="map-pin ${index === 0 ? 'is-active' : ''}" type="button" data-map="${record.id}" style="--x: ${record.x}; --y: ${record.y}">
          <span>${escapeHtml(record.zone)}</span>
        </button>
      `
    )
    .join('');
}

function renderFieldData() {
  fieldDataRows.innerHTML = fieldRecords
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.date)}</td>
          <td>${escapeHtml(record.location)}</td>
          <td>${escapeHtml(record.time)}</td>
          <td>${record.lux} lux</td>
          <td>${escapeHtml(record.activity)}</td>
          <td>${escapeHtml(record.weather)}</td>
          <td>${escapeHtml(record.photo)}</td>
          <td>${escapeHtml(record.note)}</td>
        </tr>
      `
    )
    .join('');
}

function selectMapRecord(id) {
  const reading = fieldRecords.find((record) => record.id === id);
  if (!reading) return;
  document.querySelectorAll('[data-map]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.map === id);
  });
  mapZone.textContent = reading.zone;
  mapFinding.textContent = reading.finding;
  mapLux.textContent = `${reading.lux} lux`;
  mapTime.textContent = reading.time;
  mapActivity.textContent = reading.activity;
  mapNote.textContent = reading.note;
  applyScenario(reading.scenario);
}

function bindMapPins() {
  document.querySelectorAll('[data-map]').forEach((button) => {
    button.addEventListener('click', () => selectMapRecord(button.dataset.map));
  });
}

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

canvas.addEventListener('pointerdown', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointerX = (event.clientX - rect.left) / rect.width;
  pointerY = (event.clientY - rect.top) / rect.height;
  movementPulse = 1;
  createSparkBurst(pointerX * width, pointerY * height);
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
renderMapPins();
renderFieldData();
bindMapPins();
loadNoctisFieldRecords();
resize();
updateReadings();
updateScenarioButtons();
requestAnimationFrame(drawScene);
