import { useMemo } from "react";
import { useLibrary } from "../state/library";
import { createOrbitSlots } from "./orbits";

export function Volumes() {
  const { books, select } = useLibrary();
  const slots = useMemo(() => createOrbitSlots(), []);

  if (books.length === 0) {
    return null;
  }

  return (
    <group>
      {books.map((book, index) => {
        const slot = slots[index];
        if (!slot) {
          return null;
        }
        return (
          <mesh
            key={book.slug}
            position={slot.position}
            onClick={(event) => {
              event.stopPropagation();
              select(book);
            }}
          >
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color="#f4d27a" />
          </mesh>
        );
      })}
    </group>
  );
}
