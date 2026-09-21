import { useMemo } from "react";
import * as THREE from "three";

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hash(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function paintFloorAtlas(): THREE.CanvasTexture {
  const width = 2048;
  const height = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Floor atlas canvas was not available");
  }

  const image = ctx.createImageData(width, height);
  const { data } = image;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const wx = (u - 0.5) * 56;
      const wz = -18 + v * 116;
      const n =
        hash(Math.floor(wx * 0.35), Math.floor(wz * 0.35)) * 0.55 +
        hash(Math.floor(wx * 1.1), Math.floor(wz * 1.1)) * 0.45;

      let r = 118 + n * 22;
      let g = 108 + n * 16;
      let b = 94 + n * 12;

      const tile = 1.15;
      const tx = Math.min(wx - Math.floor(wx / tile) * tile, tile - (wx - Math.floor(wx / tile) * tile));
      const tz = Math.min(wz - Math.floor(wz / tile) * tile, tile - (wz - Math.floor(wz / tile) * tile));
      const grout = Math.min(tx, tz) < 0.034 ? 1 : 0;
      if (grout) {
        r *= 0.48;
        g *= 0.48;
        b *= 0.46;
      }

      const inWell =
        Math.abs(wx) < 10.2 && wz > 27 && wz < 69;
      if (inWell) {
        const d1 = Math.abs(((wx + wz) * 0.085) % 1 - 0.5);
        const d2 = Math.abs(((wx - wz) * 0.085) % 1 - 0.5);
        const barX = Math.abs((wx * 0.145) % 1 - 0.5);
        const barZ = Math.abs((wz * 0.125) % 1 - 0.5);
        const diamond = Math.min(d1, d2) < 0.055 ? 1 : 0;
        const bars = barX < 0.07 || barZ < 0.07 ? 0.7 : 0;
        const gobo = Math.max(diamond, bars);
        if (gobo > 0) {
          const shade = 1 - gobo * 0.38;
          r *= shade;
          g *= shade * 0.98;
          b *= shade * 0.96;
        } else {
          r += 18;
          g += 12;
          b += 6;
        }
      }

      const i = (y * width + x) * 4;
      data[i] = clampByte(r);
      data[i + 1] = clampByte(g);
      data[i + 2] = clampByte(b);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

type SurfaceKind = "stone" | "plate" | "dark" | "floor" | "metal";

function surfaceFragment(kind: SurfaceKind): string {
  const common = /* glsl */ `
    float hash12(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise2(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash12(i);
      float b = hash12(i + vec2(1.0, 0.0));
      float c = hash12(i + vec2(0.0, 1.0));
      float d = hash12(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    float jointAxis(float pos, float spacing, float width) {
      float cell = min(fract(pos / spacing), 1.0 - fract(pos / spacing)) * spacing;
      return 1.0 - smoothstep(0.0, width, cell);
    }
    vec3 wn = normalize(vWorldNormal);
    vec3 wp = vWorldPosition;
    vec3 an = abs(wn);
    float n = noise2(wp.xz * 0.07) * 0.6 + noise2(wp.xz * 0.33 + wp.y * 0.11) * 0.4;
  `;

  if (kind === "floor") {
    return /* glsl */ `
      ${common}
      float tile = 1.15;
      float tx = min(fract(wp.x / tile), 1.0 - fract(wp.x / tile)) * tile;
      float tz = min(fract(wp.z / tile), 1.0 - fract(wp.z / tile)) * tile;
      float grout = 1.0 - smoothstep(0.0, 0.02, min(tx, tz));
      vec3 floorCol = mix(vec3(0.46, 0.41, 0.35), vec3(0.54, 0.47, 0.39), n);
      floorCol = mix(floorCol, vec3(0.22, 0.20, 0.18), grout * 0.9);
      float well = smoothstep(11.2, 8.0, abs(wp.x)) * smoothstep(26.0, 29.0, wp.z) * smoothstep(71.0, 68.0, wp.z);
      float d1 = abs(fract((wp.x + wp.z) * 0.085) - 0.5);
      float d2 = abs(fract((wp.x - wp.z) * 0.085) - 0.5);
      float diamond = 1.0 - smoothstep(0.04, 0.085, min(d1, d2));
      float bars = max(
        1.0 - smoothstep(0.05, 0.11, abs(fract(wp.x * 0.145) - 0.5)),
        1.0 - smoothstep(0.05, 0.11, abs(fract(wp.z * 0.125) - 0.5))
      );
      float gobo = max(diamond, bars * 0.7) * well;
      floorCol *= mix(1.0, 0.56, gobo);
      floorCol *= mix(1.0, 1.12, well * (1.0 - gobo));
      diffuseColor.rgb = floorCol;
    `;
  }

  if (kind === "metal") {
    return /* glsl */ `
      ${common}
      float brush = abs(sin(wp.y * 26.0 + noise2(wp.zy * 3.4) * 2.2));
      vec3 metalCol = vec3(0.16, 0.17, 0.185) * (0.72 + brush * 0.4);
      metalCol += vec3(0.04, 0.035, 0.03) * n;
      diffuseColor.rgb = metalCol;
    `;
  }

  const palette =
    kind === "plate"
      ? /* glsl */ `
      float sx = 3.1;
      float sy = 2.6;
      float sz = 3.1;
      float jw = 0.034;
      vec3 baseCol = mix(vec3(0.90, 0.86, 0.78), vec3(0.84, 0.80, 0.72), n);
      vec3 jointCol = vec3(0.62, 0.58, 0.52);
    `
      : kind === "dark"
        ? /* glsl */ `
      float sx = 1.4;
      float sy = 1.8;
      float sz = 1.4;
      float jw = 0.022;
      vec3 baseCol = mix(vec3(0.42, 0.39, 0.35), vec3(0.34, 0.32, 0.29), n);
      vec3 jointCol = vec3(0.18, 0.17, 0.15);
    `
        : /* glsl */ `
      float sx = 1.75;
      float sy = 2.35;
      float sz = 1.75;
      float jw = 0.026;
      vec3 baseCol = mix(vec3(0.80, 0.74, 0.64), vec3(0.72, 0.69, 0.62), n);
      baseCol = mix(baseCol, vec3(0.86, 0.78, 0.66), clamp(n * 0.55, 0.0, 1.0));
      vec3 jointCol = vec3(0.40, 0.37, 0.33);
    `;

  return /* glsl */ `
    ${common}
    ${palette}
    float lineX = jointAxis(wp.x, sx, jw);
    float lineY = jointAxis(wp.y, sy, jw * 0.85);
    float lineZ = jointAxis(wp.z, sz, jw);
    float joint = clamp(an.x * max(lineY, lineZ) + an.y * max(lineX, lineZ) + an.z * max(lineX, lineY), 0.0, 1.0);
    vec3 albedo = mix(baseCol, jointCol, joint);
    albedo *= 0.92 + n * 0.14;
    diffuseColor.rgb = albedo;
  `;
}

function patchWorldSurface(
  material: THREE.MeshStandardMaterial,
  kind: SurfaceKind,
): THREE.MeshStandardMaterial {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;",
      )
      .replace(
        "#include <project_vertex>",
        `#include <project_vertex>
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWorldPosition;\nvarying vec3 vWorldNormal;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        ${surfaceFragment(kind)}`,
      );
  };
  material.customProgramCacheKey = () => `world-surface-${kind}-v3`;
  material.needsUpdate = true;
  return material;
}

export type TempleMaterials = {
  stone: THREE.MeshStandardMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  plate: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  floor: THREE.MeshStandardMaterial;
  floorMap: THREE.CanvasTexture;
  glow: THREE.MeshBasicMaterial;
  slit: THREE.MeshBasicMaterial;
  sky: THREE.MeshBasicMaterial;
  joint: THREE.MeshStandardMaterial;
  dispose: () => void;
};

export function createTempleMaterials(): TempleMaterials {
  const floorMap = paintFloorAtlas();

  const stone = patchWorldSurface(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.78,
      metalness: 0.02,
      envMapIntensity: 0.55,
    }),
    "stone",
  );

  const stoneDark = patchWorldSurface(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.7,
      metalness: 0.06,
      envMapIntensity: 0.45,
    }),
    "dark",
  );

  const plate = patchWorldSurface(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.62,
      metalness: 0.03,
      envMapIntensity: 0.6,
    }),
    "plate",
  );

  const metal = patchWorldSurface(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.28,
      metalness: 0.86,
      envMapIntensity: 1.15,
    }),
    "metal",
  );

  const floor = patchWorldSurface(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: floorMap,
      roughness: 0.16,
      metalness: 0.28,
      envMapIntensity: 1.05,
    }),
    "floor",
  );

  const glass = new THREE.MeshPhysicalMaterial({
    color: "#b7c6d2",
    roughness: 0.05,
    metalness: 0.08,
    transparent: true,
    opacity: 0.22,
    envMapIntensity: 1.2,
    side: THREE.DoubleSide,
  });

  const glow = new THREE.MeshBasicMaterial({
    color: "#f0e6d2",
  });

  const slit = new THREE.MeshBasicMaterial({
    color: "#ffd9a0",
  });

  const sky = new THREE.MeshBasicMaterial({
    color: "#c5d3e2",
    side: THREE.DoubleSide,
  });

  const joint = new THREE.MeshStandardMaterial({
    color: "#4a453e",
    roughness: 0.86,
    metalness: 0.02,
  });

  return {
    stone,
    stoneDark,
    plate,
    metal,
    glass,
    floor,
    floorMap,
    glow,
    slit,
    sky,
    joint,
    dispose: () => {
      floorMap.dispose();
      stone.dispose();
      stoneDark.dispose();
      plate.dispose();
      metal.dispose();
      glass.dispose();
      floor.dispose();
      glow.dispose();
      slit.dispose();
      sky.dispose();
      joint.dispose();
    },
  };
}

export function useTempleMaterials(): TempleMaterials {
  return useMemo(() => createTempleMaterials(), []);
}
