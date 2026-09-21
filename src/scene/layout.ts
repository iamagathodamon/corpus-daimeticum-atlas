export const EYE = 1.64;
export const MAX_STEP = 0.42;
export const LEDGE = 0.75;

export const STAIR_STEPS = 72;
export const STAIR_RISE = 0.165;
export const STAIR_RUN = 0.39;
export const STAIR_START_Z = 28;
export const STAIR_WIDTH = 16.2;
export const STAIR_HEIGHT = STAIR_STEPS * STAIR_RISE;
export const STAIR_END_Z = STAIR_START_Z + STAIR_STEPS * STAIR_RUN;

export const ATRIUM = {
  halfW: 26,
  walkW: 24.3,
  z0: 2,
  z1: 94,
  height: 34,
};

export const PORTAL = {
  halfW: 2.55,
  z0: -16.6,
  z1: 2,
  height: 6.7,
};

export type ViewName = "atrium" | "traverse" | "threshold";

export type CameraView = {
  position: [number, number, number];
  target: [number, number, number];
};

export const VIEWS: Record<ViewName, CameraView> = {
  threshold: {
    position: [0, EYE, -12.4],
    target: [0.4, 3.2, 18],
  },
  atrium: {
    position: [-8.2, EYE, 11.6],
    target: [2.6, 10.4, 50],
  },
  traverse: {
    position: [-5.6, 4.12, 33.8],
    target: [4.4, 8.8, 58],
  },
};

type Region = {
  contains: (x: number, z: number) => boolean;
  height: (x: number, z: number) => number;
};

const regions: Region[] = [
  {
    contains: (x, z) =>
      z >= PORTAL.z0 && z < PORTAL.z1 && Math.abs(x) < PORTAL.halfW,
    height: () => 0,
  },
  {
    contains: (x, z) =>
      z >= ATRIUM.z0 && z < ATRIUM.z1 && Math.abs(x) < ATRIUM.walkW,
    height: () => 0,
  },
  {
    contains: (x, z) =>
      Math.abs(x) < STAIR_WIDTH / 2 + 0.15 &&
      z >= STAIR_START_Z - 0.05 &&
      z <= STAIR_END_Z + 0.2,
    height: (_x, z) => {
      const t = Math.min(
        1,
        Math.max(0, (z - STAIR_START_Z) / (STAIR_END_Z - STAIR_START_Z)),
      );
      return t * STAIR_HEIGHT;
    },
  },
  {
    contains: (x, z) =>
      Math.abs(x) < 10.15 && z > STAIR_END_Z && z < 88.6,
    height: () => STAIR_HEIGHT,
  },
  {
    contains: (x, z) =>
      Math.abs(x) > 21.15 && Math.abs(x) < 25.35 && z >= 13 && z < 87,
    height: () => 8,
  },
  {
    contains: (x, z) =>
      Math.abs(x) > 21.15 && Math.abs(x) < 25.35 && z >= 54 && z < 87,
    height: () => 16.2,
  },
  {
    contains: (x, z) => x > 16 && x < 22.4 && z > 37.4 && z < 46.2,
    height: (x) => ((x - 16) / 6) * 8,
  },
  {
    contains: (x, z) => x < -16 && x > -22.4 && z > 37.4 && z < 46.2,
    height: (x) => ((-16 - x) / 6) * 8,
  },
  {
    contains: (x, z) =>
      Math.abs(x) > 21.15 && Math.abs(x) < 25.35 && z >= 54 && z < 62.4,
    height: (_x, z) => 8 + ((z - 54) / 8.2) * 8.2,
  },
];

const blockers: Array<{ x: number; z: number; r: number }> = [
  { x: 15.6, z: 71.2, r: 1.7 },
  { x: -14, z: 34, r: 1.55 },
  { x: 14, z: 34, r: 1.55 },
  { x: -14, z: 66, r: 1.55 },
  { x: 14, z: 66, r: 1.55 },
];

function blocked(x: number, z: number): boolean {
  for (const b of blockers) {
    const dx = x - b.x;
    const dz = z - b.z;
    if (dx * dx + dz * dz < b.r * b.r) {
      return true;
    }
  }
  return false;
}

export function sampleFloor(
  x: number,
  z: number,
  eyeY: number,
): number | null {
  if (blocked(x, z)) {
    return null;
  }

  const feet = eyeY - EYE;
  const heights: number[] = [];
  for (const region of regions) {
    if (region.contains(x, z)) {
      heights.push(region.height(x, z));
    }
  }
  if (heights.length === 0) {
    return null;
  }

  let best = -Infinity;
  for (const h of heights) {
    if (h <= feet + MAX_STEP && h > best) {
      best = h;
    }
  }
  if (best === -Infinity) {
    return null;
  }
  if (best < feet - LEDGE) {
    return null;
  }
  return best;
}

export function readView(): ViewName | null {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view === "atrium" || view === "traverse" || view === "threshold") {
    return view;
  }
  const hash = window.location.hash.replace("#", "");
  if (hash === "atrium" || hash === "traverse" || hash === "threshold") {
    return hash;
  }
  return null;
}
