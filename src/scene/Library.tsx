import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import type { Quality } from "../lib/quality";
import { CameraMotion } from "./CameraMotion";
import { Constellation } from "./Constellation";
import { Core } from "./Core";
import { Filaments } from "./Filaments";
import { GlyphField } from "./GlyphField";
import { Nebula } from "./Nebula";
import { setPointer } from "./pointer";
import { Swarm } from "./Swarm";
import { Volumes } from "./Volumes";

function Scene({ quality }: { quality: Quality }) {
  return (
    <>
      <color attach="background" args={["#03010a"]} />
      <ambientLight intensity={0.22} color="#8a7cff" />
      <pointLight position={[2.4, 1.6, 1.2]} intensity={8} color="#f0c56a" />
      <pointLight position={[-2.2, -0.8, -1.6]} intensity={6} color="#5ad0ff" />
      <pointLight position={[0.2, 2.4, -2]} intensity={4} color="#c48cff" />
      <Nebula />
      <Constellation quality={quality} />
      <Swarm quality={quality} />
      <GlyphField quality={quality} />
      <Filaments quality={quality} />
      <Core />
      <Volumes />
      <CameraMotion quality={quality} />
      {quality.post ? (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom
            luminanceThreshold={0.18}
            intensity={quality.isMobile ? 0.55 : 0.85}
            mipmapBlur
            luminanceSmoothing={0.2}
          />
          {quality.grain ? (
            <ChromaticAberration
              radialModulation
              modulationOffset={0.18}
              offset={new THREE.Vector2(0.0007, 0.0009)}
            />
          ) : null}
          {quality.grain ? (
            <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} />
          ) : null}
          <Vignette eskil={false} offset={0.28} darkness={0.62} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export function Library({ quality }: { quality: Quality }) {
  return (
    <Canvas
      className="field-canvas"
      dpr={quality.dpr}
      camera={{
        fov: quality.isMobile ? 58 : 50,
        near: 0.12,
        far: 40,
        position: [0, 0.3, quality.intro ? 9.5 : 3.55],
      }}
      gl={{
        antialias: !quality.isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        powerPreference: quality.isMobile ? "low-power" : "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      onPointerMove={(event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        setPointer(x, -y);
      }}
    >
      <Scene quality={quality} />
    </Canvas>
  );
}
