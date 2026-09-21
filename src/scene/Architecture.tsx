import { useEffect, useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import type { BufferGeometry, Material } from "three";
import type { Quality } from "../lib/quality";
import {
  STAIR_END_Z,
  STAIR_HEIGHT,
  STAIR_RISE,
  STAIR_RUN,
  STAIR_START_Z,
  STAIR_STEPS,
  STAIR_WIDTH,
} from "./layout";
import {
  ceilingBeams,
  diagrid,
  inclinedRail,
  mergeBoxes,
  pierFlutes,
  railRun,
  stairFlight,
  stairFlightX,
  stairNosings,
  transformedBox,
  wallReveals,
} from "./geometry";
import { useTempleMaterials, type TempleMaterials } from "./materials";

function MergedMesh({
  geometry,
  material,
  castShadow,
  receiveShadow,
}: {
  geometry: BufferGeometry;
  material: Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  useEffect(
    () => () => {
      geometry.dispose();
    },
    [geometry],
  );
  return (
    <mesh
      geometry={geometry}
      material={material}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

function Floor({
  quality,
  materials,
}: {
  quality: Quality;
  materials: TempleMaterials;
}) {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 40]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[56, 116]} />
      </mesh>
      {quality.reflector ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 40]}>
          <planeGeometry args={[56, 116]} />
          <MeshReflectorMaterial
            blur={[200, 60]}
            resolution={quality.isMobile ? 384 : 768}
            mixBlur={0.7}
            mixStrength={0.55}
            mirror={0.22}
            roughness={0.2}
            metalness={0.2}
            color="#8a8074"
            map={materials.floorMap}
            transparent
            opacity={0.42}
            depthWrite={false}
            depthScale={0.55}
            minDepthThreshold={0.65}
            maxDepthThreshold={1.35}
            reflectorOffset={0.03}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function Architecture({ quality }: { quality: Quality }) {
  const materials = useTempleMaterials();

  useEffect(() => () => materials.dispose(), [materials]);

  const shell = useMemo(() => {
    const parts = [
      transformedBox(1.6, 7.1, 19, -3.4, 3.55, -7.2),
      transformedBox(1.6, 7.1, 19, 3.4, 3.55, -7.2),
      transformedBox(8.4, 0.9, 19, 0, 6.95, -7.2),
      transformedBox(8.4, 0.28, 19, 0, 0.14, -7.2),
      transformedBox(10.4, 0.7, 1.1, 0, 3.4, -16.5),
      transformedBox(1.1, 6.8, 0.7, -4.6, 3.4, -16.4),
      transformedBox(1.1, 6.8, 0.7, 4.6, 3.4, -16.4),
      transformedBox(1.8, 34, 96, -26.8, 17, 46),
      transformedBox(1.8, 34, 96, 26.8, 17, 46),
      transformedBox(56, 34, 1.8, 0, 17, 95.2),
      transformedBox(56, 2.4, 8, 0, 33.1, -1.2),
      transformedBox(16.4, 1.1, 92, -18.4, 33.5, 48),
      transformedBox(16.4, 1.1, 92, 18.4, 33.5, 48),
      transformedBox(20.8, 1.1, 26, 0, 33.5, 14),
      transformedBox(20.8, 1.1, 24, 0, 33.5, 81.5),
      transformedBox(56, 0.42, 4, 0, 0.21, 46),
    ];
    return mergeBoxes(parts);
  }, []);

  const plates = useMemo(
    () =>
      mergeBoxes([
        transformedBox(28, 2.9, 20, -11.5, 19.4, 24, 0.16, 0.38, -0.2),
        transformedBox(22, 2.5, 16, -8.2, 13.8, 7.5, 0.26, 0.14, -0.07),
        transformedBox(26, 2.3, 18, 13.8, 21.6, 34, -0.1, -0.34, 0.15),
        transformedBox(34, 2.1, 16, 2, 26.4, 49, 0.07, -0.1, 0.04),
        transformedBox(30, 1.9, 14, -1, 23.8, 72, 0.14, 0.02, 0),
        transformedBox(18, 1.55, 12, -16.4, 16.2, 52, 0.04, 0.48, -0.28),
        transformedBox(16, 1.4, 11, 17.2, 17.6, 58, -0.08, -0.42, 0.2),
        transformedBox(20, 1.7, 10, 0, 28.6, 22, 0.2, 0, 0),
        transformedBox(30, 3.2, 16, -7.2, 15.4, 26, 0.3, 0.42, -0.16),
        transformedBox(18, 2.4, 12, 7.4, 17.8, 38, -0.18, -0.28, 0.12),
      ]),
    [],
  );

  const lattice = useMemo(
    () =>
      diagrid({
        width: 20,
        depth: 42,
        y: 33.6,
        z: 48,
        cells: quality.diagrid,
        beam: 0.42,
      }),
    [quality.diagrid],
  );

  const nosings = useMemo(
    () =>
      stairNosings({
        steps: STAIR_STEPS,
        rise: STAIR_RISE,
        run: STAIR_RUN,
        width: STAIR_WIDTH,
        x: 0,
        z0: STAIR_START_Z,
      }),
    [],
  );

  const soffits = useMemo(
    () =>
      mergeBoxes([
        transformedBox(4.8, 0.22, 74, -23.4, 7.92, 50),
        transformedBox(4.8, 0.22, 74, 23.4, 7.92, 50),
        transformedBox(4.8, 0.22, 34, -23.4, 16.12, 70),
        transformedBox(4.8, 0.22, 34, 23.4, 16.12, 70),
      ]),
    [],
  );

  const farWall = useMemo(
    () => transformedBox(52, 30, 0.45, 0, 16, 94.55),
    [],
  );

  const wellRim = useMemo(() => {
    const parts = [
      transformedBox(22.4, 0.55, 0.7, 0, 33.2, 27),
      transformedBox(22.4, 0.55, 0.7, 0, 33.2, 69),
      transformedBox(0.7, 0.55, 42.8, -10.7, 33.2, 48),
      transformedBox(0.7, 0.55, 42.8, 10.7, 33.2, 48),
    ];
    const collars: Array<[number, number, number]> = [
      [18, 36, 24.2],
      [16, 32, 28.4],
    ];
    for (const [w, d, y] of collars) {
      parts.push(transformedBox(w + 0.7, 0.38, 0.55, 0, y, 48 - d / 2));
      parts.push(transformedBox(w + 0.7, 0.38, 0.55, 0, y, 48 + d / 2));
      parts.push(transformedBox(0.55, 0.38, d + 0.7, -w / 2, y, 48));
      parts.push(transformedBox(0.55, 0.38, d + 0.7, w / 2, y, 48));
    }
    return mergeBoxes(parts);
  }, []);

  const stair = useMemo(
    () =>
      stairFlight({
        steps: STAIR_STEPS,
        rise: STAIR_RISE,
        run: STAIR_RUN,
        width: STAIR_WIDTH,
        x: 0,
        z0: STAIR_START_Z,
      }),
    [],
  );

  const plaza = useMemo(
    () =>
      mergeBoxes([
        transformedBox(20.2, 0.36, 33, 0, STAIR_HEIGHT + 0.18, 72.2),
        transformedBox(0.42, 1.15, 33, -10.05, STAIR_HEIGHT + 0.7, 72.2),
        transformedBox(0.42, 1.15, 33, 10.05, STAIR_HEIGHT + 0.7, 72.2),
      ]),
    [],
  );

  const galleries = useMemo(
    () =>
      mergeBoxes([
        transformedBox(4.6, 0.32, 74, -23.4, 8.16, 50),
        transformedBox(4.6, 0.32, 74, 23.4, 8.16, 50),
        transformedBox(4.6, 0.32, 34, -23.4, 16.36, 70),
        transformedBox(4.6, 0.32, 34, 23.4, 16.36, 70),
        stairFlightX({
          steps: 48,
          rise: 8 / 48,
          run: 0.125,
          width: 3.4,
          z: 41.8,
          x0: 16,
          dir: 1,
        }),
        stairFlightX({
          steps: 48,
          rise: 8 / 48,
          run: 0.125,
          width: 3.4,
          z: 41.8,
          x0: -16,
          dir: -1,
        }),
        stairFlight({
          steps: 50,
          rise: 8.2 / 50,
          run: 8.2 / 50,
          width: 3.8,
          x: 23.4,
          z0: 54,
          y0: 8,
        }),
        stairFlight({
          steps: 50,
          rise: 8.2 / 50,
          run: 8.2 / 50,
          width: 3.8,
          x: -23.4,
          z0: 54,
          y0: 8,
        }),
      ]),
    [],
  );

  const rails = useMemo(
    () =>
      mergeBoxes([
        inclinedRail({
          x: -STAIR_WIDTH / 2 + 0.12,
          z0: STAIR_START_Z,
          z1: STAIR_END_Z,
          y0: 0,
          y1: STAIR_HEIGHT,
        }),
        inclinedRail({
          x: STAIR_WIDTH / 2 - 0.12,
          z0: STAIR_START_Z,
          z1: STAIR_END_Z,
          y0: 0,
          y1: STAIR_HEIGHT,
        }),
        railRun({
          length: 32,
          x: -10.05,
          y: STAIR_HEIGHT,
          z: 72.2,
          axis: "z",
        }),
        railRun({
          length: 32,
          x: 10.05,
          y: STAIR_HEIGHT,
          z: 72.2,
          axis: "z",
        }),
        railRun({
          length: 72,
          x: -21.2,
          y: 8,
          z: 50,
          axis: "z",
        }),
        railRun({
          length: 72,
          x: 21.2,
          y: 8,
          z: 50,
          axis: "z",
        }),
        railRun({
          length: 32,
          x: -21.2,
          y: 16.2,
          z: 70,
          axis: "z",
        }),
        railRun({
          length: 32,
          x: 21.2,
          y: 16.2,
          z: 70,
          axis: "z",
        }),
        railRun({
          length: 6.2,
          x: 0,
          y: 0,
          z: 2.4,
          axis: "x",
          posts: 5,
        }),
      ]),
    [],
  );

  const piers = useMemo(
    () =>
      mergeBoxes([
        transformedBox(2.2, 22, 2.2, -14, 11, 34),
        transformedBox(2.2, 22, 2.2, 14, 11, 34),
        transformedBox(2.2, 22, 2.2, -14, 11, 66),
        transformedBox(2.2, 22, 2.2, 14, 11, 66),
        transformedBox(3.1, 0.45, 3.1, -14, 0.22, 34),
        transformedBox(3.1, 0.45, 3.1, 14, 0.22, 34),
        transformedBox(3.1, 0.45, 3.1, -14, 0.22, 66),
        transformedBox(3.1, 0.45, 3.1, 14, 0.22, 66),
      ]),
    [],
  );

  const aedicules = useMemo(() => {
    const parts = [];
    const zs = [18, 30, 48, 62, 76];
    for (const z of zs) {
      parts.push(transformedBox(0.5, 5.2, 3.1, -25.6, 3.4, z));
      parts.push(transformedBox(0.5, 5.2, 3.1, 25.6, 3.4, z));
    }
    return mergeBoxes(parts);
  }, []);

  const stele = useMemo(
    () =>
      mergeBoxes([
        transformedBox(2.15, 14.2, 2.15, 15.6, 7.3, 71.2),
        transformedBox(3.2, 0.4, 3.2, 15.6, 0.2, 71.2),
      ]),
    [],
  );

  const axis = useMemo(
    () => transformedBox(0.16, 0.02, 24, 0, 0.03, 15.5),
    [],
  );

  const reveals = useMemo(() => wallReveals(), []);
  const flutes = useMemo(() => pierFlutes(), []);
  const beams = useMemo(() => ceilingBeams(), []);

  const slits = useMemo(() => {
    const parts = [];
    for (let i = -3; i <= 3; i += 1) {
      parts.push(transformedBox(0.7, 18, 0.12, i * 3.4, 16, 94.2));
    }
    return mergeBoxes(parts);
  }, []);

  const glass = useMemo(() => {
    const stairLen = Math.hypot(STAIR_END_Z - STAIR_START_Z, STAIR_HEIGHT);
    const pitch = -Math.atan2(STAIR_HEIGHT, STAIR_END_Z - STAIR_START_Z);
    const stairZ = (STAIR_START_Z + STAIR_END_Z) / 2;
    const stairY = STAIR_HEIGHT / 2 + 0.56;
    return mergeBoxes([
      transformedBox(
        0.04,
        0.92,
        stairLen,
        -STAIR_WIDTH / 2 + 0.12,
        stairY,
        stairZ,
        pitch,
        0,
        0,
      ),
      transformedBox(
        0.04,
        0.92,
        stairLen,
        STAIR_WIDTH / 2 - 0.12,
        stairY,
        stairZ,
        pitch,
        0,
        0,
      ),
      transformedBox(0.04, 0.92, 31, -10.05, STAIR_HEIGHT + 0.56, 72.2),
      transformedBox(0.04, 0.92, 31, 10.05, STAIR_HEIGHT + 0.56, 72.2),
      transformedBox(0.04, 0.92, 70, -21.2, 8.56, 50),
      transformedBox(0.04, 0.92, 70, 21.2, 8.56, 50),
      transformedBox(5.4, 2.3, 0.04, 0, 1.25, -15.9),
    ]);
  }, []);

  return (
    <group>
      <Floor quality={quality} materials={materials} />
      <MergedMesh geometry={shell} material={materials.stone} castShadow receiveShadow />
      <MergedMesh geometry={plates} material={materials.plate} castShadow receiveShadow />
      <MergedMesh geometry={beams} material={materials.stoneDark} castShadow receiveShadow />
      <MergedMesh geometry={lattice} material={materials.metal} castShadow />
      <MergedMesh geometry={reveals} material={materials.joint} />
      <MergedMesh geometry={flutes} material={materials.joint} />
      <MergedMesh geometry={wellRim} material={materials.glow} />
      <MergedMesh geometry={stair} material={materials.stone} castShadow receiveShadow />
      <MergedMesh geometry={nosings} material={materials.metal} />
      <MergedMesh geometry={plaza} material={materials.stone} castShadow receiveShadow />
      <MergedMesh geometry={galleries} material={materials.stone} castShadow receiveShadow />
      <MergedMesh geometry={soffits} material={materials.stoneDark} receiveShadow />
      <MergedMesh geometry={farWall} material={materials.stoneDark} receiveShadow />
      <MergedMesh geometry={rails} material={materials.metal} castShadow />
      <MergedMesh geometry={piers} material={materials.stone} castShadow receiveShadow />
      <MergedMesh geometry={aedicules} material={materials.stoneDark} receiveShadow />
      <MergedMesh geometry={stele} material={materials.stoneDark} castShadow receiveShadow />
      <MergedMesh geometry={axis} material={materials.metal} />
      <MergedMesh geometry={slits} material={materials.slit} />
      <MergedMesh geometry={glass} material={materials.glass} />
      <mesh position={[0, 41.5, 48]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[88, 110]} />
        <primitive object={materials.sky} attach="material" />
      </mesh>
    </group>
  );
}
