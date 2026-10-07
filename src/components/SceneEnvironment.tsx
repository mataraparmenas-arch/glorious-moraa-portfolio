import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../lib/world";
import { PARTICLES, viewMetrics, type Detail } from "./scene/constants";
import { createParticleMaterial, type SharedUniforms } from "./scene/shaders";
import { sstep } from "./scene/poses";

const RING_COUNT = 7;
const SPAN = 36;
const COOL = new THREE.Color(0x7fd8f0);
const WARM = new THREE.Color(0xffcfa6);

/** A partial scanner-gantry ring with fine measurement ticks. */
function ringGeometry(r: number, seed: number) {
  const pts: number[] = [];
  const seg = 160;
  const a0 = seed * 1.7;
  const arc = Math.PI * (1.35 + 0.5 * Math.sin(seed * 3.1));
  const add = (rad: number, from: number, sweep: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = from + (sweep * i) / n;
      const b = from + (sweep * (i + 1)) / n;
      pts.push(Math.cos(a) * rad, Math.sin(a) * rad, 0, Math.cos(b) * rad, Math.sin(b) * rad, 0);
    }
  };
  add(r, a0, arc, seg);
  add(r * 0.955, a0 + arc * 0.5, Math.PI * 0.9, 80);
  const step = (3 * Math.PI) / 180;
  for (let k = 0; k * step < arc; k++) {
    const a = a0 + k * step;
    const len = k % 5 === 0 ? 0.13 : 0.05;
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(a) * (r - len), Math.sin(a) * (r - len), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
  return g;
}

function build(detail: Detail, U: SharedUniforms) {
  const root = new THREE.Group();

  const rings = Array.from({ length: RING_COUNT }, (_, i) => {
    const geo = ringGeometry(3.7 + (i % 3) * 0.45, i + 1);
    const mat = new THREE.LineBasicMaterial({
      color: 0x7fd8f0,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const line = new THREE.LineSegments(geo, mat);
    line.frustumCulled = false;
    const g = new THREE.Group();
    g.add(line);
    root.add(g);
    return { g, geo, mat };
  });

  const count = PARTICLES[detail];
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rnd() - 0.5) * 18;
    pos[i * 3 + 1] = (rnd() - 0.5) * 11;
    pos[i * 3 + 2] = -14 + rnd() * 20;
    seed[i] = rnd();
    size[i] = 2 + rnd() * 3.2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  pGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const pMat = createParticleMaterial(U);
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  root.add(points);

  const dispose = () => {
    rings.forEach((r) => {
      r.geo.dispose();
      r.mat.dispose();
    });
    pGeo.dispose();
    pMat.dispose();
  };
  return { root, rings, points, pMat, dispose };
}

export default function SceneEnvironment({ detail, uniforms }: { detail: Detail; uniforms: SharedUniforms }) {
  const env = useMemo(() => build(detail, uniforms), [detail, uniforms]);
  useEffect(() => () => env.dispose(), [env]);
  const st = useRef({ t: 0, intro: 0, env: 1 });

  useFrame((state, dtRaw) => {
    const S = st.current;
    const dt = Math.min(dtRaw, 0.05);
    const reduced = world.reduced;
    if (!reduced) S.t += dt;
    S.intro = reduced ? 1 : Math.min(1, S.intro + dt / 2);
    S.env += (world.kf.env - S.env) * (reduced ? 1 : 1 - Math.exp(-3 * dt));
    const t = S.t;
    const travel = reduced ? 0 : world.travel * 6 + t * 0.25;
    const { visW, visH, cosP } = viewMetrics(state.size.width / Math.max(1, state.size.height));

    env.rings.forEach(({ g, mat }, i) => {
      const z = ((((i * SPAN) / RING_COUNT + travel) % SPAN) + SPAN) % SPAN - 27;
      g.position.set(Math.sin(i * 2.3) * 0.4, Math.cos(i * 1.7) * 0.3, z);
      g.rotation.z = i * 0.9 + (reduced ? 0 : t * 0.05 * (i % 2 ? 1 : -1));
      const far = sstep(-27, -17, z);
      const near = 1 - sstep(0.5, 6.5, z);
      mat.opacity = 0.4 * far * near * S.env * S.intro;
      mat.color.lerpColors(COOL, WARM, world.warmS);
    });

    const u = env.pMat.uniforms;
    u.uTime.value = t;
    u.uTravel.value = travel;
    u.uPixel.value = state.gl.getPixelRatio();
    u.uWarm.value = world.warmS;
    u.uAlpha.value = S.intro * (0.4 + 0.6 * S.env);
    u.uSize.value = world.portrait ? 0.7 : 1;
    u.uPointer.value.set((world.pxs * visW) / 2, (world.pys * visH) / 2 / cosP);
    u.uPointerOn.value = world.pointerOn && !reduced ? 1 : 0;
    env.points.visible = !world.lowPower;
  });

  return <primitive object={env.root} />;
}
