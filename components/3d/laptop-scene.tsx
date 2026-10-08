"use client";
/* eslint-disable react-hooks/immutability -- useFrame owns imperative GPU and bridge updates, never React render state. */
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Lightformer,
  useCursor,
  ContactShadows,
} from "@react-three/drei";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import { str, type Entry } from "@/types/content";
import { introPhase, type ScreenAnchor } from "@/lib/intro-motion";
import { useSite } from "@/components/portfolio/site-preferences";
function paintScreen(
  c: CanvasRenderingContext2D,
  profile: Entry,
  soft: boolean,
  boot: number,
  content: number,
  preview: number,
  english: boolean,
) {
  const text = soft ? "#202126" : "#f5f5f7",
    muted = soft ? "#72737e" : "#a3aaba";
  c.setTransform(1024 / 1400, 0, 0, 614 / 840, 0, 0);
  c.globalAlpha = 1;
  c.fillStyle = "#08090b";
  c.fillRect(0, 0, 1400, 840);
  if (!boot) return;
  c.globalAlpha = boot;
  c.fillStyle = soft ? "#f8f7f3" : "#101217";
  c.fillRect(0, 0, 1400, 840);
  c.globalAlpha = boot * (1 - content);
  c.fillStyle = text;
  c.font = "90px Georgia, serif";
  c.textAlign = "center";
  c.fillText("MM/", 700, 410);
  c.fillStyle = muted;
  c.font = "18px Arial, sans-serif";
  c.fillText("PORTFOLIO", 700, 465);
  c.globalAlpha = boot * content;
  c.textAlign = "left";
  const fill = c.createLinearGradient(0, 0, 1400, 840);
  fill.addColorStop(0, soft ? "#f1dde1" : "#132443");
  fill.addColorStop(0.5, soft ? "#f8f7f3" : "#101217");
  fill.addColorStop(1, soft ? "#e1e7f5" : "#152f54");
  c.fillStyle = fill;
  c.fillRect(0, 0, 1400, 840);
  c.globalAlpha = boot * content * preview;
  c.fillStyle = soft ? "#ffffff" : "#181b22";
  c.beginPath();
  c.roundRect(65, 72, 1270, 694, 30);
  c.fill();
  c.fillStyle = text;
  c.font = "32px Georgia, serif";
  c.fillText("MM/", 112, 132);
  c.fillStyle = muted;
  c.font = "18px Arial, sans-serif";
  c.fillText(english ? "About" : "Sobre mí", 905, 132);
  c.fillText(english ? "Projects" : "Proyectos", 1030, 132);
  c.fillText(english ? "Contact" : "Contacto", 1170, 132);
  c.fillStyle = muted;
  c.font = "15px monospace";
  c.fillText("SOFTWARE · SYSTEMS · IDEAS", 118, 226);
  c.fillStyle = text;
  c.font = "76px Georgia, serif";
  c.fillText(str(profile, "first_name").split(" ")[0], 112, 336);
  c.fillText(str(profile, "last_name"), 112, 419);
  c.font = "24px Arial, sans-serif";
  c.fillText(str(profile, "degree"), 118, 483);
  c.fillStyle = muted;
  c.font = "20px Arial, sans-serif";
  c.fillText("Software Engineering Student", 118, 523);
  c.fillStyle = text;
  c.beginPath();
  c.roundRect(118, 579, 218, 57, 28);
  c.fill();
  c.fillStyle = soft ? "#ffffff" : "#16191f";
  c.font = "18px Arial, sans-serif";
  c.fillText(english ? "View projects  ↗" : "Ver proyectos  ↗", 147, 615);
  const panel = c.createLinearGradient(820, 210, 1246, 678);
  panel.addColorStop(0, soft ? "#e4eaf5" : "#223853");
  panel.addColorStop(0.6, soft ? "#f4f4f2" : "#171e2b");
  panel.addColorStop(1, soft ? "#ecdfe5" : "#2c3550");
  c.fillStyle = panel;
  c.beginPath();
  c.roundRect(800, 203, 478, 485, 28);
  c.fill();
  c.fillStyle = soft ? "#8c939d" : "#b4c0d3";
  c.font = "120px Georgia, serif";
  c.textAlign = "center";
  c.fillText("MM/", 1040, 470);
  c.globalAlpha = 1;
  c.textAlign = "left";
}
function Laptop({
  progress,
  profile,
  anchor,
  soft,
  onSkip,
  onReady,
  english,
  mobile,
}: {
  progress: MutableRefObject<{ value: number }>;
  profile: Entry;
  anchor: MutableRefObject<ScreenAnchor>;
  soft: boolean;
  onSkip: () => void;
  onReady: () => void;
  english: boolean;
  mobile: boolean;
}) {
  const { scene } = useGLTF("/models/laptop.glb?v=2");
  const model = useMemo(() => scene.clone(true), [scene]);
  const parts = useMemo(
    () => ({
      hinge: model.getObjectByName("DisplayHinge")!,
      screen: model.getObjectByName("Screen")!,
    }),
    [model],
  );
  const { camera, invalidate, gl, size } = useThree();
  const viewTarget = useMemo(() => new THREE.Vector3(), []);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, "pointer", "auto", gl.domElement);
  useEffect(() => {
    const bridge = anchor.current;
    bridge.invalidate = invalidate;
    return () => {
      bridge.invalidate = undefined;
    };
  }, [anchor, invalidate]);
  const glow = useRef<THREE.PointLight>(null);
  const lastOpen = useRef(-1);
  const screenData = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 614;
    return { canvas, texture: new THREE.CanvasTexture(canvas), step: -1 };
  }, []);
  useEffect(() => {
    screenData.step = -1;
    invalidate();
  }, [profile, soft, english, screenData, invalidate]);
  useEffect(() => {
    screenData.texture.colorSpace = THREE.SRGBColorSpace;
    const screen = parts.screen as THREE.Mesh;
    const material = new THREE.MeshBasicMaterial({
      map: screenData.texture,
      toneMapped: false,
    });
    screen.material = material;
    const materials: THREE.Material[] = [material];
    const copies = new Map<THREE.Material, THREE.Material>();
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = ![
          "ScreenGlass",
          "SpeakerPerforations",
          "CameraLens",
          "CameraIndicator",
          "LidEngraving",
        ].includes(obj.name);
        obj.receiveShadow = true;
        if (obj !== screen) {
          const original = obj.material as THREE.Material;
          if (!copies.has(original)) {
            const copy = original.clone();
            copies.set(original, copy);
            materials.push(copy);
          }
          obj.material = copies.get(original)!;
        }
      }
    });
    const legendsCanvas = document.createElement("canvas");
    legendsCanvas.width = 1280;
    legendsCanvas.height = 512;
    const c = legendsCanvas.getContext("2d")!;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#e9edf1";
    const keys = model.getObjectByName("Laptop")?.userData.keycaps as {
      label: string;
      x: number;
      z: number;
      small: boolean;
    }[];
    keys?.forEach((key) => {
      c.font = `${key.small ? 18 : 26}px Arial, sans-serif`;
      const lines = key.label.split("\n");
      lines.forEach((line, i) =>
        c.fillText(
          line,
          (key.x / 3.24 + 0.5) * 1280,
          ((key.z + 1.1) / 1.2) * 512 + (i - (lines.length - 1) / 2) * 18,
        ),
      );
    });
    const legendsTexture = new THREE.CanvasTexture(legendsCanvas);
    legendsTexture.colorSpace = THREE.SRGBColorSpace;
    legendsTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
    const legendsMaterial = new THREE.MeshStandardMaterial({
      map: legendsTexture,
      transparent: true,
      opacity: 0.82,
      roughness: 0.65,
      depthWrite: false,
    });
    const legends = new THREE.Mesh(
      new THREE.PlaneGeometry(3.24, 1.2),
      legendsMaterial,
    );
    legends.name = "KeyLegends";
    legends.rotation.x = -Math.PI / 2;
    legends.position.set(0, 0.0685, -0.5);
    const base = model.getObjectByName("Base")!;
    base.add(legends);
    materials.push(legendsMaterial);
    invalidate();
    onReady();
    let disposed = false;
    void document.fonts.ready.then(() => {
      if (disposed) return;
      screenData.step = -1;
      invalidate();
    });
    return () => {
      disposed = true;
      materials.forEach((m) => m.dispose());
      base.remove(legends);
      legends.geometry.dispose();
      legendsTexture.dispose();
      screenData.texture.dispose();
    };
  }, [model, parts, screenData, invalidate, gl, onReady]);
  useFrame(() => {
    const p = progress.current.value,
      phase = introPhase(p);
    parts.hinge.rotation.x = -Math.PI * 0.55 * phase.open;
    if (lastOpen.current !== phase.open) {
      lastOpen.current = phase.open;
      gl.shadowMap.needsUpdate = true;
    }
    camera.position.set(
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(-3.4, -1.5, phase.open),
        0,
        phase.zoom,
      ),
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(4.3, 3.9, phase.open),
        1.55,
        phase.zoom,
      ),
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(7, 7.8, phase.open),
        1.8,
        phase.zoom,
      ),
    );
    viewTarget.set(
      0,
      THREE.MathUtils.lerp(0.45 + 0.45 * phase.open, 1.4, phase.zoom),
      THREE.MathUtils.lerp(0, -1.46, phase.zoom),
    );
    if (mobile) {
      // Fit the whole device to portrait screens before the final screen zoom.
      const fit = Math.max(1, 1 / (size.width / size.height));
      camera.position.sub(viewTarget).multiplyScalar(fit).add(viewTarget);
    }
    camera.lookAt(viewTarget);
    if (glow.current) glow.current.intensity = phase.boot * 0.3 * phase.canvas;
    const step =
      phase.boot === 0
        ? 0
        : p >= 0.8
          ? 1000
          : phase.code === 1 && phase.preview === 1
            ? 999
            : Math.round(p * 240);
    if (step !== screenData.step) {
      screenData.step = step;
      paintScreen(
        screenData.canvas.getContext("2d")!,
        profile,
        soft,
        phase.boot,
        phase.code,
        phase.preview,
        english,
      );
      screenData.texture.needsUpdate = true;
    }
  });
  return (
    <>
      <primitive
        object={model}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          setHovered(false);
          onSkip();
        }}
      />
      <pointLight
        ref={glow}
        position={[0, 0.9, -0.6]}
        color="#d8e6f6"
        intensity={0}
        distance={4}
        decay={2}
      />
    </>
  );
}
export default function LaptopScene({
  progress,
  profile,
  anchor,
  onSkip,
  onReady,
  mobile = false,
}: {
  progress: MutableRefObject<{ value: number }>;
  profile: Entry;
  anchor: MutableRefObject<ScreenAnchor>;
  onSkip: () => void;
  onReady: () => void;
  mobile?: boolean;
}) {
  const { theme, locale } = useSite();
  return (
    <Canvas
      aria-hidden
      shadows
      camera={{ position: [-3.4, 4.3, 7], fov: 34 }}
      dpr={[1, 1.25]}
      frameloop="demand"
      onCreated={({ gl }) => {
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: mobile ? "low-power" : "high-performance",
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        shadow-mapSize={mobile ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-radius={4}
        shadow-normalBias={0.015}
        shadow-bias={-0.0001}
        position={[-4, 6, 3]}
        intensity={2.2}
      />
      <directionalLight
        position={[4, 2, -4]}
        intensity={0.85}
        color="#dce4ef"
      />
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.075, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.07} />
      </mesh>
      <Suspense fallback={null}>
        <Environment resolution={mobile ? 128 : 256}>
          <Lightformer
            intensity={1.2}
            scale={[10, 10, 1]}
            position={[0, 6, 0]}
            rotation-x={-Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={3.2}
            scale={[10, 5, 1]}
            position={[-4, 3, -3]}
            rotation-y={Math.PI / 4}
          />
          <Lightformer
            intensity={1.8}
            scale={[6, 4, 1]}
            position={[4, 2, -4]}
            rotation-y={Math.PI}
          />
        </Environment>
        <Laptop
          progress={progress}
          profile={profile}
          anchor={anchor}
          soft={theme === "soft"}
          onSkip={onSkip}
          onReady={onReady}
          english={locale === "en"}
          mobile={mobile}
        />
        <ContactShadows
          position={[0, -0.073, 0]}
          scale={7}
          opacity={0.28}
          blur={2.4}
          far={0.8}
          resolution={mobile ? 128 : 256}
          frames={1}
        />
      </Suspense>
    </Canvas>
  );
}
