"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Earth } from "./Earth";
import { EventMarkers } from "./EventMarkers";
import { NeoObjects } from "./NeoObjects";
import { IssMarker } from "./IssMarker";
import { FilterPanel } from "./FilterPanel";
import { EventDetail } from "./EventDetail";
import { NeoDetail } from "./NeoDetail";
import { LayersPanel, type LayerState } from "./LayersPanel";
import { TimelineScrubber } from "./TimelineScrubber";
import { ShareButton } from "./ShareButton";
import { ApodCard } from "./ApodCard";
import { SoundToggle } from "./SoundToggle";
import { MobileNav, MobileSheet, type MobileSheetKey } from "./MobileNav";
import { ping } from "@/lib/audio";
import type { Apod } from "@/lib/apod";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { EventPoint } from "@/lib/eonet";
import type { NeoObject } from "@/lib/neo";
import { sunDirection } from "@/lib/sunPosition";
import { readUrlState, writeUrlState } from "@/lib/urlState";

const EARTH_RADIUS = 2;

interface SceneProps {
  points: EventPoint[];
  neos: NeoObject[];
  apod: Apod | null;
}

function latLonToVec3(lat: number, lon: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  );
}

interface RigProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  worldGroupRef: React.RefObject<THREE.Group | null>;
  autoRotate: boolean;
  flyTarget: THREE.Vector3 | null;
  onFlyDone: () => void;
}

function Rig({
  controlsRef,
  worldGroupRef,
  autoRotate,
  flyTarget,
  onFlyDone,
}: RigProps) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (autoRotate && worldGroupRef.current) {
      worldGroupRef.current.rotation.y += delta * 0.04;
    }
    if (flyTarget && controlsRef.current) {
      const dir = flyTarget.clone().normalize();
      const dist = camera.position.length();
      const target = dir.multiplyScalar(Math.max(dist * 0.7, 4));
      camera.position.lerp(target, 0.08);
      controlsRef.current.update();
      if (camera.position.distanceTo(target) < 0.05) onFlyDone();
    }
  });

  return null;
}

export function Scene({ points, neos, apod }: SceneProps) {
  const categories = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    for (const p of points) {
      const entry = map.get(p.categoryId);
      if (entry) entry.count += 1;
      else
        map.set(p.categoryId, {
          id: p.categoryId,
          title: p.categoryTitle,
          count: 1,
        });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [points]);

  const initial = useMemo(() => readUrlState(), []);

  const [active, setActive] = useState<Set<string>>(() =>
    initial.active
      ? new Set(initial.active)
      : new Set(categories.map((c) => c.id)),
  );
  const [layers, setLayers] = useState<LayerState>(
    () => initial.layers ?? { eonet: true, neo: true, iss: true },
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    initial.eventId ?? null,
  );
  const [selectedNeo, setSelectedNeo] = useState<NeoObject | null>(() =>
    initial.neoId ? neos.find((n) => n.id === initial.neoId) ?? null : null,
  );

  useEffect(() => {
    writeUrlState({
      layers,
      active: Array.from(active),
      eventId: selectedEventId,
      neoId: selectedNeo?.id ?? null,
    });
  }, [layers, active, selectedEventId, selectedNeo]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [flyTarget, setFlyTarget] = useState<THREE.Vector3 | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheetKey>(null);
  const [apodOpen, setApodOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const worldGroupRef = useRef<THREE.Group | null>(null);

  const [sunDir, setSunDir] = useState(() => sunDirection(new Date()));
  useEffect(() => {
    const id = setInterval(
      () => setSunDir(sunDirection(new Date())),
      60_000,
    );
    return () => clearInterval(id);
  }, []);
  const sunPos = useMemo(() => sunDir.clone().multiplyScalar(20), [sunDir]);

  const dateBounds = useMemo(() => {
    if (points.length === 0) {
      const now = Date.now();
      return { min: now - 30 * 86400000, max: now };
    }
    const times = points.map((p) => new Date(p.date).getTime());
    const max = Math.max(...times, Date.now());
    const min = Math.min(...times, max - 30 * 86400000);
    return { min, max };
  }, [points]);

  const [scrubTime, setScrubTime] = useState<number>(dateBounds.max);
  useEffect(() => {
    setScrubTime(dateBounds.max);
  }, [dateBounds.max]);

  const visiblePoints = useMemo(
    () =>
      points.filter(
        (p) =>
          active.has(p.categoryId) &&
          new Date(p.date).getTime() <= scrubTime,
      ),
    [points, active, scrubTime],
  );

  const selectedEvent = useMemo(
    () => points.find((p) => p.id === selectedEventId) ?? null,
    [points, selectedEventId],
  );

  const toggleCat = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setAll = (on: boolean) => {
    setActive(on ? new Set(categories.map((c) => c.id)) : new Set());
  };

  const toggleLayer = (key: keyof LayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectEvent = (id: string) => {
    setSelectedNeo(null);
    setSelectedEventId(id);
    setAutoRotate(false);
    if (isMobile) setMobileSheet("detail");
    ping(880);
    const p = points.find((pt) => pt.id === id);
    if (!p || !worldGroupRef.current) return;
    const local = latLonToVec3(p.lat, p.lon);
    const world = local.applyQuaternion(worldGroupRef.current.quaternion);
    setFlyTarget(world);
  };

  const handleSelectNeo = (neo: NeoObject) => {
    setSelectedEventId(null);
    setSelectedNeo(neo);
    setAutoRotate(false);
    if (isMobile) setMobileSheet("detail");
    ping(neo.hazardous ? 440 : 660);
  };

  const handleDeselect = () => {
    setSelectedEventId(null);
    setSelectedNeo(null);
    setFlyTarget(null);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        onPointerMissed={handleDeselect}
      >
        <color attach="background" args={["#000005"]} />
        <ambientLight intensity={0.05} />
        <hemisphereLight args={["#3a4a6b", "#0a0a1a", 0.15]} />
        <directionalLight position={sunPos} intensity={1.6} />
        <Stars
          radius={120}
          depth={50}
          count={isMobile ? 1500 : 4000}
          factor={3}
          fade
          speed={0.4}
        />
        <Suspense fallback={null}>
          <group ref={worldGroupRef}>
            <Earth radius={EARTH_RADIUS} />
            {layers.eonet && (
              <EventMarkers
                points={visiblePoints}
                radius={EARTH_RADIUS}
                selectedId={selectedEventId}
                onSelect={handleSelectEvent}
              />
            )}
            {layers.iss && <IssMarker earthRadius={EARTH_RADIUS} />}
          </group>
          {layers.neo && (
            <NeoObjects
              neos={neos}
              earthRadius={EARTH_RADIUS}
              selectedId={selectedNeo?.id ?? null}
              onSelect={handleSelectNeo}
            />
          )}
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3.2}
          maxDistance={16}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
          onStart={() => {
            setAutoRotate(false);
            setFlyTarget(null);
          }}
        />
        <Rig
          controlsRef={controlsRef}
          worldGroupRef={worldGroupRef}
          autoRotate={autoRotate}
          flyTarget={flyTarget}
          onFlyDone={() => setFlyTarget(null)}
        />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3 sm:p-6">
        <div className="pointer-events-auto">
          <h1 className="text-base font-semibold tracking-tight sm:text-xl">
            Earth Live
          </h1>
          <p className="mt-0.5 text-[10px] text-zinc-400 sm:mt-1 sm:text-xs">
            EONET · {visiblePoints.length}/{points.length} · {neos.length}{" "}
            NEOs
          </p>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <button
            onClick={() => setAutoRotate((r) => !r)}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-zinc-300 backdrop-blur transition hover:bg-white/10 sm:px-3 sm:py-1.5 sm:text-xs"
          >
            {autoRotate ? "Pause" : "Rotate"}
          </button>
          <SoundToggle enabled={soundOn} onChange={setSoundOn} />
          <ShareButton />
        </div>
      </header>

      {apod && (
        <ApodCard
          apod={apod}
          open={apodOpen}
          onOpenChange={setApodOpen}
          hideTrigger={false}
        />
      )}

      <FilterPanel
        categories={categories}
        active={active}
        onToggle={toggleCat}
        onSetAll={setAll}
      />
      <LayersPanel
        layers={layers}
        onToggle={toggleLayer}
        counts={{ eonet: visiblePoints.length, neo: neos.length }}
      />
      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={handleDeselect} />
      )}
      {selectedNeo && (
        <NeoDetail neo={selectedNeo} onClose={handleDeselect} />
      )}

      <div className="md:hidden">
        <MobileSheet
          open={mobileSheet === "filters"}
          onClose={() => setMobileSheet(null)}
          title="Categories"
        >
          <FilterPanel
            categories={categories}
            active={active}
            onToggle={toggleCat}
            onSetAll={setAll}
            className="block w-full"
          />
        </MobileSheet>
        <MobileSheet
          open={mobileSheet === "layers"}
          onClose={() => setMobileSheet(null)}
          title="Layers"
        >
          <LayersPanel
            layers={layers}
            onToggle={toggleLayer}
            counts={{ eonet: visiblePoints.length, neo: neos.length }}
            className="block w-full"
          />
        </MobileSheet>
        <MobileSheet
          open={mobileSheet === "detail" && !!(selectedEvent || selectedNeo)}
          onClose={() => setMobileSheet(null)}
          title="Details"
        >
          {selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onClose={() => {
                handleDeselect();
                setMobileSheet(null);
              }}
              className="block w-full"
            />
          )}
          {selectedNeo && (
            <NeoDetail
              neo={selectedNeo}
              onClose={() => {
                handleDeselect();
                setMobileSheet(null);
              }}
              className="block w-full"
            />
          )}
        </MobileSheet>
      </div>

      <div className="pb-16 md:pb-0">
        <TimelineScrubber
          minDate={dateBounds.min}
          maxDate={dateBounds.max}
          value={scrubTime}
          onChange={setScrubTime}
        />
      </div>

      <MobileNav
        active={mobileSheet}
        onSet={setMobileSheet}
        hasDetail={!!(selectedEvent || selectedNeo)}
        hasApod={!!apod}
        onOpenApod={() => setApodOpen(true)}
      />
    </div>
  );
}
