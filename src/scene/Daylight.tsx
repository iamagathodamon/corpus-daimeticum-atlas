import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "../lib/quality";

function Sun() {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(0, 0, 48);
    return object;
  }, []);

  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[14, 52, 18]}
        intensity={2.8}
        color="#ffe7c2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
        shadow-camera-near={8}
        shadow-camera-far={140}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={54}
        shadow-camera-bottom={-38}
        target={target}
      />
    </>
  );
}

function Dust({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const data = new Float32Array(count * 5);
    for (let i = 0; i < count; i += 1) {
      data[i * 5] = (Math.random() - 0.5) * 14;
      data[i * 5 + 1] = 2 + Math.random() * 28;
      data[i * 5 + 2] = 30 + Math.random() * 40;
      data[i * 5 + 3] = 0.35 + Math.random() * 0.7;
      data[i * 5 + 4] = Math.random() * Math.PI * 2;
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const instance = mesh.current;
    if (!instance) {
      return;
    }
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const x = seeds[i * 5];
      const y0 = seeds[i * 5 + 1];
      const z = seeds[i * 5 + 2];
      const speed = seeds[i * 5 + 3];
      const phase = seeds[i * 5 + 4];
      const y = 2 + ((y0 + t * speed * 0.14) % 28);
      dummy.position.set(
        x + Math.sin(t * 0.1 + phase) * 0.2,
        y,
        z + Math.cos(t * 0.08 + phase) * 0.16,
      );
      dummy.scale.setScalar(0.016 + (i % 5) * 0.003);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
    }
    instance.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color="#f3e6c8"
        transparent
        opacity={0.14}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function Daylight({ quality }: { quality: Quality }) {
  return (
    <>
      <color attach="background" args={["#c9c0b2"]} />
      <fog attach="fog" args={["#c9c0b2", 70, 175]} />
      <hemisphereLight args={["#e8d9c0", "#7a6e60", 0.72]} />
      <ambientLight intensity={0.16} color="#e6d8c4" />
      {quality.shadows ? (
        <Sun />
      ) : (
        <directionalLight
          position={[14, 52, 18]}
          intensity={2.4}
          color="#ffe7c2"
        />
      )}
      <directionalLight
        position={[0, 20, 98]}
        intensity={0.85}
        color="#ffe9c4"
      />
      <directionalLight
        position={[-16, 12, 24]}
        intensity={0.28}
        color="#d7cfc4"
      />
      <rectAreaLight
        position={[0, 33.4, 48]}
        width={18}
        height={38}
        intensity={7.5}
        color="#fff4de"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        position={[0, 16, 93.8]}
        width={22}
        height={16}
        intensity={7.2}
        color="#ffd9a4"
        rotation={[0, Math.PI, 0]}
      />
      <rectAreaLight
        position={[0, 2.2, -15.2]}
        width={5}
        height={3.4}
        intensity={1.8}
        color="#d8cfc2"
        rotation={[0, 0, 0]}
      />
      <Dust count={quality.dust} />
    </>
  );
}
