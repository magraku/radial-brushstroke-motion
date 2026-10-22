import { useMemo } from "react";
import * as THREE from "three";

/*
 * Procedural stylized tree — a winding trunk with sweeping branches, soft
 * leaf clusters and bordeaux fruits, matching the brand palette:
 *   bark   — warm grey-brown (mascot ink)
 *   leaves — Cool Horizon #80AEE8 (translucent)
 *   fruits — Night Bordeaux #5B0015
 * Everything is deterministic (seeded rng) so SSR and client agree.
 */

function rng(seed: number) {
  let s = seed % 2147483647;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

type BranchSpec = {
  points: [number, number, number][];
  r0: number;
  r1: number;
};

// Hand-tuned skeleton, echoing the winding tree from the design reference.
const BRANCHES: BranchSpec[] = [
  // trunk (bottom -> top)
  { points: [[0, 0, 0], [-0.35, 1.6, 0.15], [0.4, 3.2, -0.1], [-0.15, 4.8, 0.2], [0.3, 6.4, 0], [0, 8, 0.1], [0.15, 9.4, 0]], r0: 0.55, r1: 0.16 },
  // left sweeping branch
  { points: [[0.05, 5.6, 0.05], [-1.4, 6.3, 0.3], [-2.9, 6.9, 0.1], [-4.2, 7.9, -0.2], [-5.1, 9.2, 0]], r0: 0.24, r1: 0.05 },
  // left sub-branch
  { points: [[-2.9, 6.9, 0.1], [-3.6, 7.6, 0.7], [-4.0, 8.6, 0.9]], r0: 0.12, r1: 0.04 },
  // right sweeping branch
  { points: [[0.2, 7.2, 0], [1.7, 7.9, -0.2], [3.2, 8.5, 0.1], [4.4, 9.6, 0.3], [5.2, 10.9, 0.1]], r0: 0.22, r1: 0.05 },
  // right sub-branch
  { points: [[3.2, 8.5, 0.1], [3.9, 9.2, -0.6], [4.3, 10.3, -0.8]], r0: 0.11, r1: 0.04 },
  // top twigs
  { points: [[0.15, 9.4, 0], [-0.7, 10.4, 0.2], [-1.5, 11.1, 0.1]], r0: 0.1, r1: 0.03 },
  { points: [[0.15, 9.4, 0], [1.0, 10.5, -0.1], [1.9, 11.3, 0.1]], r0: 0.1, r1: 0.03 },
  { points: [[0.15, 9.4, 0], [0.1, 10.7, 0.3], [0.0, 11.9, 0.2]], r0: 0.09, r1: 0.03 },
  // roots
  { points: [[0, 0.25, 0], [-0.9, -0.05, 0.3], [-2.1, -0.25, 0.5]], r0: 0.3, r1: 0.06 },
  { points: [[0, 0.25, 0], [1.0, -0.05, -0.2], [2.3, -0.25, -0.4]], r0: 0.28, r1: 0.06 },
  { points: [[0, 0.25, 0], [0.2, -0.15, 0.9], [0.4, -0.3, 1.9]], r0: 0.24, r1: 0.05 },
  { points: [[0, 0.25, 0], [-0.3, -0.15, -0.8], [-0.7, -0.3, -1.8]], r0: 0.22, r1: 0.05 },
];

const LEAVES: { p: [number, number, number]; s: number }[] = [
  { p: [-5.2, 9.6, 0], s: 1.5 },
  { p: [-4.2, 10.4, 0.6], s: 1.15 },
  { p: [-6.0, 8.6, -0.4], s: 1.0 },
  { p: [-4.1, 8.9, 1.0], s: 0.85 },
  { p: [5.3, 11.3, 0.1], s: 1.45 },
  { p: [4.3, 12.1, -0.5], s: 1.05 },
  { p: [6.2, 10.5, 0.5], s: 0.95 },
  { p: [4.4, 10.6, -1.0], s: 0.8 },
  { p: [0.1, 12.4, 0.2], s: 1.6 },
  { p: [-1.4, 11.6, 0.3], s: 1.05 },
  { p: [1.7, 11.8, -0.2], s: 1.1 },
  { p: [0.6, 13.3, -0.3], s: 0.9 },
];

const FRUITS: [number, number, number][] = [
  [1.9, 10.6, 0.4],
  [-1.3, 10.9, 0.5],
  [4.6, 10.2, 0.7],
  [-4.6, 9.0, 0.4],
  [0.4, 11.6, -0.5],
];

function taperedTube(spec: BranchSpec): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(spec.points.map((p) => new THREE.Vector3(...p)));
  const tubular = 48;
  const radial = 10;
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  // TubeGeometry has uniform radius — taper it by scaling each ring toward the curve spine.
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    const r = spec.r0 + (spec.r1 - spec.r0) * t;
    const spine = curve.getPoint(t);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      const v = new THREE.Vector3(pos.getX(idx), pos.getY(idx), pos.getZ(idx));
      v.sub(spine).multiplyScalar(r).add(spine);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

export function TreeScene() {
  const { branchGeos, leafGeos } = useMemo(() => {
    const branchGeos = BRANCHES.map(taperedTube);
    const r = rng(42);
    const leafGeos = LEAVES.map((l) => {
      const g = new THREE.IcosahedronGeometry(l.s, 1);
      // gently squash + jitter for an organic cloud feel
      const pos = g.attributes["position"] as THREE.BufferAttribute;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        const j = 1 + (r() - 0.5) * 0.25;
        pos.setXYZ(i, v.x * j, v.y * 0.82 * j, v.z * j);
      }
      g.computeVertexNormals();
      return g;
    });
    return { branchGeos, leafGeos };
  }, []);

  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.32}>
        <circleGeometry args={[40, 48]} />
        <meshStandardMaterial color="#efe8d2" roughness={1} />
      </mesh>

      {/* bark */}
      {branchGeos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#8f867c" roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* leaves */}
      {leafGeos.map((g, i) => (
        <mesh key={i} geometry={g} position={LEAVES[i]!.p}>
          <meshStandardMaterial color="#a8c8ee" roughness={0.9} flatShading transparent opacity={0.85} />
        </mesh>
      ))}

      {/* fruits */}
      {FRUITS.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#5b0015" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
