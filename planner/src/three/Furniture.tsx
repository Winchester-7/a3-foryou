/** @author Erbol king */
import { RoundedBox } from '@react-three/drei';
import type { ReactNode } from 'react';
import { findDoor, findSofa, sofaDims } from '../data/catalog';
import type { PlacedObject } from '../data/objects';

type V3 = [number, number, number];

function Box({ size, pos, color, rough = 0.6, metal = 0, radius = 0 }: { size: V3; pos: V3; color: string; rough?: number; metal?: number; radius?: number }) {
  if (radius > 0) {
    return (
      <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2 - 0.001)} smoothness={3} position={pos} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
      </RoundedBox>
    );
  }
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

function Cyl({ r, h, pos, color, rough = 0.3, metal = 0 }: { r: number; h: number; pos: V3; color: string; rough?: number; metal?: number }) {
  return (
    <mesh position={pos} castShadow>
      <cylinderGeometry args={[r, r, h, 24]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

const CHROME = '#c9ccd0';
const WHITE = '#f7f6f3';
const DARK = '#2c2c2c';

function Door({ o }: { o: PlacedObject }) {
  const m = findDoor(o.ref);
  const c = o.color ?? m.colors[0].hex;
  const W = 0.8;
  const H = 2.0;
  return (
    <group>
      {/* casing */}
      <Box size={[0.07, H + 0.07, 0.025]} pos={[-W / 2 - 0.035, (H + 0.07) / 2, 0.0]} color={c} rough={0.5} />
      <Box size={[0.07, H + 0.07, 0.025]} pos={[W / 2 + 0.035, (H + 0.07) / 2, 0.0]} color={c} rough={0.5} />
      <Box size={[W + 0.14, 0.07, 0.025]} pos={[0, H + 0.035, 0.0]} color={c} rough={0.5} />
      {/* leaf */}
      <Box size={[W, H, 0.04]} pos={[0, H / 2, -0.02]} color={c} rough={0.45} />
      {m.glass ? (
        <mesh position={[0, H * 0.58, 0.001]}>
          <boxGeometry args={[W * 0.56, H * 0.6, 0.01]} />
          <meshPhysicalMaterial color="#cfd8da" roughness={0.15} metalness={0.1} transparent opacity={0.75} />
        </mesh>
      ) : (
        <>
          <Box size={[W * 0.7, H * 0.36, 0.006]} pos={[0, H * 0.7, 0.002]} color={c} rough={0.35} />
          <Box size={[W * 0.7, H * 0.36, 0.006]} pos={[0, H * 0.27, 0.002]} color={c} rough={0.35} />
        </>
      )}
      {/* handle */}
      <Box size={[0.13, 0.018, 0.018]} pos={[W / 2 - 0.12, 1.0, 0.03]} color={CHROME} rough={0.2} metal={0.9} />
      <Cyl r={0.025} h={0.02} pos={[W / 2 - 0.07, 1.0, 0.01]} color={CHROME} metal={0.9} />
    </group>
  );
}

function Sofa({ o }: { o: PlacedObject }) {
  const m = findSofa(o.ref);
  const { w, d } = sofaDims(o.size ?? m.sizes[0]);
  const c = o.color ?? m.fabrics[0].hex;
  const arm = m.kind === 'Кресло' ? 0.14 : 0.18;
  const seats = m.kind === 'Кресло' ? 1 : w > 2.1 ? 3 : 2;
  const seatW = (w - arm * 2) / seats;
  const legs: V3[] = [
    [-w / 2 + 0.08, 0.04, -d / 2 + 0.08],
    [w / 2 - 0.08, 0.04, -d / 2 + 0.08],
    [-w / 2 + 0.08, 0.04, d / 2 - 0.08],
    [w / 2 - 0.08, 0.04, d / 2 - 0.08],
  ];
  return (
    <group>
      {legs.map((p, i) => (
        <Cyl key={i} r={0.018} h={0.08} pos={p} color={DARK} rough={0.4} metal={0.6} />
      ))}
      <Box size={[w, 0.2, d]} pos={[0, 0.18, 0]} color={c} rough={0.9} radius={0.03} />
      {Array.from({ length: seats }, (_, i) => (
        <Box key={i} size={[seatW - 0.012, 0.15, d - 0.26]} pos={[-w / 2 + arm + seatW * (i + 0.5), 0.355, 0.1]} color={c} rough={0.92} radius={0.05} />
      ))}
      <Box size={[w - arm * 2, 0.46, 0.22]} pos={[0, 0.55, -d / 2 + 0.13]} color={c} rough={0.92} radius={0.07} />
      <Box size={[arm, 0.5, d]} pos={[-w / 2 + arm / 2, 0.4, 0]} color={c} rough={0.9} radius={0.05} />
      <Box size={[arm, 0.5, d]} pos={[w / 2 - arm / 2, 0.4, 0]} color={c} rough={0.9} radius={0.05} />
    </group>
  );
}

function Bed({ o }: { o: PlacedObject }) {
  const w = 1.7;
  const d = 2.15;
  const c = o.color ?? '#e6dfd3';
  return (
    <group>
      <Box size={[w, 0.28, d - 0.08]} pos={[0, 0.14, 0.04]} color={c} rough={0.9} radius={0.02} />
      <Box size={[w, 1.05, 0.1]} pos={[0, 0.525, -d / 2 + 0.05]} color={c} rough={0.9} radius={0.04} />
      <Box size={[w - 0.08, 0.22, d - 0.2]} pos={[0, 0.39, 0.06]} color={WHITE} rough={0.95} radius={0.06} />
      <Box size={[w - 0.02, 0.07, d * 0.6]} pos={[0, 0.52, d * 0.18]} color="#cfc4b3" rough={0.95} radius={0.03} />
      <Box size={[0.62, 0.13, 0.36]} pos={[-0.36, 0.56, -d / 2 + 0.34]} color={WHITE} rough={0.95} radius={0.06} />
      <Box size={[0.62, 0.13, 0.36]} pos={[0.36, 0.56, -d / 2 + 0.34]} color={WHITE} rough={0.95} radius={0.06} />
    </group>
  );
}

function Fronts({ w, h, y, z, cols, color }: { w: number; h: number; y: number; z: number; cols: number; color: string }) {
  const cw = w / cols;
  return (
    <>
      {Array.from({ length: cols }, (_, i) => (
        <Box key={i} size={[cw - 0.006, h - 0.006, 0.02]} pos={[-w / 2 + cw * (i + 0.5), y, z]} color={color} rough={0.45} />
      ))}
    </>
  );
}

function Wardrobe({ o }: { o: PlacedObject }) {
  const c = o.color ?? WHITE;
  return (
    <group>
      <Box size={[1.6, 2.2, 0.58]} pos={[0, 1.1, -0.01]} color={c} rough={0.55} />
      <Fronts w={1.6} h={2.18} y={1.1} z={0.29} cols={3} color={c} />
      {[-0.28, 0.25, 0.28].map((x, i) => (
        <Box key={i} size={[0.012, 0.3, 0.02]} pos={[x, 1.1, 0.31]} color={DARK} rough={0.3} metal={0.7} />
      ))}
    </group>
  );
}

function Kitchen({ o }: { o: PlacedObject }) {
  const c = o.color ?? WHITE;
  const w = 2.4;
  return (
    <group>
      <Box size={[w, 0.1, 0.52]} pos={[0, 0.05, -0.03]} color={DARK} rough={0.8} />
      <Box size={[w, 0.78, 0.56]} pos={[0, 0.49, -0.02]} color={c} rough={0.5} />
      <Fronts w={w} h={0.78} y={0.49} z={0.27} cols={4} color={c} />
      <Box size={[w + 0.02, 0.04, 0.62]} pos={[0, 0.9, 0]} color="#e9e6e1" rough={0.25} />
      {/* sink + hob */}
      <Box size={[0.5, 0.012, 0.4]} pos={[-0.6, 0.922, 0]} color="#9ea2a6" rough={0.2} metal={0.8} />
      <Cyl r={0.018} h={0.3} pos={[-0.6, 1.07, -0.22]} color={CHROME} metal={0.9} rough={0.2} />
      <Box size={[0.6, 0.008, 0.5]} pos={[0.55, 0.924, 0]} color="#151515" rough={0.1} />
      {/* wall cabinets */}
      <Box size={[w, 0.7, 0.34]} pos={[0, 1.85, -0.14]} color={c} rough={0.5} />
      <Fronts w={w} h={0.7} y={1.85} z={0.035} cols={4} color={c} />
    </group>
  );
}

function Island({ o }: { o: PlacedObject }) {
  const c = o.color ?? WHITE;
  return (
    <group>
      <Box size={[1.5, 0.86, 0.75]} pos={[0, 0.43, -0.05]} color={c} rough={0.5} />
      <Box size={[1.6, 0.04, 0.9]} pos={[0, 0.88, 0]} color="#e9e6e1" rough={0.25} />
    </group>
  );
}

function Table() {
  const wood = '#a58360';
  const chair = '#d8ccb9';
  const legs: V3[] = [
    [-0.62, 0.36, -0.32],
    [0.62, 0.36, -0.32],
    [-0.62, 0.36, 0.32],
    [0.62, 0.36, 0.32],
  ];
  const chairs: [number, number, number][] = [
    [-0.35, 0.62, Math.PI],
    [0.35, 0.62, Math.PI],
    [-0.35, -0.62, 0],
    [0.35, -0.62, 0],
  ];
  return (
    <group>
      <Box size={[1.4, 0.04, 0.8]} pos={[0, 0.74, 0]} color={wood} rough={0.55} />
      {legs.map((p, i) => (
        <Box key={i} size={[0.05, 0.72, 0.05]} pos={p} color={wood} rough={0.55} />
      ))}
      {chairs.map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={r}>
          <Box size={[0.44, 0.06, 0.42]} pos={[0, 0.46, 0]} color={chair} rough={0.9} radius={0.02} />
          <Box size={[0.44, 0.4, 0.05]} pos={[0, 0.7, 0.19]} color={chair} rough={0.9} radius={0.02} />
          {[
            [-0.19, -0.17],
            [0.19, -0.17],
            [-0.19, 0.17],
            [0.19, 0.17],
          ].map(([lx, lz], k) => (
            <Cyl key={k} r={0.014} h={0.44} pos={[lx, 0.22, lz]} color={DARK} metal={0.5} rough={0.4} />
          ))}
        </group>
      ))}
    </group>
  );
}

function Tv({ o }: { o: PlacedObject }) {
  const c = o.color ?? WHITE;
  return (
    <group>
      <Box size={[1.8, 0.45, 0.4]} pos={[0, 0.3, 0]} color={c} rough={0.5} />
      <Fronts w={1.8} h={0.3} y={0.3} z={0.205} cols={3} color={c} />
      <Box size={[1.3, 0.75, 0.035]} pos={[0, 1.3, -0.18]} color="#0d0d0d" rough={0.15} />
    </group>
  );
}

function Plant() {
  return (
    <group>
      <Cyl r={0.17} h={0.38} pos={[0, 0.19, 0]} color="#d7d1c6" rough={0.9} />
      <mesh position={[0, 0.78, 0]} castShadow>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color="#5c7a4c" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.12, 1.05, 0.06]} castShadow>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial color="#6f8d5b" roughness={0.85} flatShading />
      </mesh>
    </group>
  );
}

function Rug({ o }: { o: PlacedObject }) {
  return (
    <mesh position={[0, 0.006, 0]} receiveShadow>
      <boxGeometry args={[2, 0.012, 1.4]} />
      <meshStandardMaterial color={o.color ?? '#e6dfd3'} roughness={1} />
    </mesh>
  );
}

function Bathtub() {
  return (
    <group>
      <Box size={[1.7, 0.58, 0.75]} pos={[0, 0.29, 0]} color={WHITE} rough={0.15} radius={0.06} />
      <Box size={[1.52, 0.02, 0.57]} pos={[0.02, 0.575, 0]} color="#dfe6ea" rough={0.05} radius={0.009} />
      <Cyl r={0.02} h={0.2} pos={[-0.78, 0.68, -0.3]} color={CHROME} metal={0.9} rough={0.15} />
    </group>
  );
}

function Shower() {
  return (
    <group>
      <Box size={[0.9, 0.05, 0.9]} pos={[0, 0.025, 0]} color={WHITE} rough={0.2} />
      <mesh position={[0, 1.05, 0.44]}>
        <boxGeometry args={[0.9, 2.0, 0.01]} />
        <meshPhysicalMaterial color="#e3eef1" roughness={0.05} transparent opacity={0.22} />
      </mesh>
      <mesh position={[0.44, 1.05, 0]}>
        <boxGeometry args={[0.01, 2.0, 0.9]} />
        <meshPhysicalMaterial color="#e3eef1" roughness={0.05} transparent opacity={0.22} />
      </mesh>
      <Box size={[0.9, 0.02, 0.02]} pos={[0, 2.05, 0.44]} color={CHROME} metal={0.9} rough={0.2} />
      <Cyl r={0.11} h={0.015} pos={[0, 2.0, -0.3]} color={CHROME} metal={0.9} rough={0.2} />
      <Cyl r={0.012} h={0.9} pos={[0, 1.55, -0.43]} color={CHROME} metal={0.9} rough={0.2} />
    </group>
  );
}

function Vanity({ o }: { o: PlacedObject }) {
  const c = o.color ?? WHITE;
  return (
    <group>
      <Box size={[0.8, 0.46, 0.46]} pos={[0, 0.62, -0.01]} color={c} rough={0.45} />
      <Fronts w={0.8} h={0.44} y={0.62} z={0.225} cols={2} color={c} />
      <Box size={[0.82, 0.1, 0.48]} pos={[0, 0.9, 0]} color={WHITE} rough={0.12} radius={0.02} />
      <mesh position={[0, 0.951, 0.02]} scale={[1, 1, 0.7]}>
        <cylinderGeometry args={[0.2, 0.2, 0.004, 32]} />
        <meshStandardMaterial color="#d9dee1" roughness={0.1} />
      </mesh>
      <Cyl r={0.015} h={0.18} pos={[0, 1.04, -0.17]} color={CHROME} metal={0.9} rough={0.15} />
      <mesh position={[0, 1.55, -0.232]}>
        <boxGeometry args={[0.7, 0.8, 0.01]} />
        <meshStandardMaterial color="#e9eef0" roughness={0.06} metalness={0.55} />
      </mesh>
    </group>
  );
}

function Toilet() {
  return (
    <group>
      <Box size={[0.4, 0.9, 0.08]} pos={[0, 0.75, -0.27]} color={WHITE} rough={0.2} radius={0.02} />
      <Box size={[0.14, 0.09, 0.01]} pos={[0, 1.0, -0.225]} color={CHROME} metal={0.8} rough={0.2} />
      <Box size={[0.37, 0.34, 0.52]} pos={[0, 0.4, 0.02]} color={WHITE} rough={0.15} radius={0.12} />
      <Box size={[0.38, 0.03, 0.5]} pos={[0, 0.585, 0.03]} color={WHITE} rough={0.2} radius={0.012} />
    </group>
  );
}

export function FurnitureModel({ o }: { o: PlacedObject }): ReactNode {
  switch (o.kind) {
    case 'door':
      return <Door o={o} />;
    case 'sofa':
      return <Sofa o={o} />;
    case 'bed':
      return <Bed o={o} />;
    case 'wardrobe':
      return <Wardrobe o={o} />;
    case 'kitchen':
      return <Kitchen o={o} />;
    case 'island':
      return <Island o={o} />;
    case 'table':
      return <Table />;
    case 'tv':
      return <Tv o={o} />;
    case 'plant':
      return <Plant />;
    case 'rug':
      return <Rug o={o} />;
    case 'bathtub':
      return <Bathtub />;
    case 'shower':
      return <Shower />;
    case 'vanity':
      return <Vanity o={o} />;
    case 'toilet':
      return <Toilet />;
  }
}
