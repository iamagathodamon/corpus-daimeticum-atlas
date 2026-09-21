import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { Quality } from "../lib/quality";
import { Architecture } from "./Architecture";
import { Daylight } from "./Daylight";
import { Volumes } from "./Volumes";
import { Walker } from "./Walker";

function Scene({ quality }: { quality: Quality }) {
  return (
    <>
      <Daylight quality={quality} />
      <Architecture quality={quality} />
      <Volumes />
      <Walker quality={quality} />
      {quality.post ? (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Vignette eskil={false} offset={0.18} darkness={0.42} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export function Library({ quality }: { quality: Quality }) {
  return (
    <Canvas
      className="field-canvas"
      shadows={quality.shadows}
      dpr={quality.dpr}
      camera={{
        fov: quality.isMobile ? 60 : 54,
        near: 0.12,
        far: 180,
        position: [0, 1.64, -12.4],
      }}
      gl={{
        antialias: !quality.isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
        powerPreference: quality.isMobile ? "low-power" : "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = quality.shadows;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        RectAreaLightUniformsLib.init();
      }}
    >
      <Scene quality={quality} />
    </Canvas>
  );
}
