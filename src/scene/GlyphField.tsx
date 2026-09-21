import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  InstancedMesh,
  Object3D,
} from "three";
import type { Quality } from "../lib/quality";

function createGlyphTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  const cx = size / 2;
  const cy = size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 170, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 88, 0.2, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, 70);
  ctx.lineTo(cx + 150, cy + 120);
  ctx.lineTo(cx - 150, cy + 120);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 190, cy);
  ctx.lineTo(cx + 190, cy);
  ctx.moveTo(cx, cy - 190);
  ctx.lineTo(cx, cy + 190);
  ctx.stroke();
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function GlyphField({ quality }: { quality: Quality }) {
  const mesh = useRef<InstancedMesh>(null);
  const map = useMemo(() => createGlyphTexture(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const seeds = useMemo(() => {
    return Array.from({ length: quality.glyphs }, () => ({
      radius: 2.1 + Math.random() * 2.6,
      tilt: (Math.random() - 0.5) * 1.4,
      speed: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      scale: 0.08 + Math.random() * 0.16,
    }));
  }, [quality.glyphs]);

  useFrame(({ clock }) => {
    const inst = mesh.current;
    if (!inst) {
      return;
    }
    const t = clock.elapsedTime;
    for (let i = 0; i < seeds.length; i += 1) {
      const s = seeds[i];
      const a = s.phase + t * s.speed;
      dummy.position.set(
        Math.cos(a) * s.radius,
        Math.sin(a * 1.4 + s.tilt) * 0.9,
        Math.sin(a) * s.radius,
      );
      dummy.lookAt(0, 0, 0);
      dummy.rotateZ(t * 0.15 + s.phase);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, quality.glyphs]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={map}
        color={new Color("#d7b6ff")}
        transparent
        opacity={0.42}
        depthWrite={false}
        blending={AdditiveBlending}
        side={DoubleSide}
      />
    </instancedMesh>
  );
}
