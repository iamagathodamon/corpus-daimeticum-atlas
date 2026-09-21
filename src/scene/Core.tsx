import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group, type Mesh } from "three";

export function Core() {
  const group = useRef<Group>(null);
  const knot = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.18;
      group.current.rotation.z = Math.sin(t * 0.23) * 0.2;
    }
    if (knot.current) {
      knot.current.rotation.x = t * 0.28;
      knot.current.rotation.y = t * 0.16;
    }
    if (glow.current) {
      const s = 1.05 + Math.sin(t * 1.8) * 0.12;
      glow.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh ref={glow}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial
          color="#6a2cff"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshBasicMaterial color="#f2d89a" />
      </mesh>
      <mesh ref={knot}>
        <torusKnotGeometry args={[0.72, 0.11, 220, 28, 2, 3]} />
        <meshStandardMaterial
          color="#1a0a2c"
          metalness={0.88}
          roughness={0.22}
          emissive="#8b5cf6"
          emissiveIntensity={0.55}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.32, 0.012, 16, 120]} />
        <meshBasicMaterial color="#e8b84a" />
      </mesh>
      <mesh rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[1.55, 0.005, 12, 100]} />
        <meshBasicMaterial color="#5ad4e8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}
