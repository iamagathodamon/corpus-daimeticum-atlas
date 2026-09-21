import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  InstancedMesh,
  Object3D,
} from "three";
import type { Quality } from "../lib/quality";
import { pointer } from "./pointer";

export function Swarm({ quality }: { quality: Quality }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = Math.min(quality.swarm, quality.isMobile ? 220 : 520);
  const seeds = useMemo(() => {
    return Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = 1.05 + Math.random() * 0.95;
      return {
        a,
        r,
        y: (Math.random() - 0.5) * 0.7,
        s: 0.01 + Math.random() * 0.02,
        speed: 0.35 + Math.random() * 0.55,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    const inst = mesh.current;
    if (!inst) {
      return;
    }
    const t = clock.elapsedTime;
    inst.position.set(pointer.x * 0.3, pointer.y * 0.22, 0);
    for (let i = 0; i < seeds.length; i += 1) {
      const s = seeds[i];
      const a = s.a + t * s.speed;
      dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(a * 2) * 0.08, Math.sin(a) * s.r);
      dummy.scale.setScalar(s.s);
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
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color={new Color("#ffc85a")}
        transparent
        opacity={0.62}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </instancedMesh>
  );
}
