import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Quality } from "../lib/quality";

const startPosition = new THREE.Vector3(-3.15, 1.48, 0.55);
const startLook = new THREE.Vector3(-4.15, 1.38, -0.35);
const endPosition = new THREE.Vector3(0.22, 1.36, 2.82);
const endLook = new THREE.Vector3(-0.05, 1.14, -0.35);

type CameraRigProps = {
  quality: Quality;
};

export function CameraRig({ quality }: CameraRigProps) {
  const [settled, setSettled] = useState(!quality.intro);
  const elapsed = useRef(quality.intro ? 0 : 10);
  const look = useRef(endLook.clone());

  useFrame(({ camera }, delta) => {
    if (settled) {
      return;
    }
    elapsed.current += delta;
    const u = THREE.MathUtils.clamp(elapsed.current / 5.4, 0, 1);
    const e = u * u * (3 - 2 * u);
    camera.position.lerpVectors(startPosition, endPosition, e);
    look.current.lerpVectors(startLook, endLook, e);
    camera.lookAt(look.current);
    if (u >= 1) {
      setSettled(true);
    }
  });

  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.046}
      enabled={settled}
      autoRotate={settled && !quality.isMobile}
      autoRotateSpeed={0.16}
      minDistance={quality.isMobile ? 2.6 : 2.15}
      maxDistance={quality.isMobile ? 3.6 : 4.35}
      minPolarAngle={Math.PI * 0.36}
      maxPolarAngle={Math.PI * 0.56}
      minAzimuthAngle={-0.82}
      maxAzimuthAngle={0.82}
      target={[-0.05, 1.14, -0.35]}
    />
  );
}
