"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import "./quiet";

/** Mutable inputs written by the hero (no React re-renders per frame). */
export type GalaxyInput = {
  mx: number; // pointer in canvas NDC, -1..1
  my: number;
  mOn: number; // 1 while the pointer is over the hero
  scroll: number; // 0..1 hero scrolled out
  intro: number; // 0 → 1 once the loader wipes away
  wave: number; // bumped on every click: sends a shockwave from (wx, wy)
  wx: number; // click in canvas NDC
  wy: number;
};

// Shared by the dust, the nodes and the edges so all three stay locked
// together through the intro spiral, the cursor lens and the scroll bloom.
const common = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  uniform float uScroll;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  uniform vec4 uWaveA; // origin x, origin z, start time, amplitude
  uniform vec4 uWaveB;
  float gK;
  float gNear;
  float gWave;

  // A ring expanding across the disc from w.xy, fading as it travels.
  float wave(vec2 xz, vec4 w) {
    float age = uTime - w.z;
    if (w.w <= 0.0 || age < 0.0 || age > 3.6) return 0.0;
    float d = length(xz - w.xy) - age * 3.4;
    return exp(-d * d * 5.0) * w.w * (1.0 - age / 3.6);
  }

  vec3 galaxy(vec3 p, vec3 rnd) {
    float r = length(p.xz);
    float ang = atan(p.z, p.x);
    // Differential "breathing" swirl: inner orbits lead, arms never smear.
    ang += 0.32 * sin(uTime * 0.11 + r * 0.22) / (r + 0.9);
    // Intro: spiral in from a wide, scattered disc.
    float k = clamp(uIntro * 1.6 - rnd.x * 0.6, 0.0, 1.0);
    gK = 1.0 - pow(1.0 - k, 3.0);
    float rr = mix(r * 2.2 + 1.6 + rnd.y * 3.2, r, gK);
    ang += (1.0 - gK) * (3.2 + rnd.z * 2.6);
    p.x = cos(ang) * rr;
    p.z = sin(ang) * rr;
    p.y = mix(p.y + (rnd.x - 0.5) * 4.0, p.y, gK);
    // Shockwaves: the ring lifts the particles it passes and pushes them out.
    gWave = wave(p.xz, uWaveA) + wave(p.xz, uWaveB);
    p.y += gWave * (0.22 + rnd.y * 0.25);
    p.xz *= 1.0 + gWave * 0.05;
    // Scroll: the disc blooms outward and lifts apart.
    p.xz *= 1.0 + uScroll * (0.5 + rnd.y * 1.3);
    p.y += uScroll * (rnd.z - 0.5) * 5.0;
    return p;
  }

  // Cursor lens: push away from the pointer in screen space.
  vec4 lens(vec4 clip) {
    vec2 d = clip.xy / clip.w - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    vec2 dir = dist > 1e-4 ? d / dist : vec2(0.0);
    dir.x /= uAspect;
    gNear = uMouseOn * smoothstep(0.45, 0.0, dist);
    clip.xy += dir * gNear * 0.13 * clip.w;
    return clip;
  }
`;

const dustVert = /* glsl */ `
  ${common}
  uniform float uSize;
  uniform float uViewH;
  attribute vec3 aColor;
  attribute vec3 aRand;
  attribute float aScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(galaxy(position, aRand), 1.0);
    gl_Position = lens(projectionMatrix * mv);
    float tw = 0.6 + 0.4 * sin(uTime * (0.8 + aRand.x * 2.6) + aRand.y * 6.2831);
    float wv = clamp(gWave, 0.0, 1.0);
    gl_PointSize = min(uSize * aScale * uViewH / -mv.z * (0.8 + 0.2 * tw) * (1.0 + wv * 0.9), uViewH * 0.022);
    vColor = mix(aColor, vec3(0.86, 1.0, 0.5), wv * 0.9);
    vAlpha = gK * smoothstep(2.0, 4.5, -mv.z) * (1.0 - smoothstep(0.08, 0.9, uScroll)) * (0.45 + 0.45 * tw) * (1.0 + wv * 1.6);
  }
`;

const dustFrag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = exp(-d * d * 7.0);
    gl_FragColor = vec4(vColor * (0.65 + 0.8 * core), core * vAlpha);
  }
`;

const nodeVert = /* glsl */ `
  ${common}
  uniform float uSize;
  uniform float uViewH;
  uniform float uNet;
  attribute vec3 aRand;
  varying float vAlpha;
  varying float vNear;
  void main() {
    vec4 mv = modelViewMatrix * vec4(galaxy(position, aRand), 1.0);
    gl_Position = lens(projectionMatrix * mv);
    float beat = 0.75 + 0.25 * sin(uTime * 1.7 + aRand.z * 6.2831);
    gl_PointSize = min(uSize * 4.2 * uViewH / -mv.z * beat * (1.0 + gNear * 0.8 + gWave * 0.9), uViewH * 0.045);
    vNear = clamp(gNear + gWave, 0.0, 1.0);
    vAlpha = uNet * gK * smoothstep(2.0, 4.5, -mv.z) * (1.0 - smoothstep(0.05, 0.6, uScroll));
  }
`;

const nodeFrag = /* glsl */ `
  varying float vAlpha;
  varying float vNear;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = exp(-d * d * 22.0);
    float ring = smoothstep(0.07, 0.0, abs(d - 0.66)) * (0.25 + 0.75 * vNear);
    vec3 col = mix(vec3(1.0), vec3(0.784, 0.949, 0.353), 0.7);
    gl_FragColor = vec4(col, (core + ring) * vAlpha);
  }
`;

const edgeVert = /* glsl */ `
  ${common}
  uniform float uNet;
  attribute vec3 aRand;
  attribute float aT;
  attribute float aPhase;
  varying float vT;
  varying float vPhase;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(galaxy(position, aRand), 1.0);
    gl_Position = lens(projectionMatrix * mv);
    vT = aT;
    vPhase = aPhase;
    vAlpha = uNet * gK * smoothstep(2.0, 4.5, -mv.z) * (1.0 - smoothstep(0.05, 0.6, uScroll)) * (1.0 + 2.6 * gNear + 3.0 * gWave);
  }
`;

const edgeFrag = /* glsl */ `
  uniform float uTime;
  varying float vT;
  varying float vPhase;
  varying float vAlpha;
  void main() {
    // A signal travels along every edge.
    float head = fract(uTime * 0.26 + vPhase);
    float pulse = smoothstep(0.13, 0.0, abs(vT - head));
    gl_FragColor = vec4(vec3(0.784, 0.949, 0.353) * (0.8 + pulse), (0.035 + 0.75 * pulse) * vAlpha);
  }
`;

// Colours in sRGB (the canvas runs `linear` + `flat`, so no conversion).
const HOT = [1.0, 1.0, 0.97];
const LIME = [0.784, 0.949, 0.353];
const DUSK = [0.34, 0.34, 0.37];
const PAPER = [0.93, 0.93, 0.95];
const R = 5.4;
const BRANCHES = 4;
const SPIN = 1.05;

const mix3 = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);

function rng(seed: number) {
  return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
}

function buildDust(count: number) {
  const rand = rng(7);
  const signed = (pow: number) => Math.pow(rand(), pow) * (rand() < 0.5 ? -1 : 1);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 3);
  const scl = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const kind = rand();
    let x: number, y: number, z: number, r: number, s: number, c: number[];
    if (kind < 0.08) {
      // Bulge
      r = Math.pow(rand(), 1.8) * 0.85;
      const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.cos(ph) * 0.5;
      z = r * Math.sin(ph) * Math.sin(th);
      s = 0.4 + rand() * 0.7;
      c = mix3(HOT, LIME, (r / 0.85) * 0.35);
    } else if (kind < 0.12) {
      // Distant dust for depth
      r = 7 + rand() * 7;
      const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.cos(ph) * 0.45;
      z = r * Math.sin(ph) * Math.sin(th);
      s = 0.25 + rand() * 0.35;
      c = mix3(DUSK, PAPER, rand() * 0.5);
    } else {
      // Spiral arms
      r = Math.pow(rand(), 1.25) * R + 0.2;
      const a = ((i % BRANCHES) / BRANCHES) * Math.PI * 2 + r * SPIN;
      const spread = 0.07 + r * 0.1;
      x = Math.cos(a) * r + signed(2.6) * spread * 1.8;
      z = Math.sin(a) * r + signed(2.6) * spread * 1.8;
      y = signed(2.8) * spread * (0.9 - (r / R) * 0.45);
      s = 0.4 + Math.pow(rand(), 4) * 1.5;
      const t = Math.min(1, r / R);
      c = t < 0.32 ? mix3(HOT, PAPER, t / 0.32) : mix3(PAPER, DUSK, (t - 0.32) / 0.68);
      if (rand() < 0.24) c = mix3(LIME, DUSK, t * 0.6); // lime highlights
    }
    pos.set([x, y, z], i * 3);
    col.set(c, i * 3);
    rnd.set([rand(), rand(), rand()], i * 3);
    scl[i] = s;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aRand", new THREE.BufferAttribute(rnd, 3));
  g.setAttribute("aScale", new THREE.BufferAttribute(scl, 1));
  return g;
}

/** Neural constellation: nodes seeded along the arms, wired to their nearest neighbours. */
function buildNetwork(count: number) {
  const rand = rng(31);
  const nodes: { p: number[]; r: number[] }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 0.9 + Math.pow(rand(), 0.85) * 3.9;
    const a = ((i % BRANCHES) / BRANCHES) * Math.PI * 2 + r * SPIN + (rand() - 0.5) * 0.35;
    nodes.push({
      p: [Math.cos(a) * r, (rand() - 0.5) * 0.25, Math.sin(a) * r],
      // Late intro stagger so the network wires itself after the dust settles.
      r: [0.55 + rand() * 0.45, rand(), rand()],
    });
  }

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: Math.hypot(n.p[0] - m.p[0], n.p[1] - m.p[1], n.p[2] - m.p[2]) }))
      .filter((e) => e.j !== i && e.d < 1.35)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([i, j]);
        }
      });
  });

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nodes.flatMap((n) => n.p)), 3));
  nodeGeo.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(nodes.flatMap((n) => n.r)), 3));

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges.flatMap(([a, b]) => [...nodes[a].p, ...nodes[b].p])), 3));
  edgeGeo.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(edges.flatMap(([a, b]) => [...nodes[a].r, ...nodes[b].r])), 3));
  edgeGeo.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(edges.flatMap(() => [0, 1])), 1));
  const phases = edges.map(() => rand());
  edgeGeo.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(phases.flatMap((p) => [p, p])), 1));
  return { nodeGeo, edgeGeo };
}

/** Soft radial glow for the galactic core (additive, so it only ever brightens). */
function buildCoreTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,240,0.9)");
  g.addColorStop(0.12, "rgba(222,250,150,0.55)");
  g.addColorStop(0.4, "rgba(200,242,90,0.12)");
  g.addColorStop(1, "rgba(200,242,90,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const WAVE_DELAY = 1.25; // s after the intro starts: the first shockwave
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const plane = new THREE.Plane();
const hit = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

function Galaxy({ input, count, reduce }: { input: RefObject<GalaxyInput>; count: number; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Sprite>(null);
  const waves = useRef({ seen: 0, next: 0, introAt: -1 });

  const { dust, net, uniforms, mats } = useMemo(() => {
    const uniforms = {
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 0.036 },
      uViewH: { value: 800 },
      uAspect: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseOn: { value: 0 },
      uNet: { value: 0 },
      uWaveA: { value: new THREE.Vector4(0, 0, 0, 0) },
      uWaveB: { value: new THREE.Vector4(0, 0, 0, 0) },
    };
    const base = { uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const mats = {
      dust: new THREE.ShaderMaterial({ ...base, vertexShader: dustVert, fragmentShader: dustFrag }),
      node: new THREE.ShaderMaterial({ ...base, vertexShader: nodeVert, fragmentShader: nodeFrag }),
      edge: new THREE.ShaderMaterial({ ...base, vertexShader: edgeVert, fragmentShader: edgeFrag }),
    };
    return { dust: buildDust(count), net: buildNetwork(count > 8000 ? 64 : 40), uniforms, mats };
  }, [count]);
  const coreMat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: buildCoreTexture(),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useEffect(
    () => () => {
      [dust, net.nodeGeo, net.edgeGeo, mats.dust, mats.node, mats.edge].forEach((o) => o.dispose());
    },
    [dust, net, mats],
  );
  useEffect(
    () => () => {
      coreMat.map?.dispose();
      coreMat.dispose();
    },
    [coreMat],
  );

  // Fire a shockwave from a point on the disc (alternating two slots so
  // a quick second click doesn't cut the first ring short).
  const fire = (x: number, z: number, amp: number) => {
    const w = waves.current;
    const slot = w.next++ % 2 === 0 ? uniforms.uWaveA : uniforms.uWaveB;
    slot.value.set(x, z, uniforms.uTime.value, amp);
  };

  // Size, renderer and camera are read from the frame state rather than
  // subscribed to with useThree(), so store changes never re-render this.
  useFrame(({ size, gl, camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = input.current;
    const u = uniforms;
    const ease = (rate: number) => 1 - Math.exp(-dt * rate);
    if (!reduce) u.uTime.value += dt;
    u.uIntro.value += (s.intro - u.uIntro.value) * (reduce ? 1 : ease(0.95));
    const netTarget = Math.min(1, Math.max(0, (u.uIntro.value - 0.5) / 0.4));
    u.uNet.value += (netTarget - u.uNet.value) * (reduce ? 1 : ease(1.6));
    u.uScroll.value += (s.scroll - u.uScroll.value) * ease(7);
    u.uMouse.value.x += (s.mx - u.uMouse.value.x) * ease(6);
    u.uMouse.value.y += (s.my - u.uMouse.value.y) * ease(6);
    u.uMouseOn.value += (s.mOn - u.uMouseOn.value) * ease(3);
    u.uViewH.value = size.height * gl.getPixelRatio();
    u.uAspect.value = size.width / size.height;

    // Camera flies in from high and far as the intro plays, then drifts
    // gently with the pointer.
    const k = 1 - Math.pow(1 - Math.min(1, u.uIntro.value), 2.2);
    const cx = s.mx * 0.35 * s.mOn;
    camera.position.x += (cx - camera.position.x) * ease(2);
    camera.position.y = 5.8 + (2.2 - 5.8) * k;
    camera.position.z = 13.5 + (7.6 - 13.5) * k;
    camera.lookAt(0, 0.5, 0);

    const g = group.current;
    if (!g) return;

    if (!reduce) {
      const w = waves.current;
      // First ring rolls out once the spiral has mostly settled.
      if (s.intro > 0 && w.introAt < 0) w.introAt = u.uTime.value + WAVE_DELAY;
      if (w.introAt > 0 && u.uTime.value >= w.introAt) {
        w.introAt = 0;
        fire(0, 0, 1);
      }
      // Clicks: cast onto the disc plane and send a ring from there.
      if (s.wave !== w.seen) {
        w.seen = s.wave;
        ndc.set(s.wx, s.wy);
        raycaster.setFromCamera(ndc, camera);
        g.updateMatrixWorld();
        plane.setFromNormalAndCoplanarPoint(UP, new THREE.Vector3()).applyMatrix4(g.matrixWorld);
        if (raycaster.ray.intersectPlane(plane, hit)) {
          g.worldToLocal(hit);
          const r = Math.hypot(hit.x, hit.z);
          const lim = Math.min(1, 6 / Math.max(r, 1e-3)); // keep it on the disc
          fire(hit.x * lim, hit.z * lim, 0.9);
        } else fire(0, 0, 0.9);
      }
    }

    // Core glow breathes, swells with each ring and fades on scroll-out.
    if (core.current) {
      const breathe = reduce ? 1 : 0.85 + 0.15 * Math.sin(u.uTime.value * 0.9);
      const age = u.uTime.value - Math.max(u.uWaveA.value.z, u.uWaveB.value.z);
      const kick = age >= 0 && age < 1.2 ? (1 - age / 1.2) * 0.35 : 0;
      coreMat.opacity = (0.38 * breathe + kick) * k * (1 - Math.min(1, s.scroll * 1.6));
      const sc = 3.4 * (0.6 + 0.4 * k) * (1 + kick * 0.6);
      core.current.scale.set(sc, sc, 1);
    }
    if (!reduce) g.rotation.y += dt * (0.045 + s.scroll * 0.25);
    // Tilt follows the pointer; flattens toward the viewer as you scroll.
    const tx = -0.62 - s.my * 0.09 * s.mOn - s.scroll * 0.35;
    const tz = s.mx * 0.07 * s.mOn;
    g.rotation.x += (tx - g.rotation.x) * ease(2.2);
    g.rotation.z += (tz - g.rotation.z) * ease(2.2);
    // Portrait screens see a narrow slice of the disc: shrink it to fit.
    const fit = Math.min(1, Math.max(0.55, u.uAspect.value * 1.25));
    g.scale.setScalar(g.scale.x + (fit - g.scale.x) * ease(4));
  });

  return (
    <group ref={group} rotation={[-0.62, 0, 0]} position={[0, 0.9, 0]}>
      <points geometry={dust} material={mats.dust} frustumCulled={false} />
      <lineSegments geometry={net.edgeGeo} material={mats.edge} frustumCulled={false} />
      <points geometry={net.nodeGeo} material={mats.node} frustumCulled={false} />
      <sprite ref={core} material={coreMat} />
    </group>
  );
}

export default function HeroGalaxy({
  input,
  frameloop,
  reduce,
}: {
  input: RefObject<GalaxyInput>;
  frameloop: "always" | "demand" | "never";
  reduce: boolean;
}) {
  const count = typeof window !== "undefined" && window.innerWidth < 720 ? 6500 : 11000;
  return (
    <Canvas
      // Soft additive glows look the same at 1.5× as at 1.75×, for ~25% fewer pixels.
      dpr={[1, 1.5]}
      // The canvas never needs its page offset (no pointer events go through
      // R3F), so skip the scroll listener that re-measures and re-renders it.
      resize={{ scroll: false }}
      flat
      linear
      frameloop={frameloop}
      camera={{ position: [0, 5.8, 13.5], fov: 50 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.5, 0)}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Galaxy input={input} count={count} reduce={reduce} />
    </Canvas>
  );
}
