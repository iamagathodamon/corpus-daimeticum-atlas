export type Vec3 = [number, number, number];

export type CaseSpec = {
  id: string;
  position: Vec3;
  rotationY: number;
  width: number;
  height: number;
  depth: number;
  rows: number;
  bays: number;
};

export const ROOM = {
  halfWidth: 4.55,
  halfDepth: 3.95,
  height: 4.16,
  wall: 0.14,
} as const;

export const CASE_TRIM = {
  shelf: 0.032,
  upright: 0.042,
  kick: 0.09,
  crown: 0.1,
} as const;

export const CASES: CaseSpec[] = [
  {
    id: "port",
    position: [-4.27, 0, -0.15],
    rotationY: Math.PI / 2,
    width: 5.15,
    height: 3.7,
    depth: 0.4,
    rows: 6,
    bays: 5,
  },
  {
    id: "starboard",
    position: [4.27, 0, -0.15],
    rotationY: -Math.PI / 2,
    width: 5.15,
    height: 3.7,
    depth: 0.4,
    rows: 6,
    bays: 5,
  },
  {
    id: "fore-west",
    position: [-2.98, 0, -3.61],
    rotationY: 0,
    width: 2.18,
    height: 3.7,
    depth: 0.38,
    rows: 6,
    bays: 2,
  },
  {
    id: "fore-east",
    position: [2.98, 0, -3.61],
    rotationY: 0,
    width: 2.18,
    height: 3.7,
    depth: 0.38,
    rows: 6,
    bays: 2,
  },
];

export type ShelfSlot = {
  id: string;
  position: Vec3;
  rotationY: number;
  width: number;
  height: number;
  depth: number;
};

function rotateY(x: number, z: number, rotationY: number): [number, number] {
  const c = Math.cos(rotationY);
  const s = Math.sin(rotationY);
  return [x * c + z * s, -x * s + z * c];
}

export function createShelfSlots(): ShelfSlot[] {
  const slots: ShelfSlot[] = [];
  const bookHeight = 0.21;
  const bookDepth = 0.145;
  const bookWidth = 0.038;

  for (const spec of CASES) {
    const innerWidth = spec.width - CASE_TRIM.upright * 2;
    const innerHeight = spec.height - CASE_TRIM.kick - CASE_TRIM.crown;
    const bayWidth = innerWidth / spec.bays;
    const rowHeight = innerHeight / spec.rows;

    for (let bay = 0; bay < spec.bays; bay += 1) {
      for (let row = 0; row < spec.rows; row += 1) {
        const volumes = Math.max(3, Math.floor((bayWidth - 0.04) / (bookWidth + 0.006)));
        for (let n = 0; n < volumes; n += 1) {
          const localX =
            -spec.width / 2 +
            CASE_TRIM.upright +
            bay * bayWidth +
            0.03 +
            n * (bookWidth + 0.006) +
            bookWidth / 2;
          const localY =
            CASE_TRIM.kick +
            CASE_TRIM.shelf +
            row * rowHeight +
            bookHeight / 2 +
            0.004;
          const localZ = spec.depth / 2 - bookDepth / 2 - 0.03;
          const [wx, wz] = rotateY(localX, localZ, spec.rotationY);
          slots.push({
            id: `${spec.id}-${bay}-${row}-${n}`,
            position: [spec.position[0] + wx, localY, spec.position[2] + wz],
            rotationY: spec.rotationY,
            width: bookWidth,
            height: bookHeight,
            depth: bookDepth,
          });
        }
      }
    }
  }

  return slots;
}
