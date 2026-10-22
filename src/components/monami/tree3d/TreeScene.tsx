import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * Procedural stylized ("Pixar-like") tree:
 *   bark   — polished silver, smooth shading, recursive branching
 *   leaves — Night Bordeaux, real leaf shapes (shown when the user sells)
 *   fruits — glossy bordeaux berries with stems (shown when the user buys)
 * Deterministic (seeded rng) so every render is identical.
 */

export type Bloom = "none" | "leaves" | "fruits" | "both";

function rng(seed: number) {
  let s = seed % 2147483647;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

type Tip = { p: THREE.Vector3; d: THREE.Vector3 };

function tube(points: THREE.Vector3[], r0: number, r1: number, tubular: number, radial: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    // ease the taper + flare at the base for an organic, sculpted feel
    const r = r1 + (r0 - r1) * Math.pow(1 - t, 1.4) + (t < 0.12 ? (0.12 - t) * r0 * 1.6 : 0);
    const spine = curve.getPoint(t);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.set(pos.getX(idx), pos.getY(idx), pos.getZ(idx)).sub(spine).multiplyScalar(r).add(spine);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

type Spec = { points: [number, number, number][]; r0: number; r1: number; root?: boolean };

// Hand-tuned winding skeleton (the original tree), echoing the design reference.
const BRANCHES: Spec[] = [
  { points: [[0, -0.3, 0], [-0.35, 1.6, 0.15], [0.4, 3.2, -0.1], [-0.15, 4.8, 0.2], [0.3, 6.4, 0], [0, 8, 0.1], [0.15, 9.4, 0]], r0: 0.6, r1: 0.16 },
  { points: [[0.05, 5.6, 0.05], [-1.4, 6.3, 0.3], [-2.9, 6.9, 0.1], [-4.2, 7.9, -0.2], [-5.1, 9.2, 0]], r0: 0.26, r1: 0.05 },
  { points: [[-2.9, 6.9, 0.1], [-3.6, 7.6, 0.7], [-4.0, 8.6, 0.9]], r0: 0.13, r1: 0.04 },
  { points: [[0.2, 7.2, 0], [1.7, 7.9, -0.2], [3.2, 8.5, 0.1], [4.4, 9.6, 0.3], [5.2, 10.9, 0.1]], r0: 0.24, r1: 0.05 },
  { points: [[3.2, 8.5, 0.1], [3.9, 9.2, -0.6], [4.3, 10.3, -0.8]], r0: 0.12, r1: 0.04 },
  { points: [[0.15, 9.4, 0], [-0.7, 10.4, 0.2], [-1.5, 11.1, 0.1]], r0: 0.11, r1: 0.03 },
  { points: [[0.15, 9.4, 0], [1.0, 10.5, -0.1], [1.9, 11.3, 0.1]], r0: 0.11, r1: 0.03 },
  { points: [[0.15, 9.4, 0], [0.1, 10.7, 0.3], [0.0, 11.9, 0.2]], r0: 0.1, r1: 0.03 },
  { points: [[0, 0.25, 0], [-0.9, -0.05, 0.3], [-2.1, -0.25, 0.5]], r0: 0.32, r1: 0.05, root: true },
  { points: [[0, 0.25, 0], [1.0, -0.05, -0.2], [2.3, -0.25, -0.4]], r0: 0.3, r1: 0.05, root: true },
  { points: [[0, 0.25, 0], [0.2, -0.15, 0.9], [0.4, -0.3, 1.9]], r0: 0.26, r1: 0.05, root: true },
  { points: [[0, 0.25, 0], [-0.3, -0.15, -0.8], [-0.7, -0.3, -1.8]], r0: 0.24, r1: 0.05, root: true },
  { points: [[0, 0.2, 0], [0.8, -0.1, 0.8], [1.6, -0.3, 1.3]], r0: 0.18, r1: 0.04, root: true },
];

function buildTree() {
  const r = rng(7);
  const geos: THREE.BufferGeometry[] = [];
  const tips: Tip[] = [];

  BRANCHES.forEach((b, bi) => {
    const pts = b.points.map((p) => new THREE.Vector3(...p));
    const big = b.r0 > 0.2;
    geos.push(tube(pts, b.r0, b.r1, big ? 64 : 32, big ? 24 : 14));
    if (b.root) return;
    const curve = new THREE.CatmullRomCurve3(pts);
    const end = curve.getPoint(1);
    tips.push({ p: end, d: curve.getTangent(1) });
    if (bi === 0) return;
    // Pixar detail: little curling twigs sprouting along each branch
    const n = big ? 4 : 2;
    for (let k = 0; k < n; k++) {
      const t = 0.35 + (k / n) * 0.6 + r() * 0.05;
      const from = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const side = new THREE.Vector3((r() - 0.5) * 2, 0.6 + r() * 0.6, (r() - 0.5) * 2).normalize();
      const d = tan.clone().lerp(side, 0.65).normalize();
      const len = (big ? 1.3 : 0.8) * (0.7 + r() * 0.5);
      const p1 = from.clone().addScaledVector(d, len * 0.5);
      const p2 = p1.clone().addScaledVector(d.clone().add(new THREE.Vector3((r() - 0.5) * 0.6, 0.35, (r() - 0.5) * 0.6)).normalize(), len * 0.5);
      geos.push(tube([from, p1, p2], b.r0 * 0.38, 0.025, 16, 8));
      tips.push({ p: p2, d });
    }
  });

  // keep per-tube smooth normals (recomputing after merge would facet the seams)
  const bark = mergeGeometries(geos, false)!;
  return { bark, tips };
}

function leafGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.13, 0.08, 0.15, 0.3, 0, 0.46);
  s.bezierCurveTo(-0.15, 0.3, -0.13, 0.08, 0, 0);
  const g = new THREE.ShapeGeometry(s, 8);
  // cup the leaf slightly so light rolls across it
  const pos = g.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    pos.setZ(i, x * x * 2.2 - y * y * 0.35);
  }
  g.computeVertexNormals();
  return g;
}

function useGrowth(target: boolean) {
  const g = useRef(target ? 1 : 0);
  return { g, target };
}

function Instanced({ geometry, material, matrices, colors, visible }: { geometry: THREE.BufferGeometry; material: THREE.Material; matrices: THREE.Matrix4[]; colors?: THREE.Color[]; visible: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { g } = useGrowth(visible);
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(), m: new THREE.Matrix4() }), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh || !colors) return;
    colors.forEach((c, i) => mesh.setColorAt(i, c));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [colors]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const goal = visible ? 1 : 0;
    if (Math.abs(g.current - goal) < 0.001 && mesh.userData["init"]) return;
    g.current += (goal - g.current) * (1 - Math.exp(-3 * Math.min(delta, 0.05)));
    mesh.userData["init"] = true;
    matrices.forEach((m, i) => {
      // staggered pop-in: each instance grows in its own window
      const local = THREE.MathUtils.clamp(g.current * 1.6 - (i / matrices.length) * 0.6, 0, 1);
      const e = 1 - Math.pow(1 - local, 3);
      m.decompose(tmp.p, tmp.q, tmp.s);
      tmp.s.multiplyScalar(e);
      tmp.m.compose(tmp.p, tmp.q, tmp.s);
      mesh.setMatrixAt(i, tmp.m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = g.current > 0.002;
  });

  return <instancedMesh ref={ref} args={[geometry, material, matrices.length]} frustumCulled={false} />;
}

export function TreeScene({ bloom = "none" }: { bloom?: Bloom }) {
  const data = useMemo(() => {
    const { bark, tips } = buildTree();
    const r = rng(99);

    const leafGeo = leafGeometry();
    const leafM: THREE.Matrix4[] = [];
    const leafC: THREE.Color[] = [];
    const shades = ["#5b0015", "#741026", "#8c1d33", "#4a0011"].map((c) => new THREE.Color(c));
    tips.forEach((t) => {
      for (let k = 0; k < 14; k++) {
        const p = t.p.clone().add(new THREE.Vector3((r() - 0.5) * 1.5, (r() - 0.3) * 1.1, (r() - 0.5) * 1.5));
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * Math.PI, r() * Math.PI * 2, r() * Math.PI));
        const s = 0.8 + r() * 0.6;
        leafM.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(s, s, s)));
        leafC.push(shades[Math.floor(r() * shades.length)]!.clone());
      }
    });

    const fruitM: THREE.Matrix4[] = [];
    const stemM: THREE.Matrix4[] = [];
    tips.forEach((t, i) => {
      if (i % 2) return;
      for (let k = 0; k < 2; k++) {
        const anchor = t.p.clone().add(new THREE.Vector3((r() - 0.5) * 0.8, -0.1 - r() * 0.3, (r() - 0.5) * 0.8));
        const s = 0.75 + r() * 0.4;
        const fruit = anchor.clone().add(new THREE.Vector3(0, -0.32, 0));
        fruitM.push(new THREE.Matrix4().compose(fruit, new THREE.Quaternion(), new THREE.Vector3(s, s * 0.92, s)));
        stemM.push(new THREE.Matrix4().compose(anchor.clone().add(new THREE.Vector3(0, -0.12, 0)), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)));
      }
    });

    return {
      bark,
      leafGeo,
      leafM,
      leafC,
      fruitM,
      stemM,
      fruitGeo: new THREE.SphereGeometry(0.15, 32, 24),
      stemGeo: new THREE.CylinderGeometry(0.01, 0.015, 0.26, 6),
      leafMat: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5, side: THREE.DoubleSide, emissive: "#3a0010", emissiveIntensity: 0.35 }),
      fruitMat: new THREE.MeshPhysicalMaterial({ color: "#7a0a22", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.4 }),
      stemMat: new THREE.MeshStandardMaterial({ color: "#4a0a14", roughness: 0.7 }),
    };
  }, []);

  const leaves = bloom === "leaves" || bloom === "both";
  const fruits = bloom === "fruits" || bloom === "both";

  return (
    <group>
      {/* soft ground disc */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.32}>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#9fc1ec" roughness={1} transparent opacity={0.6} />
      </mesh>

      <mesh geometry={data.bark}>
        <meshPhysicalMaterial color="#d4d8de" metalness={0.75} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.25} />
      </mesh>

      <Instanced geometry={data.leafGeo} material={data.leafMat} matrices={data.leafM} colors={data.leafC} visible={leaves} />
      <Instanced geometry={data.fruitGeo} material={data.fruitMat} matrices={data.fruitM} visible={fruits} />
      <Instanced geometry={data.stemGeo} material={data.stemMat} matrices={data.stemM} visible={fruits} />
    </group>
  );
}
