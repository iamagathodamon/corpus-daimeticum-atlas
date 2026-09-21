import { useMemo } from "react";
import * as THREE from "three";
import { createLibraryTextures, type LibraryTextures } from "./textures";

export type LibraryMaterials = {
  textures: LibraryTextures;
  walnut: THREE.MeshStandardMaterial;
  walnutDark: THREE.MeshStandardMaterial;
  oak: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
  plaster: THREE.MeshStandardMaterial;
  leather: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  brassDim: THREE.MeshStandardMaterial;
  rug: THREE.MeshStandardMaterial;
  paper: THREE.MeshStandardMaterial;
  linen: THREE.MeshStandardMaterial;
  dusk: THREE.MeshBasicMaterial;
};

export function createLibraryMaterials(anisotropy: number): LibraryMaterials {
  const textures = createLibraryTextures(anisotropy);

  const walnut = new THREE.MeshStandardMaterial({
    map: textures.walnut,
    roughnessMap: textures.walnutRough,
    roughness: 0.62,
    metalness: 0.02,
    color: "#f3e4d0",
  });

  const walnutDark = new THREE.MeshStandardMaterial({
    map: textures.walnut,
    roughnessMap: textures.walnutRough,
    roughness: 0.7,
    metalness: 0.02,
    color: "#7a5c48",
  });

  const oak = new THREE.MeshStandardMaterial({
    map: textures.oak,
    roughness: 0.55,
    metalness: 0.02,
    color: "#f4e2cc",
  });

  const floor = new THREE.MeshStandardMaterial({
    map: textures.parquet,
    roughness: 0.42,
    metalness: 0.04,
    color: "#ecd8c4",
  });

  const plaster = new THREE.MeshStandardMaterial({
    map: textures.plaster,
    roughness: 0.86,
    metalness: 0,
    color: "#e8dfd0",
  });

  const leather = new THREE.MeshStandardMaterial({
    map: textures.leather,
    roughness: 0.58,
    metalness: 0.04,
    color: "#e0b8a8",
  });

  const brass = new THREE.MeshStandardMaterial({
    color: "#c4a46a",
    metalness: 1,
    roughness: 0.28,
  });

  const brassDim = new THREE.MeshStandardMaterial({
    color: "#8a7048",
    metalness: 0.92,
    roughness: 0.42,
  });

  const rug = new THREE.MeshStandardMaterial({
    map: textures.rug,
    roughness: 0.9,
    metalness: 0,
    color: "#d2c2b0",
  });

  const paper = new THREE.MeshStandardMaterial({
    map: textures.paper,
    roughness: 0.82,
    metalness: 0,
  });

  const linen = new THREE.MeshStandardMaterial({
    color: "#cbb79a",
    roughness: 0.88,
    metalness: 0,
  });

  const dusk = new THREE.MeshBasicMaterial({
    map: textures.dusk,
  });

  return {
    textures,
    walnut,
    walnutDark,
    oak,
    floor,
    plaster,
    leather,
    brass,
    brassDim,
    rug,
    paper,
    linen,
    dusk,
  };
}

export function useLibraryMaterials(anisotropy: number): LibraryMaterials {
  return useMemo(() => createLibraryMaterials(anisotropy), [anisotropy]);
}
