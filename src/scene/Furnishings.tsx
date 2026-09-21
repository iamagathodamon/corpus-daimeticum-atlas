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
      <mesh
        position={[0, 1.255, -0.02]}
        rotation={[-0.32, 0, 0]}
        receiveShadow
        material={materials.paper}
      >
        <planeGeometry args={[0.42, 0.3]} />
      </mesh>
      <mesh
        position={[0.02, 1.248, -0.01]}
        rotation={[-0.32, 0.04, 0.01]}
        material={materials.linen}
      >
        <planeGeometry args={[0.16, 0.22]} />
      </mesh>
    </group>
  );
}

function Lamp({ materials }: { materials: LibraryMaterials }) {
  return (
    <group position={[0.42, 0, 0.08]}>
      <mesh position={[0, 0.03, 0]} receiveShadow material={materials.brass}>
        <cylinderGeometry args={[0.16, 0.2, 0.06, 16]} />
      </mesh>
      <mesh position={[0, 0.78, 0]} castShadow material={materials.brass}>
        <cylinderGeometry args={[0.018, 0.022, 1.48, 10]} />
      </mesh>
      <mesh
        position={[-0.18, 1.62, -0.22]}
        rotation={[0.2, 0.4, 0]}
        castShadow
        material={materials.brass}
      >
        <cylinderGeometry args={[0.012, 0.012, 0.55, 8]} />
      </mesh>
      <mesh position={[-0.34, 1.48, -0.38]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial
          color="#ffd7a0"
          emissive="#ffb25a"
          emissiveIntensity={2.4}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[-0.34, 1.56, -0.38]}>
        <cylinderGeometry args={[0.11, 0.16, 0.12, 16, 1, true]} />
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

function Chair({ materials }: { materials: LibraryMaterials }) {
  return (
    <group position={[0.92, 0, 1.28]} rotation={[0, 0.28, 0]}>
      <mesh
        position={[0, 0.42, 0]}
        castShadow
        receiveShadow
        material={materials.leather}
      >
        <boxGeometry args={[0.62, 0.12, 0.56]} />
      </mesh>
      <mesh
        position={[0, 0.78, -0.24]}
        rotation={[-0.12, 0, 0]}
        castShadow
        receiveShadow
        material={materials.leather}
      >
        <boxGeometry args={[0.62, 0.7, 0.1]} />
      </mesh>
      {[
        [-0.31, 0.52, 0.02],
        [0.31, 0.52, 0.02],
      ].map(([x, y, z]) => (
        <mesh key={x} position={[x, y, z]} castShadow material={materials.leather}>
          <boxGeometry args={[0.08, 0.28, 0.52]} />
        </mesh>
      ))}
      {[
        [-0.26, 0.2, 0.22],
        [0.26, 0.2, 0.22],
        [-0.26, 0.2, -0.22],
        [0.26, 0.2, -0.22],
      ].map(([x, y, z], index) => (
        <mesh
          key={index}
          position={[x, y, z]}
          castShadow
          material={materials.walnutDark}
        >
          <boxGeometry args={[0.07, 0.4, 0.07]} />
        </mesh>
      ))}
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
      <Chair materials={materials} />
    </group>
  );
}
