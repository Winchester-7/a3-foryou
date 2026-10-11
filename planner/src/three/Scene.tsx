/** @author Erbol king */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { usePlanner } from '../store';
import { Room } from './Room';
import { FurnitureModel } from './Furniture';
import { footprint, modelScale, type PlacedObject } from '../data/objects';
import { canvasRef } from './canvasRef';


const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();

const tmpV = new THREE.Vector3();

function Placed({ o }: { o: PlacedObject }) {
  const selected = usePlanner((s) => s.selectedId === o.id);
  const grab = useRef<{ dx: number; dz: number } | null>(null);
  const group = useRef<THREE.Group>(null);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const { w, d } = footprint(o);

  // a door lives in its wall: when that wall is cut away for the dollhouse view, hide the door too
  useFrame(({ camera }) => {
    if (o.kind !== 'door' || !group.current) return;
    const inward = tmpV.set(Math.sin(o.rot), 0, Math.cos(o.rot));
    const toCam = camera.position.clone().sub(group.current.position).setY(0);
    const top = camera.position.y > 4 && Math.hypot(camera.position.x, camera.position.z) < 1;
    group.current.visible = top || toCam.dot(inward) > 0.05 || selected;
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const st = usePlanner.getState();
    st.select(o.id);
    if (!e.ray.intersectPlane(floorPlane, hit)) return;
    grab.current = { dx: o.x - hit.x, dz: o.z - hit.z };
    st.updateObject(o.id, {}, true); // history checkpoint before the drag
    st.setDragging(true);
    if (controls) controls.enabled = false; // synchronously, so the first move doesn't orbit
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!grab.current) return;
    e.stopPropagation();
    if (!e.ray.intersectPlane(floorPlane, hit)) return;
    usePlanner.getState().moveObject(o.id, hit.x + grab.current.dx, hit.z + grab.current.dz);
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    if (!grab.current) return;
    grab.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
    usePlanner.getState().setDragging(false);
    if (controls) controls.enabled = true;
  };

  return (
    <group
      ref={group}
      position={[o.x, 0, o.z]}
      rotation-y={o.rot}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <group scale={modelScale(o)}>
        <FurnitureModel o={o} />
      </group>
      {selected && (
        <group position-y={0.012}>
          <mesh rotation-x={-Math.PI / 2}>
            <planeGeometry args={[w + 0.08, d + 0.08]} />
            <meshBasicMaterial color="#E0241B" transparent opacity={0.12} depthWrite={false} />
          </mesh>
          <lineSegments rotation-x={-Math.PI / 2}>
            <edgesGeometry args={[new THREE.PlaneGeometry(w + 0.08, d + 0.08)]} />
            <lineBasicMaterial color="#E0241B" />
          </lineSegments>
        </group>
      )}
    </group>
  );
}

function Objects() {
  const objects = usePlanner((s) => s.objects);
  return (
    <>
      {objects.map((o) => (
        <Placed key={o.id} o={o} />
      ))}
    </>
  );
}

/** Smoothly flies the camera between the 3D view and the top-down plan. */
function CameraRig({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const view = usePlanner((s) => s.view);
  const room = usePlanner((s) => s.room);
  const { camera, invalidate } = useThree();
  const target = useRef<THREE.Vector3 | null>(null);
  const size = Math.max(room.length, room.width);

  useEffect(() => {
    target.current =
      view === 'top'
        ? new THREE.Vector3(0, size * 1.9 + 1, size * 0.04 + 0.05)
        : new THREE.Vector3(room.length * 0.7 + 1.4, size * 1.45 + 2.2, room.width * 1.05 + 2.2);
    const c = controls.current;
    if (c) {
      c.minPolarAngle = 0;
      c.maxPolarAngle = view === 'top' ? Math.PI / 2.2 : Math.PI / 2.15;
      c.enableRotate = view !== 'top';
      c.target.set(0, view === 'top' ? 0 : 0.7, 0);
    }
    invalidate();
  }, [view, size, room.length, room.width, controls, invalidate]);

  useFrame((_, dt) => {
    if (!target.current) return;
    camera.position.lerp(target.current, 1 - Math.exp(-dt * 6));
    controls.current?.update();
    if (camera.position.distanceTo(target.current) < 0.01) target.current = null;
    else invalidate();
  });
  return null;
}

function Lights() {
  const room = usePlanner((s) => s.room);
  const size = Math.max(room.length, room.width);
  return (
    <>
      <hemisphereLight args={['#fffaf2', '#cfc6b8', 0.55]} />
      <directionalLight
        position={[size * 0.6, size * 1.4 + 2, size * 0.4]}
        intensity={1.25}
        color="#fff4e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-radius={6}
      />
      {/* soft interior fill from the "ceiling" */}
      <pointLight position={[0, room.height - 0.2, 0]} intensity={2.5} distance={size * 2.2} decay={1.6} color="#fff1dc" />
      {/* studio lightformers give tiles and chrome believable reflections, no network HDR needed */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={1.2} position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#fff3e0" />
        <Lightformer intensity={0.8} position={[6, 2, -3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color="#eaf2ff" />
        <Lightformer form="ring" intensity={1.5} position={[2, 4, 6]} scale={2} />
      </Environment>
    </>
  );
}

export function Scene() {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const dragging = usePlanner((s) => s.dragging);
  const room = usePlanner((s) => s.room);
  const size = Math.max(room.length, room.width);
  const initialCam = useMemo<[number, number, number]>(
    () => [room.length * 0.7 + 1.4, size * 1.45 + 2.2, room.width * 1.05 + 2.2],
    // only for the very first frame; CameraRig handles later changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Canvas
      shadows="soft"
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: initialCam, fov: 38, near: 0.05, far: 200 }}
      gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      onCreated={({ gl }) => (canvasRef.current = gl.domElement)}
      onPointerMissed={() => usePlanner.getState().select(null)}
      style={{ touchAction: 'none' }}
    >
      <color attach="background" args={['#efece6']} />
      <fog attach="fog" args={['#efece6', size * 3, size * 7]} />
      <Suspense fallback={null}>
        <Lights />
        <Room />
        <Objects />
      </Suspense>
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={!dragging}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.2}
        maxDistance={size * 4}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.7, 0]}
      />
      <CameraRig controls={controls} />
    </Canvas>
  );
}
