"use client";

import { type ReactNode } from "react";

export interface MarkerShape {
  geometry: ReactNode;
  surfaceOffset: number;
  emissiveIntensity: number;
}

const PILLAR: MarkerShape = {
  geometry: <cylinderGeometry args={[0.008, 0.018, 0.1, 8]} />,
  surfaceOffset: 0.05,
  emissiveIntensity: 0.3,
};

const SHAPES: Record<string, MarkerShape> = {
  wildfires: {
    geometry: <coneGeometry args={[0.012, 0.045, 6]} />,
    surfaceOffset: 0.022,
    emissiveIntensity: 1.1,
  },
  volcanoes: {
    geometry: <coneGeometry args={[0.04, 0.075, 6]} />,
    surfaceOffset: 0.038,
    emissiveIntensity: 0.7,
  },
  severeStorms: {
    geometry: <torusGeometry args={[0.045, 0.012, 8, 18]} />,
    surfaceOffset: 0.01,
    emissiveIntensity: 0.5,
  },
  earthquakes: {
    geometry: <torusGeometry args={[0.05, 0.006, 6, 24]} />,
    surfaceOffset: 0.005,
    emissiveIntensity: 0.6,
  },
  seaLakeIce: {
    geometry: <octahedronGeometry args={[0.03, 0]} />,
    surfaceOffset: 0.03,
    emissiveIntensity: 0.4,
  },
  floods: {
    geometry: <torusGeometry args={[0.04, 0.008, 6, 18]} />,
    surfaceOffset: 0.008,
    emissiveIntensity: 0.4,
  },
  drought: {
    geometry: <cylinderGeometry args={[0.04, 0.04, 0.005, 12]} />,
    surfaceOffset: 0.0025,
    emissiveIntensity: 0.2,
  },
  dustHaze: {
    geometry: <sphereGeometry args={[0.035, 10, 10]} />,
    surfaceOffset: 0.035,
    emissiveIntensity: 0.15,
  },
  landslides: {
    geometry: <tetrahedronGeometry args={[0.035, 0]} />,
    surfaceOffset: 0.025,
    emissiveIntensity: 0.3,
  },
  manmade: {
    geometry: <boxGeometry args={[0.035, 0.035, 0.035]} />,
    surfaceOffset: 0.018,
    emissiveIntensity: 0.4,
  },
  snow: {
    geometry: <octahedronGeometry args={[0.028, 0]} />,
    surfaceOffset: 0.028,
    emissiveIntensity: 0.3,
  },
  tempExtremes: {
    geometry: <coneGeometry args={[0.022, 0.07, 6]} />,
    surfaceOffset: 0.035,
    emissiveIntensity: 0.6,
  },
  waterColor: {
    geometry: <cylinderGeometry args={[0.04, 0.04, 0.005, 12]} />,
    surfaceOffset: 0.0025,
    emissiveIntensity: 0.4,
  },
};

export function shapeFor(categoryId: string): MarkerShape {
  return SHAPES[categoryId] ?? PILLAR;
}

export const CATEGORY_IDS = Object.keys(SHAPES);
