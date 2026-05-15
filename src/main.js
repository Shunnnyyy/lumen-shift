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
const pulseButton = document.querySelector('#pulseButton');

let width = 0;
let height = 0;
let movementPulse = 0;
let pointerX = 0.5;
let pointerY = 0.5;

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
  hourValue.textContent = formatHour(state.hour);
  flowValue.textContent = `${state.flow}%`;
  dimValue.textContent = `${state.dim}%`;
  energySaved.textContent = `${state.saved}%`;
  brightnessLabel.textContent = `${state.adaptiveBrightness}%`;
  activityLabel.textContent =
    state.flow > 72 || movementPulse > 0.65 ? 'High' : state.flow > 28 ? 'Moderate' : 'Quiet';
}

function drawGlow(x, y, radius, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 4, x, y, radius);
  gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
  gradient.addColorStop(0.28, `rgba(255,255,255,${alpha * 0.24})`);
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawScene(time) {
  const state = getState();
  ctx.clearRect(0, 0, width, height);

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#030303');
  background.addColorStop(0.58, '#111');
  background.addColorStop(1, '#050505');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    const y = height * (0.16 + i * 0.075);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.sin(time * 0.0006 + i) * 10);
    ctx.stroke();
  }

  ctx.fillStyle = '#111';
  ctx.fillRect(0, height * 0.48, width, height * 0.24);
  ctx.fillStyle = '#070707';
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  const roadY = height * 0.73;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
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

    ctx.strokeStyle = 'rgba(255,255,255,0.36)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, postTop);
    ctx.lineTo(x, postBottom);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,${0.38 + intensity * 0.58})`;
    ctx.beginPath();
    ctx.arc(x, postTop, 4 + intensity * 2.2, 0, Math.PI * 2);
    ctx.fill();

    drawGlow(x, postTop + height * 0.12, height * (0.18 + intensity * 0.18), 0.055 + intensity * 0.18);

    ctx.fillStyle = `rgba(255,255,255,${0.07 + intensity * 0.18})`;
    ctx.beginPath();
    ctx.ellipse(x, postBottom + 12, width * 0.045 * intensity, height * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  particles.forEach((particle) => {
    particle.x += particle.speed * (0.28 + state.flow / 55);
    if (particle.x > 1.04) particle.x = -0.04;
    const active = particle.x < state.flow / 100 || movementPulse > 0.15;
    const alpha = active ? 0.72 : 0.12;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
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
  control.addEventListener('input', updateReadings);
});

pulseButton.addEventListener('click', () => {
  movementPulse = 1;
});

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect();
  pointerX = (event.clientX - rect.left) / rect.width;
  pointerY = (event.clientY - rect.top) / rect.height;
  movementPulse = Math.max(movementPulse, 0.42);
});

window.addEventListener('resize', resize);
resize();
updateReadings();
requestAnimationFrame(drawScene);
