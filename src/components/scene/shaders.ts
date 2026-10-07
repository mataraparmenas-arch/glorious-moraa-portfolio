import * as THREE from "three";

export function createUniforms() {
  return {
    uTime: { value: 0 },
    uScanY: { value: 0 },
    uScan: { value: 1 },
    uPointer: { value: new THREE.Vector2(10, 10) },
    uPointerOn: { value: 0 },
    uAlpha: { value: 1 },
    uWarm: { value: 0 },
    uPixel: { value: 1 },
    uTrail: { value: 0 },
    uSize: { value: 1 },
  };
}
export type SharedUniforms = ReturnType<typeof createUniforms>;

const COMMON = /* glsl */ `
const vec3 C_COOL = vec3(0.56, 0.90, 1.0);
const vec3 C_HOT = vec3(0.86, 0.99, 1.0);
const vec3 C_MINT = vec3(0.56, 0.94, 0.83);
const vec3 C_WARM = vec3(1.0, 0.80, 0.62);
`;

/* ----------------------------- anatomical points ----------------------------- */
const pointsVert = /* glsl */ `
uniform float uTime;
uniform float uScanY;
uniform float uScan;
uniform float uPixel;
uniform float uAlpha;
uniform float uPointerOn;
uniform float uSize;
uniform vec2 uPointer;
attribute float aSize;
attribute float aSeed;
attribute float aKind;
varying float vGlow;
varying float vA;
varying float vKind;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * wp;
  float sd = abs(position.y - uScanY);
  float scan = (1.0 - smoothstep(0.0, 0.32, sd)) * uScan;
  float pd = distance(wp.xy, uPointer);
  float ptr = (1.0 - smoothstep(0.0, 1.3, pd)) * uPointerOn;
  float tw = 0.5 + 0.5 * sin(uTime * 1.4 + aSeed * 40.0);
  vGlow = clamp(scan + ptr * 0.9, 0.0, 1.5);
  float base = aKind > 0.5 ? 0.62 : 0.3;
  vA = uAlpha * (base + 0.22 * tw);
  vKind = aKind;
  gl_PointSize = aSize * uPixel * uSize * (1.0 + vGlow * 1.4) * (8.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const pointsFrag = /* glsl */ `
${COMMON}
uniform float uWarm;
varying float vGlow;
varying float vA;
varying float vKind;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = pow(1.0 - d * 2.0, 1.6);
  vec3 col = mix(C_COOL, C_HOT, clamp(vGlow, 0.0, 1.0));
  col = mix(col, C_MINT, vKind > 1.5 ? 0.65 : 0.0);
  col = mix(col, C_WARM, uWarm * 0.75);
  float a = core * vA * (1.0 + vGlow * 1.8);
  gl_FragColor = vec4(col, a);
}
`;

/* ------------------------------- wire / lines -------------------------------- */
const wireVert = /* glsl */ `
uniform float uScanY;
uniform float uScan;
uniform float uPointerOn;
uniform float uAlpha;
uniform float uBase;
uniform vec2 uPointer;
varying float vGlow;
varying float vA;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float sd = abs(position.y - uScanY);
  float scan = (1.0 - smoothstep(0.0, 0.34, sd)) * uScan;
  float pd = distance(wp.xy, uPointer);
  float ptr = (1.0 - smoothstep(0.0, 1.4, pd)) * uPointerOn;
  vGlow = clamp(scan + ptr * 0.8, 0.0, 1.5);
  vA = uAlpha * uBase;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const wireFrag = /* glsl */ `
${COMMON}
uniform float uWarm;
varying float vGlow;
varying float vA;
void main() {
  vec3 col = mix(C_COOL * 0.85, C_HOT, clamp(vGlow, 0.0, 1.0));
  col = mix(col, C_WARM, uWarm * 0.75);
  gl_FragColor = vec4(col, vA * (1.0 + vGlow * 3.2));
}
`;

/* ------------------------------ joint markers -------------------------------- */
const markerVert = /* glsl */ `
uniform float uTime;
uniform float uPixel;
uniform float uAlpha;
uniform float uPointerOn;
uniform float uSize;
uniform vec2 uPointer;
attribute float aHi;
attribute float aSeed;
attribute float aSize;
varying float vHi;
varying float vA;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * wp;
  float pd = distance(wp.xy, uPointer);
  float ptr = (1.0 - smoothstep(0.0, 0.9, pd)) * uPointerOn;
  vHi = clamp(aHi + ptr * 0.8, 0.0, 1.0);
  float pulse = 0.5 + 0.5 * sin(uTime * 2.2 + aSeed * 6.0);
  vA = uAlpha * (0.4 + 0.6 * vHi);
  gl_PointSize = aSize * uPixel * uSize * (1.0 + vHi * 0.9 + pulse * 0.14 * vHi) * (8.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const markerFrag = /* glsl */ `
${COMMON}
uniform float uWarm;
varying float vHi;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float ring = smoothstep(0.76, 0.84, d) * (1.0 - smoothstep(0.9, 1.0, d));
  float dotc = 1.0 - smoothstep(0.0, 0.16, d);
  float halo = (1.0 - smoothstep(0.2, 1.0, d)) * vHi * 0.22;
  float a = ring * 0.9 + dotc * (0.55 + vHi * 0.6) + halo;
  vec3 col = mix(C_COOL, C_HOT, vHi);
  col = mix(col, C_MINT, vHi * 0.35);
  col = mix(col, C_WARM, uWarm * 0.7);
  gl_FragColor = vec4(col, a * vA);
}
`;

/* ---------------------------------- trails ----------------------------------- */
const trailVert = /* glsl */ `
attribute float aAlpha;
uniform float uTrail;
uniform float uAlpha;
varying float vA;
void main() {
  vA = aAlpha * uTrail * uAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const trailFrag = /* glsl */ `
${COMMON}
uniform float uWarm;
varying float vA;
void main() {
  vec3 col = mix(mix(C_HOT, C_MINT, 0.35), C_WARM, uWarm * 0.7);
  gl_FragColor = vec4(col, vA * 0.9);
}
`;

/* ------------------------------- scan slice disc ------------------------------ */
const discVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const discFrag = /* glsl */ `
uniform float uBeam;
uniform float uWarm;
varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  if (r > 1.0) discard;
  float e1 = (r - 0.97) * 28.0;
  float e2 = (r - 0.66) * 40.0;
  float edge = exp(-e1 * e1);
  float inner = exp(-e2 * e2) * 0.22;
  float fill = (1.0 - smoothstep(0.0, 1.0, r)) * 0.06;
  float ang = atan(p.y, p.x) * 57.2958;
  float ticks = step(0.9, fract(ang / 6.0)) * smoothstep(0.84, 0.95, r) * 0.3;
  float a = (edge * 0.75 + inner + fill + ticks) * uBeam;
  vec3 col = mix(vec3(0.62, 0.93, 1.0), vec3(1.0, 0.84, 0.68), uWarm * 0.7);
  gl_FragColor = vec4(col, a);
}
`;

/* -------------------------------- particles ---------------------------------- */
const particleVert = /* glsl */ `
uniform float uTime;
uniform float uTravel;
uniform float uPixel;
uniform float uAlpha;
uniform float uPointerOn;
uniform float uSize;
uniform vec2 uPointer;
attribute float aSeed;
attribute float aSize;
varying float vA;
void main() {
  vec3 p = position;
  p.z = mod(position.z + 14.0 + uTravel, 20.0) - 14.0;
  p.x += sin(uTime * 0.13 + aSeed * 6.283) * 0.35;
  p.y += cos(uTime * 0.11 + aSeed * 12.0) * 0.3;
  p.xy -= uPointer * 0.03 * (1.0 + (p.z + 14.0) / 20.0);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  float pd = distance(p.xy, uPointer);
  float near = (1.0 - smoothstep(0.0, 1.6, pd)) * uPointerOn;
  float fade = smoothstep(-14.0, -10.0, p.z) * (1.0 - smoothstep(3.0, 6.0, p.z));
  vA = uAlpha * fade * (0.2 + 0.22 * (0.5 + 0.5 * sin(uTime * 0.8 + aSeed * 30.0)) + near * 0.6);
  gl_PointSize = aSize * uPixel * uSize * (8.2 / -mv.z) * (1.0 + near * 0.8);
  gl_Position = projectionMatrix * mv;
}
`;
const particleFrag = /* glsl */ `
${COMMON}
uniform float uWarm;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float core = pow(1.0 - d * 2.0, 1.8);
  vec3 col = mix(C_COOL, C_WARM, uWarm * 0.8);
  gl_FragColor = vec4(col, core * vA);
}
`;

const common = {
  transparent: true,
  depthWrite: false,
  depthTest: false,
  blending: THREE.AdditiveBlending,
} as const;

export function createFigureMaterials(U: SharedUniforms) {
  return {
    points: new THREE.ShaderMaterial({
      uniforms: { ...U },
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      ...common,
    }),
    wire: new THREE.ShaderMaterial({
      uniforms: { ...U, uBase: { value: 0.12 } },
      vertexShader: wireVert,
      fragmentShader: wireFrag,
      ...common,
    }),
    skeleton: new THREE.ShaderMaterial({
      uniforms: { ...U, uBase: { value: 0.42 } },
      vertexShader: wireVert,
      fragmentShader: wireFrag,
      ...common,
    }),
    markers: new THREE.ShaderMaterial({
      uniforms: { ...U },
      vertexShader: markerVert,
      fragmentShader: markerFrag,
      ...common,
    }),
    trail: new THREE.ShaderMaterial({
      uniforms: { ...U },
      vertexShader: trailVert,
      fragmentShader: trailFrag,
      ...common,
    }),
    disc: new THREE.ShaderMaterial({
      uniforms: { uBeam: { value: 0 }, uWarm: U.uWarm },
      vertexShader: discVert,
      fragmentShader: discFrag,
      side: THREE.DoubleSide,
      ...common,
    }),
  };
}

export function createParticleMaterial(U: SharedUniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uAlpha: { value: 1 }, uTravel: { value: 0 } },
    vertexShader: particleVert,
    fragmentShader: particleFrag,
    ...common,
  });
}
