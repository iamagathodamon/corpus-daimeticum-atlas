import { ROOM } from "./layout";
import type { LibraryMaterials } from "./materials";

type RoomProps = {
  materials: LibraryMaterials;
  cheapGlass: boolean;
};

function Wall({
  position,
  args,
  materials,
}: {
  position: [number, number, number];
  args: [number, number, number];
  materials: LibraryMaterials;
}) {
  return (
    <mesh position={position} castShadow receiveShadow material={materials.plaster}>
      <boxGeometry args={args} />
    </mesh>
  );
}

function WindowSash({
  x,
  materials,
  cheapGlass,
}: {
  x: number;
  materials: LibraryMaterials;
  cheapGlass: boolean;
}) {
  const z = -ROOM.halfDepth - ROOM.wall * 0.15;
  const sill = 0.98;
  const height = 2.52;
  const width = 1.28;

  return (
    <group position={[x, sill + height / 2, z]}>
      <mesh castShadow receiveShadow material={materials.walnut}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.08]} />
      </mesh>
      {[-0.32, 0.32].map((px) =>
        [-0.78, 0, 0.78].map((py) => (
          <mesh key={`${px}-${py}`} position={[px, py, 0.01]}>
            <planeGeometry args={[0.56, 0.72]} />
            <meshStandardMaterial
              color={cheapGlass ? "#7d8896" : "#6f7b8a"}
              transparent
              opacity={cheapGlass ? 0.22 : 0.32}
              roughness={0.18}
              metalness={0.08}
            />
          </mesh>
        )),
      )}
      <mesh position={[0, 0, 0.03]} material={materials.walnutDark}>
        <boxGeometry args={[0.03, height - 0.08, 0.03]} />
      </mesh>
      {[-0.4, 0.4].map((py) => (
        <mesh key={py} position={[0, py, 0.03]} material={materials.walnutDark}>
          <boxGeometry args={[width - 0.12, 0.03, 0.03]} />
        </mesh>
      ))}
      <mesh
        position={[0, -height / 2 + 0.04, 0.08]}
        receiveShadow
        material={materials.walnut}
      >
        <boxGeometry args={[width + 0.18, 0.06, 0.16]} />
      </mesh>
    </group>
  );
}

export function Room({ materials, cheapGlass }: RoomProps) {
  const h = ROOM.height;
  const w = ROOM.halfWidth * 2;
  const d = ROOM.halfDepth * 2;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[w + 1.2, d + 1.2]} />
      </mesh>

      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, h, 0]}
        receiveShadow
        material={materials.plaster}
      >
        <planeGeometry args={[w + 0.4, d + 0.4]} />
      </mesh>

      <Wall
        position={[-ROOM.halfWidth - ROOM.wall / 2, h / 2, 0]}
        args={[ROOM.wall, h, d + ROOM.wall * 2]}
        materials={materials}
      />
      <Wall
        position={[ROOM.halfWidth + ROOM.wall / 2, h / 2, 0]}
        args={[ROOM.wall, h, d + ROOM.wall * 2]}
        materials={materials}
      />
      <Wall
        position={[0, h / 2, ROOM.halfDepth + ROOM.wall / 2]}
        args={[w + ROOM.wall * 2, h, ROOM.wall]}
        materials={materials}
      />

      <Wall
        position={[0, 0.49, -ROOM.halfDepth - ROOM.wall / 2]}
        args={[w + ROOM.wall * 2, 0.98, ROOM.wall]}
        materials={materials}
      />
      <Wall
        position={[0, 3.76, -ROOM.halfDepth - ROOM.wall / 2]}
        args={[w + ROOM.wall * 2, 0.8, ROOM.wall]}
        materials={materials}
      />
      <Wall
        position={[-3.55, 2.22, -ROOM.halfDepth - ROOM.wall / 2]}
        args={[2.0, 2.52, ROOM.wall]}
        materials={materials}
      />
      <Wall
        position={[3.55, 2.22, -ROOM.halfDepth - ROOM.wall / 2]}
        args={[2.0, 2.52, ROOM.wall]}
        materials={materials}
      />
      <Wall
        position={[0, 2.22, -ROOM.halfDepth - ROOM.wall / 2]}
        args={[1.22, 2.52, ROOM.wall]}
        materials={materials}
      />

      <WindowSash x={-1.18} materials={materials} cheapGlass={cheapGlass} />
      <WindowSash x={1.18} materials={materials} cheapGlass={cheapGlass} />

      <mesh position={[0, 2.15, -6.4]} material={materials.dusk}>
        <planeGeometry args={[18, 8]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, -6.2]}
      >
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#16110d" roughness={1} />
      </mesh>

      <mesh
        position={[0, 0.08, -ROOM.halfDepth + 0.05]}
        receiveShadow
        material={materials.walnut}
      >
        <boxGeometry args={[w - 0.2, 0.16, 0.08]} />
      </mesh>
    </group>
  );
}
