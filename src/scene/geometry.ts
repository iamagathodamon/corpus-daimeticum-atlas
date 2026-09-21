import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function transformedBox(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const matrix = new THREE.Matrix4();
  matrix.compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
    new THREE.Vector3(1, 1, 1),
  );
  geometry.applyMatrix4(matrix);
  return geometry;
}

export function mergeBoxes(
  parts: THREE.BufferGeometry[],
): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  for (const part of parts) {
    part.dispose();
  }
  if (!merged) {
    throw new Error("Failed to merge temple geometry");
  }
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

export function stairFlight(options: {
  steps: number;
  rise: number;
  run: number;
  width: number;
  x: number;
  z0: number;
  y0?: number;
}): THREE.BufferGeometry {
  const { steps, rise, run, width, x, z0, y0 = 0 } = options;
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < steps; i += 1) {
    parts.push(
      transformedBox(
        width,
        rise,
        run,
        x,
        y0 + i * rise + rise / 2,
        z0 + i * run + run / 2,
      ),
    );
  }
  const cheekH = steps * rise + 0.22;
  const cheekZ = z0 + (steps * run) / 2;
  const cheekY = y0 + cheekH / 2;
  parts.push(
    transformedBox(0.28, cheekH, steps * run + 0.2, x - width / 2 - 0.12, cheekY, cheekZ),
  );
  parts.push(
    transformedBox(0.28, cheekH, steps * run + 0.2, x + width / 2 + 0.12, cheekY, cheekZ),
  );
  return mergeBoxes(parts);
}

export function stairNosings(options: {
  steps: number;
  rise: number;
  run: number;
  width: number;
  x: number;
  z0: number;
  y0?: number;
}): THREE.BufferGeometry {
  const { steps, rise, run, width, x, z0, y0 = 0 } = options;
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < steps; i += 1) {
    parts.push(
      transformedBox(
        width - 0.08,
        0.03,
        0.055,
        x,
        y0 + (i + 1) * rise + 0.01,
        z0 + i * run + run - 0.02,
      ),
    );
  }
  return mergeBoxes(parts);
}

export function stairFlightX(options: {
  steps: number;
  rise: number;
  run: number;
  width: number;
  z: number;
  x0: number;
  y0?: number;
  dir?: 1 | -1;
}): THREE.BufferGeometry {
  const { steps, rise, run, width, z, x0, y0 = 0, dir = 1 } = options;
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < steps; i += 1) {
    parts.push(
      transformedBox(
        run,
        rise,
        width,
        x0 + dir * (i * run + run / 2),
        y0 + i * rise + rise / 2,
        z,
      ),
    );
  }
  return mergeBoxes(parts);
}

export function inclinedRail(options: {
  x: number;
  z0: number;
  z1: number;
  y0: number;
  y1: number;
  posts?: number;
}): THREE.BufferGeometry {
  const { x, z0, z1, y0, y1, posts = 16 } = options;
  const dz = z1 - z0;
  const dy = y1 - y0;
  const length = Math.hypot(dz, dy);
  const pitch = -Math.atan2(dy, dz);
  const z = (z0 + z1) / 2;
  const yMid = (y0 + y1) / 2;
  const parts: THREE.BufferGeometry[] = [
    transformedBox(0.07, 0.045, length, x, yMid + 1.02, z, pitch, 0, 0),
    transformedBox(0.018, 0.04, length, x, yMid + 0.58, z, pitch, 0, 0),
  ];
  for (let i = 0; i < posts; i += 1) {
    const t = posts === 1 ? 0.5 : i / (posts - 1);
    const pz = z0 + t * dz;
    const py = y0 + t * dy;
    parts.push(transformedBox(0.04, 1.04, 0.04, x, py + 0.52, pz));
  }
  return mergeBoxes(parts);
}

export function railRun(options: {
  length: number;
  x: number;
  y: number;
  z: number;
  axis: "z" | "x";
  posts?: number;
}): THREE.BufferGeometry {
  const { length, x, y, z, axis, posts = Math.max(2, Math.round(length / 1.7)) } = options;
  const parts: THREE.BufferGeometry[] = [];
  const capW = 0.07;
  const capH = 0.045;
  if (axis === "z") {
    parts.push(transformedBox(capW, capH, length, x, y + 1.02, z));
    parts.push(transformedBox(0.018, 0.78, length, x, y + 0.52, z));
    for (let i = 0; i < posts; i += 1) {
      const t = posts === 1 ? 0.5 : i / (posts - 1);
      const pz = z - length / 2 + t * length;
      parts.push(transformedBox(0.04, 1.04, 0.04, x, y + 0.52, pz));
    }
  } else {
    parts.push(transformedBox(length, capH, capW, x, y + 1.02, z));
    parts.push(transformedBox(length, 0.78, 0.018, x, y + 0.52, z));
    for (let i = 0; i < posts; i += 1) {
      const t = posts === 1 ? 0.5 : i / (posts - 1);
      const px = x - length / 2 + t * length;
      parts.push(transformedBox(0.04, 1.04, 0.04, px, y + 0.52, z));
    }
  }
  return mergeBoxes(parts);
}

export function diagrid(options: {
  width: number;
  depth: number;
  y: number;
  z: number;
  cells: number;
  beam: number;
}): THREE.BufferGeometry {
  const { width, depth, y, z, cells, beam } = options;
  const parts: THREE.BufferGeometry[] = [];
  const cellW = width / cells;
  const cellD = depth / cells;
  const x0 = -width / 2;
  const z0 = z - depth / 2;
  const bar = beam;
  const h = 0.42;

  parts.push(transformedBox(width + 0.8, 0.7, 0.7, 0, y, z0));
  parts.push(transformedBox(width + 0.8, 0.7, 0.7, 0, y, z0 + depth));
  parts.push(transformedBox(0.7, 0.7, depth + 0.8, -width / 2, y, z));
  parts.push(transformedBox(0.7, 0.7, depth + 0.8, width / 2, y, z));

  for (let i = 0; i <= cells; i += 1) {
    parts.push(
      transformedBox(bar, h, depth, x0 + i * cellW, y, z),
    );
    parts.push(
      transformedBox(width, h, bar, 0, y, z0 + i * cellD),
    );
  }

  const diagLen = Math.hypot(cellW, cellD);
  const diagAng = Math.atan2(cellD, cellW);
  for (let ix = 0; ix < cells; ix += 1) {
    for (let iz = 0; iz < cells; iz += 1) {
      const cx = x0 + (ix + 0.5) * cellW;
      const cz = z0 + (iz + 0.5) * cellD;
      parts.push(
        transformedBox(diagLen, bar * 0.7, bar, cx, y + 0.08, cz, 0, diagAng, 0),
      );
      parts.push(
        transformedBox(diagLen, bar * 0.7, bar, cx, y - 0.08, cz, 0, -diagAng, 0),
      );
    }
  }

  return mergeBoxes(parts);
}

export function wallReveals(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let z = 10; z <= 88; z += 3.2) {
    parts.push(transformedBox(0.07, 30, 0.06, -25.86, 15, z));
    parts.push(transformedBox(0.07, 30, 0.06, 25.86, 15, z));
  }
  for (const y of [4.1, 8.12, 12.3, 16.32, 21.1, 26.6]) {
    parts.push(transformedBox(0.07, 0.055, 80, -25.86, y, 50));
    parts.push(transformedBox(0.07, 0.055, 80, 25.86, y, 50));
  }
  return mergeBoxes(parts);
}

export function pierFlutes(): THREE.BufferGeometry {
  const piers: Array<[number, number]> = [
    [-14, 34],
    [14, 34],
    [-14, 66],
    [14, 66],
  ];
  const parts: THREE.BufferGeometry[] = [];
  for (const [x, z] of piers) {
    for (const dx of [-0.74, 0, 0.74]) {
      parts.push(transformedBox(0.09, 20.6, 0.09, x + dx, 10.5, z + 1.12));
      parts.push(transformedBox(0.09, 20.6, 0.09, x + dx, 10.5, z - 1.12));
    }
  }
  return mergeBoxes(parts);
}

export function ceilingBeams(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let z = 8; z <= 90; z += 5.5) {
    if (z > 28 && z < 68) {
      parts.push(transformedBox(16.2, 0.42, 0.5, -18.2, 32.55, z));
      parts.push(transformedBox(16.2, 0.42, 0.5, 18.2, 32.55, z));
    } else {
      parts.push(transformedBox(52, 0.42, 0.5, 0, 32.55, z));
    }
  }
  for (let x = -22; x <= 22; x += 5.5) {
    parts.push(transformedBox(0.5, 0.42, 24, x, 32.55, 13.5));
    parts.push(transformedBox(0.5, 0.42, 22, x, 32.55, 82));
  }
  return mergeBoxes(parts);
}
