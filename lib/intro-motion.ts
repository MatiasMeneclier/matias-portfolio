export const range = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const INTRO_PROGRESS_EVENT = "portfolio:intro-progress";
export const INTRO_SCROLL_VIEWPORTS = 1.5;
// Time-based damping keeps the same response on 60 Hz and 120 Hz displays.
export function dampIntroProgress(
  current: number,
  target: number,
  delta: number,
  maxLag = 1,
) {
  const damped = current + (target - current) * (1 - Math.exp(-delta / 65));
  // A fast touch fling must not leave an invisible hero behind the native scroll.
  const next = Math.max(target - maxLag, Math.min(target + maxLag, damped));
  return Math.abs(target - next) < 0.0001 ? target : next;
}
export interface IntroProgressDetail {
  progress: number;
  scrollEnd: number;
  background: number;
}
const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
export function introPhase(p: number) {
  return {
    open: smoother(range(p, 0.02, 0.46)),
    boot: smooth(range(p, 0.32, 0.44)),
    code: smooth(range(p, 0.42, 0.58)),
    preview: 1 - smooth(range(p, 0.66, 0.8)),
    zoom: smoother(range(p, 0.54, 0.9)),
    identity: smooth(range(p, 0.72, 0.94)),
    canvas: 1 - smooth(range(p, 0.74, 0.96)),
    details: smooth(range(p, 0.84, 0.98)),
    background: smooth(range(p, 0.8, 1)),
    hero: smooth(range(p, 0.8, 0.98)),
    surface: smooth(range(p, 0.8, 0.96)),
    chrome: smooth(range(p, 0.84, 0.98)),
    layer: 1 - smooth(range(p, 0.88, 1)),
    title: 1 - smooth(range(p, 0.01, 0.18)),
    controls: 1 - smooth(range(p, 0.72, 0.88)),
    topControls: 1 - smooth(range(p, 0.46, 0.66)),
  };
}
export interface ScreenAnchor {
  x: number;
  y: number;
  width: number;
  invalidate?: () => void;
}
