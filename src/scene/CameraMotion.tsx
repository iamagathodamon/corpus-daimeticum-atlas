import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import type { Quality } from "../lib/quality";
import { pointer } from "./pointer";

const look = new Vector3();

export function CameraMotion({ quality }: { quality: Quality }) {
  const intro = useRef(0);
  const { camera } = useThree();

  useFrame((_, delta) => {
    intro.current = Math.min(1, intro.current + delta / (quality.intro ? 2.1 : 0.15));
    const e = intro.current * intro.current * (3 - 2 * intro.current);
    const t = performance.now() * 0.00012;
    const radius = MathUtils.lerp(9.5, 3.55, e);
    const height = MathUtils.lerp(0.2, 0.35 + pointer.y * 0.35, e);
    const yaw = t + pointer.x * 0.55;
    camera.position.set(
      Math.sin(yaw) * radius,
      height,
      Math.cos(yaw) * radius,
    );
    look.set(pointer.x * 0.4, pointer.y * 0.25, 0);
    camera.lookAt(look);
  });

  return null;
}
