"use client";
import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  OrbitControls,
  Line,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";

export type ViewerProps = {
  heatmap?: boolean;
  wireframe?: boolean;
  annotations?: boolean;
  autoRotate?: boolean;
  blades?: number;
  resetKey?: number;
  onSnapshot?: (value: string) => void;
  compact?: boolean;
  onReady?: () => void;
};
function AnnotationSprite({ datum = false }: { datum?: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = datum ? 128 : 640;
    canvas.height = datum ? 128 : 224;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = datum ? "#17342c" : "#291d22";
    ctx.strokeStyle = datum ? "#b5d5c4" : "#bd696c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(4, 4, canvas.width - 8, canvas.height - 8, datum ? 8 : 18);
    ctx.fill();
    ctx.stroke();
    if (datum) {
      ctx.fillStyle = "#d9eee3";
      ctx.font = "bold 65px Arial";
      ctx.textAlign = "center";
      ctx.fillText("B", 64, 88);
    } else {
      ctx.fillStyle = "#f3a3a0";
      ctx.font = "25px Arial";
      ctx.fillText("01", 30, 63);
      ctx.font = "bold 66px Arial";
      ctx.fillText("+0.38", 95, 105);
      ctx.font = "32px Arial";
      ctx.fillText("mm", 320, 105);
      ctx.fillStyle = "#c28c8e";
      ctx.font = "24px Arial";
      ctx.fillText("FLANGE DEVIATION", 96, 163);
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [datum]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite
      position={datum ? [-1.3, 0.2, 1] : [1.6, 1.6, 0.2]}
      scale={datum ? [0.24, 0.24, 1] : [1.6, 0.56, 1]}
      renderOrder={20}
    >
      <spriteMaterial
        map={texture}
        transparent
        depthTest={false}
        toneMapped={false}
      />
    </sprite>
  );
}
// Closed procedural mechanical geometry: no remote assets or licensed CAD required.
function flangeGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 2.3, 0, Math.PI * 2, false);
  const bore = new THREE.Path();
  bore.absarc(0, 0, 0.37, 0, Math.PI * 2, true);
  shape.holes.push(bore);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const hole = new THREE.Path();
    hole.absarc(
      Math.cos(a) * 2.08,
      Math.sin(a) * 2.08,
      0.095,
      0,
      Math.PI * 2,
      true,
    );
    shape.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
    curveSegments: 80,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -0.24, 0);
  return geo;
}
function bladeGeometry(angle: number) {
  const segments = 38,
    vertices: number[] = [],
    indices: number[] = [];
  for (let s = 0; s <= segments; s++) {
    const t = s / segments,
      r = 0.68 + t * 1.26,
      a = angle + t * 0.8;
    const h = 0.9 * (1 - t * 0.76);
    for (const [side, top] of [
      [-1, 0],
      [1, 0],
      [-1, 1],
      [1, 1],
    ]) {
      const theta = a + (side * 0.034) / r + top * 0.08 * (1 - t);
      vertices.push(r * Math.cos(theta), -0.04 + top * h, r * Math.sin(theta));
    }
    if (s < segments) {
      const k = s * 4;
      for (const [u, v] of [
        [0, 1],
        [1, 3],
        [3, 2],
        [2, 0],
      ])
        indices.push(k + u, k + v, k + 4 + u, k + v, k + 4 + v, k + 4 + u);
    }
  }
  indices.push(0, 2, 1, 1, 2, 3);
  const k = segments * 4;
  indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
function hubGeometry() {
  const profile = [
    [0.38, -0.05],
    [0.78, -0.05],
    [0.78, 0.03],
    [0.72, 0.08],
    [0.59, 0.78],
    [0.53, 1.05],
    [0.47, 1.12],
    [0.38, 1.12],
    [0.38, -0.05],
  ];
  return new THREE.LatheGeometry(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
    80,
  );
}
function addDeviationColors(geo: THREE.BufferGeometry) {
  const pos = geo.getAttribute("position"),
    colors = new Float32Array(pos.count * 3),
    color = new THREE.Color();
  const green = new THREE.Color("#36d791"),
    yellow = new THREE.Color("#efdc4a"),
    red = new THREE.Color("#ff343c");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      z = pos.getZ(i),
      y = pos.getY(i),
      r = Math.hypot(x, z);
    const distance = Math.hypot(x - 1.62, z - 1.02);
    const hotspot = Math.max(0, 1 - distance / 0.95) * (r > 1.25 ? 1 : 0.2);
    const variation = (Math.sin(x * 7 + z * 4) + 1) * 0.035;
    if (hotspot > 0.28)
      color.copy(yellow).lerp(red, Math.min(1, (hotspot - 0.28) * 2.9));
    else color.copy(green).lerp(yellow, hotspot * 2 + variation);
    if (y > 0.95) color.lerp(new THREE.Color("#23b9a0"), 0.25);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}
function Part({
  heatmap = false,
  wireframe = false,
  blades = 11,
}: ViewerProps) {
  const geometries = useMemo(
    () =>
      [
        flangeGeometry(),
        hubGeometry(),
        ...Array.from({ length: blades }, (_, i) =>
          bladeGeometry((i / blades) * Math.PI * 2),
        ),
      ].map(addDeviationColors),
    [blades],
  );
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  return (
    <group>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={heatmap ? "#ffffff" : "#a5b1bb"}
            vertexColors={heatmap}
            metalness={heatmap ? 0.12 : 0.92}
            roughness={heatmap ? 0.75 : 0.25}
            envMapIntensity={heatmap ? 0.25 : 1}
            wireframe={wireframe}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
function Scene({
  heatmap,
  wireframe,
  annotations,
  autoRotate,
  blades,
  resetKey,
  onSnapshot,
  compact,
  onReady,
}: ViewerProps) {
  const controls = useRef<OrbitControlsType>(null);
  const { camera, gl, scene, invalidate } = useThree();
  useEffect(() => {
    camera.position.set(5.5, 4.7, 6.6);
    controls.current?.target.set(0, 0.2, 0);
    controls.current?.update();
    invalidate();
  }, [resetKey, camera, invalidate]);
  useEffect(() => {
    const timer = setTimeout(() => {
      gl.render(scene, camera);
      onReady?.();
      if (heatmap && onSnapshot) {
        try {
          onSnapshot(gl.domElement.toDataURL("image/png"));
        } catch {}
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [heatmap, blades, onSnapshot, onReady, gl, scene, camera]);
  return (
    <>
      <ambientLight intensity={heatmap ? 0.5 : 0.7} />
      <directionalLight position={[4, 8, 4]} intensity={heatmap ? 1.2 : 2.5} />
      <directionalLight
        position={[-5, 3, -3]}
        color="#a4d9ed"
        intensity={heatmap ? 0.7 : 2}
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={3}
          scale={[10, 5, 1]}
          position={[0, 6, -4]}
          rotation-x={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={4}
          scale={[3, 8, 1]}
          position={[-5, 1, 1]}
          rotation-y={Math.PI / 2}
        />
        <Lightformer
          form="rect"
          intensity={2}
          scale={[4, 5, 1]}
          position={[5, 1, 3]}
          rotation-y={-Math.PI / 2}
        />
      </Environment>
      <Part heatmap={heatmap} wireframe={wireframe} blades={blades} />
      <ContactShadows
        frames={1}
        position={[0, -0.31, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        far={5}
        resolution={256}
        color="#000000"
      />
      {!compact && (
        <gridHelper
          args={[14, 28, "#26363d", "#17262d"]}
          position={[0, -0.34, 0]}
        />
      )}
      {annotations && heatmap && (
        <>
          <Line
            points={[
              [1.62, 0.18, 1.02],
              [1.6, 1.6, 0.2],
            ]}
            color="#ff7276"
            lineWidth={1}
          />
          <AnnotationSprite />
          <AnnotationSprite datum />
        </>
      )}
      <OrbitControls
        ref={controls}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={13}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        enablePan={!compact}
      />
    </>
  );
}
class ViewerBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="viewer-fallback">
        <strong>3D rendering is unavailable</strong>
        <p>
          Enable hardware acceleration or open this page in Chrome or Edge. Your
          inspection report remains accessible.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function PartViewer(props: ViewerProps) {
  return (
    <ViewerBoundary>
      <Canvas
        frameloop={props.autoRotate ? "always" : "demand"}
        camera={{ position: [5.5, 4.7, 6.6], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        aria-label="Interactive 3D component. Drag to rotate; scroll or pinch to zoom."
      >
        <Scene {...props} />
      </Canvas>
    </ViewerBoundary>
  );
}
