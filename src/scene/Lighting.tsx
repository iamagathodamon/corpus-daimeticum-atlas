import { useLayoutEffect, useRef } from "react";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import type { SpotLight } from "three";
import type { Quality } from "../lib/quality";

type LightingProps = {
  quality: Quality;
};

export function Lighting({ quality }: LightingProps) {
  const lamp = useRef<SpotLight>(null);

  useLayoutEffect(() => {
    RectAreaLightUniformsLib.init();
    if (lamp.current) {
      lamp.current.target.position.set(-0.08, 1.18, -0.42);
      lamp.current.target.updateMatrixWorld();
    }
  }, []);

  return (
    <>
      <color attach="background" args={["#0a0806"]} />
      <fog attach="fog" args={["#0c0907", 7.5, 16]} />
      <hemisphereLight args={["#8a97aa", "#2a1c14", 0.18]} />
      <ambientLight intensity={0.045} color="#2c241c" />

      <directionalLight
        position={[-0.2, 3.4, -4.8]}
        intensity={1.85}
        color="#c5d0e2"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMap}
        shadow-mapSize-height={quality.shadowMap}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      <rectAreaLight
        position={[0, 2.3, -3.86]}
        width={2.55}
        height={2.4}
        intensity={7.5}
        color="#b7c4d6"
      />

      <spotLight
        ref={lamp}
        position={[0.08, 2.05, -0.3]}
        intensity={14}
        color="#ffc57a"
        angle={0.48}
        penumbra={0.82}
        distance={7}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMap}
        shadow-mapSize-height={quality.shadowMap}
        shadow-bias={-0.0002}
      />

      <pointLight
        position={[0.08, 1.5, -0.36]}
        intensity={1.35}
        color="#ffb35c"
        distance={4.2}
        decay={2}
      />

      <pointLight
        position={[-2.4, 2.6, 1.4]}
        intensity={0.28}
        color="#6a5848"
        distance={6}
      />
    </>
  );
}
