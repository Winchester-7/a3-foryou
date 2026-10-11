/** @author Erbol king */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { usePlanner, wallTileHeight, type Surface } from '../store';
import { findDecor, FINISH_ROUGHNESS } from '../data/catalog';
import { useTileTexture } from './tileTexture';

const WALL_T = 0.12;
const BASEBOARD = '#f4f2ee';

function specFor(s: Surface) {
  const { decor, collection } = findDecor(s.decorId);
  const size = collection.sizes.find((z) => z.label === s.size) ?? collection.sizes[0];
  return {
    spec: { texture: decor.texture, w: size.w, h: size.h, layout: s.layout, grout: s.grout },
    roughness: FINISH_ROUGHNESS[s.finish] ?? 0.5,
  };
}

function Floor() {
  const room = usePlanner((s) => s.room);
  const floor = usePlanner((s) => s.floor);
  const { spec, roughness } = specFor(floor);

  // the tiled zone: a band of `coverage` of the room, starting from one side
  const f = Math.min(1, Math.max(0.1, floor.coverage));
  const alongX = floor.from === 'left' || floor.from === 'right';
  const zoneW = alongX ? room.length * f : room.length; // X
  const zoneD = alongX ? room.width : room.width * f; // Z
  const cx = floor.from === 'left' ? -room.length / 2 + zoneW / 2 : floor.from === 'right' ? room.length / 2 - zoneW / 2 : 0;
  const cz = floor.from === 'back' ? -room.width / 2 + zoneD / 2 : floor.from === 'front' ? room.width / 2 - zoneD / 2 : 0;

  const map = useTileTexture(spec, zoneW, zoneD);
  return (
    <group>
      {f < 1 && (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[room.length, room.width]} />
          <meshStandardMaterial color={floor.base} roughness={0.95} />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} position={[cx, f < 1 ? 0.002 : 0, cz]} receiveShadow name="floor">
        <planeGeometry args={[zoneW, zoneD]} />
        {/* keyed by texture: adding a map to a live material needs a shader rebuild */}
        <meshStandardMaterial key={map?.uuid ?? 'plain'} map={map} color={map ? '#ffffff' : '#d9d4cc'} roughness={roughness} metalness={0} envMapIntensity={roughness < 0.3 ? 0.9 : 0.5} />
      </mesh>
    </group>
  );
}

/** One wall, drawn in local space: inner face on z=0, facing +z, body behind it. */
function Wall({ index, length }: { index: number; length: number }) {
  const room = usePlanner((s) => s.room);
  const walls = usePlanner((s) => s.walls);
  const full = useRef<THREE.Group>(null);
  const stub = useRef<THREE.Group>(null);

  const H = room.height;
  const { base, height: tileH } = wallTileHeight(walls, room);
  const tiled = walls.mode !== 'none' && walls.sides[index] !== false && tileH > 0;
  const tileW = length * Math.min(1, Math.max(0.1, walls.span));
  const { spec, roughness } = specFor(walls);
  const map = useTileTexture(spec, tileW, Math.max(tileH, 0.1));

  const L = room.length / 2;
  const W = room.width / 2;
  const [pos, rot] = useMemo((): [THREE.Vector3, number] => {
    switch (index) {
      case 0:
        return [new THREE.Vector3(0, 0, -W), 0];
      case 1:
        return [new THREE.Vector3(L, 0, 0), -Math.PI / 2];
      case 2:
        return [new THREE.Vector3(0, 0, W), Math.PI];
      default:
        return [new THREE.Vector3(-L, 0, 0), Math.PI / 2];
    }
  }, [index, L, W]);
  const inward = useMemo(() => new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot), [rot]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Cut away the walls standing between the camera and the room (Planner 5D-style dollhouse view)
  useFrame(({ camera }) => {
    if (!full.current || !stub.current) return;
    const outside = tmp.copy(camera.position).sub(pos).setY(0).dot(inward) < 0.05;
    const top = camera.position.y > Math.max(room.length, room.width) * 1.6 && Math.abs(camera.position.x) < 1 && Math.abs(camera.position.z) < 1;
    const cut = outside && !top;
    full.current.visible = !cut;
    stub.current.visible = cut;
  });

  const paint = (
    <meshStandardMaterial color={walls.paint} roughness={0.92} />
  );

  return (
    <group position={pos} rotation-y={rot}>
      <group ref={full}>
        <mesh position={[0, H / 2, -WALL_T / 2]} castShadow receiveShadow>
          <boxGeometry args={[length + WALL_T * 2, H, WALL_T]} />
          {paint}
        </mesh>
        {tiled && (
          <mesh position={[0, base + tileH / 2, 0.002]} receiveShadow>
            <planeGeometry args={[tileW, tileH]} />
            <meshStandardMaterial key={map?.uuid ?? 'plain'} map={map} color={map ? '#ffffff' : '#d9d4cc'} roughness={Math.max(roughness, 0.2)} envMapIntensity={0.45} />
          </mesh>
        )}
        {base === 0 && tiled ? null : (
          <mesh position={[0, 0.04, 0.008]} receiveShadow>
            <boxGeometry args={[length, 0.08, 0.016]} />
            <meshStandardMaterial color={BASEBOARD} roughness={0.6} />
          </mesh>
        )}
      </group>
      {/* low cut-away stub so the room outline stays readable */}
      <group ref={stub} visible={false}>
        <mesh position={[0, 0.06, -WALL_T / 2]} receiveShadow>
          <boxGeometry args={[length + WALL_T * 2, 0.12, WALL_T]} />
          <meshStandardMaterial color="#cfc9bf" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.121, -WALL_T / 2]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[length + WALL_T * 2, WALL_T]} />
          <meshBasicMaterial color="#3a3936" />
        </mesh>
      </group>
    </group>
  );
}

export function Room() {
  const room = usePlanner((s) => s.room);
  return (
    <group>
      <Floor />
      <Wall index={0} length={room.length} />
      <Wall index={1} length={room.width} />
      <Wall index={2} length={room.length} />
      <Wall index={3} length={room.width} />
      {/* surrounding ground so shadows and the cut-away have context */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.005} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#e7e3dc" roughness={1} />
      </mesh>
    </group>
  );
}
