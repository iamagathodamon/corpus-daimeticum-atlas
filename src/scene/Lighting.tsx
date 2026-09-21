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
      <color attach="background" args={["#1a1410"]} />
      <fog attach="fog" args={["#1a1410", 14, 28]} />
      <hemisphereLight args={["#c8c2b4", "#4a382c", 0.55]} />
      <ambientLight intensity={0.22} color="#c4b49c" />

      <directionalLight
        position={[-0.4, 3.6, -3.8]}
        intensity={2.4}
        color="#e6d4bc"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMap}
        shadow-mapSize-height={quality.shadowMap}
        shadow-bias={-0.00025}
        shadow-normalBias={0.02}
        shadow-camera-near={0.5}
        shadow-camera-far={16}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      <rectAreaLight
        position={[0, 2.35, -3.82]}
        width={2.7}
        height={2.5}
        intensity={7}
        color="#c8b8a0"
      />

      <rectAreaLight
        position={[0, 4.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={6.5}
        height={5.5}
        intensity={4.5}
        color="#d2c2a8"
      />

      <spotLight
        ref={lamp}
        position={[0.08, 2.05, -0.3]}
        intensity={10}
        color="#ffc57a"
        angle={0.52}
        penumbra={0.84}
        distance={8}
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMap}
        shadow-mapSize-height={quality.shadowMap}
        shadow-bias={-0.0002}
      />

      <pointLight
        position={[0.08, 1.55, -0.3]}
        intensity={2.2}
        color="#ffc07a"
        distance={5}
        decay={2}
      />

      <pointLight
        position={[-3.1, 2.15, 0.1]}
        intensity={3.4}
        color="#f0d4b0"
        distance={5.5}
        decay={2}
      />
      <pointLight
        position={[3.1, 2.15, 0.1]}
        intensity={2.6}
        color="#e8d0b4"
        distance={5.5}
        decay={2}
      />
      <pointLight
        position={[0, 2.2, 2.9]}
        intensity={2.2}
        color="#e4d2ba"
        distance={5}
        decay={2}
      />
    </>
  );
}
