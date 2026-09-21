export type Quality = {
  isMobile: boolean;
  post: boolean;
  intro: boolean;
  dpr: [number, number];
  shadows: boolean;
  reflector: boolean;
  dust: number;
  diagrid: number;
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
    post: !reduced,
    intro: !mobile,
    dpr: mobile ? [1, 1.25] : [1, 1.75],
    shadows: !reduced,
    reflector: !reduced,
    dust: reduced ? 80 : 180,
    diagrid: reduced ? 5 : 9,
  };
}
