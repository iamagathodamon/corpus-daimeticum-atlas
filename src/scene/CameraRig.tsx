import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Quality } from "../lib/quality";

const startPosition = new THREE.Vector3(-2.2, 1.5, 0.2);
const startLook = new THREE.Vector3(-4.0, 1.38, 0.05);
const endPosition = new THREE.Vector3(0.55, 1.68, 0.9);
const endLook = new THREE.Vector3(-2.7, 1.2, -0.45);
const orbitTarget: [number, number, number] = [-1.4, 1.16, -0.15];

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
    const u = THREE.MathUtils.clamp(elapsed.current / 5.2, 0, 1);
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
      autoRotate={false}
      minDistance={2.6}
      maxDistance={quality.isMobile ? 3.8 : 4.4}
      minPolarAngle={Math.PI * 0.38}
      maxPolarAngle={Math.PI * 0.54}
      minAzimuthAngle={-0.85}
      maxAzimuthAngle={0.55}
      target={orbitTarget}
    />
  );
}
