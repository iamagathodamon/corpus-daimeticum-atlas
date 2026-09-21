export type OrbitSlot = {
  id: string;
  position: [number, number, number];
};

/** Twenty-five reserved loci for a later catalog drop. Not shelves. */
export function createOrbitSlots(count = 25): OrbitSlot[] {
  const slots: OrbitSlot[] = [];
  const radius = 1.55;
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    const y = Math.sin(i * 1.7) * 0.22;
    slots.push({
      id: `orbit-${i}`,
      position: [Math.cos(a) * radius, y, Math.sin(a) * radius],
    });
  }
  return slots;
}
