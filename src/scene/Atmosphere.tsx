import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "../lib/quality";

function Dust({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 2.4;
      positions[i * 3 + 1] = 0.45 + Math.random() * 3.1;
      positions[i * 3 + 2] = -3.35 + Math.random() * 2.6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }) => {
    const attr = points.current?.geometry.getAttribute("position");
    if (!(attr instanceof THREE.BufferAttribute)) {
      return;
    }
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      let y = attr.getY(i) + 0.0035;
      if (y > 3.65) {
        y = 0.4;
      }
      attr.setY(i, y);
      attr.setX(i, attr.getX(i) + Math.sin(t * 0.18 + i) * 0.00035);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.013}
        color="#f2e6d2"
        transparent
        opacity={0.32}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function LightShaft() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {},
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
            float fall = pow(1.0 - vUv.y, 1.35) * 0.16;
            gl_FragColor = vec4(0.70, 0.76, 0.88, fall * edge);
          }
        `,
      }),
    [],
  );

  return (
    <mesh
      position={[0, 1.9, -2.35]}
      rotation={[0.58, 0, 0]}
      material={material}
    >
      <planeGeometry args={[2.7, 4.3]} />
    </mesh>
  );
}

export function Atmosphere({ quality }: { quality: Quality }) {
  return (
    <group>
      <LightShaft />
      {quality.dust ? <Dust count={280} /> : null}
    </group>
  );
}
