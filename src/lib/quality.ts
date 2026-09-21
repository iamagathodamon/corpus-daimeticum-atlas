export type Quality = {
  isMobile: boolean;
  post: boolean;
  grain: boolean;
  intro: boolean;
  dpr: [number, number];
  stars: number;
  swarm: number;
  glyphs: number;
  filaments: number;
};

export function detectQuality(): Quality {
  const mobile =
    window.innerWidth < 820 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const memory = (
    navigator as Navigator & { deviceMemory?: number }
  ).deviceMemory;
  const lowMemory = typeof memory === "number" && memory <= 4;
  const reduced = mobile || lowMemory;

  return {
    isMobile: mobile,
    post: true,
    grain: !reduced,
    intro: !mobile,
    dpr: mobile ? [1, 1.35] : [1, 1.75],
    stars: reduced ? 2800 : 11000,
    swarm: reduced ? 900 : 2800,
    glyphs: reduced ? 36 : 110,
    filaments: reduced ? 2 : 5,
  };
}
