import type { LibraryMaterials } from "./materials";

function Lectern({ materials }: { materials: LibraryMaterials }) {
  return (
    <group position={[-0.08, 0, -0.42]}>
      <mesh
        position={[0, 0.52, 0]}
        castShadow
        receiveShadow
        material={materials.walnut}
      >
        <boxGeometry args={[0.38, 1.04, 0.38]} />
      </mesh>
      <mesh position={[0, 1.08, 0]} castShadow material={materials.walnut}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
      </mesh>
      <mesh
        position={[0, 1.22, 0.02]}
        rotation={[-0.32, 0, 0]}
        castShadow
        receiveShadow
        material={materials.oak}
      >
        <boxGeometry args={[0.72, 0.045, 0.5]} />
      </mesh>
      <mesh
        position={[0, 1.145, 0.22]}
        rotation={[-0.32, 0, 0]}
        castShadow
        material={materials.walnutDark}
      >
        <boxGeometry args={[0.72, 0.03, 0.035]} />
      </mesh>
    </group>
  );
}

function Lamp({ materials }: { materials: LibraryMaterials }) {
  return (
    <group position={[0.36, 0, 0.02]}>
      <mesh position={[0, 0.03, 0]} receiveShadow material={materials.brass}>
        <cylinderGeometry args={[0.12, 0.16, 0.05, 16]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow material={materials.brass}>
        <cylinderGeometry args={[0.016, 0.02, 1.38, 12]} />
      </mesh>
      <mesh position={[0, 1.44, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial
          color="#ffd7a0"
          emissive="#ffb25a"
          emissiveIntensity={2.2}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.11, 16, 1, true]} />
        <meshStandardMaterial
          color="#5a3a22"
          roughness={0.7}
          metalness={0.05}
          side={2}
        />
      </mesh>
    </group>
  );
}

export function Furnishings({ materials }: { materials: LibraryMaterials }) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0.08]}
        position={[0.15, 0.012, 0.35]}
        receiveShadow
        material={materials.rug}
      >
        <planeGeometry args={[3.4, 4.2]} />
      </mesh>
      <Lectern materials={materials} />
      <Lamp materials={materials} />
    </group>
  );
}
