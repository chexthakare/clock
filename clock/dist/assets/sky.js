/* ============================================================
   Time Bridge - animated sky background
   ------------------------------------------------------------
   One fullscreen shader, one draw call. Everything is procedural:
   gradient, sun/moon disc, stars, aurora, three drifting cloud
   layers, rain and lightning. The palette and the sun's position
   come from the real solar altitude for the base place, so the sky
   genuinely matches the time of day where you are.
   ============================================================ */

import * as THREE from './vendor/three.module.min.js';
import {
  RAD, solarState, zoneParts, daylight, halfArcHourAngle,
} from './solar.js';

const layer = document.getElementById('sky');
const canvas = document.getElementById('skyCanvas');
const hud = {
  place: document.getElementById('skyPlace'),
  phase: document.getElementById('skyPhase'),
  icon: document.getElementById('skyIcon'),
  sunrise: document.getElementById('skySunrise'),
  sunset: document.getElementById('skySunset'),
  rain: document.getElementById('rainToggle'),
};

/* ---------- moon phase ---------- */

/* The synodic month, 29.530588853 days, measured from the new moon of
   2000-01-06 18:14 UTC. Dividing by a single day, as this once did, made the
   terminator sweep a full cycle every 24 hours, so the moon showed a
   "full" phase at the same time each night and was never correct. */
const SYNODIC_MS = 29.530588853 * 86400000;
const NEW_MOON_2000 = Date.UTC(2000, 0, 6, 18, 14);

/**
 * Where the terminator sits, from +1 (new) through 0 (half) to -1 (full).
 * cos alone is correct for the shader's limb sweep: at +1 every sample of the
 * disc falls on the dark side, at -1 every sample falls on the lit side.
 */
function moonTerminator(stamp) {
  const age = (((stamp - NEW_MOON_2000) / SYNODIC_MS) % 1 + 1) % 1;
  return Math.cos(2 * Math.PI * age);
}

/* ---------- solar helpers ---------- */

const HORIZON_Y = 0.60; // where the horizon sits in the viewport
const PEAK_Y = 0.985; // where the sun sits at solar noon
const SPAN_X = 0.44; // half width of the sun's arc

/* ---------- palette ---------- */

/* Keyed by sun altitude in degrees, so twilight blends smoothly. */
const PALETTE = [
  { a: -90, top: [4, 6, 14],   mid: [8, 12, 30],   low: [14, 20, 48],   glow: [40, 60, 120],  star: 1.00, aurora: 1.00 },
  { a: -18, top: [5, 8, 20],   mid: [11, 17, 44],  low: [22, 30, 66],   glow: [70, 100, 190], star: 1.00, aurora: 0.85 },
  { a: -12, top: [8, 12, 34],  mid: [20, 28, 70],  low: [44, 48, 96],   glow: [120, 130, 215], star: 0.70, aurora: 0.35 },
  { a: -6,  top: [16, 22, 62], mid: [44, 46, 116], low: [104, 78, 140], glow: [190, 140, 215], star: 0.22, aurora: 0.05 },
  { a: -2,  top: [30, 42, 102],mid: [86, 62, 142], low: [196, 110, 126],glow: [255, 150, 140], star: 0.04, aurora: 0.00 },
  { a: 1,   top: [44, 72, 150],mid: [124, 88, 160],low: [255, 166, 110],glow: [255, 190, 120], star: 0.00, aurora: 0.00 },
  { a: 6,   top: [52, 100, 190],mid: [136, 140, 214],low: [255, 206, 150],glow: [255, 220, 160], star: 0.00, aurora: 0.00 },
  { a: 16,  top: [52, 112, 208],mid: [136, 176, 232],low: [214, 236, 250],glow: [255, 246, 214], star: 0.00, aurora: 0.00 },
  { a: 40,  top: [40, 104, 208],mid: [116, 170, 236],low: [206, 232, 250],glow: [255, 255, 235], star: 0.00, aurora: 0.00 },
  { a: 90,  top: [34, 96, 204], mid: [110, 166, 236],low: [202, 230, 250],glow: [255, 255, 245], star: 0.00, aurora: 0.00 },
];

function mixStops(altitude) {
  let i = 0;
  while (i < PALETTE.length - 2 && altitude > PALETTE[i + 1].a) i += 1;
  const lo = PALETTE[i];
  const hi = PALETTE[i + 1];
  const span = hi.a - lo.a;
  const t = span > 0 ? Math.min(1, Math.max(0, (altitude - lo.a) / span)) : 0;
  const ease = t * t * (3 - 2 * t);
  const chan = (key) => [0, 1, 2].map((c) => lo[key][c] + (hi[key][c] - lo[key][c]) * ease);
  return {
    top: chan('top'), mid: chan('mid'), low: chan('low'), glow: chan('glow'),
    star: lo.star + (hi.star - lo.star) * ease,
    aurora: lo.aurora + (hi.aurora - lo.aurora) * ease,
  };
}

function phaseLabel(altitude, rising) {
  if (altitude < -18) return { text: 'Night', icon: 'bi-moon-stars-fill' };
  if (altitude < -12) return { text: 'Deep twilight', icon: 'bi-moon-stars-fill' };
  if (altitude < -6) return { text: 'Twilight', icon: 'bi-stars' };
  if (altitude < 0) return { text: 'First light', icon: 'bi-sunrise' };
  if (altitude < 4) return { text: rising ? 'Sunrise' : 'Sunset', icon: rising ? 'bi-sunrise' : 'bi-sunset' };
  if (altitude < 9) return { text: 'Golden hour', icon: 'bi-sun-fill' };
  return { text: 'Daytime', icon: 'bi-brightness-high-fill' };
}

/* ---------- cloud shading ----------
   The clouds are now generated in the shader from fbm, so this only supplies
   the two colours their lighting is mixed between. Bright tops fade to dim
   moonlight at night, and an overcast sky closes the gap between the ends,
   which is what makes rain look heavy rather than merely dark. */

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function smoothstepJS(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function paintClouds(stops, altitude) {
  const lum = 0.26 + 0.74 * smoothstepJS(-12, 12, altitude);
  const warm = smoothstepJS(0, 30, altitude);

  // Bright tops, heavy bases. The floors stop a moonless sky driving either
  // end to black, where the cloud would vanish into the sky instead of
  // reading as a shape.
  const lit = lerp3(stops.glow, [255, 255, 255], 0.34 + 0.26 * warm).map((v) => v * lum);
  const dark = lit.map((v) => Math.max(v * 0.45 + 7 * lum, 34));
  const mean = [
    (lit[0] + dark[0] * 2) / 3,
    (lit[1] + dark[1] * 2) / 3,
    (lit[2] + dark[2] * 2) / 3,
  ];

  // Overcast: pull both ends toward a cold grey so the volume is lost.
  const wet = uniforms.uRain.value;
  const grey = [96, 104, 120];
  const top = lerp3(lit, grey, wet * 0.45 + 0.12);
  const bottom = lerp3(dark, mean, wet * 0.5 + 0.18);

  uniforms.uCloudLit.value.setRGB(top[0] / 255, top[1] / 255, top[2] / 255);
  uniforms.uCloudDark.value.setRGB(bottom[0] / 255, bottom[1] / 255, bottom[2] / 255);
  // Rain thickens the deck as well as darkening it.
  uniforms.uCover.value = Math.min(0.86, 0.30 + wet * 0.42 + state.cloud * 0.12);
}

/* ---------- shader ---------- */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uAlt;
uniform vec2  uSunPos;
uniform float uSunDisc;
uniform float uMoonDisc;
uniform float uMoonPhase;
uniform float uNight;
uniform float uAurora;
uniform float uRain;
uniform float uFlash;
uniform float uCloud;
uniform float uCover;
uniform vec3  uCloudLit;
uniform vec3  uCloudDark;
uniform float uSeed;
uniform vec2  uPar;
uniform vec3  uTop;
uniform vec3  uMid;
uniform vec3  uLow;
uniform vec3  uGlow;

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = rot * p;
    a *= 0.5;
  }
  return v;
}

/* ---- clouds ----
   One fbm layer. The noise sets the shape, a vertical ramp gives it volume,
   and the sun brightens the edges. This replaced cut-out sprites that were
   pure white with shape only in their alpha, so a gradient fill could only
   ever produce a flat lens with a hard tonal break across it.

   Kept deliberately plain. An earlier version had two decks and a
   gradient-as-normal lighting term, which sampled the noise field nine times
   per pixel for a background that is never looked at directly. */
vec3 applyClouds(vec3 col, vec2 uv, float aspect) {
  vec2 p = uv * vec2(2.4, 4.6);
  p.x += uTime * 0.014;
  float n = fbm(p);

  // uCover slides the threshold, so rain thickens the deck rather than
  // just darkening it.
  float d = smoothstep(1.0 - uCover, 1.0 - uCover + 0.30, n);

  // Fade out top and bottom so the bank has no straight edge on screen.
  d *= smoothstep(0.05, 0.32, uv.y) * smoothstep(1.0, 0.74, uv.y);
  if (d < 0.01) return col;

  // Thin edges catch the sun, thick cores stay heavy. Reaching below the
  // horizon flattens this, which is what makes an overcast sky look flat.
  float reach = smoothstep(-10.0, 14.0, uAlt) * (1.0 - uRain * 0.7);
  float lit = smoothstep(0.10, 0.90, 1.0 - d) * mix(0.35, 1.0, reach);
  vec3 cloud = mix(uCloudDark, uCloudLit, clamp(lit, 0.0, 1.0));

  // Warm the cloud that is closest to the sun.
  vec2 toSun = uSunPos - uv;
  toSun.x *= aspect;
  float near = pow(clamp(1.0 - length(toSun) * 0.6, 0.0, 1.0), 4.0);
  cloud += uGlow * near * 0.3 * reach;

  return mix(col, cloud, clamp(d * 0.9, 0.0, 0.92));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float seed = uSeed;

  /* ---- gradient ---- */
  float h = clamp(uv.y, 0.0, 1.0);
  float g = pow(h, 0.85);
  vec3 col = mix(uLow, uMid, smoothstep(0.0, 0.55, g));
  col = mix(col, uTop, smoothstep(0.45, 1.0, g));

  /* warm band hugging the horizon, strongest near the sun's azimuth */
  float horizonBand = exp(-pow((h - 0.58) * 5.2, 2.0));
  float azT = 1.0 - smoothstep(0.0, 0.55, abs(uSunPos.x - uv.x) * aspect);
  col += uGlow * horizonBand * azT * 0.10 * smoothstep(-12.0, 6.0, uAlt);

  /* ---- sun / moon glow ---- */
  vec2 dp = (uv - uSunPos) * vec2(aspect, 1.0);
  float d = length(dp);
  float glow = exp(-d * 3.4) * 0.80 + exp(-d * 11.0) * 0.45;
  col += uGlow * glow * (0.20 + 0.80 * smoothstep(-14.0, 8.0, uAlt));

  /* ---- stars ---- */
  float starField = 0.0;
  for (int L = 0; L < 3; L++) {
    float fi = float(L);
    float scale = 22.0 + fi * 30.0;
    float depth = 0.010 + 0.009 * fi;
    vec2 q = (uv * vec2(aspect, 1.0) + uPar * depth) * scale + seed * 3.0;
    vec2 id = floor(q);
    vec2 f = fract(q) - 0.5;
    float r = hash21(id + fi * 19.0);
    if (r > 0.90 - fi * 0.07) {
      vec2 off = (vec2(hash21(id + 3.1), hash21(id + 7.7)) - 0.5) * 0.66;
      float mag = hash21(id + 11.3);
      float twinkle = 0.62 + 0.38 * sin(uTime * (1.1 + mag * 2.6) + mag * 40.0);
      starField += smoothstep(0.055, 0.0, length(f - off)) * (0.30 + 0.70 * mag) * twinkle;
    }
  }
  float starMask = uNight * smoothstep(0.06, 0.42, h) * (1.0 - uCloud * 0.45);
  col += vec3(0.86, 0.90, 1.0) * starField * 0.9 * starMask;

  /* ---- aurora ribbons ---- */
  float aur = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float yBase = 0.30 + fi * 0.11;
    float n = fbm(vec2(uv.x * 2.1 + uTime * (0.045 + 0.028 * fi) + fi * 7.0 + seed,
                       uv.y * 3.2 - uTime * 0.018 + fi * 3.0));
    aur += exp(-pow((uv.y - yBase - n * 0.13) * 6.5, 2.0)) * (0.65 - fi * 0.16);
  }
  vec3 auroraCol = mix(vec3(0.22, 0.95, 0.60), vec3(0.62, 0.38, 0.98),
                       0.5 + 0.5 * sin(uv.x * 2.0 + uTime * 0.18));
  col += auroraCol * aur * uAurora * 0.42 * smoothstep(0.18, 0.62, h) * (1.0 - uCloud * 0.5);

  /* ---- clouds ---- */
  col = applyClouds(col, uv, aspect);

  /* ---- sun disc ----
     The drifting cloud sprites are a DOM layer stacked above this canvas,
     so they occlude the sun naturally and no in-shader cloud is needed. */
  float occ = 1.0;
  if (uSunDisc > 0.001) {
    float disc = smoothstep(0.024, 0.020, d);
    col += (uGlow * 1.6 + vec3(1.0, 0.97, 0.90) * 1.5) * disc * uSunDisc * occ;
  }

  /* ---- moon disc ----
     The terminator is the projection of the lit limb, so it is an ellipse
     rather than a straight edge: a straight edge pinned to the centre can
     only ever show half-lit, and one scaled by a small constant stays near
     half-lit at every phase. Folding uMoonPhase into sqrt(1-y*y) lets the
     terminator travel the full width of the disc, giving real crescents. */
  if (uMoonDisc > 0.001) {
    float r = 0.021;
    float m = smoothstep(r * 1.14, r * 0.98, d);
    float my = clamp(dp.y / r, -1.0, 1.0);
    float limb = sqrt(max(0.0, 1.0 - my * my));
    float lit = smoothstep(-0.035, 0.035, (dp.x / r) * (1.0 - abs(uMoonPhase)) - uMoonPhase * limb);
    float craters = 0.84 + 0.16 * fbm(dp * 110.0);
    col += mix(vec3(0.46, 0.52, 0.68), vec3(0.99, 0.98, 0.93), lit) * m * craters * 1.35 * uMoonDisc * occ;
    col += vec3(0.62, 0.72, 1.0) * smoothstep(r * 3.4, r, d) * 0.10 * uMoonDisc;
  }

  /* ---- rain ---- */
  if (uRain > 0.005) {
    float rain = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float sc = 24.0 + fi * 18.0;
      float fall = 9.0 + fi * 4.0;
      vec2 q = vec2(uv.x * aspect * sc + uPar.x * 0.6 * fi, uv.y * sc + uTime * fall + fi * 17.0);
      vec2 id = floor(q);
      float r = hash21(id + fi * 7.0);
      if (r > 0.70) {
        vec2 f = fract(q) - 0.5;
        float len = 0.16 + 0.30 * hash21(id + 2.0);
        float streak = smoothstep(0.05, 0.0, abs(f.x + f.y * 0.20)) * smoothstep(len, 0.0, abs(f.y));
        rain += streak * (0.55 - fi * 0.14);
      }
    }
    col += vec3(0.74, 0.82, 0.96) * rain * uRain * 0.45;
    float haze = uRain * smoothstep(0.40, 1.0, uv.y) * 0.45;
    col = mix(col, mix(col, vec3(0.58, 0.65, 0.76), 0.55), haze);
  }

  /* ---- lightning ---- */
  if (uFlash > 0.001) {
    float by = uv.y;
    float bx = 0.5 + (fbm(vec2(by * 6.5, seed * 2.0)) - 0.5) * 0.34;
    float bolt = smoothstep(0.007, 0.0, abs(uv.x - bx)) * smoothstep(0.97, 0.34, by) * smoothstep(0.10, 0.18, by);
    col += vec3(0.88, 0.93, 1.0) * bolt * uFlash * 1.5;
    col += vec3(0.70, 0.80, 1.0) * uFlash * 0.26;
  }

  /* soft shoulder so the sun never clips flat */
  col = col / (1.0 + col * 0.16);
  col = pow(max(col, 0.0), vec3(0.95));

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- setup ---------- */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
} catch (err) {
  renderer = null;
}

if (!renderer) {
  if (layer) layer.classList.add('is-off');
  throw new Error('Time Bridge: WebGL unavailable, sky disabled.');
}

THREE.ColorManagement.enabled = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setClearColor(0x0b1220, 1);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

const uniforms = {
  uRes: { value: new THREE.Vector2(1, 1) },
  uTime: { value: 0 },
  uAlt: { value: 12 },
  uSunPos: { value: new THREE.Vector2(0.5, 0.7) },
  uSunDisc: { value: 1 },
  uMoonDisc: { value: 0 },
  uMoonPhase: { value: 0.3 },
  uNight: { value: 0 },
  uAurora: { value: 0 },
  uRain: { value: 0 },
  uFlash: { value: 0 },
  uCloud: { value: 0.18 },
  uCover: { value: 0.34 },
  uCloudLit: { value: new THREE.Color(0.95, 0.96, 1) },
  uCloudDark: { value: new THREE.Color(0.32, 0.36, 0.46) },
  uSeed: { value: Math.random() * 10 },
  uPar: { value: new THREE.Vector2(0, 0) },
  uTop: { value: new THREE.Color(0.05, 0.1, 0.25) },
  uMid: { value: new THREE.Color(0.1, 0.16, 0.35) },
  uLow: { value: new THREE.Color(0.2, 0.3, 0.5) },
  uGlow: { value: new THREE.Color(0.9, 0.8, 0.6) },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: VERTEX,
  fragmentShader: FRAGMENT,
  depthTest: false,
  depthWrite: false,
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
quad.frustumCulled = false;
scene.add(quad);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

const state = {
  tz: 'UTC',
  lat: 51.5074,
  lon: -0.1278,
  label: 'Local time',
  rain: false,
  rainTarget: 0,
  cloud: 0.18,
  flash: 0,
  nextFlash: 0,
  par: { x: 0, y: 0, tx: 0, ty: 0 },
  scroll: 0,
  sunX: 0.5,
  sunY: 0.7,
  dprScale: 1,
  frameEma: 16,
  lastAdapt: 0,
  lastSolar: 0,
  lastHud: 0,
  stops: null,
  altitude: 0,
  lastTint: 0,
  startedAt: performance.now(),
  running: true,
};

/* Zones PHP could not place. */
const COORD_FALLBACK = {
  UTC: [51.5074, -0.1278],
  GMT: [51.5074, -0.1278],
  Etc: [51.5074, -0.1278],
};

function coordFallback(tz) {
  if (COORD_FALLBACK[tz]) return COORD_FALLBACK[tz];
  if (tz.startsWith('Etc/')) return COORD_FALLBACK.UTC;
  return null;
}

let PLACES = [];
try {
  const boot = JSON.parse(document.getElementById('boot-data').textContent);
  PLACES = Array.isArray(boot.places) ? boot.places : [];
} catch (err) {
  PLACES = [];
}

function lookupPlace(tz) {
  for (const p of PLACES) {
    if (p && p.tz === tz) return p;
  }
  return null;
}

/** Follow the base place, falling back to the device zone. */
function setContext(context) {
  if (!context) return;
  const tz = (context.places && context.places[0]) || context.localTz || 'UTC';
  const coords = context.coords && context.coords[tz];
  const place = lookupPlace(tz);

  let lat = null;
  let lon = null;
  if (coords && typeof coords.lat === 'number' && typeof coords.lon === 'number') {
    lat = coords.lat;
    lon = coords.lon;
  } else if (place && typeof place.lat === 'number' && typeof place.lon === 'number') {
    lat = place.lat;
    lon = place.lon;
  } else {
    const fallback = coordFallback(tz) || coordFallback(context.localTz);
    if (fallback) { lat = fallback[0]; lon = fallback[1]; }
  }

  if (lat === null || lon === null) return;
  state.tz = tz;
  state.lat = lat;
  state.lon = lon;
  state.label = (place && place.city) || tz.split('/').pop().replace(/_/g, ' ');
  state.lastSolar = 0;
  updateHud(true);
}

/* ---------- sizing ---------- */

function applySize() {
  const cap = Math.min(window.devicePixelRatio || 1, 2);
  const dpr = Math.max(0.55, cap * state.dprScale);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  uniforms.uRes.value.set(size.x, size.y);
}

let resizeTimer = 0;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(applySize, 120);
});
applySize();

/* ---------- rain toggle ---------- */

const RAIN_KEY = 'timebridge.rain.v1';
try {
  state.rain = localStorage.getItem(RAIN_KEY) === '1';
} catch (err) {
  state.rain = false;
}
state.rainTarget = state.rain ? 1 : 0;
uniforms.uRain.value = state.rainTarget;

function paintRainButton() {
  if (!hud.rain) return;
  hud.rain.setAttribute('aria-pressed', state.rain ? 'true' : 'false');
  hud.rain.querySelector('i').className = state.rain ? 'bi bi-cloud-rain-fill' : 'bi bi-cloud-rain';
}

if (hud.rain) {
  hud.rain.addEventListener('click', () => {
    state.rain = !state.rain;
    try { localStorage.setItem(RAIN_KEY, state.rain ? '1' : '0'); } catch (err) { /* not persisted */ }
    paintRainButton();
  });
}
paintRainButton();

/* ---------- pointer parallax ---------- */

if (finePointer.matches) {
  window.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches) return;
    state.par.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    state.par.ty = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
}

window.addEventListener('scroll', () => {
  if (reduceMotion.matches) return;
  const span = Math.max(1, document.body.scrollHeight - window.innerHeight);
  state.scroll = Math.min(1, window.scrollY / span);
}, { passive: true });

/* ---------- HUD ---------- */

function localTime(tz, stamp) {
  if (stamp === null || stamp === undefined) return '--:--';
  const p = zoneParts(tz, new Date(stamp));
  const suffix = p.hour < 12 ? 'am' : 'pm';
  const hour = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${hour}:${String(p.minute).padStart(2, '0')}${suffix}`;
}

let hudInfo = null;

function updateHud(force) {
  const now = Date.now();
  if (!force && now - state.lastHud < 20000) return;
  state.lastHud = now;

  const info = daylight(state.tz, state.lat, state.lon, new Date());
  hudInfo = info;

  if (hud.place) hud.place.textContent = state.label;
  if (hud.phase) {
    const sun = solarState(new Date(), state.lat, state.lon);
    const phase = phaseLabel(sun.altitude, sun.hourAngle < 0);
    hud.phase.textContent = phase.text;
    if (hud.icon) hud.icon.innerHTML = `<i class="bi ${phase.icon}"></i>`;
  }
  if (hud.sunrise) hud.sunrise.textContent = localTime(state.tz, info.sunrise);
  if (hud.sunset) hud.sunset.textContent = localTime(state.tz, info.sunset);
}

document.documentElement.dataset.sky = 'on';

/* ---------- frame loop ---------- */

function smoothTowards(current, target, rate) {
  return current + (target - current) * rate;
}

function updateSolar() {
  const now = Date.now();
  if (now - state.lastSolar < 15000) return;
  state.lastSolar = now;

  const sun = solarState(new Date(), state.lat, state.lon);
  const stops = mixStops(sun.altitude);

  uniforms.uAlt.value = sun.altitude;
  uniforms.uNight.value = smoothTowards(uniforms.uNight.value, stops.star, 0.5);
  uniforms.uAurora.value = smoothTowards(uniforms.uAurora.value, stops.aurora, 0.5);
  uniforms.uTop.value.setRGB(stops.top[0] / 255, stops.top[1] / 255, stops.top[2] / 255);
  uniforms.uMid.value.setRGB(stops.mid[0] / 255, stops.mid[1] / 255, stops.mid[2] / 255);
  uniforms.uLow.value.setRGB(stops.low[0] / 255, stops.low[1] / 255, stops.low[2] / 255);
  uniforms.uGlow.value.setRGB(stops.glow[0] / 255, stops.glow[1] / 255, stops.glow[2] / 255);

  const h0 = halfArcHourAngle(state.lat, sun.declination * RAD);
  const moonHourAngle = sun.hourAngle + 180;
  const useMoon = sun.altitude < -6;
  const hourAngle = useMoon ? moonHourAngle : sun.hourAngle;

  if (h0 > 1) {
    const x = 0.5 + SPAN_X * Math.max(-1.25, Math.min(1.25, hourAngle / h0)) * 0.88;
    state.sunX = Math.min(0.95, Math.max(0.05, x));
  } else {
    // Polar day or night leaves no arc width to divide by, so the disc would
    // otherwise sit wherever it was hours ago. Park it on the horizon side the
    // hour angle points at instead.
    state.sunX = Math.min(0.95, Math.max(0.05, hourAngle < 0 ? 0.08 : 0.92));
  }

  // Vertical: recomputed each tick so the disc tracks the real arc.
  const curve = Math.max(0, Math.min(1, sun.altitude / Math.max(6, hudInfo ? hudInfo.maxAltitude : 45)));
  const targetY = useMoon
    ? HORIZON_Y + (PEAK_Y - HORIZON_Y) * Math.sin(Math.max(0, Math.min(1, (curve + 0.35))) * Math.PI * 0.5)
    : HORIZON_Y + (PEAK_Y - HORIZON_Y) * Math.sin(curve * Math.PI * 0.5);
  state.sunY = targetY;

  uniforms.uSunPos.value.set(state.sunX, targetY);
  uniforms.uSunDisc.value = sun.altitude > -1.5 && !useMoon ? 1 : 0;
  uniforms.uMoonDisc.value = useMoon ? 1 : 0;
  uniforms.uMoonPhase.value = moonTerminator(Date.now());

  // Rainy weather reads as heavier cloud.
  const targetCloud = 0.16 + state.rainTarget * 0.42;
  state.cloud = smoothTowards(state.cloud, targetCloud, 0.12);
  uniforms.uCloud.value = state.cloud;

  state.stops = stops;
  state.altitude = sun.altitude;

  // Drives the header's scrim and ink in style.css. The switch is at 1deg
  // rather than at the -1deg the sun disc uses, because the sky is already
  // too dark to carry dark ink before the disc has even set.
  const dark = sun.altitude < 1;
  document.documentElement.dataset.skyPhase = dark ? 'night' : 'day';

  updateHud(false);
}

function frame(now) {
  if (!state.running) return;
  requestAnimationFrame(frame);

  const dt = Math.min(0.05, (now - (state.lastFrame || now)) / 1000);
  state.lastFrame = now;
  const t = (now - state.startedAt) / 1000;

  state.frameEma = state.frameEma * 0.9 + (dt * 1000) * 0.1;
  if (now - state.lastAdapt > 2500) {
    const cap = Math.min(window.devicePixelRatio || 1, 2);
    if (state.frameEma > 30 && state.dprScale > 0.55) {
      state.dprScale = Math.max(0.55, state.dprScale - 0.25);
      applySize();
      state.lastAdapt = now;
    } else if (state.frameEma < 14 && state.dprScale < 1) {
      state.dprScale = Math.min(1, state.dprScale + 0.25);
      applySize();
      state.lastAdapt = now;
    } else if (now - state.lastAdapt > 8000) {
      state.lastAdapt = now;
    }
  }

  const still = reduceMotion.matches;

  uniforms.uTime.value = still ? 12.0 : t;
  state.rainTarget = state.rain ? 1 : 0;
  uniforms.uRain.value = still
    ? state.rainTarget
    : smoothTowards(uniforms.uRain.value, state.rainTarget, 0.06);

  // lightning, only while raining and only when motion is welcome
  if (state.rain && !still) {
    if (!state.nextFlash) state.nextFlash = now + 4000 + Math.random() * 9000;
    if (now > state.nextFlash) {
      state.flash = 1;
      state.nextFlash = now + 5000 + Math.random() * 11000;
    }
  } else {
    state.nextFlash = 0;
  }
  state.flash = Math.max(0, state.flash - dt * 3.2);
  uniforms.uFlash.value = still ? 0 : state.flash * state.flash;

  const parX = still ? 0 : state.par.tx;
  const parY = still ? 0 : state.par.ty + (state.scroll ? (state.scroll - 0.5) * 0.35 : 0);
  state.par.x = smoothTowards(state.par.x, parX, 0.06);
  state.par.y = smoothTowards(state.par.y, parY, 0.06);
  uniforms.uPar.value.set(state.par.x * 0.05, state.par.y * 0.035);

  updateSolar();

  // Repaint the cloud tint on its own clock: the solar pass only runs
  // every 15s, but the rain fade needs to follow it far more closely.
  if (state.stops && now - state.lastTint > 250) {
    state.lastTint = now;
    paintClouds(state.stops, state.altitude);
  }

  renderer.render(scene, camera);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    state.running = false;
  } else if (!state.running) {
    state.running = true;
    state.lastFrame = performance.now();
    requestAnimationFrame(frame);
  }
});

/* ---------- boot ---------- */

// Start with whatever the page already published, then keep following it.
setContext(window.timeBridgeContext);
window.addEventListener('timebridge:places', (event) => setContext(event.detail));

if (reduceMotion.matches) {
  state.running = true;
  requestAnimationFrame(frame);
} else {
  requestAnimationFrame(frame);
}

export { mixStops, phaseLabel };
