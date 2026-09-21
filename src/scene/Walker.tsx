import { useEffect, useMemo, useRef } from "react";
import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Quality } from "../lib/quality";
import { setTraversalLocked } from "../state/traversal";
import { EYE, readView, sampleFloor, VIEWS, type ViewName } from "./layout";

const WALK = 5.4;
const SPRINT = 12.2;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function applyView(camera: THREE.Camera, name: ViewName) {
  const view = VIEWS[name];
  camera.position.set(...view.position);
  camera.lookAt(...view.target);
}

export function Walker({ quality }: { quality: Quality }) {
  const { camera, gl } = useThree();
  const locked = useRef(false);
  const keys = useRef({
    f: false,
    b: false,
    l: false,
    r: false,
    sprint: false,
  });
  const intro = useRef(0);
  const preset = useMemo(() => readView(), []);
  const skipIntro = Boolean(preset) || !quality.intro;
  const hold = useRef(new THREE.Vector3(...VIEWS.atrium.target));
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const wish = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useEffect(() => {
    if (preset) {
      applyView(camera, preset);
      hold.current.set(...VIEWS[preset].target);
      intro.current = 1;
      return;
    }
    applyView(camera, "threshold");
    if (skipIntro) {
      applyView(camera, "atrium");
      intro.current = 1;
    }
  }, [camera, preset, skipIntro]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") keys.current.f = true;
      if (event.code === "KeyS" || event.code === "ArrowDown") keys.current.b = true;
      if (event.code === "KeyA" || event.code === "ArrowLeft") keys.current.l = true;
      if (event.code === "KeyD" || event.code === "ArrowRight") keys.current.r = true;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        keys.current.sprint = true;
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "KeyW" || event.code === "ArrowUp") keys.current.f = false;
      if (event.code === "KeyS" || event.code === "ArrowDown") keys.current.b = false;
      if (event.code === "KeyA" || event.code === "ArrowLeft") keys.current.l = false;
      if (event.code === "KeyD" || event.code === "ArrowRight") keys.current.r = false;
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        keys.current.sprint = false;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);

    if (!locked.current) {
      if (preset) {
        applyView(camera, preset);
        return;
      }
      if (intro.current < 1) {
        intro.current = Math.min(1, intro.current + dt * 0.13);
        const t = easeInOut(intro.current);
        const a = VIEWS.threshold;
        const b = VIEWS.atrium;
        camera.position.set(
          a.position[0] + (b.position[0] - a.position[0]) * t,
          a.position[1] + (b.position[1] - a.position[1]) * t,
          a.position[2] + (b.position[2] - a.position[2]) * t,
        );
        camera.lookAt(
          a.target[0] + (b.target[0] - a.target[0]) * t,
          a.target[1] + (b.target[1] - a.target[1]) * t,
          a.target[2] + (b.target[2] - a.target[2]) * t,
        );
      }
      return;
    }

    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 0.0001) {
      forward.set(0, 0, 1);
    } else {
      forward.normalize();
    }
    right.crossVectors(forward, up).normalize();

    wish.set(0, 0, 0);
    if (keys.current.f) wish.add(forward);
    if (keys.current.b) wish.sub(forward);
    if (keys.current.r) wish.add(right);
    if (keys.current.l) wish.sub(right);

    if (wish.lengthSq() > 0) {
      wish.normalize();
      const speed = keys.current.sprint ? SPRINT : WALK;
      const nextX = camera.position.x + wish.x * speed * dt;
      const nextZ = camera.position.z + wish.z * speed * dt;
      const floor = sampleFloor(nextX, nextZ, camera.position.y);
      if (floor !== null) {
        camera.position.x = nextX;
        camera.position.z = nextZ;
        const desired = floor + EYE;
        camera.position.y += (desired - camera.position.y) * (1 - Math.exp(-12 * dt));
      }
    } else {
      const floor = sampleFloor(camera.position.x, camera.position.z, camera.position.y);
      if (floor !== null) {
        const desired = floor + EYE;
        camera.position.y += (desired - camera.position.y) * (1 - Math.exp(-12 * dt));
      }
    }
  });

  return (
    <PointerLockControls
      domElement={gl.domElement}
      onLock={() => {
        locked.current = true;
        intro.current = 1;
        setTraversalLocked(true);
      }}
      onUnlock={() => {
        locked.current = false;
        setTraversalLocked(false);
      }}
    />
  );
}
