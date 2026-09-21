import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CatmullRomCurve3,
  DoubleSide,
  ShaderMaterial,
  Vector3,
} from "three";
import type { Quality } from "../lib/quality";
import { filamentFragment, filamentVertex } from "./shaders";

function makeCurve(index: number, radius: number): CatmullRomCurve3 {
  const points: Vector3[] = [];
  const turns = 3;
  const count = 40;
  for (let i = 0; i <= count; i += 1) {
    const u = i / count;
    const a = u * Math.PI * 2 * turns + index * 0.9;
    const r = radius + Math.sin(u * Math.PI * 4 + index) * 0.35;
    points.push(
      new Vector3(
        Math.cos(a) * r,
        Math.sin(u * Math.PI * 2 + index) * 0.85,
        Math.sin(a) * r,
      ),
    );
  }
  return new CatmullRomCurve3(points, true);
}

const COLORS = [
  [0.95, 0.7, 0.28],
  [0.45, 0.82, 1.0],
  [0.78, 0.45, 1.0],
  [1.0, 0.55, 0.62],
  [0.55, 1.0, 0.78],
];

export function Filaments({ quality }: { quality: Quality }) {
  const items = useMemo(() => {
    return Array.from({ length: quality.filaments }, (_, index) => {
      const curve = makeCurve(index, 1.7 + index * 0.18);
      const material = new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: {
            value: {
              x: COLORS[index % COLORS.length][0],
              y: COLORS[index % COLORS.length][1],
              z: COLORS[index % COLORS.length][2],
            },
          },
        },
        vertexShader: filamentVertex,
        fragmentShader: filamentFragment,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
      });
      return { curve, material, index };
    });
  }, [quality.filaments]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const item of items) {
      item.material.uniforms.uTime.value = t + item.index * 0.4;
    }
  });

  return (
    <group>
      {items.map((item) => (
        <mesh key={item.index} material={item.material}>
          <tubeGeometry args={[item.curve, 140, 0.01, 6, true]} />
        </mesh>
      ))}
    </group>
  );
}
