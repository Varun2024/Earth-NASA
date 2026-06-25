"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { IssPosition } from "@/lib/iss";

const ISS_ALTITUDE_SCALE = 1.18;
const POLL_MS = 5000;

interface IssMarkerProps {
  earthRadius: number;
}

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export function IssMarker({ earthRadius }: IssMarkerProps) {
  const [iss, setIss] = useState<IssPosition | null>(null);
  const [hover, setHover] = useState(false);
  const targetPos = useRef(new THREE.Vector3());
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/iss", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as IssPosition;
        if (alive) setIss(data);
      } catch {
        // swallow — next tick will retry
      }
    };
    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!iss) return;
    const v = latLonToVec3(iss.lat, iss.lon, earthRadius * ISS_ALTITUDE_SCALE);
    targetPos.current.copy(v);
  }, [iss, earthRadius]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.lerp(targetPos.current, 0.08);
    if (glowRef.current) glowRef.current.position.copy(meshRef.current.position);
  });

  if (!iss) return null;

  return (
    <group>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.25} />
      </mesh>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[0.05, 0.025, 0.025]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={1}
        />
        {hover && (
          <Html distanceFactor={6} position={[0, 0.12, 0]} center>
            <div className="pointer-events-none whitespace-nowrap rounded-md border border-cyan-400/30 bg-black/85 px-2.5 py-1 text-xs text-cyan-100 shadow-lg backdrop-blur">
              <div className="font-medium">ISS (live)</div>
              <div className="text-[10px] text-cyan-300/70">
                {iss.altitudeKm.toFixed(0)} km · {iss.velocityKmH.toFixed(0)}{" "}
                km/h
              </div>
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}
