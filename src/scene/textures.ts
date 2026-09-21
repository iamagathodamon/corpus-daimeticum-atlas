import * as THREE from "three";

function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(ix + iy * 57);
  const b = hash(ix + 1 + iy * 57);
  const c = hash(ix + (iy + 1) * 57);
  const d = hash(ix + 1 + (iy + 1) * 57);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i += 1) {
    value += amp * noise2(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.05;
  }
  return value;
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function color(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function canvasTexture(
  size: number,
  paint: (ctx: CanvasRenderingContext2D, size: number) => void,
  anisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D is unavailable");
  }
  paint(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function paintWood(
  ctx: CanvasRenderingContext2D,
  size: number,
  dark: string,
  light: string,
  grain = 1,
): void {
  const a = color(dark);
  const b = color(light);
  const image = ctx.createImageData(size, size);
  const data = image.data;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / size;
      const ny = y / size;
      const ripple = Math.sin((ny * 28 + fbm(nx * 3, ny * 8) * 4) * grain);
      const rings = Math.sin(ny * 70 * grain + fbm(nx * 6, ny * 2) * 7);
      const pore = noise2(nx * 90, ny * 18);
      const t = THREE.MathUtils.clamp(
        0.46 + ripple * 0.18 + rings * 0.1 + (pore - 0.5) * 0.12,
        0,
        1,
      );
      const [r, g, bl] = lerpColor(a, b, t);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = bl;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function paintParquet(ctx: CanvasRenderingContext2D, size: number): void {
  const tile = size / 16;
  const dark = color("#3a2418");
  const mid = color("#6a4630");
  const light = color("#8a6142");

  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 16; col += 1) {
      const herring = (row + col) % 2 === 0;
      const ox = col * tile;
      const oy = row * tile;
      ctx.save();
      ctx.translate(ox + tile / 2, oy + tile / 2);
      ctx.rotate(herring ? Math.PI / 4 : -Math.PI / 4);
      ctx.translate(-tile / 2, -tile / 2);

      for (let slat = 0; slat < 4; slat += 1) {
        const t = 0.25 + hash(row * 31 + col * 17 + slat) * 0.55;
        const [r, g, b] = lerpColor(dark, slat % 2 ? light : mid, t);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(slat * (tile / 4), -tile * 0.2, tile / 4 - 0.6, tile * 1.4);
      }
      ctx.restore();
    }
  }

  ctx.fillStyle = "rgba(20, 12, 8, 0.18)";
  ctx.fillRect(0, 0, size, size);
}

function paintRug(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#241610";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#4a3426";
  ctx.lineWidth = size * 0.045;
  ctx.strokeRect(size * 0.06, size * 0.06, size * 0.88, size * 0.88);

  ctx.strokeStyle = "#6a4a32";
  ctx.lineWidth = size * 0.012;
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);

  ctx.strokeStyle = "#3a261c";
  ctx.lineWidth = size * 0.008;
  ctx.strokeRect(size * 0.16, size * 0.16, size * 0.68, size * 0.68);

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.strokeStyle = "#5a3c28";
  ctx.lineWidth = size * 0.007;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.16);
  ctx.lineTo(size * 0.12, 0);
  ctx.lineTo(0, size * 0.16);
  ctx.lineTo(-size * 0.12, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  const field = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < field.data.length; i += 4) {
    const n = (hash(i * 0.13) - 0.5) * 16;
    field.data[i] = THREE.MathUtils.clamp(field.data[i] + n, 0, 255);
    field.data[i + 1] = THREE.MathUtils.clamp(field.data[i + 1] + n * 0.8, 0, 255);
    field.data[i + 2] = THREE.MathUtils.clamp(field.data[i + 2] + n * 0.6, 0, 255);
  }
  ctx.putImageData(field, 0, 0);
}

function paintLeather(ctx: CanvasRenderingContext2D, size: number): void {
  const a = color("#2c1212");
  const b = color("#5a2a22");
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / size;
      const ny = y / size;
      const grain = fbm(nx * 14, ny * 14);
      const speck = noise2(nx * 70, ny * 70);
      const t = THREE.MathUtils.clamp(grain * 0.75 + speck * 0.25, 0, 1);
      const [r, g, bl] = lerpColor(a, b, t);
      const i = (y * size + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = bl;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function paintPlaster(ctx: CanvasRenderingContext2D, size: number): void {
  const a = color("#6d6456");
  const b = color("#8a8070");
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const t = fbm(x / size * 6, y / size * 6);
      const [r, g, bl] = lerpColor(a, b, t);
      const i = (y * size + x) * 4;
      image.data[i] = r;
      image.data[i + 1] = g;
      image.data[i + 2] = bl;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function paintDusk(ctx: CanvasRenderingContext2D, size: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, "#141820");
  sky.addColorStop(0.42, "#2a3344");
  sky.addColorStop(0.62, "#6a5348");
  sky.addColorStop(0.78, "#8a5a3c");
  sky.addColorStop(1, "#1c1410");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#0d0c0b";
  ctx.beginPath();
  ctx.moveTo(0, size * 0.74);
  ctx.lineTo(size * 0.12, size * 0.62);
  ctx.lineTo(size * 0.22, size * 0.7);
  ctx.lineTo(size * 0.38, size * 0.56);
  ctx.lineTo(size * 0.5, size * 0.68);
  ctx.lineTo(size * 0.66, size * 0.54);
  ctx.lineTo(size * 0.8, size * 0.66);
  ctx.lineTo(size * 0.92, size * 0.58);
  ctx.lineTo(size, size * 0.7);
  ctx.lineTo(size, size);
  ctx.lineTo(0, size);
  ctx.fill();
}

function paintPaper(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = "#e6d8c2";
  ctx.fillRect(0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (hash(i * 0.37) - 0.5) * 18;
    image.data[i] += n;
    image.data[i + 1] += n * 0.9;
    image.data[i + 2] += n * 0.7;
  }
  ctx.putImageData(image, 0, 0);
}

export type LibraryTextures = {
  walnut: THREE.CanvasTexture;
  walnutRough: THREE.CanvasTexture;
  oak: THREE.CanvasTexture;
  parquet: THREE.CanvasTexture;
  plaster: THREE.CanvasTexture;
  leather: THREE.CanvasTexture;
  rug: THREE.CanvasTexture;
  dusk: THREE.CanvasTexture;
  paper: THREE.CanvasTexture;
};

export function createLibraryTextures(anisotropy: number): LibraryTextures {
  const walnut = canvasTexture(
    1024,
    (ctx, size) => paintWood(ctx, size, "#2a1810", "#6b442c", 1),
    anisotropy,
  );
  walnut.repeat.set(2.2, 1.4);

  const walnutRough = canvasTexture(
    512,
    (ctx, size) => {
      const image = ctx.createImageData(size, size);
      for (let i = 0; i < image.data.length; i += 4) {
        const v = 90 + hash(i) * 110;
        image.data[i] = v;
        image.data[i + 1] = v;
        image.data[i + 2] = v;
        image.data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    },
    anisotropy,
  );
  walnutRough.colorSpace = THREE.NoColorSpace;
  walnutRough.repeat.copy(walnut.repeat);

  const oak = canvasTexture(
    1024,
    (ctx, size) => paintWood(ctx, size, "#3d2618", "#8a5a38", 0.85),
    anisotropy,
  );
  oak.repeat.set(1.4, 1.4);

  const parquet = canvasTexture(1024, paintParquet, anisotropy);
  parquet.repeat.set(6, 5);

  const plaster = canvasTexture(512, paintPlaster, anisotropy);
  plaster.repeat.set(3, 2);

  const leather = canvasTexture(512, paintLeather, anisotropy);
  const rug = canvasTexture(1024, paintRug, anisotropy);
  rug.repeat.set(1, 1);

  const dusk = canvasTexture(1024, paintDusk, 1);
  dusk.wrapS = THREE.ClampToEdgeWrapping;
  dusk.wrapT = THREE.ClampToEdgeWrapping;

  const paper = canvasTexture(256, paintPaper, 2);

  return {
    walnut,
    walnutRough,
    oak,
    parquet,
    plaster,
    leather,
    rug,
    dusk,
    paper,
  };
}
