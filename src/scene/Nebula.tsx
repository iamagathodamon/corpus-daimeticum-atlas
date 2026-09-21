import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, ShaderMaterial } from "three";
import { pointer } from "./pointer";
import { nebulaFragment, nebulaVertex } from "./shaders";

export function Nebula() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: { x: 0, y: 0 } },
        },
        vertexShader: nebulaVertex,
        fragmentShader: nebulaFragment,
        side: BackSide,
        depthWrite: false,
      }),
    [],
  );
  const ref = useRef(material);

  useFrame(({ clock }) => {
    const mat = ref.current;
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPointer.value.x +=
      (pointer.x - mat.uniforms.uPointer.value.x) * 0.04;
    mat.uniforms.uPointer.value.y +=
      (pointer.y - mat.uniforms.uPointer.value.y) * 0.04;
  });

  return (
    <mesh scale={[-1, 1, 1]} frustumCulled={false}>
      <sphereGeometry args={[22, 48, 32]} />
      <primitive object={material} attach="material" ref={ref} />
    </mesh>
  );
}
