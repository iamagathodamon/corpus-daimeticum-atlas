import { useMemo } from "react";
import { useLibrary } from "../state/library";
import { createVolumeLoci } from "./loci";

export function Volumes() {
  const { books, select } = useLibrary();
  const loci = useMemo(() => createVolumeLoci(), []);

  if (books.length === 0) {
    return null;
  }

  return (
    <group>
      {books.map((book, index) => {
        const locus = loci[index];
        if (!locus) {
          return null;
        }
        return (
          <mesh
            key={book.slug}
            position={locus.position}
            onClick={(event) => {
              event.stopPropagation();
              select(book);
            }}
          >
            <boxGeometry args={[0.55, 0.08, 0.55]} />
            <meshPhysicalMaterial color="#2a3036" roughness={0.4} metalness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}
