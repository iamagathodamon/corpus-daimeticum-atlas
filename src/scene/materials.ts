import { useMemo } from "react";
import * as THREE from "three";

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function paintStone(
  size: number,
  base: [number, number, number],
  variation: number,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Stone texture canvas was not available");
  }

  ctx.fillStyle = `rgb(${base[0]}, ${base[1]}, ${base[2]})`;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 56; i += 1) {
    const drift = (Math.random() - 0.5) * variation;
    const r = clampByte(base[0] + drift);
    const g = clampByte(base[1] + drift * 0.92);
    const b = clampByte(base[2] + drift * 1.08);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.055)`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * size,
      Math.random() * size,
      Math.random() * size * 0.42,
      Math.random() * size * 0.22,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 9;
    image.data[i] = clampByte(image.data[i] + n);
    image.data[i + 1] = clampByte(image.data[i + 1] + n);
    image.data[i + 2] = clampByte(image.data[i + 2] + n * 1.05);
  }
  ctx.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paintRoughness(size: number, lo: number, hi: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Roughness canvas was not available");
  }
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = clampByte((lo + Math.random() * (hi - lo)) * 255);
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export type TempleMaterials = {
  stone: THREE.MeshPhysicalMaterial;
  stoneDark: THREE.MeshPhysicalMaterial;
  plate: THREE.MeshPhysicalMaterial;
  metal: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  glow: THREE.MeshBasicMaterial;
  slit: THREE.MeshBasicMaterial;
  sky: THREE.MeshBasicMaterial;
  dispose: () => void;
};

export function createTempleMaterials(): TempleMaterials {
  const stoneMap = paintStone(1024, [214, 218, 224], 28);
  stoneMap.repeat.set(7, 11);
  const plateMap = paintStone(1024, [230, 233, 238], 16);
  plateMap.repeat.set(4, 4);
  const darkMap = paintStone(512, [58, 63, 70], 18);
  darkMap.repeat.set(3, 6);
  const rough = paintRoughness(512, 0.62, 0.92);
  rough.repeat.set(7, 11);

  const stone = new THREE.MeshPhysicalMaterial({
    color: "#d5d9df",
    map: stoneMap,
    roughnessMap: rough,
    roughness: 0.84,
    metalness: 0.02,
    envMapIntensity: 0.35,
    clearcoat: 0.06,
    clearcoatRoughness: 0.7,
  });

  const stoneDark = new THREE.MeshPhysicalMaterial({
    color: "#3a4047",
    map: darkMap,
    roughness: 0.72,
    metalness: 0.08,
    envMapIntensity: 0.28,
  });

  const plate = new THREE.MeshPhysicalMaterial({
    color: "#e7eaef",
    map: plateMap,
    roughness: 0.78,
    metalness: 0.01,
    envMapIntensity: 0.4,
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
  });

  const metal = new THREE.MeshPhysicalMaterial({
    color: "#1d2126",
    roughness: 0.38,
    metalness: 0.86,
    envMapIntensity: 0.7,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: "#9eb4c6",
    roughness: 0.06,
    metalness: 0.04,
    transparent: true,
    opacity: 0.16,
    transmission: 0,
    envMapIntensity: 1,
    side: THREE.DoubleSide,
  });

  const glow = new THREE.MeshBasicMaterial({
    color: "#f4f7fb",
  });

  const slit = new THREE.MeshBasicMaterial({
    color: "#fff3d8",
  });

  const sky = new THREE.MeshBasicMaterial({
    color: "#e8eef5",
    side: THREE.DoubleSide,
  });

  return {
    stone,
    stoneDark,
    plate,
    metal,
    glass,
    glow,
    slit,
    sky,
    dispose: () => {
      stoneMap.dispose();
      plateMap.dispose();
      darkMap.dispose();
      rough.dispose();
      stone.dispose();
      stoneDark.dispose();
      plate.dispose();
      metal.dispose();
      glass.dispose();
      glow.dispose();
      slit.dispose();
      sky.dispose();
    },
  };
}

export function useTempleMaterials(): TempleMaterials {
  const materials = useMemo(() => createTempleMaterials(), []);
  return materials;
}
