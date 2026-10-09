"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import "./quiet";
import { PARTICLES } from "./constants";

export type ProcessInput = {
  morph: number; // target shape 0..3 (continuous, scroll-scrubbed)
  mx: number; // pointer, -1..1 across the viewport
  my: number;
};

// Stage 1 · K-means: five cluster centres in 3D.
const CENTROIDS = [
  [-1.65, 0.75, 0.4], [1.45, 1.05, -0.6], [0.1, -0.15, 1.25], [-1.05, -1.15, -0.85], [1.55, -0.95, 0.75],
];

// Stage 2 · Reasoning graph, carried over from the 2D figure in the design
// handoff (x/y in 0–1 space) and given depth.
const HUBS_2D = [
  [0.18, 0.24], [0.46, 0.14], [0.8, 0.22], [0.3, 0.52], [0.6, 0.44],
  [0.86, 0.6], [0.16, 0.84], [0.48, 0.8], [0.76, 0.88],
];
const HUB_Z = [0.8, -0.6, 0.5, -0.9, 0.9, -0.4, 0.6, -0.8, 0.3];
const EDGES = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [2, 5], [3, 4],
  [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8], [3, 7],
];
const HUBS = HUBS_2D.map(([x, y], i) => [(x - 0.5) * 4.8, (0.5 - y) * 3.8, HUB_Z[i] * 1.2]);

// Stage 3 · Dashboard: an 8 × 8 grid of bars, 64 particles per bar.
const BARS = 8;
const PER_BAR = PARTICLES / (BARS * BARS);
const BAR_BASE = -1.35;
const BAR_SPAN = 3.6;
const barHeight = (bx: number, bz: number) => {
  // A rising trend with some seasonality: the shape of a good quarter.
  const trend = 0.55 + 1.75 * (bx / (BARS - 1));
  const season = 0.35 * Math.sin(bx * 1.3 + bz * 0.9) + 0.22 * Math.cos(bz * 1.7);
  return Math.max(0.3, trend + season);
};
const barX = (bx: number) => (bx / (BARS - 1) - 0.5) * BAR_SPAN;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uSize;
  uniform float uViewH;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec4 aAcc;   // accent flag per stage
  attribute vec4 aMeta;  // rand, rand, edge t (-1 = none), edge phase
  attribute vec4 aExtra; // centroid, outlier, bar phase, position within bar
  attribute float aHub;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSquare;
  varying float vRing;

  void main() {
    float m = clamp(uMorph, 0.0, 3.0);
    float seg = min(floor(m), 2.0);
    float t = m - seg;
    // Staggered, eased hand-off between neighbouring shapes.
    float tt = clamp((t - aMeta.x * 0.3) / 0.7, 0.0, 1.0);
    tt = tt * tt * (3.0 - 2.0 * tt);
    vec3 a = seg < 0.5 ? position : (seg < 1.5 ? aP1 : aP2);
    vec3 b = seg < 0.5 ? aP1 : (seg < 1.5 ? aP2 : aP3);
    vec3 p = mix(a, b, tt);
    // Particles swell outward mid-flight, then settle.
    p += normalize(p + vec3(1e-3)) * sin(tt * 3.14159) * (0.25 + aMeta.y * 0.55);

    vec4 w = clamp(1.0 - abs(vec4(m) - vec4(0.0, 1.0, 2.0, 3.0)), 0.0, 1.0);
    float ph = aMeta.y * 6.2831;

    // 0 · Data: turbulent noise, and a scan line validating it row by row.
    p += vec3(sin(uTime * 1.3 + ph), cos(uTime * 1.1 + ph * 1.7), sin(uTime * 0.9 + ph * 2.3)) * (0.16 * w.x + 0.012);
    float scanY = sin(uTime * 0.75) * 2.25;
    float scan = smoothstep(0.2, 0.0, abs(p.y - scanY)) * w.x;
    p.x += scan * 0.06 * sin(ph);

    // 1 · Models: clusters breathe around their centroids; outliers drift.
    p += vec3(sin(uTime * 0.9 + ph), cos(uTime * 0.8 + ph), 0.0) * 0.03 * w.y * (1.0 - aExtra.x);
    float blink = 0.5 + 0.5 * sin(uTime * 3.2 + ph);

    // 3 · Products: bars breathe like a live dashboard.
    p.y += (p.y - (${BAR_BASE.toFixed(2)})) * 0.09 * sin(uTime * 1.4 + aExtra.z) * w.w;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float acc = dot(aAcc, w);
    float pulse = 0.0;
    if (aMeta.z >= 0.0) {
      float head = fract(uTime * 0.42 + aMeta.w);
      pulse = smoothstep(0.1, 0.0, abs(aMeta.z - head)) * w.z;
    }
    float hub = aHub * w.z;
    float isCentre = aExtra.x * w.y; // ("centroid" is reserved in GLSL ES 3)
    float outlier = aExtra.y * w.y;
    float lit = clamp(acc + pulse + hub + scan + isCentre + outlier * blink, 0.0, 1.0);
    float size = uSize * (1.0 + hub * 2.8 + pulse * 1.3 + acc * 0.3 + scan * 0.9 + isCentre * 3.6 + outlier * (1.4 + blink));
    gl_PointSize = size * uViewH / -mv.z;

    vColor = mix(vec3(0.95, 0.95, 0.96), vec3(0.784, 0.949, 0.353), lit);
    float depth = 0.35 + 0.65 * smoothstep(-11.0, -6.2, mv.z);
    vAlpha = mix(0.72, 0.97, lit) * depth;
    vSquare = w.w;
    vRing = outlier;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSquare;
  varying float vRing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float circle = 1.0 - smoothstep(0.3, 0.5, d);
    float ring = smoothstep(0.06, 0.0, abs(d - 0.36)) + (1.0 - smoothstep(0.08, 0.14, d));
    float square = 1.0 - smoothstep(0.34, 0.5, max(abs(c.x), abs(c.y)));
    float mask = mix(circle, ring, step(0.5, vRing));
    mask = mix(mask, square, step(0.5, vSquare));
    if (mask < 0.02) discard;
    gl_FragColor = vec4(vColor, mask * vAlpha);
  }
`;

function buildShapes() {
  const N = PARTICLES;
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());

  const p0 = new Float32Array(N * 3), p1 = new Float32Array(N * 3);
  const p2 = new Float32Array(N * 3), p3 = new Float32Array(N * 3);
  const acc = new Float32Array(N * 4), meta = new Float32Array(N * 4), extra = new Float32Array(N * 4);
  const hub = new Float32Array(N);
  const clusterEnd = 9 + 9 * 110;

  for (let i = 0; i < N; i++) {
    // 0 · Noise: an uneven cloud.
    const r0 = 2.5 * Math.cbrt(rand());
    const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
    p0.set([r0 * Math.sin(ph) * Math.cos(th) * 1.25, r0 * Math.cos(ph) * 0.85, r0 * Math.sin(ph) * Math.sin(th)], i * 3);

    // 1 · K-means: five clusters, their centroids, and a few outliers.
    const k = i % CENTROIDS.length;
    const isCentroid = i < CENTROIDS.length;
    const isOutlier = !isCentroid && i % 61 === 0;
    const c = CENTROIDS[k];
    if (isCentroid) p1.set(c, i * 3);
    else if (isOutlier) {
      const r = 2.5 + rand() * 0.7, a = rand() * Math.PI * 2, e = (rand() - 0.5) * 1.6;
      p1.set([Math.cos(a) * r, e, Math.sin(a) * r * 0.8], i * 3);
    } else {
      const spread = 0.28 + (k % 3) * 0.07;
      p1.set([c[0] + gauss() * spread, c[1] + gauss() * spread * 0.85, c[2] + gauss() * spread], i * 3);
    }

    // 2 · Reason: hubs, clusters and edges with travelling pulses.
    let edgeT = -1, edgePhase = 0;
    if (i < 9) {
      p2.set(HUBS[i], i * 3);
      hub[i] = 1;
    } else if (i < clusterEnd) {
      const h = HUBS[i % 9], rr = 0.05 + Math.pow(rand(), 1.5) * 0.24;
      p2.set([h[0] + gauss() * rr, h[1] + gauss() * rr, h[2] + gauss() * rr], i * 3);
    } else {
      const e = i % EDGES.length;
      const [A, B] = [HUBS[EDGES[e][0]], HUBS[EDGES[e][1]]];
      const t = rand();
      const j = () => (rand() - 0.5) * 0.05;
      p2.set([A[0] + (B[0] - A[0]) * t + j(), A[1] + (B[1] - A[1]) * t + j(), A[2] + (B[2] - A[2]) * t + j()], i * 3);
      edgeT = t;
      edgePhase = (e * 0.37) % 1;
    }

    // 3 · Ship: a live 3D dashboard — bars of stacked points.
    const bar = Math.floor(i / PER_BAR);
    const bx = bar % BARS, bz = Math.floor(bar / BARS);
    const within = (i % PER_BAR) / (PER_BAR - 1);
    const h = barHeight(bx, bz);
    const col = i % 4; // 2 × 2 points across each bar
    p3.set(
      [barX(bx) + ((col % 2) - 0.5) * 0.1, BAR_BASE + within * h, barX(bz) + (Math.floor(col / 2) - 0.5) * 0.1],
      i * 3,
    );

    acc.set(
      [
        i % 13 === 0 ? 1 : 0,
        0,
        i < clusterEnd && i % 7 === 0 ? 1 : 0,
        within > 0.94 || bz === BARS - 1 ? 1 : 0, // lit bar tops + the front row
      ],
      i * 4,
    );
    meta.set([rand(), rand(), edgeT, edgePhase], i * 4);
    extra.set([isCentroid ? 1 : 0, isOutlier ? 1 : 0, bx * 0.7 + bz * 0.45, within], i * 4);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(p0, 3));
  g.setAttribute("aP1", new THREE.BufferAttribute(p1, 3));
  g.setAttribute("aP2", new THREE.BufferAttribute(p2, 3));
  g.setAttribute("aP3", new THREE.BufferAttribute(p3, 3));
  g.setAttribute("aAcc", new THREE.BufferAttribute(acc, 4));
  g.setAttribute("aMeta", new THREE.BufferAttribute(meta, 4));
  g.setAttribute("aExtra", new THREE.BufferAttribute(extra, 4));
  g.setAttribute("aHub", new THREE.BufferAttribute(hub, 1));

  const graph = new THREE.BufferGeometry();
  graph.setAttribute("position", new THREE.BufferAttribute(new Float32Array(EDGES.flatMap(([a, b]) => [...HUBS[a], ...HUBS[b]])), 3));

  // Spokes from each centroid out to a few of its members.
  const spokes: number[] = [];
  for (let i = CENTROIDS.length; i < 400; i += 3) {
    if (i % 61 === 0) continue;
    const k = i % CENTROIDS.length;
    spokes.push(...CENTROIDS[k], p1[i * 3], p1[i * 3 + 1], p1[i * 3 + 2]);
  }
  const clusters = new THREE.BufferGeometry();
  clusters.setAttribute("position", new THREE.BufferAttribute(new Float32Array(spokes), 3));

  // A trend line riding across the tops of the front row of bars.
  const trend: number[] = [];
  for (let bx = 0; bx < BARS - 1; bx++) {
    const z = barX(BARS - 1);
    trend.push(barX(bx), BAR_BASE + barHeight(bx, BARS - 1) + 0.18, z, barX(bx + 1), BAR_BASE + barHeight(bx + 1, BARS - 1) + 0.18, z);
  }
  const chart = new THREE.BufferGeometry();
  chart.setAttribute("position", new THREE.BufferAttribute(new Float32Array(trend), 3));

  return { points: g, graph, clusters, chart };
}

// Per-stage tilt: level for noise, above the clusters, face the graph,
// look down onto the dashboard.
const TILT = [-0.22, -0.32, -0.08, -0.52];

function Particles({ input, reduce }: { input: RefObject<ProcessInput>; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const graphMat = useRef<THREE.LineBasicMaterial>(null);
  const clusterMat = useRef<THREE.LineBasicMaterial>(null);
  const chartMat = useRef<THREE.LineBasicMaterial>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const shapes = useMemo(buildShapes, []);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMorph: { value: 0 }, uSize: { value: 0.05 }, uViewH: { value: 800 } }),
    [],
  );
  const spin = useRef(0);

  useEffect(
    () => () => Object.values(shapes).forEach((geo) => geo.dispose()),
    [shapes],
  );

  // Read size and renderer from the frame state (no store subscription,
  // so nothing here re-renders while the page scrolls).
  useFrame(({ size, gl }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = input.current;
    const ease = (rate: number) => 1 - Math.exp(-dt * rate);
    // R3F copies uniform objects onto the material, so write through the material.
    const u = material.current?.uniforms as typeof uniforms | undefined;
    if (!u) return;
    if (!reduce) u.uTime.value += dt;
    u.uMorph.value += (s.morph - u.uMorph.value) * (reduce ? 1 : ease(4.2));
    u.uViewH.value = size.height * gl.getPixelRatio();

    const m = u.uMorph.value;
    const w = (k: number) => Math.max(0, 1 - Math.abs(m - k));
    if (clusterMat.current) clusterMat.current.opacity = 0.16 * w(1) ** 2;
    if (graphMat.current) graphMat.current.opacity = 0.42 * w(2) ** 2;
    if (chartMat.current) chartMat.current.opacity = 0.85 * w(3) ** 3;

    const g = group.current;
    if (!g) return;
    if (!reduce) spin.current += dt * 0.14;
    const i = Math.min(2, Math.floor(m)), f = m - i;
    const tilt = TILT[i] + (TILT[i + 1] - TILT[i]) * f;
    g.rotation.y += (spin.current + s.mx * 0.45 - g.rotation.y) * ease(3);
    g.rotation.x += (tilt + s.my * 0.22 - g.rotation.x) * ease(3);
    const aspect = size.width / size.height;
    const sc = Math.min(1, aspect * 0.98);
    g.scale.setScalar(g.scale.x + (sc - g.scale.x) * ease(4));
  });

  return (
    <group ref={group}>
      <points geometry={shapes.points} frustumCulled={false}>
        <shaderMaterial
          ref={material}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={shapes.clusters} frustumCulled={false}>
        <lineBasicMaterial ref={clusterMat} color="#c8f25a" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={shapes.graph} frustumCulled={false}>
        <lineBasicMaterial ref={graphMat} color="#c8f25a" transparent opacity={0} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={shapes.chart} frustumCulled={false}>
        <lineBasicMaterial ref={chartMat} color="#c8f25a" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

export default function ProcessScene({
  input,
  active,
  reduce,
}: {
  input: RefObject<ProcessInput>;
  active: boolean;
  reduce: boolean;
}) {
  return (
    <Canvas
      // Capped at 1.5×: with MSAA on, 2× quadruples the fill cost on retina
      // screens for points that are soft-edged anyway.
      dpr={[1, 1.5]}
      // No pointer events go through R3F, so its scroll re-measure is unused.
      resize={{ scroll: false }}
      flat
      linear
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, 8.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Particles input={input} reduce={reduce} />
    </Canvas>
  );
}
