import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Quality } from "../lib/quality";
import { Atmosphere } from "./Atmosphere";
import { CameraRig } from "./CameraRig";
import { Furnishings } from "./Furnishings";
import { Lighting } from "./Lighting";
import { useLibraryMaterials } from "./materials";
import { Room } from "./Room";
import { Shelves } from "./Shelves";
import { Volumes } from "./Volumes";

function Scene({ quality }: { quality: Quality }) {
  const materials = useLibraryMaterials(quality.anisotropy);

  return (
    <>
      <Lighting quality={quality} />
      <Room materials={materials} cheapGlass={quality.isMobile} />
      <Shelves materials={materials} />
      <Furnishings materials={materials} />
      <Volumes />
      <Atmosphere quality={quality} />
      {quality.shadows ? (
        <ContactShadows
          position={[0, 0.011, 0.1]}
          opacity={0.42}
          scale={9}
          blur={2.6}
          far={3.8}
          color="#140e0a"
        />
      ) : null}
      <CameraRig quality={quality} />
      {quality.post ? (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom
            luminanceThreshold={0.74}
            intensity={0.28}
            mipmapBlur
            luminanceSmoothing={0.2}
          />
          <Vignette eskil={false} offset={0.32} darkness={0.42} />
          <SMAA />
        </EffectComposer>
      ) : null}
    </>
  );
}

export function Library({ quality }: { quality: Quality }) {
  return (
    <Canvas
      className="library-canvas"
      shadows={quality.shadows}
      dpr={quality.dpr}
      camera={{
        fov: quality.isMobile ? 42 : 36,
        near: 0.35,
        far: 40,
        position: quality.intro ? [-2.2, 1.5, 0.2] : [0.55, 1.68, 0.9],
      }}
      gl={{
        antialias: !quality.isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.22,
        powerPreference: quality.isMobile ? "low-power" : "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = quality.shadows;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <Scene quality={quality} />
    </Canvas>
  );
}
