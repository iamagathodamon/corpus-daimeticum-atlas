export const nebulaVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const nebulaFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec3 vDir;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.07 + vec3(0.17, 0.31, 0.09);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir);
    float t = uTime * 0.035;
    vec3 q = dir * 2.4;
    q += vec3(uPointer.x * 0.35, uPointer.y * 0.25, t);
    vec3 r = q;
    r.x += fbm(q + vec3(t, 0.2, -t));
    r.y += fbm(q + vec3(-t * 0.7, t, 0.4));
    float n = fbm(r);
    float n2 = fbm(r * 2.3 + n);
    float veil = pow(max(n * 0.72 + n2 * 0.4, 0.0), 1.35);

    vec3 ink = vec3(0.01, 0.01, 0.04);
    vec3 violet = vec3(0.28, 0.08, 0.48);
    vec3 gold = vec3(0.82, 0.58, 0.28);
    vec3 cyan = vec3(0.22, 0.78, 0.92);
    vec3 col = mix(ink, violet, veil);
    col = mix(col, gold, smoothstep(0.55, 0.92, n2) * 0.55);
    col = mix(col, cyan, smoothstep(0.72, 1.0, n) * 0.28);

    float poles = pow(abs(dir.y), 1.6);
    col += cyan * poles * 0.08;
    col += gold * (1.0 - poles) * 0.04;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    vec3 p = position;
    p.x += sin(uTime * 0.55 + aSeed * 18.0) * 0.05;
    p.y += cos(uTime * 0.42 + aSeed * 11.0) * 0.06;
    float twinkle = 0.65 + 0.35 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 12.0);
    vAlpha = twinkle;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (220.0 / max(2.0, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

export const pointFragment = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float d = length(uv);
    if (d > 1.0) discard;
    float core = smoothstep(1.0, 0.0, d);
    float glow = pow(core, 1.8);
    vec3 col = mix(uColor, vec3(1.0), pow(core, 6.0) * 0.65);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`;

export const filamentVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const filamentFragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float run = fract(vUv.x * 2.4 - uTime * 0.18);
    float pulse = smoothstep(0.0, 0.12, run) * smoothstep(0.55, 0.18, run);
    float edge = smoothstep(0.0, 0.28, vUv.y) * smoothstep(1.0, 0.72, vUv.y);
    float a = (0.12 + pulse * 0.9) * edge;
    vec3 col = mix(uColor, vec3(1.0), pulse * 0.45);
    gl_FragColor = vec4(col, a);
  }
`;
