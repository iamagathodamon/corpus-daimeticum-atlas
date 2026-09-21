import { useMemo } from "react";
import * as THREE from "three";

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hash(ix: number, iy: number): number {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function paintPaneledStone(options: {
  size: number;
  fill: [number, number, number];
  joint: [number, number, number];
  grain: number;
}): THREE.CanvasTexture {
  const { size, fill, joint, grain } = options;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Stone canvas was not available");
  }

  const image = ctx.createImageData(size, size);
  const inset = Math.max(10, Math.round(size * 0.034));
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n =
        hash(Math.floor(x * 0.04), Math.floor(y * 0.04)) * 0.55 +
        hash(Math.floor(x * 0.18), Math.floor(y * 0.16)) * 0.45;
      const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
      const onJoint = edge < inset ? 1 - edge / inset : 0;
      const speckle = (hash(x, y) - 0.5) * grain;
      const r = fill[0] + n * 18 + speckle - onJoint * (fill[0] - joint[0]);
      const g = fill[1] + n * 14 + speckle - onJoint * (fill[1] - joint[1]);
      const b = fill[2] + n * 10 + speckle - onJoint * (fill[2] - joint[2]);
      const i = (y * size + x) * 4;
      image.data[i] = clampByte(r);
      image.data[i + 1] = clampByte(g);
      image.data[i + 2] = clampByte(b);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(1, 1);
  return texture;
}

function paintRoughness(size: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Roughness canvas was not available");
  }
  const image = ctx.createImageData(size, size);
  const inset = Math.round(size * 0.034);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
      const v = edge < inset ? 210 : 150 + hash(x, y) * 40;
      const i = (y * size + x) * 4;
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

function paintMetal(size: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Metal canvas was not available");
  }
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    const band = 38 + Math.sin(y * 0.35) * 10 + hash(0, y) * 14;
    for (let x = 0; x < size; x += 1) {
      const speckle = hash(x, y) * 18;
      const i = (y * size + x) * 4;
      const v = clampByte(band + speckle);
      image.data[i] = v;
      image.data[i + 1] = clampByte(v + 2);
      image.data[i + 2] = clampByte(v + 4);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(1, 6);
  return texture;
}

function paintFloorAtlas(): THREE.CanvasTexture {
  const width = 1536;
  const height = 1536;
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
        hash(Math.floor(wx * 0.4), Math.floor(wz * 0.4)) * 0.6 +
        hash(Math.floor(wx * 1.3), Math.floor(wz * 1.3)) * 0.4;

      let r = 102 + n * 20;
      let g = 90 + n * 14;
      let b = 76 + n * 10;

      const tile = 1.15;
      const fx = wx - Math.floor(wx / tile) * tile;
      const fz = wz - Math.floor(wz / tile) * tile;
      const tx = Math.min(fx, tile - fx);
      const tz = Math.min(fz, tile - fz);
      if (Math.min(tx, tz) < 0.04) {
        r *= 0.42;
        g *= 0.41;
        b *= 0.4;
      }

      const inWell = Math.abs(wx) < 10.4 && wz > 27 && wz < 69;
      if (inWell) {
        const wrap = (value: number) => {
          const f = value - Math.floor(value);
          return Math.abs(f - 0.5);
        };
        const diamond = Math.min(wrap((wx + wz) * 0.085), wrap((wx - wz) * 0.085));
        const bars = Math.min(wrap(wx * 0.145), wrap(wz * 0.125));
        const gobo = diamond < 0.052 || bars < 0.068 ? 1 : 0;
        if (gobo) {
          r *= 0.58;
          g *= 0.56;
          b *= 0.52;
        } else {
          r += 22;
          g += 14;
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
  const stoneMap = paintPaneledStone({
    size: 768,
    fill: [206, 190, 164],
    joint: [92, 84, 72],
    grain: 14,
  });
  const plateMap = paintPaneledStone({
    size: 768,
    fill: [232, 220, 200],
    joint: [168, 156, 138],
    grain: 10,
  });
  const darkMap = paintPaneledStone({
    size: 512,
    fill: [108, 100, 90],
    joint: [52, 48, 42],
    grain: 12,
  });
  const rough = paintRoughness(512);
  const metalMap = paintMetal(256);
  const floorMap = paintFloorAtlas();

  const stone = new THREE.MeshStandardMaterial({
    color: "#f2ebe0",
    map: stoneMap,
    roughnessMap: rough,
    roughness: 0.74,
    metalness: 0.03,
    envMapIntensity: 0.5,
  });

  const stoneDark = new THREE.MeshStandardMaterial({
    color: "#d8d0c6",
    map: darkMap,
    roughness: 0.7,
    metalness: 0.05,
    envMapIntensity: 0.4,
  });

  const plate = new THREE.MeshStandardMaterial({
    color: "#f7f1e6",
    map: plateMap,
    roughness: 0.6,
    metalness: 0.04,
    envMapIntensity: 0.55,
  });

  const metal = new THREE.MeshStandardMaterial({
    color: "#c5c8cc",
    map: metalMap,
    roughness: 0.26,
    metalness: 0.88,
    envMapIntensity: 1.2,
  });

  const floor = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: floorMap,
    roughness: 0.36,
    metalness: 0.12,
    envMapIntensity: 1.1,
  });

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
      stoneMap.dispose();
      plateMap.dispose();
      darkMap.dispose();
      rough.dispose();
      metalMap.dispose();
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
