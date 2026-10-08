"use client";
import { useEffect, useRef, type ReactNode } from "react";

const vertexShaderGLSL = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderGLSL = `
precision highp float;
varying vec2 vUv;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_grain;
uniform float u_vignette;
uniform float u_glow;
uniform vec3  u_colors[4];
uniform vec3  u_bg;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  float ratio = u_resolution.x / u_resolution.y;
  vec2 p = uv - 0.5;
  p.x *= ratio;

  float t = u_time * 0.28;

  float n1 = snoise(p * 1.65 + vec2(t * 0.2, -t * 0.3));
  float n2 = snoise(p * 2.4 + vec2(-t * 0.15, t * 0.25) + n1 * 0.25);
  float n3 = snoise(p * 1.8 + vec2(t * 0.1, -t * 0.2) + n2 * 0.2);

  vec3 col = u_bg;

  float dist = length(p) * 1.5;
  float vignette = 1.0 - smoothstep(0.3, 1.2, dist);

  // Concentrate color into moving ribbons, leaving most of the base untouched.
  float ribbon = smoothstep(0.12, 0.55, n1 * 0.7 + n2 * 0.3);
  vec3 tintA = mix(u_colors[0], u_colors[2], smoothstep(-0.4, 0.5, n3));
  vec3 tintB = mix(u_colors[1], u_colors[3], smoothstep(-0.3, 0.6, n1));
  vec3 tint = mix(tintA, tintB, smoothstep(-0.3, 0.4, n2));
  col = mix(col, tint, ribbon * 0.95);

  float glow = (1.0 - smoothstep(0.0, 0.8, dist)) * u_glow;
  col += u_colors[1] * glow * ribbon;

  col = mix(u_bg, col, 1.0 - (1.0 - vignette) * u_vignette);

  float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
  col += (grain - 0.5) * u_grain * 0.1;

  gl_FragColor = vec4(col, 1.0);
}
`;

export interface VelarisProps {
  bg?: string;
  colors?: string[];
  speed?: number;
  grain?: number;
  vignette?: number;
  glow?: number;
  height?: string;
  className?: string;
  children?: ReactNode;
  paused?: boolean;
  resolutionScale?: number;
  frameRate?: number;
}
const DEFAULT_COLORS = ["#86efac", "#4ade80", "#059669", "#000000"];
function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace("#", "");
  if (value.length === 3) value = [...value].map((x) => x + x).join("");
  if (!/^[a-f\d]{6}([a-f\d]{2})?$/i.test(value)) value = "08090b";
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}
export default function Velaris({
  bg = "#000000",
  colors = DEFAULT_COLORS,
  speed = 2,
  grain = 0.3,
  vignette = 0.8,
  glow = 0.3,
  height = "100vh",
  className = "",
  children,
  paused = false,
  resolutionScale = 0.85,
  frameRate = 30,
}: VelarisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const elapsed = useRef(0);
  const playback = useRef<(() => void) | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current,
      container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = createShader(gl.VERTEX_SHADER, vertexShaderGLSL);
    const fragment = createShader(gl.FRAGMENT_SHADER, fragmentShaderGLSL);
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const dispose = () => {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      shaders.forEach((shader) => gl.deleteShader(shader));
    };
    if (!vertex || !fragment || !program || !buffer) {
      dispose();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      dispose();
      return;
    }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const time = gl.getUniformLocation(program, "u_time");
    gl.uniform1f(gl.getUniformLocation(program, "u_grain"), grain);
    gl.uniform1f(gl.getUniformLocation(program, "u_vignette"), vignette);
    gl.uniform1f(gl.getUniformLocation(program, "u_glow"), glow);
    gl.uniform3f(gl.getUniformLocation(program, "u_bg"), ...hexToRgb(bg));
    gl.uniform3fv(
      gl.getUniformLocation(program, "u_colors[0]"),
      new Float32Array(
        Array.from({ length: 4 }, (_, i) => hexToRgb(colors[i] || bg)).flat(),
      ),
    );
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0,
      previous = 0,
      lastFrame = -Infinity,
      lost = false;
    const draw = () => {
      if (lost || !canvas.width || !canvas.height) return;
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, elapsed.current * speed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = "1";
      container.dataset.renderer =
        reduced.matches || speed === 0 ? "static" : "webgl";
    };
    const render = (now: number) => {
      if (
        document.hidden ||
        pausedRef.current ||
        reduced.matches ||
        speed === 0 ||
        lost
      )
        return;
      if (previous) elapsed.current += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (now - lastFrame >= 1000 / frameRate) {
        draw();
        lastFrame = now;
      }
      raf = requestAnimationFrame(render);
    };
    const resume = () => {
      cancelAnimationFrame(raf);
      previous = 0;
      if (document.hidden || lost) return;
      draw();
      if (!pausedRef.current && !reduced.matches && speed !== 0)
        raf = requestAnimationFrame(render);
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1) * resolutionScale;
      canvas.width = Math.max(1, Math.round(container.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(container.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      canvas.style.opacity = "0";
      container.dataset.renderer = "fallback";
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    canvas.addEventListener("webglcontextlost", onLost);
    document.addEventListener("visibilitychange", resume);
    reduced.addEventListener("change", resume);
    resize();
    playback.current = resume;
    resume();
    return () => {
      observer.disconnect();
      playback.current = null;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", resume);
      reduced.removeEventListener("change", resume);
      canvas.style.opacity = "0";
      dispose();
    };
  }, [bg, colors, speed, grain, vignette, glow, resolutionScale, frameRate]);
  useEffect(() => {
    pausedRef.current = paused;
    playback.current?.();
  }, [paused]);
  return (
    <div
      ref={containerRef}
      style={{
        height,
        background: `radial-gradient(ellipse 40% 55% at 18% 25%, ${colors[0] || bg}, transparent), radial-gradient(ellipse 30% 45% at 85% 70%, ${colors[1] || bg}, transparent), ${bg}`,
      }}
      className={`velaris relative w-full overflow-hidden ${className}`}
      data-renderer="fallback"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />
      {children && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}
