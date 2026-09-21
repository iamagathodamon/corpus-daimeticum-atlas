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
import { pointFragment, pointVertex } from "./shaders";

function randomInShell(radius: number, jitter: number): [number, number, number] {
  const u = Math.random();
  const v = Math.random();
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = radius + (Math.random() - 0.5) * jitter;
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi) * 0.72,
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

export function Constellation({ quality }: { quality: Quality }) {
  const points = useRef<Points>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.75) },
          uColor: { value: { x: 0.78, y: 0.86, z: 1.0 } },
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
    const count = quality.stars;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const shell = i % 5 === 0 ? 7.4 : i % 3 === 0 ? 4.8 : 3.2;
      const [x, y, z] = randomInShell(shell, 1.8);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      sizes[i] = 0.6 + Math.random() * 2.4;
      seeds[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return geo;
  }, [quality.stars]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    if (points.current) {
      points.current.rotation.y = clock.elapsedTime * 0.018;
      points.current.rotation.x = Math.sin(clock.elapsedTime * 0.07) * 0.08;
    }
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <primitive object={material} attach="material" />
    </points>
  );
}
