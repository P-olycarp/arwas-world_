"use client";

import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Product } from "@/data/products";

type Props = { product: Product; color: string; text: string };
type Pt = [number, number];
type ModelProps = { color: string; ink: string; texture: THREE.Texture };

function inkFor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const lum =
    (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.55 ? "#161616" : "#f5f5f5";
}

/* ---------- print texture (custom text drawn on the product) ---------- */

function usePrintTexture(label: string, ink: string) {
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    t.colorSpace = THREE.SRGBColorSpace;
    return { canvas: c, texture: t };
  }, []);

  useEffect(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const display = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-display")
      .trim();
    const family =
      (display ? display + ", " : "") +
      'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
    let size = 130;
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${size}px ${family}`;
    while (ctx.measureText(label).width > 450 && size > 24) {
      size -= 4;
      ctx.font = `800 ${size}px ${family}`;
    }
    ctx.fillText(label, 256, 132);
    texture.needsUpdate = true;
  }, [label, ink, canvas, texture]);

  return texture;
}

function PrintMaterial({ texture }: { texture: THREE.Texture }) {
  return (
    <meshStandardMaterial
      map={texture}
      transparent
      roughness={0.9}
      polygonOffset
      polygonOffsetFactor={-2}
    />
  );
}

function PrintPlane({
  width,
  position,
  texture,
}: {
  width: number;
  position: [number, number, number];
  texture: THREE.Texture;
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[width, width / 2]} />
      <PrintMaterial texture={texture} />
    </mesh>
  );
}

function PrintWrap({
  radius,
  width,
  y,
  texture,
}: {
  radius: number;
  width: number;
  y: number;
  texture: THREE.Texture;
}) {
  const theta = width / radius;
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry
        args={[radius, radius, width / 2, 40, 1, true, -theta / 2, theta]}
      />
      <PrintMaterial texture={texture} />
    </mesh>
  );
}

/* ---------- placeholder models (replace with .glb via products.ts) ---------- */

function garmentGeometry(
  start: Pt,
  end: Pt,
  dip: number,
  points: Pt[],
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(start[0], start[1]);
  shape.quadraticCurveTo(0, dip, end[0], end[1]);
  points.forEach(([x, y]) => shape.lineTo(x, y));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 20,
  });
  geo.translate(0, 0, -0.15);
  return geo;
}

const SHIRT_POINTS: Pt[] = [
  [1.05, 1.75],
  [1.95, 1.15],
  [1.65, 0.65],
  [1.1, 0.85],
  [1.1, -1.9],
  [-1.1, -1.9],
  [-1.1, 0.85],
  [-1.65, 0.65],
  [-1.95, 1.15],
  [-1.05, 1.75],
];

const HOODIE_POINTS: Pt[] = [
  [1.15, 1.7],
  [2, -0.7],
  [1.65, -0.95],
  [1.2, 0.4],
  [1.2, -1.9],
  [-1.2, -1.9],
  [-1.2, 0.4],
  [-1.65, -0.95],
  [-2, -0.7],
  [-1.15, 1.7],
];

function Shirt({
  kind,
  color,
  ink,
  texture,
}: ModelProps & { kind: "tee" | "polo" | "jersey" }) {
  const geo = useMemo(
    () =>
      garmentGeometry(
        [-0.45, 1.9],
        [0.45, 1.9],
        kind === "jersey" ? 1.15 : 1.5,
        SHIRT_POINTS,
      ),
    [kind],
  );
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      <PrintPlane width={1.5} position={[0, 0.55, 0.236]} texture={texture} />
      {kind === "polo" && (
        <>
          {[-1, 1].map((d) => (
            <mesh
              key={d}
              position={[d * 0.3, 1.8, 0.22]}
              rotation={[0, 0, -d * 0.55]}
            >
              <boxGeometry args={[0.6, 0.16, 0.08]} />
              <meshStandardMaterial color={ink} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 1.35, 0.24]}>
            <boxGeometry args={[0.14, 0.85, 0.03]} />
            <meshStandardMaterial color={ink} roughness={0.8} />
          </mesh>
        </>
      )}
      {kind === "jersey" &&
        [-0.35, -0.65].map((y) => (
          <mesh key={y} position={[0, y, 0.24]}>
            <boxGeometry args={[2.2, 0.14, 0.03]} />
            <meshStandardMaterial color={ink} roughness={0.8} />
          </mesh>
        ))}
    </group>
  );
}

function Hoodie({ color, texture }: ModelProps) {
  const geo = useMemo(
    () => garmentGeometry([-0.5, 1.85], [0.5, 1.85], 1.55, HOODIE_POINTS),
    [],
  );
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.85, -0.28]} scale={[0.82, 0.62, 0.5]}>
        <sphereGeometry args={[1, 28, 18]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, -1, 0.24]}>
        <boxGeometry args={[1.5, 0.62, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <mesh key={x} position={[x, 1.25, 0.27]}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
        </mesh>
      ))}
      <PrintPlane width={1.4} position={[0, 0.5, 0.236]} texture={texture} />
    </group>
  );
}

function Tumbler({ color, texture }: ModelProps) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1, 0.78, 3.4, 48]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[1.03, 1.03, 0.25, 48]} />
        <meshStandardMaterial color="#222222" roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 2.5, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.06, 0.06, 1.4, 12]} />
        <meshStandardMaterial color="#dcdcdc" roughness={0.3} metalness={0.3} />
      </mesh>
      <PrintWrap radius={0.91} width={1.25} y={0.2} texture={texture} />
    </group>
  );
}

function Bottle({ color, texture }: ModelProps) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.62, 0.62, 3, 40]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.32, 0.5, 0.4, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.42, 32]} />
        <meshStandardMaterial color="#222222" roughness={0.4} />
      </mesh>
      <PrintWrap radius={0.626} width={1} y={-0.1} texture={texture} />
    </group>
  );
}

function Mug({ color, texture }: ModelProps) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[1, 0.95, 1.9, 48, 1, true]} />
        <meshStandardMaterial
          color={color}
          roughness={0.25}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.94, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.86, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.92, 40]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.3} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.5, 0.13, 14, 28, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
      </mesh>
      <PrintWrap radius={1.006} width={1.5} y={0} texture={texture} />
    </group>
  );
}

function PhotoCard({ url }: { url: string }) {
  const map = useTexture(url, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const img = map.image as { width: number; height: number };
  const aspect = img.width / img.height;
  const w = aspect >= 1 ? 4.4 : 4.4 * aspect;
  const h = aspect >= 1 ? 4.4 / aspect : 4.4;
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={map} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function Placeholder({
  id,
  image,
  ...rest
}: ModelProps & { id: Product["kind"]; image?: string }) {
  if (image) return <PhotoCard url={image} />;
  switch (id) {
    case "hoodie":
      return <Hoodie {...rest} />;
    case "tee":
    case "polo":
    case "jersey":
      return <Shirt kind={id} {...rest} />;
    case "tumbler":
      return <Tumbler {...rest} />;
    case "bottle":
      return <Bottle {...rest} />;
    case "mug":
      return <Mug {...rest} />;
  }
}

/* ---------- real models (.glb) ---------- */

function GltfModel({
  path,
  color,
  texture,
}: {
  path: string;
  color: string;
  texture: THREE.Texture;
}) {
  const { scene } = useGLTF(path);
  const { model, tinted } = useMemo(() => {
    const clone = scene.clone(true);
    const tinted: THREE.MeshStandardMaterial[] = [];
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const n = mesh.name.toLowerCase();
      if (n.startsWith("print")) {
        mesh.material = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          roughness: 0.9,
          polygonOffset: true,
          polygonOffsetFactor: -2,
        });
        return;
      }
      if (n.startsWith("keep") || n.startsWith("trim")) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const copies = list.map((m) => {
        const c = m.clone();
        if ("color" in c) tinted.push(c as THREE.MeshStandardMaterial);
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
    });
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.scale.setScalar(4 / Math.max(size.y, 0.0001));
    return { model: wrapper, tinted };
  }, [scene, texture]);

  useLayoutEffect(() => {
    tinted.forEach((m) => m.color.set(color));
  }, [tinted, color]);

  return <primitive object={model} />;
}
/* ---------- motion rig and camera ---------- */

function Rig({
  rotation,
  dragging,
  reduced,
  target,
  children,
}: {
  rotation: MutableRefObject<number>;
  dragging: MutableRefObject<boolean>;
  reduced: boolean;
  target: number;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    ref.current?.scale.setScalar(0.25);
  }, []);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    if (!dragging.current) {
      const home = Math.round(rotation.current / (Math.PI * 2)) * Math.PI * 2;
      rotation.current = THREE.MathUtils.damp(rotation.current, home, 4, delta);
    }
    const t = state.clock.elapsedTime;
    g.rotation.y = rotation.current + (reduced ? 0 : Math.sin(t * 0.7) * 0.4);
    g.rotation.x = reduced ? 0 : Math.sin(t * 0.5) * 0.05;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 6, delta));
  });

  return <group ref={ref}>{children}</group>;
}

function ResponsiveCamera() {
  useFrame(({ camera, size }) => {
    camera.position.z = size.width / size.height < 0.9 ? 15 : 12;
  });
  return null;
}

/* ---------- stage ---------- */

export default function ProductStage({ product, color, text }: Props) {
  const rotation = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const ink = inkFor(color);
  const texture = usePrintTexture(text.trim() || "Arwas", ink);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    rotation.current += (e.clientX - lastX.current) * 0.012;
    lastX.current = e.clientX;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      rotation.current -= 0.4;
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      rotation.current += 0.4;
      e.preventDefault();
    }
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      className="relative h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      tabIndex={0}
      role="group"
      aria-label={`3D preview of ${product.name}. Use the left and right arrow keys to turn it.`}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <Canvas
        camera={{ position: [0, 0, 12], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
      >
        <ResponsiveCamera />
        <hemisphereLight args={["#ffffff", "#8a8a99", 1.7]} />
        <directionalLight position={[4, 6, 8]} intensity={2.6} />
        <directionalLight position={[-6, 2, -5]} intensity={1} />
        <Suspense fallback={null}>
          <group position={[0, product.offsetY, 0]}>
            <Rig
              key={product.id}
              rotation={rotation}
              dragging={dragging}
              reduced={reduced}
              target={product.scale}
            >
              {product.model ? (
                <GltfModel path={product.model} color={color} texture={texture} />
              ) : (
                <Placeholder
                  id={product.kind}
                  image={product.image}
                  color={color}
                  ink={ink}
                  texture={texture}
                />
              )}
            </Rig>
          </group>
        </Suspense>
      </Canvas>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-body text-foreground">
        Drag or use the arrow keys to turn it
      </p>
    </div>
  );
}
