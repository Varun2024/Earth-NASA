"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { NeoObject } from "@/lib/neo";

interface NeoObjectsProps {
  neos: NeoObject[];
  earthRadius: number;
  selectedId: string | null;
  onSelect: (neo: NeoObject) => void;
}

interface PlacedNeo {
  neo: NeoObject;
  orbitRadius: number;
  inclination: number;
  phase: number;
  speed: number;
  scale: number;
  color: THREE.Color;
}

function place(neos: NeoObject[], earthRadius: number): PlacedNeo[] {
  if (neos.length === 0) return [];
  const lunars = neos.map((n) => n.missDistanceLunar);
  const minL = Math.min(...lunars);
  const maxL = Math.max(...lunars);
  const range = maxL - minL || 1;

  return neos.map((neo, i) => {
    const t = (neo.missDistanceLunar - minL) / range;
    const orbitRadius = earthRadius * (1.45 + t * 1.6);
    const diameterScale = Math.min(
      0.13,
      Math.max(0.025, Math.log10(neo.diameterMeters + 1) * 0.025),
    );
    return {
      neo,
      orbitRadius,
      inclination: ((i * 137.5) % 90) * (Math.PI / 180) - Math.PI / 4,
      phase: (i * 2.39996) % (Math.PI * 2),
      speed: 0.05 + (1 - t) * 0.12,
      scale: diameterScale,
      color: new THREE.Color(neo.hazardous ? "#ef4444" : "#cbd5e1"),
    };
  });
}

export function NeoObjects({
  neos,
  earthRadius,
  selectedId,
  onSelect,
}: NeoObjectsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const placed = useMemo(() => place(neos, earthRadius), [neos, earthRadius]);

  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    placed.forEach((p, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const a = p.phase + t * p.speed;
      const x = Math.cos(a) * p.orbitRadius;
      const z = Math.sin(a) * p.orbitRadius;
      const y = Math.sin(a) * Math.sin(p.inclination) * p.orbitRadius * 0.3;
      mesh.position.set(x, y, z);
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.013;
    });
  });

  const hovered = placed.find((p) => p.neo.id === hoverId);

  return (
    <group ref={groupRef}>
      {placed.map((p, i) => {
        const isSelected = selectedId === p.neo.id;
        const emphasize = isSelected || hoverId === p.neo.id;
        return (
          <group key={p.neo.id}>
            <mesh
              ref={(m) => {
                meshRefs.current[i] = m;
              }}
              scale={emphasize ? p.scale * 1.5 : p.scale}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p.neo);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoverId(p.neo.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                setHoverId((c) => (c === p.neo.id ? null : c));
                document.body.style.cursor = "default";
              }}
            >
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={p.color}
                roughness={0.85}
                metalness={0.15}
                emissive={p.neo.hazardous ? "#7f1d1d" : "#000"}
                emissiveIntensity={emphasize ? 0.6 : 0.2}
              />
            </mesh>
          </group>
        );
      })}

      {hovered && (
        <Html
          position={[0, 0, 0]}
          style={{ pointerEvents: "none" }}
          wrapperClass="neo-tooltip-wrapper"
        >
          <div className="pointer-events-none fixed left-1/2 top-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/15 bg-black/85 px-3 py-1.5 text-xs text-zinc-100 shadow-lg backdrop-blur">
            <div className="font-medium">
              {hovered.neo.name}{" "}
              {hovered.neo.hazardous && (
                <span className="text-red-400">⚠ hazardous</span>
              )}
            </div>
            <div className="text-[10px] text-zinc-400">
              ~{Math.round(hovered.neo.diameterMeters)} m ·{" "}
              {hovered.neo.missDistanceLunar.toFixed(2)} LD ·{" "}
              {hovered.neo.velocityKmS.toFixed(1)} km/s
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
