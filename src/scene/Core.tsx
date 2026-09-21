import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

export function Core() {
  const group = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const knot = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.16;
      group.current.rotation.z = Math.sin(t * 0.21) * 0.18;
    }
    if (knot.current) {
      knot.current.rotation.x = t * 0.22;
      knot.current.rotation.y = t * 0.13;
    }
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={knot}>
        <torusKnotGeometry args={[0.62, 0.09, 180, 24, 2, 3]} />
        <meshPhysicalMaterial
          color="#12081c"
          metalness={0.92}
          roughness={0.14}
          iridescence={1}
          iridescenceIOR={1.7}
          iridescenceThicknessRange={[120, 640]}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive="#3a1468"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1.18, 0.012, 16, 96]} />
        <meshBasicMaterial color="#f0c56a" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.004, 8, 80]} />
        <meshBasicMaterial color="#7ce7ff" transparent opacity={0.45} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#14081f" />
      </mesh>
    </group>
  );
}
