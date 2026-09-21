import { ContactShadows } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, N8AO, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
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
      <ContactShadows
        position={[0, 0.02, 46]}
        opacity={0.38}
        scale={90}
        blur={2.1}
        far={22}
        resolution={quality.isMobile ? 256 : 512}
        color="#3a342c"
      />
      <Volumes />
      <Walker quality={quality} />
      {quality.post ? (
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <N8AO aoRadius={4.5} intensity={1.35} distanceFalloff={1.2} />
          <Vignette eskil={false} offset={0.16} darkness={0.34} />
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
        far: 220,
        position: [0, 1.64, -12.4],
      }}
      gl={{
        antialias: !quality.isMobile,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.94,
        powerPreference: quality.isMobile ? "low-power" : "high-performance",
        alpha: false,
      }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.shadowMap.enabled = quality.shadows;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        RectAreaLightUniformsLib.init();
        const pmrem = new THREE.PMREMGenerator(gl);
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = env;
        scene.environmentIntensity = 0.42;
        pmrem.dispose();
      }}
    >
      <Scene quality={quality} />
    </Canvas>
  );
}
