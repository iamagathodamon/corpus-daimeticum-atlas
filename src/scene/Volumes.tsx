import { useMemo } from "react";
import * as THREE from "three";
import { useLibrary } from "../state/library";
import { createShelfSlots, type ShelfSlot } from "./layout";
import type { Book } from "../types/book";

function coverColor(slug: string): string {
  let n = 0;
  for (let i = 0; i < slug.length; i += 1) {
    n = (n * 31 + slug.charCodeAt(i)) % 360;
  }
  return `hsl(${n} 18% 28%)`;
}

function Volume({
  book,
  slot,
  onSelect,
}: {
  book: Book;
  slot: ShelfSlot;
  onSelect: () => void;
}) {
  const map = useMemo(() => {
    if (!book.cover) {
      return null;
    }
    const texture = new THREE.TextureLoader().load(book.cover);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [book.cover]);

  return (
    <mesh
      position={slot.position}
      rotation={[0, slot.rotationY, 0]}
      castShadow
      receiveShadow
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <boxGeometry args={[slot.width, slot.height, slot.depth]} />
      <meshStandardMaterial
        map={map ?? undefined}
        color={map ? "#d8c8b4" : coverColor(book.slug)}
        roughness={0.62}
        metalness={0.04}
      />
    </mesh>
  );
}

export function Volumes() {
  const { books, select } = useLibrary();
  const slots = useMemo(() => createShelfSlots(), []);

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
          <Volume
            key={book.slug}
            book={book}
            slot={slot}
            onSelect={() => select(book)}
          />
        );
      })}
    </group>
  );
}
