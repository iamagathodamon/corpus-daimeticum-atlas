export type Quality = {
  isMobile: boolean;
  shadows: boolean;
  post: boolean;
  dust: boolean;
  intro: boolean;
  dpr: [number, number];
  shadowMap: number;
  anisotropy: number;
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
    shadows: !reduced,
    post: !reduced,
    dust: !reduced,
    intro: !mobile,
    dpr: mobile ? [1, 1.25] : [1, 1.75],
    shadowMap: reduced ? 512 : 2048,
    anisotropy: reduced ? 4 : 8,
  };
}
