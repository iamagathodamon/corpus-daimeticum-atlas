import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  InstancedMesh,
  Object3D,
} from "three";
import type { Quality } from "../lib/quality";

export function Constellation({ quality }: { quality: Quality }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = Math.min(quality.stars, quality.isMobile ? 420 : 900);
  const seeds = useMemo(() => {
    return Array.from({ length: count }, () => {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 2.6 + Math.random() * 5.2;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) * 0.7,
        z: r * Math.sin(phi) * Math.sin(theta),
        s: 0.008 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const inst = mesh.current;
    if (!inst) {
      return;
    }
    const t = clock.elapsedTime;
    inst.rotation.y = t * 0.02;
    for (let i = 0; i < seeds.length; i += 1) {
      const s = seeds[i];
      const pulse = 0.75 + Math.sin(t * 1.6 + s.phase) * 0.35;
      dummy.position.set(s.x, s.y, s.z);
      dummy.scale.setScalar(s.s * pulse);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={new Color("#d8ecff")}
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </instancedMesh>
  );
}
