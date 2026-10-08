import * as THREE from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { mkdir, writeFile } from "node:fs/promises";
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};
const root = new THREE.Group();
root.name = "Laptop";
const metal = new THREE.MeshStandardMaterial({
  color: "#8d939b",
  metalness: 0.88,
  roughness: 0.32,
});
const polished = new THREE.MeshStandardMaterial({
  color: "#aeb4bc",
  metalness: 0.95,
  roughness: 0.22,
});
const black = new THREE.MeshStandardMaterial({
  color: "#111318",
  metalness: 0.08,
  roughness: 0.58,
});
const rubber = new THREE.MeshStandardMaterial({
  color: "#24262b",
  roughness: 0.85,
});
const keyMaterial = new THREE.MeshStandardMaterial({
  color: "#17191e",
  roughness: 0.48,
  metalness: 0.04,
});
// Footprint radius stays independent of the thin shell height.
function roundedShape(width, depth, radius) {
  const x = -width / 2,
    y = -depth / 2,
    r = radius,
    s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + width - r, y);
  s.quadraticCurveTo(x + width, y, x + width, y + r);
  s.lineTo(x + width, y + depth - r);
  s.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth);
  s.lineTo(x + r, y + depth);
  s.quadraticCurveTo(x, y + depth, x, y + depth - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function shellGeometry(
  width,
  height,
  depth,
  radius,
  bevel = 0.004,
  segments = 10,
) {
  const raw = new THREE.ExtrudeGeometry(roundedShape(width, depth, radius), {
    depth: height - bevel * 2,
    steps: 1,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments > 4 ? 3 : 1,
    curveSegments: segments,
  });
  raw.translate(0, 0, -(height - bevel * 2) / 2);
  raw.rotateX(Math.PI / 2);
  raw.deleteAttribute("normal");
  raw.deleteAttribute("uv");
  const geometry = mergeVertices(raw);
  geometry.computeVertexNormals();
  raw.dispose();
  return geometry;
}
function mesh(parent, name, geometry, material, position) {
  const object = new THREE.Mesh(geometry, material);
  object.name = name;
  object.position.set(...position);
  parent.add(object);
  return object;
}
function shell(
  parent,
  name,
  size,
  position,
  material,
  radius = 0.1,
  bevel = 0.004,
) {
  return mesh(
    parent,
    name,
    shellGeometry(...size, radius, bevel),
    material,
    position,
  );
}
const base = new THREE.Group();
base.name = "Base";
root.add(base);
shell(base, "Chassis", [4, 0.092, 2.6], [0, 0, 0], metal, 0.15, 0.009);
shell(
  base,
  "BottomSeam",
  [3.975, 0.006, 2.575],
  [0, -0.041, 0],
  polished,
  0.145,
  0.0015,
);
shell(
  base,
  "KeyboardRecess",
  [3.22, 0.006, 1.19],
  [0, 0.047, -0.5],
  black,
  0.075,
  0.001,
);
const keycaps = [],
  keyGeometries = [];
const rows = [
  [
    ["esc", 1.5],
    ...Array.from({ length: 12 }, (_, i) => ["F" + (i + 1), 1]),
    ["◉", 1.5],
  ],
  [
    [String.fromCharCode(96), 1],
    ..."1234567890".split("").map((k) => [k, 1]),
    ["−", 1],
    ["=", 1],
    ["delete", 2],
  ],
  [
    ["tab", 1.5],
    ..."QWERTYUIOP".split("").map((k) => [k, 1]),
    ["[", 1],
    ["]", 1],
    ["\\", 1.5],
  ],
  [
    ["caps", 1.8],
    ..."ASDFGHJKL".split("").map((k) => [k, 1]),
    [";", 1],
    ["'", 1],
    ["return", 2.2],
  ],
  [
    ["shift", 2.3],
    ..."ZXCVBNM".split("").map((k) => [k, 1]),
    [",", 1],
    [".", 1],
    ["/", 1],
    ["shift", 2.7],
  ],
  [
    ["ctrl", 1.25],
    ["fn", 1],
    ["⌥", 1.25],
    ["⌘", 1.5],
    ["", 4.625],
    ["⌘", 1.5],
    ["⌥", 1.25],
    ["◀", 0.875],
    ["▲\n▼", 0.875],
    ["▶", 0.875],
  ],
];
rows.forEach((row, index) => {
  let cursor = -1.56;
  row.forEach(([label, units]) => {
    const span = units * 0.208,
      x = cursor + span / 2,
      z = -1 + index * 0.2,
      height = index === 0 ? 0.105 : 0.155;
    const geometry = shellGeometry(
      span - 0.022,
      0.016,
      height,
      0.025,
      0.002,
      3,
    );
    geometry.translate(x, 0.058, z);
    keyGeometries.push(geometry);
    keycaps.push({ label, x, z, small: index === 0 || label.length > 1 });
    cursor += span;
  });
});
mesh(base, "Keyboard", mergeGeometries(keyGeometries), keyMaterial, [0, 0, 0]);
root.userData.keycaps = keycaps;
shell(
  base,
  "TrackpadRim",
  [1.63, 0.005, 0.84],
  [0, 0.048, 0.72],
  polished,
  0.075,
  0.001,
);
shell(
  base,
  "Trackpad",
  [1.61, 0.005, 0.82],
  [0, 0.052, 0.72],
  metal,
  0.07,
  0.001,
);
shell(
  base,
  "FrontNotch",
  [0.55, 0.013, 0.035],
  [0, 0.037, 1.298],
  rubber,
  0.014,
  0.002,
);
const perforations = [];
for (const side of [-1, 1]) {
  shell(
    base,
    "SpeakerPanel",
    [0.19, 0.004, 1.1],
    [side * 1.75, 0.046, -0.48],
    metal,
    0.025,
    0.001,
  );
  for (let col = 0; col < 5; col++)
    for (let row = 0; row < 32; row++) {
      const g = new THREE.CircleGeometry(0.0037, 6);
      g.rotateX(-Math.PI / 2);
      g.translate(side * 1.75 + (col - 2) * 0.027, 0.049, -1 + row * 0.034);
      perforations.push(g);
    }
}
mesh(
  base,
  "SpeakerPerforations",
  mergeGeometries(perforations),
  black,
  [0, 0, 0],
);
for (const z of [-0.95, -0.65]) {
  const port = shell(
    base,
    "USBPort",
    [0.033, 0.006, 0.115],
    [-2.012, -0.003, z],
    black,
    0.014,
    0.001,
  );
  port.rotation.z = Math.PI / 2;
  mesh(
    base,
    "USBContact",
    new THREE.BoxGeometry(0.003, 0.006, 0.073),
    polished,
    [-2.016, -0.003, z],
  );
}
const jack = mesh(
  base,
  "AudioJack",
  new THREE.CircleGeometry(0.024, 20),
  black,
  [2.013, -0.003, -0.76],
);
jack.rotation.y = Math.PI / 2;
for (const x of [-1.65, 1.65])
  for (const z of [-1.03, 1.03])
    shell(
      base,
      "RubberFoot",
      [0.34, 0.015, 0.16],
      [x, -0.054, z],
      rubber,
      0.055,
      0.002,
    );
const barrel = mesh(
  base,
  "HingeBarrel",
  new THREE.CylinderGeometry(0.034, 0.034, 3.58, 20),
  black,
  [0, 0.057, -1.23],
);
barrel.rotation.z = Math.PI / 2;
const hinge = new THREE.Group();
hinge.name = "DisplayHinge";
hinge.position.set(0, 0.104, -1.26);
root.add(hinge);
shell(hinge, "Display", [4, 0.046, 2.58], [0, 0.004, 1.28], metal, 0.15, 0.006);
shell(
  hinge,
  "DisplayRim",
  [3.97, 0.005, 2.55],
  [0, -0.021, 1.28],
  polished,
  0.145,
  0.001,
);
shell(
  hinge,
  "DisplayBezel",
  [3.91, 0.008, 2.48],
  [0, -0.027, 1.28],
  black,
  0.115,
  0.002,
);
const screenGeometry = new THREE.ShapeGeometry(
  roundedShape(3.76, 2.3, 0.065),
  14,
);
const positions = screenGeometry.attributes.position,
  uvs = screenGeometry.attributes.uv;
for (let i = 0; i < positions.count; i++)
  uvs.setXY(i, positions.getX(i) / 3.76 + 0.5, positions.getY(i) / 2.3 + 0.5);
screenGeometry.rotateX(Math.PI / 2);
mesh(
  hinge,
  "Screen",
  screenGeometry,
  new THREE.MeshBasicMaterial({ color: "#030405" }),
  [0, -0.034, 1.27],
);
mesh(
  hinge,
  "ScreenGlass",
  screenGeometry.clone(),
  new THREE.MeshPhysicalMaterial({
    color: "#b4c4d7",
    transparent: true,
    opacity: 0.035,
    roughness: 0.12,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    depthWrite: false,
  }),
  [0, -0.035, 1.27],
);
const lens = mesh(
  hinge,
  "CameraLens",
  new THREE.CircleGeometry(0.013, 20),
  new THREE.MeshStandardMaterial({
    color: "#162a3d",
    metalness: 0.75,
    roughness: 0.16,
  }),
  [0, -0.035, 2.478],
);
lens.rotation.x = Math.PI / 2;
const indicator = mesh(
  hinge,
  "CameraIndicator",
  new THREE.CircleGeometry(0.004, 10),
  rubber,
  [0.06, -0.035, 2.478],
);
indicator.rotation.x = Math.PI / 2;
const engraving = new THREE.MeshStandardMaterial({
  color: "#65707b",
  metalness: 0.6,
  roughness: 0.48,
});
for (const offset of [-0.14, 0.14]) {
  const points = [
    [offset - 0.105, 0.032, 1.43],
    [offset - 0.105, 0.032, 1.14],
    [offset, 0.032, 1.32],
    [offset + 0.105, 0.032, 1.14],
    [offset + 0.105, 0.032, 1.43],
  ].map((p) => new THREE.Vector3(...p));
  for (let i = 1; i < points.length; i++)
    mesh(
      hinge,
      "LidEngraving",
      new THREE.TubeGeometry(
        new THREE.LineCurve3(points[i - 1], points[i]),
        1,
        0.0025,
        6,
        false,
      ),
      engraving,
      [0, 0, 0],
    );
}
const glb = await new GLTFExporter().parseAsync(root, { binary: true });
await mkdir("public/models", { recursive: true });
await writeFile("public/models/laptop.glb", Buffer.from(glb));
let triangles = 0,
  meshes = 0;
root.traverse((object) => {
  if (object.isMesh) {
    meshes++;
    triangles +=
      (object.geometry.index?.count ??
        object.geometry.attributes.position.count) / 3;
  }
});
console.log(
  JSON.stringify({
    bytes: glb.byteLength,
    triangles,
    meshes,
    keys: keycaps.length,
  }),
);
