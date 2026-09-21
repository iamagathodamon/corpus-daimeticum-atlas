import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "../lib/quality";

function Sun() {
  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(0, 0, 46);
    return object;
  }, []);

  return (
    <>
      <primitive object={target} />
      <directionalLight
        position={[10, 58, 22]}
        intensity={2.15}
        color="#fff3df"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.04}
        shadow-camera-near={8}
        shadow-camera-far={140}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={56}
        shadow-camera-bottom={-40}
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
      data[i * 5] = (Math.random() - 0.5) * 16;
      data[i * 5 + 1] = 2 + Math.random() * 30;
      data[i * 5 + 2] = 28 + Math.random() * 44;
      data[i * 5 + 3] = 0.4 + Math.random() * 0.9;
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
      const y = 2 + ((y0 + t * speed * 0.18) % 30);
      dummy.position.set(
        x + Math.sin(t * 0.12 + phase) * 0.25,
        y,
        z + Math.cos(t * 0.1 + phase) * 0.2,
      );
      const s = 0.018 + (i % 5) * 0.004;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      instance.setMatrixAt(i, dummy.matrix);
    }
    instance.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        color="#efe6d2"
        transparent
        opacity={0.16}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function Daylight({ quality }: { quality: Quality }) {
  return (
    <>
      <color attach="background" args={["#b7c2ce"]} />
      <fog attach="fog" args={["#b7c2ce", 78, 190]} />
      <hemisphereLight args={["#c5d2e0", "#9a9488", 1.15]} />
      <ambientLight intensity={0.28} color="#d5dbe3" />
      {quality.shadows ? <Sun /> : (
        <directionalLight
          position={[10, 58, 22]}
          intensity={2.1}
          color="#fff3df"
        />
      )}
      <directionalLight
        position={[0, 18, 96]}
        intensity={1.15}
        color="#fff6e6"
      />
      <directionalLight
        position={[-18, 8, 20]}
        intensity={0.42}
        color="#d7e2ee"
      />
      <rectAreaLight
        position={[0, 33.4, 48]}
        width={18}
        height={38}
        intensity={5.2}
        color="#f4f8fc"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        position={[0, 16, 93.8]}
        width={22}
        height={16}
        intensity={6.4}
        color="#ffe9c4"
        rotation={[0, Math.PI, 0]}
      />
      <rectAreaLight
        position={[0, 2.2, -15.2]}
        width={5}
        height={3.4}
        intensity={2.2}
        color="#cdd8e6"
        rotation={[0, 0, 0]}
      />
      <directionalLight
        position={[2, 5, 36]}
        intensity={0.32}
        color="#d7dee6"
      />
      <Dust count={quality.dust} />
    </>
  );
}
