import { CASES, CASE_TRIM, type CaseSpec } from "./layout";
import type { LibraryMaterials } from "./materials";

function Bookcase({
  spec,
  materials,
}: {
  spec: CaseSpec;
  materials: LibraryMaterials;
}) {
  const { width, height, depth, rows, bays } = spec;
  const innerWidth = width - CASE_TRIM.upright * 2;
  const innerHeight = height - CASE_TRIM.kick - CASE_TRIM.crown;
  const bayWidth = innerWidth / bays;
  const rowHeight = innerHeight / rows;
  const boards: Array<{
    position: [number, number, number];
    args: [number, number, number];
    dark?: boolean;
  }> = [];

  boards.push({
    position: [0, height / 2, -depth / 2 + 0.016],
    args: [width - 0.02, height - 0.02, 0.03],
    dark: true,
  });
  boards.push({
    position: [-width / 2 + CASE_TRIM.upright / 2, height / 2, 0],
    args: [CASE_TRIM.upright, height, depth],
  });
  boards.push({
    position: [width / 2 - CASE_TRIM.upright / 2, height / 2, 0],
    args: [CASE_TRIM.upright, height, depth],
  });
  boards.push({
    position: [0, CASE_TRIM.kick / 2, 0],
    args: [width, CASE_TRIM.kick, depth],
  });
  boards.push({
    position: [0, height - CASE_TRIM.crown / 2, 0.01],
    args: [width + 0.04, CASE_TRIM.crown, depth + 0.02],
  });

  for (let bay = 1; bay < bays; bay += 1) {
    const x = -width / 2 + CASE_TRIM.upright + bay * bayWidth;
    boards.push({
      position: [x, CASE_TRIM.kick + innerHeight / 2, 0],
      args: [0.028, innerHeight, depth - 0.02],
    });
  }

  for (let row = 0; row < rows; row += 1) {
    const y = CASE_TRIM.kick + row * rowHeight + CASE_TRIM.shelf / 2;
    boards.push({
      position: [0, y, 0.01],
      args: [innerWidth, CASE_TRIM.shelf, depth - 0.02],
    });
  }

  return (
    <group position={spec.position} rotation={[0, spec.rotationY, 0]}>
      {boards.map((board, index) => (
        <mesh
          key={`${spec.id}-board-${index}`}
          position={board.position}
          castShadow
          receiveShadow
          material={board.dark ? materials.walnutDark : materials.walnut}
        >
          <boxGeometry args={board.args} />
        </mesh>
      ))}

      {Array.from({ length: bays }, (_, bay) => {
        const x =
          -width / 2 + CASE_TRIM.upright + bay * bayWidth + bayWidth / 2;
        return (
          <mesh
            key={`${spec.id}-plate-${bay}`}
            position={[x, height - CASE_TRIM.crown * 0.45, depth / 2 + 0.002]}
            material={materials.brassDim}
          >
            <boxGeometry args={[0.16, 0.028, 0.006]} />
          </mesh>
        );
      })}
    </group>
  );
}

export function Shelves({ materials }: { materials: LibraryMaterials }) {
  return (
    <group>
      {CASES.map((spec) => (
        <Bookcase key={spec.id} spec={spec} materials={materials} />
      ))}
    </group>
  );
}
