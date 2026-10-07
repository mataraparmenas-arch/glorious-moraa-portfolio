import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { world } from "../lib/world";
import { KF_KEYS, type KF } from "../lib/keyframes";
import { FIG_CY, FIG_H, TISSUE, viewMetrics, type Detail } from "./scene/constants";
import { createFigureMaterials, type SharedUniforms } from "./scene/shaders";
import {
  JI,
  JOINTS,
  SK_PAIRS,
  buildFigure,
  mixPose,
  newPose,
  newSolved,
  solve,
  updateMarkers,
  updateSkeleton,
  updateVertices,
  type JointName,
} from "./scene/skeleton";
import { idlePose, labPose, labYaw, phaseWeights, sstep } from "./scene/poses";

const TRAIL_LEN = 56;
const TRAIL_JOINTS: JointName[] = ["elbowL", "elbowR", "wristL", "wristR", "kneeL", "kneeR", "toeL", "toeR"];

const MARKER_SIZE: Record<JointName, number> = {
  pelvis: 18,
  spineMid: 12,
  chest: 16,
  neck: 14,
  headTop: 8,
  shoulderL: 30,
  shoulderR: 30,
  elbowL: 26,
  elbowR: 26,
  wristL: 18,
  wristR: 18,
  handL: 9,
  handR: 9,
  hipL: 28,
  hipR: 28,
  kneeL: 28,
  kneeR: 28,
  ankleL: 24,
  ankleR: 24,
  toeL: 10,
  toeR: 10,
};

const KEY_JOINTS = new Set<JointName>([
  "shoulderL",
  "shoulderR",
  "elbowL",
  "elbowR",
  "hipL",
  "hipR",
  "kneeL",
  "kneeR",
  "ankleL",
  "ankleR",
]);

const HI_MAP: Partial<Record<JointName, number>> = {
  shoulderL: 0,
  shoulderR: 0,
  elbowL: 1,
  elbowR: 1,
  wristL: 1,
  wristR: 1,
  hipL: 2,
  hipR: 2,
  kneeL: 2,
  kneeR: 2,
  ankleL: 3,
  ankleR: 3,
  toeL: 3,
  toeR: 3,
};

const COOL = new THREE.Color(0x8fdcf2);
const WARM = new THREE.Color(0xffcfa6);

function circleSegs(r: number, n: number, y: number, out: number[]) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    out.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r);
  }
}

function createRig(detail: Detail, U: SharedUniforms) {
  const fig = buildFigure(TISSUE[detail]);
  const mats = createFigureMaterials(U);

  // shared position buffer for points + contour lines
  const posAttr = new THREE.BufferAttribute(fig.positions, 3);
  posAttr.setUsage(THREE.DynamicDrawUsage);

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", posAttr);
  pGeo.setAttribute("aSize", new THREE.BufferAttribute(fig.size, 1));
  pGeo.setAttribute("aSeed", new THREE.BufferAttribute(fig.seed, 1));
  pGeo.setAttribute("aKind", new THREE.BufferAttribute(fig.kind, 1));
  const points = new THREE.Points(pGeo, mats.points);

  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute("position", posAttr);
  lGeo.setIndex(new THREE.BufferAttribute(fig.lineIndex, 1));
  const wire = new THREE.LineSegments(lGeo, mats.wire);

  // skeleton
  const skPos = new Float32Array(SK_PAIRS.length * 2 * 3);
  const skAttr = new THREE.BufferAttribute(skPos, 3);
  skAttr.setUsage(THREE.DynamicDrawUsage);
  const skGeo = new THREE.BufferGeometry();
  skGeo.setAttribute("position", skAttr);
  const skeleton = new THREE.LineSegments(skGeo, mats.skeleton);

  // joint markers
  const mPos = new Float32Array(JOINTS.length * 3);
  const mHi = new Float32Array(JOINTS.length);
  const mPosAttr = new THREE.BufferAttribute(mPos, 3);
  mPosAttr.setUsage(THREE.DynamicDrawUsage);
  const mHiAttr = new THREE.BufferAttribute(mHi, 1);
  mHiAttr.setUsage(THREE.DynamicDrawUsage);
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute("position", mPosAttr);
  mGeo.setAttribute("aHi", mHiAttr);
  mGeo.setAttribute("aSize", new THREE.BufferAttribute(Float32Array.from(JOINTS.map((j) => MARKER_SIZE[j])), 1));
  mGeo.setAttribute("aSeed", new THREE.BufferAttribute(Float32Array.from(JOINTS.map((_, i) => (i * 0.37) % 1)), 1));
  const markers = new THREE.Points(mGeo, mats.markers);

  // motion trails
  const trails = TRAIL_JOINTS.map((name) => {
    const pos = new Float32Array(TRAIL_LEN * 3);
    const alpha = new Float32Array(TRAIL_LEN);
    for (let i = 0; i < TRAIL_LEN; i++) alpha[i] = Math.pow(1 - i / (TRAIL_LEN - 1), 1.6);
    const attr = new THREE.BufferAttribute(pos, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", attr);
    geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
    const line = new THREE.Line(geo, mats.trail);
    return { j: JI[name], pos, attr, geo, line, init: false };
  });

  // scan slice (a CT-like disc travelling the body)
  const discGeo = new THREE.CircleGeometry(1.25, 72);
  const disc = new THREE.Mesh(discGeo, mats.disc);
  disc.rotation.x = -Math.PI / 2;

  // platform at the feet: coordinate rings + ticks
  const platPts: number[] = [];
  circleSegs(1.05, 96, 0, platPts);
  circleSegs(1.5, 120, 0, platPts);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r0 = 1.5;
    const r1 = i % 6 === 0 ? 1.68 : 1.58;
    platPts.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * r1, 0, Math.sin(a) * r1);
  }
  platPts.push(-1.8, 0, 0, 1.8, 0, 0, 0, 0, -1.8, 0, 0, 1.8);
  const platGeo = new THREE.BufferGeometry();
  platGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(platPts), 3));
  const platMat = new THREE.LineBasicMaterial({
    color: 0x8fdcf2,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const platform = new THREE.LineSegments(platGeo, platMat);
  platform.position.y = -1.7;

  const root = new THREE.Group();
  root.add(platform, wire, skeleton, points, markers, disc);
  trails.forEach((t) => root.add(t.line));
  root.traverse((o) => {
    o.frustumCulled = false;
  });

  const dispose = () => {
    [pGeo, lGeo, skGeo, mGeo, discGeo, platGeo].forEach((g) => g.dispose());
    trails.forEach((t) => t.geo.dispose());
    Object.values(mats).forEach((m) => m.dispose());
    platMat.dispose();
  };

  return {
    root,
    fig,
    posAttr,
    skPos,
    skAttr,
    mPos,
    mPosAttr,
    mHi,
    mHiAttr,
    mats,
    trails,
    disc,
    platform,
    platMat,
    pGeo,
    lowApplied: false,
    dispose,
  };
}

export default function AnatomyModel({ detail, uniforms }: { detail: Detail; uniforms: SharedUniforms }) {
  const rig = useMemo(() => createRig(detail, uniforms), [detail, uniforms]);
  useEffect(() => () => rig.dispose(), [rig]);

  const st = useRef({
    cur: { ...world.kf } as KF,
    t: 0,
    intro: 0,
    ptr: 0,
    idle: newPose(),
    lab: newPose(),
    pose: newPose(),
    solved: newSolved(),
    ph: [0, 0, 0, 0],
    v: new THREE.Vector3(),
  });

  useFrame((state, dtRaw) => {
    const S = st.current;
    const dt = Math.min(dtRaw, 0.05);
    const reduced = world.reduced;
    if (!reduced) S.t += dt;
    const t = S.t;

    const kf = world.kf;
    const k = reduced ? 1 : 1 - Math.exp(-3.2 * dt);
    for (const key of KF_KEYS) S.cur[key] += (kf[key] - S.cur[key]) * k;
    const cur = S.cur;

    S.intro = reduced ? 1 : Math.min(1, S.intro + dt / 1.5);
    const introE = 1 - Math.pow(1 - S.intro, 3);
    const U = uniforms;
    const vis = cur.a * introE;

    const root = rig.root;
    root.visible = vis > 0.01;
    if (!root.visible) return;

    const { width, height } = state.size;
    const { visW, visH, cosP } = viewMetrics(width / Math.max(1, height));
    const s = (cur.h * visH) / FIG_H;
    root.position.set((cur.x * visW) / 2, (cur.y * visH) / 2 / cosP - FIG_CY * s, 0);
    root.scale.setScalar(s);

    const m = world.lab;
    const yaw =
      cur.yaw + cur.swing * Math.sin(t * 0.34) + labYaw(m) * cur.move + (reduced ? 0 : world.pxs * 0.35);
    root.rotation.set(reduced ? 0 : -world.pys * 0.07, yaw, 0);

    // ---- pose -------------------------------------------------------------
    idlePose(t, cur.amp, S.idle);
    labPose(m, S.lab);
    mixPose(S.idle, S.lab, Math.min(1, Math.max(0, cur.move)), S.pose);
    solve(S.pose, S.solved);

    updateVertices(rig.fig, S.solved, S.pose.breath, rig.fig.positions);
    rig.posAttr.needsUpdate = true;
    updateSkeleton(S.solved, rig.skPos);
    rig.skAttr.needsUpdate = true;
    updateMarkers(S.solved, rig.mPos);
    rig.mPosAttr.needsUpdate = true;

    phaseWeights(m, S.ph);
    for (let i = 0; i < JOINTS.length; i++) {
      const name = JOINTS[i];
      const ph = HI_MAP[name];
      let h = KEY_JOINTS.has(name) ? 0.22 : 0;
      if (ph !== undefined) h = Math.max(h, S.ph[ph] * cur.move);
      rig.mHi[i] = h;
    }
    rig.mHiAttr.needsUpdate = true;

    if (!reduced) {
      for (const tr of rig.trails) {
        const p = S.solved.pos[tr.j];
        if (!tr.init) {
          for (let i = 0; i < TRAIL_LEN; i++) {
            tr.pos[i * 3] = p.x;
            tr.pos[i * 3 + 1] = p.y;
            tr.pos[i * 3 + 2] = p.z;
          }
          tr.init = true;
        } else {
          tr.pos.copyWithin(3, 0, (TRAIL_LEN - 1) * 3);
          tr.pos[0] = p.x;
          tr.pos[1] = p.y;
          tr.pos[2] = p.z;
        }
        tr.attr.needsUpdate = true;
      }
    }

    if (world.lowPower && !rig.lowApplied) {
      rig.pGeo.setDrawRange(0, rig.fig.surfaceCount);
      rig.lowApplied = true;
    }

    // ---- scan beam --------------------------------------------------------
    const speed = 0.1 * (0.4 + cur.scan);
    const ph = reduced ? 0.5 : (t * speed) % 1;
    const env = reduced ? 0 : sstep(0, 0.08, ph) * (1 - sstep(0.92, 1, ph));
    const scanY = -1.78 + 3.4 * ph;
    U.uScanY.value = scanY;
    U.uScan.value = cur.scan * env;
    rig.disc.position.y = scanY;
    rig.mats.disc.uniforms.uBeam.value = cur.scan * env * introE;

    // ---- uniforms ---------------------------------------------------------
    U.uTime.value = t;
    U.uAlpha.value = vis;
    U.uWarm.value = world.warmS;
    U.uPixel.value = state.gl.getPixelRatio();
    U.uTrail.value = reduced ? 0 : cur.trail * introE;
    U.uSize.value = Math.min(1.3, Math.max(0.55, s / 1.3));
    U.uPointer.value.set((world.pxs * visW) / 2, (world.pys * visH) / 2 / cosP);
    S.ptr += ((world.pointerOn && !reduced ? 1 : 0) - S.ptr) * Math.min(1, dt * 6);
    U.uPointerOn.value = S.ptr;

    rig.platform.rotation.y += dt * 0.12;
    rig.platMat.opacity = 0.22 * vis;
    rig.platMat.color.lerpColors(COOL, WARM, world.warmS);

    // ---- project joints for DOM overlays ---------------------------------
    root.updateMatrixWorld(true);
    state.camera.updateMatrixWorld();
    for (let i = 0; i < JOINTS.length; i++) {
      S.v.copy(S.solved.pos[i]);
      root.localToWorld(S.v);
      S.v.project(state.camera);
      const name = JOINTS[i];
      let o = world.joints[name];
      if (!o) {
        o = { x: 0, y: 0 };
        world.joints[name] = o;
      }
      o.x = (S.v.x * 0.5 + 0.5) * width;
      o.y = (-S.v.y * 0.5 + 0.5) * height;
    }
  });

  return <primitive object={rig.root} />;
}
