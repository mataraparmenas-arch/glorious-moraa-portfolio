import { Suspense, lazy, useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import { BodyGhost, BodyReveal } from "./BodySilhouette";

// The whole WebGL stack is code-split and mounted only after first paint.
const MedicalScene = lazy(() => import("./MedicalScene"));

function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Calm 2D stand-in for devices without WebGL. */
function SceneFallback() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden opacity-60">
      <div className="absolute right-[-10%] top-1/2 h-[80vh] w-[80vh] -translate-y-1/2 sm:right-[4%]">
        <BodyGhost className="absolute inset-0 h-full w-full" />
        <BodyReveal className="absolute inset-0 h-full w-full opacity-50" />
      </div>
    </div>
  );
}

export default function SceneLoader() {
  const [ready, setReady] = useState(false);
  const [supported] = useState(() => webglSupported());

  useEffect(() => {
    if (!supported) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let id: number;
    let idle = false;
    const start = () => setReady(true);
    const timer = window.setTimeout(() => {
      if (w.requestIdleCallback) {
        idle = true;
        id = w.requestIdleCallback(start, { timeout: 600 });
      } else {
        start();
      }
    }, 120);
    return () => {
      window.clearTimeout(timer);
      if (idle && w.cancelIdleCallback) w.cancelIdleCallback(id);
    };
  }, [supported]);

  if (!supported) return <SceneFallback />;
  if (!ready) return null;
  return (
    <ErrorBoundary fallback={<SceneFallback />}>
      <Suspense fallback={null}>
        <MedicalScene />
      </Suspense>
    </ErrorBoundary>
  );
}
