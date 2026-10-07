import { useEffect, useMemo, useRef } from "react";
import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { world } from "../lib/world";
import { CAM_Y, CAM_Z, DPR_MAX, FOV, computeDetail } from "./scene/constants";
import { createUniforms } from "./scene/shaders";
import AnatomyModel from "./AnatomyModel";
import SceneEnvironment from "./SceneEnvironment";

/** Camera with a gentle, damped parallax (disabled for reduced motion). */
function CameraRig() {
  useFrame((state) => {
    const { camera } = state;
    const px = world.reduced ? 0 : world.pxs;
    const py = world.reduced ? 0 : world.pys;
    camera.position.x += (px * 0.35 - camera.position.x) * 0.06;
    camera.position.y += (CAM_Y + py * 0.18 - camera.position.y) * 0.06;
    camera.position.z = CAM_Z;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Watches frame time; on weak devices lowers resolution and effects automatically. */
function PerfGuard() {
  const setDpr = useThree((s) => s.setDpr);
  const acc = useRef({ n: 0, sum: 0, done: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.done || world.reduced || dt > 0.25) return;
    a.n++;
    if (a.n > 40) a.sum += dt;
    if (a.n >= 160) {
      const avg = a.sum / 120;
      if (avg > 0.034) {
        world.lowPower = true;
        setDpr(1);
      }
      a.done = true;
    }
  });
  return null;
}

export default function MedicalScene() {
  const detail = useMemo(() => computeDetail(), []);
  const uniforms = useMemo(() => createUniforms(), []);

  useEffect(() => {
    world.invalidate = () => invalidate();
    return () => {
      world.invalidate = null;
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1]">
      <Canvas
        flat
        dpr={[1, DPR_MAX[detail]]}
        frameloop={world.reduced ? "demand" : "always"}
        camera={{ position: [0, CAM_Y, CAM_Z], fov: FOV, near: 0.1, far: 80 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CameraRig />
        <SceneEnvironment detail={detail} uniforms={uniforms} />
        <AnatomyModel detail={detail} uniforms={uniforms} />
        <PerfGuard />
      </Canvas>
    </div>
  );
}
