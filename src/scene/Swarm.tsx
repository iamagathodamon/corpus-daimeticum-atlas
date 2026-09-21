import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
} from "three";
import type { Quality } from "../lib/quality";
import { pointer } from "./pointer";
import { pointFragment, pointVertex } from "./shaders";

export function Swarm({ quality }: { quality: Quality }) {
  const points = useRef<Points>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
          uColor: { value: { x: 0.95, y: 0.72, z: 0.32 } },
        },
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  const geometry = useMemo(() => {
    const count = quality.swarm;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.15 + Math.random() * 0.85;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
      positions[i * 3 + 2] = Math.sin(a) * r;
      sizes[i] = 1.1 + Math.random() * 2.2;
      seeds[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return geo;
  }, [quality.swarm]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (points.current) {
      points.current.rotation.y = clock.elapsedTime * 0.14;
      points.current.position.x = pointer.x * 0.28;
      points.current.position.y = pointer.y * 0.2;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <primitive object={material} attach="material" />
    </points>
  );
}
