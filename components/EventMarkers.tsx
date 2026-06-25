"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Html, Instances, Instance } from "@react-three/drei";
import { colorFor, type EventPoint } from "@/lib/eonet";
import { shapeFor } from "./markerShape";

interface EventMarkersProps {
  points: EventPoint[];
  radius: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface PlacedPoint {
  point: EventPoint;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

const UP = new THREE.Vector3(0, 1, 0);

function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function placePoints(points: EventPoint[], radius: number): PlacedPoint[] {
  return points.map((p) => {
    const surface = latLonToVec3(p.lat, p.lon, radius * 1.001);
    const normal = surface.clone().normalize();
    const shape = shapeFor(p.categoryId);
    const position = normal
      .clone()
      .multiplyScalar(radius * 1.001 + shape.surfaceOffset);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(normal, UP);
    return { point: p, position, normal, quaternion };
  });
}

interface CategoryInstancesProps {
  catId: string;
  items: PlacedPoint[];
  onSelectRef: React.RefObject<(id: string) => void>;
  onHoverRef: React.RefObject<(id: string | null) => void>;
}

const CategoryInstances = memo(function CategoryInstances({
  catId,
  items,
  onSelectRef,
  onHoverRef,
}: CategoryInstancesProps) {
  const shape = shapeFor(catId);
  const color = colorFor(catId);
  return (
    <Instances
      limit={items.length}
      range={items.length}
      frustumCulled={false}
    >
      {shape.geometry}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={shape.emissiveIntensity}
        roughness={0.5}
        metalness={0.1}
      />
      {items.map((item) => (
        <Instance
          key={item.point.id}
          position={item.position}
          quaternion={item.quaternion}
          onClick={(e) => {
            e.stopPropagation();
            onSelectRef.current(item.point.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHoverRef.current(item.point.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            onHoverRef.current(null);
            document.body.style.cursor = "default";
          }}
        />
      ))}
    </Instances>
  );
});

export function EventMarkers({
  points,
  radius,
  selectedId,
  onSelect,
}: EventMarkersProps) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const setHoverIdSafe = useCallback((id: string | null) => {
    setHoverId((curr) => {
      if (id === null) return curr === null ? curr : null;
      return curr === id ? curr : id;
    });
  }, []);
  const onHoverRef = useRef(setHoverIdSafe);
  onHoverRef.current = setHoverIdSafe;

  const placed = useMemo(() => placePoints(points, radius), [points, radius]);

  const byCategory = useMemo(() => {
    const m = new Map<string, PlacedPoint[]>();
    for (const item of placed) {
      const arr = m.get(item.point.categoryId);
      if (arr) arr.push(item);
      else m.set(item.point.categoryId, [item]);
    }
    return Array.from(m.entries());
  }, [placed]);

  const accent = useMemo(() => {
    const id = selectedId ?? hoverId;
    if (!id) return null;
    return placed.find((p) => p.point.id === id) ?? null;
  }, [placed, selectedId, hoverId]);

  return (
    <group>
      {byCategory.map(([catId, items]) => (
        <CategoryInstances
          key={catId}
          catId={catId}
          items={items}
          onSelectRef={onSelectRef}
          onHoverRef={onHoverRef}
        />
      ))}

      {accent && (
        <mesh position={accent.position}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial
            color={colorFor(accent.point.categoryId)}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      )}

      {accent && selectedId === accent.point.id && (
        <mesh position={accent.position} quaternion={accent.quaternion}>
          <ringGeometry args={[0.06, 0.09, 32]} />
          <meshBasicMaterial
            color={colorFor(accent.point.categoryId)}
            side={THREE.DoubleSide}
            transparent
            opacity={0.75}
          />
        </mesh>
      )}

      {accent && hoverId === accent.point.id && (
        <Html
          position={accent.normal
            .clone()
            .multiplyScalar(
              radius * 1.001 +
                shapeFor(accent.point.categoryId).surfaceOffset +
                0.25,
            )}
          center
          distanceFactor={6}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-md border border-white/15 bg-black/85 px-2.5 py-1 text-xs text-zinc-100 shadow-lg backdrop-blur">
            <div className="font-medium">{accent.point.title}</div>
            <div className="text-[10px] text-zinc-400">
              {accent.point.categoryTitle}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
