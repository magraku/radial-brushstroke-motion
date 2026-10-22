import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TreeScene } from "./TreeScene";

/*
 * TreeCanvas — the 3D tree background with a cinematic camera that travels
 * along the tree as the user progresses:
 *   roots  -> account question
 *   trunk  -> niche picker (the tree "grows" as we climb)
 *   branch -> buy/sell intent
 *   canopy -> market study (leaves)
 *   fruit  -> product added / analysis (the fruit of the process)
 *   full   -> the app (inventory)
 */

export type TreeStage = "roots" | "trunk" | "branch" | "canopy" | "fruit" | "full";

const STAGES: Record<TreeStage, { pos: [number, number, number]; look: [number, number, number] }> = {
  roots: { pos: [0, 1.1, 5.2], look: [0, 1.3, 0] },
  trunk: { pos: [0.6, 4.6, 6.2], look: [0, 4.6, 0] },
  branch: { pos: [-3.6, 7.4, 5.4], look: [-2.6, 7.9, 0] },
  canopy: { pos: [0.4, 10.6, 8.4], look: [0, 10.4, 0] },
  fruit: { pos: [2.4, 10.0, 3.6], look: [1.9, 10.6, 0.4] },
  full: { pos: [0, 6.2, 17.5], look: [0, 5.8, 0] },
};

function CameraRig({ stage }: { stage: TreeStage }) {
  const lookTarget = useRef(new THREE.Vector3(...STAGES[stage].look));
  useFrame(({ camera }, delta) => {
    const s = STAGES[stage];
    const t = 1 - Math.exp(-2.4 * delta);
    camera.position.lerp(new THREE.Vector3(...s.pos), t);
    lookTarget.current.lerp(new THREE.Vector3(...s.look), t);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

export function TreeCanvas({ stage }: { stage: TreeStage }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Canvas dpr={[1, 1.5]} camera={{ position: STAGES[stage].pos, fov: 45, near: 0.1, far: 120 }} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={["#f7f2e0", 18, 42]} />
        <hemisphereLight args={["#fdfaf0", "#d8cfba", 1.1]} />
        <directionalLight position={[6, 12, 8]} intensity={1.4} />
        <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#80aee8" />
        <TreeScene />
        <CameraRig stage={stage} />
      </Canvas>
      {/* readability veil */}
      <div className="absolute inset-0 bg-background/30" />
    </div>
  );
}
