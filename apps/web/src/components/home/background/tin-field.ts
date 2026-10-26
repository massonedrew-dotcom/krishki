import { ShaderMaterial, Vector2, Vector3 } from "three";

/*
 * «Liquid tin» field: a slow, low-contrast pearl-white → sky surface with thin contour lines.
 * Own shader (first written for prototypes/light-home, ticket 20). It writes display (sRGB) values
 * directly: no lighting, no tone mapping, so the tokens come out exactly as in CSS.
 */

const FALLBACK = { paper: "#ffffff", mist: "#f5f8fb", sky: "#eaf4fb", line: "#d2e3f0" };

function token(name: string, fallback: string): Vector3 {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
  const n = parseInt(hex.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const vertexShader = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime, uScroll;
  uniform vec3 uPaper, uMist, uSky, uLine;

  // a sum of four sines over a plane that is itself pushed by crossed sines, so the field rolls
  float field(vec2 p, float t) {
    p += 0.42 * vec2(sin(p.y * 1.25 + t * 1.7), sin(p.x * 1.05 - t * 1.3));
    p += 0.20 * vec2(sin(p.y * 2.10 - t * 1.1), sin(p.x * 1.90 + t * 0.9));
    return sin(p.x * 1.15 + t) + sin(p.y * 1.45 - t * 0.8)
         + 0.8 * sin((p.x + p.y) * 0.9 + t * 0.6) + 0.6 * sin((p.x - p.y) * 1.7 - t * 1.2);
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 2.4;
    p.y -= uScroll * 2.4;                       // scrolling rolls the surface up with the page
    float t = uTime * 0.08;
    float f = field(p, t);
    float band = smoothstep(-2.4, 2.4, f);
    vec3 col = mix(uPaper, uSky, band * 0.95);
    col = mix(col, uMist, smoothstep(0.55, 1.0, band) * 0.35);                    // tin-grey troughs
    col = mix(col, uPaper, 0.4 * smoothstep(0.75, 1.0, sin(f * 1.3 + 0.6)));     // pearl sheen on the crests
    float k = f * 2.0;                                                           // contour lines of the same field
    float d = abs(fract(k) - 0.5);
    float line = 1.0 - smoothstep(0.0, fwidth(k) * 1.2, d);
    col = mix(col, uLine, line * 0.7);
    // 1/255 dither: smooth near-white gradients band on 8-bit screens otherwise
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export type TinField = ShaderMaterial & {
  uniforms: { uRes: { value: Vector2 }; uTime: { value: number }; uScroll: { value: number } };
};

export function createTinField(): TinField {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
    fog: false,
    uniforms: {
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPaper: { value: token("--paper", FALLBACK.paper) },
      uMist: { value: token("--mist", FALLBACK.mist) },
      uSky: { value: token("--sky", FALLBACK.sky) },
      uLine: { value: token("--sky-line", FALLBACK.line) },
    },
  }) as TinField;
}
