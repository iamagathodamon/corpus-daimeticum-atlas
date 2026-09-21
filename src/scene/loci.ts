export type VolumeLocus = {
  id: string;
  position: [number, number, number];
};

/** Reserved architectural loci along the hall. Not shelves. */
export function createVolumeLoci(count = 25): VolumeLocus[] {
  const loci: VolumeLocus[] = [];
  for (let i = 0; i < count; i += 1) {
    const lane = i % 2 === 0 ? -11.4 : 11.4;
    const z = 20 + Math.floor(i / 2) * 5.4;
    loci.push({
      id: `locus-${i}`,
      position: [lane, 0.05, z],
    });
  }
  return loci;
}
